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
import { Injectable, forwardRef, Inject } from '@nestjs/common';
import { ProductsService } from './products.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
@Injectable()
export class StockGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    @Inject(forwardRef(() => ProductsService))
    private readonly productsService: ProductsService,
  ) {}

  handleConnection(client: Socket) {
    console.log(`Client connected to WebSocket: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected from WebSocket: ${client.id}`);
  }

  @SubscribeMessage('join-shop')
  async handleJoinShop(
    @MessageBody() data: { shopId: string },
    @ConnectedSocket() client: Socket,
  ) {
    if (!data || !data.shopId) return { error: 'shopId is required' };
    
    // Client joins the room for their specific shop/tenant
    client.join(data.shopId);
    console.log(`Socket client ${client.id} joined room ${data.shopId}`);

    // Send initial stock status immediately upon joining!
    await this.sendCurrentStockStatus(data.shopId);
    return { success: true, room: data.shopId };
  }

  /**
   * Broadcasts/emits the list of all low-stock items in a shop to its specific room
   */
  async sendCurrentStockStatus(shopId: string) {
    try {
      const allProducts = await this.productsService.findAll(shopId);
      const lowStockItems = allProducts.filter(
        p => p.stock === 0 || p.stock <= (p.threshold ?? 10),
      );
      
      this.server.to(shopId).emit('stock-status', {
        shopId,
        lowStockItems: lowStockItems.map(p => ({
          id: p.id,
          name: p.name,
          stock: p.stock,
          threshold: p.threshold ?? 10,
        })),
      });
    } catch (e) {
      console.error('Failed to send stock status:', e);
    }
  }

  /**
   * Emits a real-time notification alert when an item goes low stock
   */
  emitLowStockAlert(shopId: string, product: any) {
    this.server.to(shopId).emit('low-stock-alert', {
      message: `Stock Alert: "${product.name}" is low in stock!`,
      product: {
        id: product.id,
        name: product.name,
        stock: product.stock,
        threshold: product.threshold ?? 10,
      },
    });
  }
}
