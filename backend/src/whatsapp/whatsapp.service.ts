import { Injectable, OnModuleInit, OnModuleDestroy, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { EventEmitter } from 'events';
import { join } from 'path';
import { existsSync, rmSync } from 'fs';
import pino from 'pino';

import { User, UserDocument } from '../users/schemas/user.schema';
import { Shop, ShopDocument } from '../shops/schemas/shop.schema';
import { Order, OrderDocument } from '../orders/schemas/order.schema';
import { Udhar, UdharDocument } from '../udhar/schemas/udhar.schema';
import { Product, ProductDocument } from '../products/schemas/product.schema';

// Helper function to parse database string dates (e.g. '28 May 2026') into JS Date
function parseOrderDate(dateStr: string, timeStr?: string): Date {
  try {
    const parts = dateStr.replace(/-/g, ' ').split(' ');
    if (parts.length === 3) {
      const day = parseInt(parts[0]);
      const monthNames = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
      const month = monthNames.findIndex(m => parts[1].toLowerCase().startsWith(m));
      const year = parseInt(parts[2]);
      
      let hours = 0;
      let minutes = 0;
      if (timeStr) {
        const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
        if (match) {
          hours = parseInt(match[1]);
          minutes = parseInt(match[2]);
          const ampm = match[3].toUpperCase();
          if (ampm === 'PM' && hours < 12) hours += 12;
          if (ampm === 'AM' && hours === 12) hours = 0;
        }
      }
      if (month !== -1) {
        return new Date(year, month, day, hours, minutes);
      }
    }
  } catch (e) {
    console.error('Failed to parse date in whatsapp service:', dateStr, e);
  }
  return new Date();
}

@Injectable()
export class WhatsappService extends EventEmitter implements OnModuleInit, OnModuleDestroy {
  private activeSockets        = new Map<string, any>();
  private connectionStatuses   = new Map<string, 'disconnected' | 'connecting' | 'connected'>();
  private connectedJids        = new Map<string, string>();
  // Prevents two concurrent connect() calls for the same shop (race condition guard)
  private pendingConnects      = new Set<string>();
  // Sends welcome message only on first successful connect, not on every auto-reconnect
  private welcomeSentShops     = new Set<string>();
  // Tracks pending auto-reconnect timers so they can be cancelled on manual disconnect
  private reconnectTimers      = new Map<string, ReturnType<typeof setTimeout>>();

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Shop.name) private shopModel: Model<ShopDocument>,
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(Udhar.name) private udharModel: Model<UdharDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
  ) {
    super();
  }

  async onModuleInit() {
    console.log('WhatsappService initialized. Multi-tenant WhatsApp bot loading.');
  }

  async onModuleDestroy() {
    // Terminate all open socket connections on shutdown
    for (const [shopId, sock] of this.activeSockets.entries()) {
      try {
        console.log(`Closing WhatsApp socket for shop ${shopId} on module destroy`);
        sock.end(undefined);
      } catch (err) {
        console.error(`Failed to close socket for shop ${shopId}:`, err);
      }
    }
    this.activeSockets.clear();
  }

  /**
   * Retrieves connection metadata for a shop
   */
  getConnectionInfo(shopId: string) {
    const status = this.connectionStatuses.get(shopId) || 'disconnected';
    const jid = this.connectedJids.get(shopId) || null;
    const phone = jid ? jid.split('@')[0] : null;

    return { status, phone };
  }

  /**
   * Updates/Saves allowed admin phone numbers for security
   */
  async updateSettings(shopId: string, whatsappAdminNumbers: string[]): Promise<UserDocument> {
    const admin = await this.userModel.findByIdAndUpdate(
      shopId,
      { whatsappAdminNumbers },
      { new: true }
    ).exec();

    if (!admin) {
      throw new NotFoundException(`Admin user with ID ${shopId} not found`);
    }

    return admin;
  }

  /**
   * Retrieves WhatsApp allowed admin numbers
   */
  async getSettings(shopId: string): Promise<string[]> {
    const admin = await this.userModel.findById(shopId).exec();
    if (!admin) {
      throw new NotFoundException(`Admin user with ID ${shopId} not found`);
    }
    return admin.whatsappAdminNumbers || [];
  }

  /**
   * Initialize a Baileys session for a shop
   */
  async connect(shopId: string) {
    // Guard 1: already connected/connecting via active socket
    if (this.activeSockets.has(shopId)) {
      const status = this.connectionStatuses.get(shopId);
      if (status === 'connected' || status === 'connecting') {
        console.log(`WhatsApp socket for shop ${shopId} is already ${status}. Skipping init.`);
        return;
      }
    }
    // Guard 2: another connect() call is already mid-flight for this shop (race condition)
    if (this.pendingConnects.has(shopId)) {
      console.log(`WhatsApp connect() already in progress for shop ${shopId}. Skipping.`);
      return;
    }
    this.pendingConnects.add(shopId);

    // Cancel any pending auto-reconnect timer (e.g. user clicked "Connect" manually)
    const existing = this.reconnectTimers.get(shopId);
    if (existing) { clearTimeout(existing); this.reconnectTimers.delete(shopId); }

    this.connectionStatuses.set(shopId, 'connecting');
    this.emit('status', { shopId, status: 'connecting' });

    try {
      const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = await import('@whiskeysockets/baileys');
      const QRCode = await import('qrcode');

      const sessionDir = join(process.cwd(), 'sessions', `session-${shopId}`);
      const { state, saveCreds } = await useMultiFileAuthState(sessionDir);

      const sock = makeWASocket({
        auth: state,
        logger: pino({ level: 'silent' }) as any,
        printQRInTerminal: false,
      });

      this.activeSockets.set(shopId, sock);
      this.pendingConnects.delete(shopId); // socket created — release the race-condition lock

      // Listen for credential saving
      sock.ev.on('creds.update', saveCreds);

      // Listen for connection updates
      sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
          try {
            const qrImageBase64 = await QRCode.toDataURL(qr);
            this.emit('qr', { shopId, qr: qrImageBase64 });
          } catch (err) {
            console.error(`Failed to generate QR for shop ${shopId}:`, err);
          }
        }

        if (connection === 'close') {
          const statusCode = (lastDisconnect?.error as any)?.output?.statusCode;
          const shouldReconnect = statusCode !== DisconnectReason.loggedOut;

          console.log(`WhatsApp connection closed for shop ${shopId}. Status code: ${statusCode}. Reconnecting: ${shouldReconnect}`);

          this.connectionStatuses.set(shopId, 'disconnected');
          this.connectedJids.delete(shopId);
          this.activeSockets.delete(shopId);
          this.emit('status', { shopId, status: 'disconnected' });

          if (!shouldReconnect) {
            // Logged out — delete session credentials and clear welcome-sent flag
            this.welcomeSentShops.delete(shopId);
            try {
              if (existsSync(sessionDir)) {
                rmSync(sessionDir, { recursive: true, force: true });
                console.log(`Deleted credentials folder for shop ${shopId}`);
              }
            } catch (err) {
              console.error(`Failed to delete session directory for shop ${shopId}:`, err);
            }
          } else {
            // Temporary drop — schedule silent reconnect (no welcome message)
            const timer = setTimeout(() => {
              this.reconnectTimers.delete(shopId);
              this.connect(shopId);
            }, 3000);
            this.reconnectTimers.set(shopId, timer);
          }
        } else if (connection === 'open') {
          console.log(`WhatsApp connection established successfully for shop ${shopId}`);
          
          const botId = sock.user?.id;
          if (botId) {
            const jid = botId.split(':')[0] + '@s.whatsapp.net';
            this.connectionStatuses.set(shopId, 'connected');
            this.connectedJids.set(shopId, jid);

            this.emit('status', { shopId, status: 'connected', phone: botId.split(':')[0] });

            // Send welcome message only on first connection, not every reconnect
            if (!this.welcomeSentShops.has(shopId)) {
              this.welcomeSentShops.add(shopId);
              try {
                await sock.sendMessage(jid, {
                  text: `🤖 *SMART SALES POS BOT ACTIVATED*\n\nHello Admin!\n\nYour WhatsApp Bot has been successfully linked to your POS system! 🎉\n\nYou can now query live reporting metrics directly from this chat on the go.\n\nType */help* to see all available commands! 🚀`
                });
              } catch (err) {
                console.error(`Failed to send welcome message for shop ${shopId}:`, err);
              }
            }
          }
        }
      });

      // Listen for incoming messages
      sock.ev.on('messages.upsert', async (upsert) => {
        console.log(`[WA UPSERT] Shop ${shopId} | Type: "${upsert.type}" | Messages count: ${upsert.messages?.length}`);

        // "append" = history loaded on connect; "notify" = genuinely new message
        if (upsert.type !== 'notify') return;

        // Reject messages older than 30 seconds — these are missed/queued messages
        // delivered in bulk on reconnect, not real-time commands the user just typed
        const nowSec = Math.floor(Date.now() / 1000);

        for (const message of upsert.messages) {
          try {
            // RAW dump EVERY message for diagnosis - always log before any filter
            console.log(`[WA RAW MSG] Key:`, JSON.stringify(message.key), `| StubType: ${message.messageStubType} | HasMsg: ${!!message.message} | MsgKeys: ${message.message ? Object.keys(message.message) : 'N/A'}`);

            // Skip stale messages (sent while bot was offline / history replay)
            const msgTimestamp = Number(message.messageTimestamp ?? 0);
            if (msgTimestamp && nowSec - msgTimestamp > 30) {
              console.log(`[WA SKIP] Stale message (age ${nowSec - msgTimestamp}s), ignoring`);
              continue;
            }

            // Skip messages with no content at all (status broadcasts, receipts)
            if (!message.message) {
              console.log(`[WA SKIP] No message body (stubType: ${message.messageStubType})`);
              continue;
            }

            // Skip protocol-only messages (message deletes, read receipts)
            const msgKeys = Object.keys(message.message);
            const isProtocolOnly = msgKeys.length === 1 && (
              msgKeys[0] === 'protocolMessage' ||
              msgKeys[0] === 'reactionMessage' ||
              msgKeys[0] === 'senderKeyDistributionMessage'
            );
            if (isProtocolOnly) {
              console.log(`[WA SKIP] Protocol-only message: ${msgKeys[0]}`);
              continue;
            }

            await this.handleIncomingMessage(shopId, sock, message);
          } catch (err) {
            console.error(`Error handling message for shop ${shopId}:`, err);
          }
        }
      });

      // Debug: log message update events
      sock.ev.on('messages.update', (updates) => {
        console.log(`[WA MSG UPDATE] Shop ${shopId} | ${updates.length} message updates received`);
      });

    } catch (err) {
      console.error(`Failed to launch WhatsApp socket for shop ${shopId}:`, err);
      this.connectionStatuses.set(shopId, 'disconnected');
      this.emit('status', { shopId, status: 'disconnected' });
    }
  }

  /**
   * Log out and destroy WhatsApp session
   */
  async disconnect(shopId: string) {
    const sock = this.activeSockets.get(shopId);
    if (sock) {
      try {
        console.log(`Logging out WhatsApp session for shop ${shopId}`);
        await sock.logout();
        sock.end(undefined);
      } catch (err) {
        console.error(`Failed to cleanly log out of WhatsApp socket for shop ${shopId}:`, err);
      }
    }

    // Cancel any pending auto-reconnect and clear welcome-sent state
    const timer = this.reconnectTimers.get(shopId);
    if (timer) { clearTimeout(timer); this.reconnectTimers.delete(shopId); }
    this.welcomeSentShops.delete(shopId);
    this.pendingConnects.delete(shopId);

    this.activeSockets.delete(shopId);
    this.connectionStatuses.set(shopId, 'disconnected');
    this.connectedJids.delete(shopId);

    const sessionDir = join(process.cwd(), 'sessions', `session-${shopId}`);
    try {
      if (existsSync(sessionDir)) {
        rmSync(sessionDir, { recursive: true, force: true });
        console.log(`Deleted credentials folder for shop ${shopId} on manual disconnect`);
      }
    } catch (err) {
      console.error(`Failed to delete credentials folder for shop ${shopId}:`, err);
    }

    this.emit('status', { shopId, status: 'disconnected' });
  }

  /**
   * Robust helper to extract text content from any message structure
   * Handles ALL known Baileys message wrapper types
   */
  private getMessageText(message: any): string {
    if (!message || !message.message) return '';
    
    let msg = message.message;
    
    // 1. Handle ephemeral messages (disappearing messages)
    if (msg.ephemeralMessage?.message) {
      msg = msg.ephemeralMessage.message;
    }
    
    // 2. Handle view once messages
    if (msg.viewOnceMessage?.message) {
      msg = msg.viewOnceMessage.message;
    }
    if (msg.viewOnceMessageV2?.message) {
      msg = msg.viewOnceMessageV2.message;
    }

    // 3. Handle document with caption
    if (msg.documentWithCaptionMessage?.message) {
      msg = msg.documentWithCaptionMessage.message;
    }
    
    if (!msg) return '';

    // Try all known text extraction paths
    const text = 
      msg.conversation || 
      msg.extendedTextMessage?.text || 
      msg.imageMessage?.caption || 
      msg.videoMessage?.caption || 
      msg.documentMessage?.caption ||
      msg.buttonsResponseMessage?.selectedDisplayText ||
      msg.listResponseMessage?.title ||
      msg.templateButtonReplyMessage?.selectedDisplayText ||
      // Some linked device messages store text in 'body'
      (msg as any).body ||
      '';
    
    return text;
  }

  /**
   * Core WhatsApp router & security layer for incoming messages
   */
  private async handleIncomingMessage(shopId: string, sock: any, message: any) {
    const fromMe = message.key.fromMe;
    const remoteJid = message.key.remoteJid;
    // WhatsApp now uses LID (Linked Identity) format alongside traditional JIDs
    const remoteJidAlt = message.key.remoteJidAlt;

    // Only answer to DMs / self-chats: accept @s.whatsapp.net AND @lid formats
    // Reject group chats (@g.us) and status broadcasts (@broadcast)
    if (!remoteJid) return;
    const isDM = remoteJid.endsWith('@s.whatsapp.net') || remoteJid.endsWith('@lid');
    if (!isDM) return;

    // Determine the best JID for phone-number-based operations
    // If remoteJid is LID format, use remoteJidAlt which has the phone number
    const phoneJid = remoteJidAlt || remoteJid;
    // Determine which JID to reply to (always use the original remoteJid)
    const replyJid = remoteJid;

    // Extract text content from message body using robust helper
    const textContent = this.getMessageText(message);
    
    // Detailed Debug Log
    console.log(`[WA BOT] JID: "${remoteJid}" | AltJID: "${remoteJidAlt || 'none'}" | fromMe: ${fromMe} | Text: "${textContent}" | MessageKeys:`, Object.keys(message.message || {}));
    if (textContent === '' && message.message) {
      console.log(`[WA BOT DEBUG] Raw Message JSON:`, JSON.stringify(message.message));
    }

    const trimmed = textContent.trim();
    if (!trimmed.startsWith('/')) return; // Commands must be prefixed with a slash

    const parsedCommand = trimmed.toLowerCase().split(' ')[0];

    // Identify user JID
    const botId = sock.user?.id;
    if (!botId) return;
    const botJid = botId.split(':')[0] + '@s.whatsapp.net';
    // Use phoneJid (which has the phone number) for authorization
    const senderJid = fromMe ? botJid : phoneJid;

    // Security Gatekeeper Check
    const isAuth = await this.isAuthorized(shopId, senderJid, fromMe);
    console.log(`[WA SECURITY] Sender: "${senderJid}" | fromMe: ${fromMe} | Authorized: ${isAuth}`);
    
    if (!isAuth) {
      console.log(`Unauthorized WhatsApp query blocked from ${senderJid} targeting shop ${shopId}`);
      return;
    }

    console.log(`Processing authorized command "${parsedCommand}" from JID ${senderJid} (shop ${shopId})`);

    // Execute requested report query
    let responseText = '';
    switch (parsedCommand) {
      case '/help':
        responseText = this.getHelpText();
        break;
      case '/shops':
        responseText = await this.getShopsReport(shopId);
        break;
      case '/bills':
        responseText = await this.getBillsReport(shopId);
        break;
      case '/orders':
        responseText = await this.getOrdersReport(shopId);
        break;
      case '/udar':
        responseText = await this.getUdharReport(shopId);
        break;
      case '/stock':
        responseText = await this.getStockReport(shopId);
        break;
      case '/today':
        responseText = await this.getTodayReport(shopId);
        break;
      case '/users':
        responseText = await this.getUsersReport(shopId);
        break;
      case '/info':
        responseText = await this.getAdminInfoReport(shopId);
        break;
      default:
        responseText = `❌ Unknown command: *${parsedCommand}*\nType '/help' to see the list of available reports.`;
        break;
    }

    // Send reply back to WhatsApp — use replyJid (original remoteJid) for correct routing
    await sock.sendMessage(replyJid, { text: responseText }, { quoted: message });
  }

  /**
   * Helper to verify if JID is authorized
   */
  private async isAuthorized(shopId: string, senderJid: string, fromMe: boolean): Promise<boolean> {
    const senderPhone = senderJid.split('@')[0];
    const cleanSender = senderPhone.replace(/\D/g, '');

    // 1. If self-chatting (admin chatting with themselves), always authorize
    if (fromMe) return true;

    // 2. Fetch admin record to check configured allowed numbers
    const admin = await this.userModel.findById(shopId).exec();
    if (!admin) return false;

    // 3. Match sender JID digits with allowed array
    if (admin.whatsappAdminNumbers && admin.whatsappAdminNumbers.length > 0) {
      return admin.whatsappAdminNumbers.some(num => {
        const cleanNum = num.replace(/\D/g, '');
        return cleanSender === cleanNum || cleanSender.endsWith(cleanNum);
      });
    }

    // 4. Default: If allowed numbers is empty, only allow self (fromMe was checked above, so return false)
    return false;
  }

  /* ══════════════════════════════════════
     COMMAND HANDLERS (REPORT GENERATION)
     ══════════════════════════════════════ */

  private getHelpText(): string {
    return `🤖 *SMART SALES POS BOT ASSISTANT*
Hello Admin! Use the following reporting commands to retrieve live POS system analytics:

🏪 \`/shops\` - List customer retail shops
🧾 \`/bills\` - View unpaid remaining bills
📦 \`/orders\` - View 10 most recent orders
💰 \`/udar\` - Outstanding udhar ledgers sum
⚠️ \`/stock\` - Critically low-stock alerts
📊 \`/today\` - Today's sales performance audit
👥 \`/users\` - List all salesmen & team members
ℹ️ \`/info\` - Admin account & system summary
❓ \`/help\` - View this command manual`;
  }

  private async getShopsReport(shopId: string): Promise<string> {
    const shops = await this.shopModel.find({ shopId: new Types.ObjectId(shopId) }).sort({ id: 1 }).exec();
    let response = `🏪 *CUSTOMER SHOPS REPORT*\n\n`;
    
    if (shops.length === 0) {
      response += `📭 No customer shops found registered in your account.`;
    } else {
      shops.forEach((s, idx) => {
        response += `${idx + 1}. *${s.name}*\n`;
        response += `   Owner: ${s.owner || 'N/A'}\n`;
        response += `   Phone: ${s.phone || 'N/A'} | Status: *${s.status?.toUpperCase() || 'ACTIVE'}*\n\n`;
      });
      response += `Total Registered Shops: *${shops.length}*`;
    }
    return response;
  }

  private async getBillsReport(shopId: string): Promise<string> {
    const orders = await this.orderModel.find({ shopId: new Types.ObjectId(shopId), payment: 'Udaar' }).exec();
    let response = `🧾 *UNPAID REMAINING BILLS (UDAAR ORDER LEDGER)*\n\n`;

    if (orders.length === 0) {
      response += `✅ Perfect! No outstanding unpaid order bills found in your logs.`;
    } else {
      let totalOutstanding = 0;
      let count = 0;

      orders.forEach((o) => {
        const orderTotal = o.products.reduce((s, p) => s + (p.price * p.qty), 0);
        const remaining = orderTotal - (o.advance || 0);

        if (remaining > 0) {
          count++;
          totalOutstanding += remaining;
          response += `• *Invoice ${o.id}* (${o.shop || o.customer})\n`;
          response += `  Total: ₨ ${Math.round(orderTotal).toLocaleString()} | AdvancePaid: ₨ ${Math.round(o.advance || 0).toLocaleString()}\n`;
          response += `  *Remaining Unpaid: ₨ ${Math.round(remaining).toLocaleString()}*\n\n`;
        }
      });

      if (count === 0) {
        response += `✅ Perfect! No outstanding unpaid order bills found in your logs.`;
      } else {
        response += `Total Outstanding Remaining Bills: *₨ ${Math.round(totalOutstanding).toLocaleString()}*`;
      }
    }
    return response;
  }

  private async getOrdersReport(shopId: string): Promise<string> {
    const orders = await this.orderModel.find({ shopId: new Types.ObjectId(shopId) }).sort({ createdAt: -1 }).limit(10).exec();
    let response = `📦 *RECENT ORDERS LEDGER (LATEST 10)*\n\n`;

    if (orders.length === 0) {
      response += `📭 No orders have been placed in this system yet.`;
    } else {
      orders.forEach((o) => {
        const orderTotal = o.products.reduce((s, p) => s + (p.price * p.qty), 0);
        response += `• *#${o.id}* | ${o.shop || o.customer}\n`;
        response += `  Amount: ₨ ${Math.round(orderTotal).toLocaleString()} | Status: *${o.status.toUpperCase()}*\n`;
        response += `  Date: ${o.date} | Payment: *${o.payment || 'Paid'}*\n\n`;
      });
    }
    return response;
  }

  private async getUdharReport(shopId: string): Promise<string> {
    const sId = new Types.ObjectId(shopId);
    const activeShops = await this.shopModel.find({ shopId: sId }).exec();
    const activeShopIds = new Set(activeShops.map(s => s.id));
    const entries = await this.udharModel.find({ shopId: sId }).exec();
    
    // Filter ledger entries for active shops only
    const activeEntries = entries.filter(e => activeShopIds.has(e.customerId));
    
    // Accumulate balances per shop
    const shopBalances: { [id: number]: { name: string; balance: number } } = {};
    activeShops.forEach(s => {
      shopBalances[s.id] = { name: s.name, balance: 0 };
    });

    activeEntries.forEach(e => {
      if (shopBalances[e.customerId]) {
        shopBalances[e.customerId].balance += e.udharAmt;
      }
    });

    let response = `💰 *UDHAR GENERAL LEDGER OUTSTANDING BALANCE*\n\n`;
    let totalUdhar = 0;
    const shopsWithBalance = Object.values(shopBalances).filter(s => s.balance > 0);

    if (shopsWithBalance.length === 0) {
      response += `✅ Congratulations! No credit balances outstanding from any retail client.`;
    } else {
      shopsWithBalance.sort((a, b) => b.balance - a.balance).forEach((s, idx) => {
        totalUdhar += s.balance;
        response += `${idx + 1}. *${s.name}*: ₨ ${Math.round(s.balance).toLocaleString()}\n`;
      });
      response += `\nTotal Outstanding Credit (Udhar): *₨ ${Math.round(totalUdhar).toLocaleString()}*`;
    }
    return response;
  }

  private async getStockReport(shopId: string): Promise<string> {
    const products = await this.productModel.find({ shopId: new Types.ObjectId(shopId) }).exec();
    const lowStock = products.filter(p => {
      const thresh = p.threshold !== undefined && p.threshold !== null ? Number(p.threshold) : 10;
      return p.stock <= thresh;
    });

    let response = `⚠️ *LOW STOCK CRITICAL ALERTS*\n\n`;
    if (lowStock.length === 0) {
      response += `✅ Excellent! All products have healthy stock levels.`;
    } else {
      lowStock.sort((a, b) => a.stock - b.stock).slice(0, 15).forEach((p, idx) => {
        const status = p.stock === 0 ? '🚨 CRITICAL' : '⚠️ LOW';
        response += `${idx + 1}. *${p.name}*\n`;
        response += `   Stock: ${p.stock} pcs | Threshold: ${p.threshold ?? 10} pcs [${status}]\n\n`;
      });

      if (lowStock.length > 15) {
        response += `...and ${lowStock.length - 15} other items.\n\n`;
      }
      response += `Total Low Stock Items: *${lowStock.length}*`;
    }
    return response;
  }

  private async getTodayReport(shopId: string): Promise<string> {
    const sId = new Types.ObjectId(shopId);
    const orders = await this.orderModel.find({ shopId: sId }).exec();
    const products = await this.productModel.find({ shopId: sId }).exec();

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayOrders = orders.filter(o => {
      const oDate = parseOrderDate(o.date, o.time);
      return oDate >= todayStart;
    });

    const activeOrders = todayOrders.filter(o => o.status !== 'cancelled');
    const salesTotal = activeOrders.reduce((sum, o) => {
      const oTotal = o.products.reduce((s, p) => s + (p.price * p.qty), 0);
      return sum + oTotal;
    }, 0);

    const deliveredCount = activeOrders.filter(o => o.status === 'completed' || o.status === 'approved').length;

    let grossProfit = 0;
    activeOrders.forEach(o => {
      o.products.forEach(op => {
        const dbProd = products.find(p => p.name.toLowerCase() === op.name.toLowerCase());
        if (dbProd && dbProd.purchase !== undefined && dbProd.selling !== undefined) {
          grossProfit += (dbProd.selling - dbProd.purchase) * op.qty;
        } else {
          grossProfit += op.price * op.qty * 0.25; // default fallback 25% profit margin
        }
      });
    });

    const formattedDate = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    let response = `📊 *TODAY'S BUSINESS SALES REPORT (${formattedDate})*\n\n`;
    response += `🧾 Orders Placed: *${todayOrders.length}*\n`;
    response += `💰 Gross Sales: *₨ ${Math.round(salesTotal).toLocaleString()}*\n`;
    response += `📈 Estimated Profit: *₨ ${Math.round(grossProfit).toLocaleString()}*\n`;
    response += `📦 Completed Deliveries: *${deliveredCount}*\n`;
    
    const cancelledCount = todayOrders.length - activeOrders.length;
    if (cancelledCount > 0) {
      response += `⚠️ Cancelled Orders: *${cancelledCount}*\n`;
    }

    return response;
  }

  private async getUsersReport(shopId: string): Promise<string> {
    const sId = new Types.ObjectId(shopId);
    const users = await this.userModel.find({ shopId: sId }).exec();
    
    let response = `👥 *TEAM MEMBERS & SALESMEN REPORT*\n\n`;
    
    if (users.length === 0) {
      response += `📭 No team members or salesmen found linked to your account.`;
    } else {
      const salesmen = users.filter(u => u.role === 'salesman');
      
      if (salesmen.length === 0) {
        response += `📭 No salesmen registered yet.\n`;
      } else {
        salesmen.forEach((u, idx) => {
          response += `${idx + 1}. *${u.name}*\n`;
          response += `   📧 Email: ${u.email}\n`;
          response += `   📱 Phone: ${u.phone || 'N/A'}\n`;
          response += `   🆔 CNIC: ${u.cnic || 'N/A'}\n`;
          response += `   📊 Sales: *${u.sales || 0}* | Orders: *${u.orders || 0}*\n`;
          response += `   Status: *${u.status?.toUpperCase() || 'ACTIVE'}*\n\n`;
        });
      }

      response += `Total Team Members: *${salesmen.length}*`;
    }
    return response;
  }

  private async getAdminInfoReport(shopId: string): Promise<string> {
    const admin = await this.userModel.findById(shopId).exec();
    if (!admin) {
      return `❌ Admin account not found.`;
    }

    const sId = new Types.ObjectId(shopId);
    const [shopsCount, productsCount, ordersCount, usersCount] = await Promise.all([
      this.shopModel.countDocuments({ shopId: sId }).exec(),
      this.productModel.countDocuments({ shopId: sId }).exec(),
      this.orderModel.countDocuments({ shopId: sId }).exec(),
      this.userModel.countDocuments({ shopId: sId }).exec(),
    ]);

    let response = `ℹ️ *ADMIN ACCOUNT & SYSTEM INFORMATION*\n\n`;
    response += `👤 *Admin Profile*\n`;
    response += `   Name: *${admin.name}*\n`;
    response += `   Email: ${admin.email}\n`;
    response += `   Role: *${admin.role?.toUpperCase()}*\n`;
    response += `   Status: *${admin.status?.toUpperCase() || 'ACTIVE'}*\n`;
    
    if (admin.plan) {
      response += `   Plan: *${admin.plan}*\n`;
    }
    if (admin.expiryDate) {
      response += `   Expiry: ${admin.expiryDate}\n`;
    }
    if (admin.feeStatus) {
      response += `   Fee Status: *${admin.feeStatus}*\n`;
    }

    response += `\n📊 *System Summary*\n`;
    response += `   🏪 Total Shops: *${shopsCount}*\n`;
    response += `   📦 Total Products: *${productsCount}*\n`;
    response += `   🧾 Total Orders: *${ordersCount}*\n`;
    response += `   👥 Team Members: *${usersCount}*\n`;

    return response;
  }
}
