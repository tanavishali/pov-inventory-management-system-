"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WhatsappService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const events_1 = require("events");
const path_1 = require("path");
const fs_1 = require("fs");
const pino_1 = __importDefault(require("pino"));
const user_schema_1 = require("../users/schemas/user.schema");
const shop_schema_1 = require("../shops/schemas/shop.schema");
const order_schema_1 = require("../orders/schemas/order.schema");
const udhar_schema_1 = require("../udhar/schemas/udhar.schema");
const product_schema_1 = require("../products/schemas/product.schema");
function parseOrderDate(dateStr, timeStr) {
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
                    if (ampm === 'PM' && hours < 12)
                        hours += 12;
                    if (ampm === 'AM' && hours === 12)
                        hours = 0;
                }
            }
            if (month !== -1) {
                return new Date(year, month, day, hours, minutes);
            }
        }
    }
    catch (e) {
        console.error('Failed to parse date in whatsapp service:', dateStr, e);
    }
    return new Date();
}
let WhatsappService = class WhatsappService extends events_1.EventEmitter {
    userModel;
    shopModel;
    orderModel;
    udharModel;
    productModel;
    activeSockets = new Map();
    connectionStatuses = new Map();
    connectedJids = new Map();
    pendingConnects = new Set();
    welcomeSentShops = new Set();
    reconnectTimers = new Map();
    constructor(userModel, shopModel, orderModel, udharModel, productModel) {
        super();
        this.userModel = userModel;
        this.shopModel = shopModel;
        this.orderModel = orderModel;
        this.udharModel = udharModel;
        this.productModel = productModel;
    }
    async onModuleInit() {
        console.log('WhatsappService initialized. Multi-tenant WhatsApp bot loading.');
    }
    async onModuleDestroy() {
        for (const [shopId, sock] of this.activeSockets.entries()) {
            try {
                console.log(`Closing WhatsApp socket for shop ${shopId} on module destroy`);
                sock.end(undefined);
            }
            catch (err) {
                console.error(`Failed to close socket for shop ${shopId}:`, err);
            }
        }
        this.activeSockets.clear();
    }
    getConnectionInfo(shopId) {
        const status = this.connectionStatuses.get(shopId) || 'disconnected';
        const jid = this.connectedJids.get(shopId) || null;
        const phone = jid ? jid.split('@')[0] : null;
        return { status, phone };
    }
    async updateSettings(shopId, whatsappAdminNumbers) {
        const admin = await this.userModel.findByIdAndUpdate(shopId, { whatsappAdminNumbers }, { new: true }).exec();
        if (!admin) {
            throw new common_1.NotFoundException(`Admin user with ID ${shopId} not found`);
        }
        return admin;
    }
    async getSettings(shopId) {
        const admin = await this.userModel.findById(shopId).exec();
        if (!admin) {
            throw new common_1.NotFoundException(`Admin user with ID ${shopId} not found`);
        }
        return admin.whatsappAdminNumbers || [];
    }
    async connect(shopId) {
        if (this.activeSockets.has(shopId)) {
            const status = this.connectionStatuses.get(shopId);
            if (status === 'connected' || status === 'connecting') {
                console.log(`WhatsApp socket for shop ${shopId} is already ${status}. Skipping init.`);
                return;
            }
        }
        if (this.pendingConnects.has(shopId)) {
            console.log(`WhatsApp connect() already in progress for shop ${shopId}. Skipping.`);
            return;
        }
        this.pendingConnects.add(shopId);
        const existing = this.reconnectTimers.get(shopId);
        if (existing) {
            clearTimeout(existing);
            this.reconnectTimers.delete(shopId);
        }
        this.connectionStatuses.set(shopId, 'connecting');
        this.emit('status', { shopId, status: 'connecting' });
        try {
            const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = await import('@whiskeysockets/baileys');
            const QRCode = await import('qrcode');
            const sessionDir = (0, path_1.join)(process.cwd(), 'sessions', `session-${shopId}`);
            const { state, saveCreds } = await useMultiFileAuthState(sessionDir);
            const sock = makeWASocket({
                auth: state,
                logger: (0, pino_1.default)({ level: 'silent' }),
                printQRInTerminal: false,
            });
            this.activeSockets.set(shopId, sock);
            this.pendingConnects.delete(shopId);
            sock.ev.on('creds.update', saveCreds);
            sock.ev.on('connection.update', async (update) => {
                const { connection, lastDisconnect, qr } = update;
                if (qr) {
                    try {
                        const qrImageBase64 = await QRCode.toDataURL(qr);
                        this.emit('qr', { shopId, qr: qrImageBase64 });
                    }
                    catch (err) {
                        console.error(`Failed to generate QR for shop ${shopId}:`, err);
                    }
                }
                if (connection === 'close') {
                    const statusCode = lastDisconnect?.error?.output?.statusCode;
                    const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
                    console.log(`WhatsApp connection closed for shop ${shopId}. Status code: ${statusCode}. Reconnecting: ${shouldReconnect}`);
                    this.connectionStatuses.set(shopId, 'disconnected');
                    this.connectedJids.delete(shopId);
                    this.activeSockets.delete(shopId);
                    this.emit('status', { shopId, status: 'disconnected' });
                    if (!shouldReconnect) {
                        this.welcomeSentShops.delete(shopId);
                        try {
                            if ((0, fs_1.existsSync)(sessionDir)) {
                                (0, fs_1.rmSync)(sessionDir, { recursive: true, force: true });
                                console.log(`Deleted credentials folder for shop ${shopId}`);
                            }
                        }
                        catch (err) {
                            console.error(`Failed to delete session directory for shop ${shopId}:`, err);
                        }
                    }
                    else {
                        const timer = setTimeout(() => {
                            this.reconnectTimers.delete(shopId);
                            this.connect(shopId);
                        }, 3000);
                        this.reconnectTimers.set(shopId, timer);
                    }
                }
                else if (connection === 'open') {
                    console.log(`WhatsApp connection established successfully for shop ${shopId}`);
                    const botId = sock.user?.id;
                    if (botId) {
                        const jid = botId.split(':')[0] + '@s.whatsapp.net';
                        this.connectionStatuses.set(shopId, 'connected');
                        this.connectedJids.set(shopId, jid);
                        this.emit('status', { shopId, status: 'connected', phone: botId.split(':')[0] });
                        if (!this.welcomeSentShops.has(shopId)) {
                            this.welcomeSentShops.add(shopId);
                            try {
                                await sock.sendMessage(jid, {
                                    text: `🤖 *SMART SALES POS BOT ACTIVATED*\n\nHello Admin!\n\nYour WhatsApp Bot has been successfully linked to your POS system! 🎉\n\nYou can now query live reporting metrics directly from this chat on the go.\n\nType */help* to see all available commands! 🚀`
                                });
                            }
                            catch (err) {
                                console.error(`Failed to send welcome message for shop ${shopId}:`, err);
                            }
                        }
                    }
                }
            });
            sock.ev.on('messages.upsert', async (upsert) => {
                console.log(`[WA UPSERT] Shop ${shopId} | Type: "${upsert.type}" | Messages count: ${upsert.messages?.length}`);
                if (upsert.type !== 'notify')
                    return;
                const nowSec = Math.floor(Date.now() / 1000);
                for (const message of upsert.messages) {
                    try {
                        console.log(`[WA RAW MSG] Key:`, JSON.stringify(message.key), `| StubType: ${message.messageStubType} | HasMsg: ${!!message.message} | MsgKeys: ${message.message ? Object.keys(message.message) : 'N/A'}`);
                        const msgTimestamp = Number(message.messageTimestamp ?? 0);
                        if (msgTimestamp && nowSec - msgTimestamp > 30) {
                            console.log(`[WA SKIP] Stale message (age ${nowSec - msgTimestamp}s), ignoring`);
                            continue;
                        }
                        if (!message.message) {
                            console.log(`[WA SKIP] No message body (stubType: ${message.messageStubType})`);
                            continue;
                        }
                        const msgKeys = Object.keys(message.message);
                        const isProtocolOnly = msgKeys.length === 1 && (msgKeys[0] === 'protocolMessage' ||
                            msgKeys[0] === 'reactionMessage' ||
                            msgKeys[0] === 'senderKeyDistributionMessage');
                        if (isProtocolOnly) {
                            console.log(`[WA SKIP] Protocol-only message: ${msgKeys[0]}`);
                            continue;
                        }
                        await this.handleIncomingMessage(shopId, sock, message);
                    }
                    catch (err) {
                        console.error(`Error handling message for shop ${shopId}:`, err);
                    }
                }
            });
            sock.ev.on('messages.update', (updates) => {
                console.log(`[WA MSG UPDATE] Shop ${shopId} | ${updates.length} message updates received`);
            });
        }
        catch (err) {
            console.error(`Failed to launch WhatsApp socket for shop ${shopId}:`, err);
            this.connectionStatuses.set(shopId, 'disconnected');
            this.emit('status', { shopId, status: 'disconnected' });
        }
    }
    async disconnect(shopId) {
        const sock = this.activeSockets.get(shopId);
        if (sock) {
            try {
                console.log(`Logging out WhatsApp session for shop ${shopId}`);
                await sock.logout();
                sock.end(undefined);
            }
            catch (err) {
                console.error(`Failed to cleanly log out of WhatsApp socket for shop ${shopId}:`, err);
            }
        }
        const timer = this.reconnectTimers.get(shopId);
        if (timer) {
            clearTimeout(timer);
            this.reconnectTimers.delete(shopId);
        }
        this.welcomeSentShops.delete(shopId);
        this.pendingConnects.delete(shopId);
        this.activeSockets.delete(shopId);
        this.connectionStatuses.set(shopId, 'disconnected');
        this.connectedJids.delete(shopId);
        const sessionDir = (0, path_1.join)(process.cwd(), 'sessions', `session-${shopId}`);
        try {
            if ((0, fs_1.existsSync)(sessionDir)) {
                (0, fs_1.rmSync)(sessionDir, { recursive: true, force: true });
                console.log(`Deleted credentials folder for shop ${shopId} on manual disconnect`);
            }
        }
        catch (err) {
            console.error(`Failed to delete credentials folder for shop ${shopId}:`, err);
        }
        this.emit('status', { shopId, status: 'disconnected' });
    }
    getMessageText(message) {
        if (!message || !message.message)
            return '';
        let msg = message.message;
        if (msg.ephemeralMessage?.message) {
            msg = msg.ephemeralMessage.message;
        }
        if (msg.viewOnceMessage?.message) {
            msg = msg.viewOnceMessage.message;
        }
        if (msg.viewOnceMessageV2?.message) {
            msg = msg.viewOnceMessageV2.message;
        }
        if (msg.documentWithCaptionMessage?.message) {
            msg = msg.documentWithCaptionMessage.message;
        }
        if (!msg)
            return '';
        const text = msg.conversation ||
            msg.extendedTextMessage?.text ||
            msg.imageMessage?.caption ||
            msg.videoMessage?.caption ||
            msg.documentMessage?.caption ||
            msg.buttonsResponseMessage?.selectedDisplayText ||
            msg.listResponseMessage?.title ||
            msg.templateButtonReplyMessage?.selectedDisplayText ||
            msg.body ||
            '';
        return text;
    }
    async handleIncomingMessage(shopId, sock, message) {
        const fromMe = message.key.fromMe;
        const remoteJid = message.key.remoteJid;
        const remoteJidAlt = message.key.remoteJidAlt;
        if (!remoteJid)
            return;
        const isDM = remoteJid.endsWith('@s.whatsapp.net') || remoteJid.endsWith('@lid');
        if (!isDM)
            return;
        const phoneJid = remoteJidAlt || remoteJid;
        const replyJid = remoteJid;
        const textContent = this.getMessageText(message);
        console.log(`[WA BOT] JID: "${remoteJid}" | AltJID: "${remoteJidAlt || 'none'}" | fromMe: ${fromMe} | Text: "${textContent}" | MessageKeys:`, Object.keys(message.message || {}));
        if (textContent === '' && message.message) {
            console.log(`[WA BOT DEBUG] Raw Message JSON:`, JSON.stringify(message.message));
        }
        const trimmed = textContent.trim();
        if (!trimmed.startsWith('/'))
            return;
        const parsedCommand = trimmed.toLowerCase().split(' ')[0];
        const botId = sock.user?.id;
        if (!botId)
            return;
        const botJid = botId.split(':')[0] + '@s.whatsapp.net';
        const senderJid = fromMe ? botJid : phoneJid;
        const isAuth = await this.isAuthorized(shopId, senderJid, fromMe);
        console.log(`[WA SECURITY] Sender: "${senderJid}" | fromMe: ${fromMe} | Authorized: ${isAuth}`);
        if (!isAuth) {
            console.log(`Unauthorized WhatsApp query blocked from ${senderJid} targeting shop ${shopId}`);
            return;
        }
        console.log(`Processing authorized command "${parsedCommand}" from JID ${senderJid} (shop ${shopId})`);
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
        await sock.sendMessage(replyJid, { text: responseText }, { quoted: message });
    }
    async isAuthorized(shopId, senderJid, fromMe) {
        const senderPhone = senderJid.split('@')[0];
        const cleanSender = senderPhone.replace(/\D/g, '');
        if (fromMe)
            return true;
        const admin = await this.userModel.findById(shopId).exec();
        if (!admin)
            return false;
        if (admin.whatsappAdminNumbers && admin.whatsappAdminNumbers.length > 0) {
            return admin.whatsappAdminNumbers.some(num => {
                const cleanNum = num.replace(/\D/g, '');
                return cleanSender === cleanNum || cleanSender.endsWith(cleanNum);
            });
        }
        return false;
    }
    getHelpText() {
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
    async getShopsReport(shopId) {
        const shops = await this.shopModel.find({ shopId: new mongoose_2.Types.ObjectId(shopId) }).sort({ id: 1 }).exec();
        let response = `🏪 *CUSTOMER SHOPS REPORT*\n\n`;
        if (shops.length === 0) {
            response += `📭 No customer shops found registered in your account.`;
        }
        else {
            shops.forEach((s, idx) => {
                response += `${idx + 1}. *${s.name}*\n`;
                response += `   Owner: ${s.owner || 'N/A'}\n`;
                response += `   Phone: ${s.phone || 'N/A'} | Status: *${s.status?.toUpperCase() || 'ACTIVE'}*\n\n`;
            });
            response += `Total Registered Shops: *${shops.length}*`;
        }
        return response;
    }
    async getBillsReport(shopId) {
        const orders = await this.orderModel.find({ shopId: new mongoose_2.Types.ObjectId(shopId), payment: 'Udaar' }).exec();
        let response = `🧾 *UNPAID REMAINING BILLS (UDAAR ORDER LEDGER)*\n\n`;
        if (orders.length === 0) {
            response += `✅ Perfect! No outstanding unpaid order bills found in your logs.`;
        }
        else {
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
            }
            else {
                response += `Total Outstanding Remaining Bills: *₨ ${Math.round(totalOutstanding).toLocaleString()}*`;
            }
        }
        return response;
    }
    async getOrdersReport(shopId) {
        const orders = await this.orderModel.find({ shopId: new mongoose_2.Types.ObjectId(shopId) }).sort({ createdAt: -1 }).limit(10).exec();
        let response = `📦 *RECENT ORDERS LEDGER (LATEST 10)*\n\n`;
        if (orders.length === 0) {
            response += `📭 No orders have been placed in this system yet.`;
        }
        else {
            orders.forEach((o) => {
                const orderTotal = o.products.reduce((s, p) => s + (p.price * p.qty), 0);
                response += `• *#${o.id}* | ${o.shop || o.customer}\n`;
                response += `  Amount: ₨ ${Math.round(orderTotal).toLocaleString()} | Status: *${o.status.toUpperCase()}*\n`;
                response += `  Date: ${o.date} | Payment: *${o.payment || 'Paid'}*\n\n`;
            });
        }
        return response;
    }
    async getUdharReport(shopId) {
        const sId = new mongoose_2.Types.ObjectId(shopId);
        const activeShops = await this.shopModel.find({ shopId: sId }).exec();
        const activeShopIds = new Set(activeShops.map(s => s.id));
        const entries = await this.udharModel.find({ shopId: sId }).exec();
        const activeEntries = entries.filter(e => activeShopIds.has(e.customerId));
        const shopBalances = {};
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
        }
        else {
            shopsWithBalance.sort((a, b) => b.balance - a.balance).forEach((s, idx) => {
                totalUdhar += s.balance;
                response += `${idx + 1}. *${s.name}*: ₨ ${Math.round(s.balance).toLocaleString()}\n`;
            });
            response += `\nTotal Outstanding Credit (Udhar): *₨ ${Math.round(totalUdhar).toLocaleString()}*`;
        }
        return response;
    }
    async getStockReport(shopId) {
        const products = await this.productModel.find({ shopId: new mongoose_2.Types.ObjectId(shopId) }).exec();
        const lowStock = products.filter(p => {
            const thresh = p.threshold !== undefined && p.threshold !== null ? Number(p.threshold) : 10;
            return p.stock <= thresh;
        });
        let response = `⚠️ *LOW STOCK CRITICAL ALERTS*\n\n`;
        if (lowStock.length === 0) {
            response += `✅ Excellent! All products have healthy stock levels.`;
        }
        else {
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
    async getTodayReport(shopId) {
        const sId = new mongoose_2.Types.ObjectId(shopId);
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
                }
                else {
                    grossProfit += op.price * op.qty * 0.25;
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
    async getUsersReport(shopId) {
        const sId = new mongoose_2.Types.ObjectId(shopId);
        const users = await this.userModel.find({ shopId: sId }).exec();
        let response = `👥 *TEAM MEMBERS & SALESMEN REPORT*\n\n`;
        if (users.length === 0) {
            response += `📭 No team members or salesmen found linked to your account.`;
        }
        else {
            const salesmen = users.filter(u => u.role === 'salesman');
            if (salesmen.length === 0) {
                response += `📭 No salesmen registered yet.\n`;
            }
            else {
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
    async getAdminInfoReport(shopId) {
        const admin = await this.userModel.findById(shopId).exec();
        if (!admin) {
            return `❌ Admin account not found.`;
        }
        const sId = new mongoose_2.Types.ObjectId(shopId);
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
};
exports.WhatsappService = WhatsappService;
exports.WhatsappService = WhatsappService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __param(1, (0, mongoose_1.InjectModel)(shop_schema_1.Shop.name)),
    __param(2, (0, mongoose_1.InjectModel)(order_schema_1.Order.name)),
    __param(3, (0, mongoose_1.InjectModel)(udhar_schema_1.Udhar.name)),
    __param(4, (0, mongoose_1.InjectModel)(product_schema_1.Product.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model])
], WhatsappService);
//# sourceMappingURL=whatsapp.service.js.map