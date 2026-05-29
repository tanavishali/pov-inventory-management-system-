import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { WhatsappService } from './whatsapp.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
@Injectable()
export class WhatsappGateway implements OnGatewayConnection, OnGatewayDisconnect, OnModuleInit {
  @WebSocketServer()
  server: Server;

  constructor(private readonly whatsappService: WhatsappService) {}

  onModuleInit() {
    // Pipe internal event emitters from service to WebSocket rooms
    this.whatsappService.on('qr', ({ shopId, qr }) => {
      console.log(`Websocket emitting QR update to shop room ${shopId}`);
      this.server.to(shopId).emit('whatsapp-qr', { qr });
    });

    this.whatsappService.on('status', ({ shopId, status, phone }) => {
      console.log(`Websocket emitting status update "${status}" to shop room ${shopId}`);
      this.server.to(shopId).emit('whatsapp-status', { status, phone });
    });
  }

  handleConnection(client: Socket) {
    console.log(`Client connected to WhatsApp WS: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected from WhatsApp WS: ${client.id}`);
  }

  @SubscribeMessage('join-whatsapp')
  async handleJoinWhatsapp(
    @MessageBody() data: { shopId: string },
    @ConnectedSocket() client: Socket,
  ) {
    if (!data || !data.shopId) return { error: 'shopId is required' };

    client.join(data.shopId);
    console.log(`Socket client ${client.id} joined WhatsApp room: ${data.shopId}`);

    // Send the current session status immediately upon joining!
    const sessionInfo = this.whatsappService.getConnectionInfo(data.shopId);
    client.emit('whatsapp-status', sessionInfo);

    return { success: true };
  }

  @SubscribeMessage('whatsapp-connect')
  async handleConnect(
    @MessageBody() data: { shopId: string },
  ) {
    if (!data || !data.shopId) return { error: 'shopId is required' };
    
    console.log(`Socket requested WhatsApp connection start for shop ${data.shopId}`);
    // Run async connect
    this.whatsappService.connect(data.shopId);

    return { success: true };
  }

  @SubscribeMessage('whatsapp-disconnect')
  async handleDisconnectSession(
    @MessageBody() data: { shopId: string },
  ) {
    if (!data || !data.shopId) return { error: 'shopId is required' };

    console.log(`Socket requested WhatsApp disconnection for shop ${data.shopId}`);
    await this.whatsappService.disconnect(data.shopId);

    return { success: true };
  }
}
