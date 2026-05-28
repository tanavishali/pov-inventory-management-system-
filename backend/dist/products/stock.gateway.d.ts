import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ProductsService } from './products.service';
export declare class StockGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private readonly productsService;
    server: Server;
    constructor(productsService: ProductsService);
    handleConnection(client: Socket): void;
    handleDisconnect(client: Socket): void;
    handleJoinShop(data: {
        shopId: string;
    }, client: Socket): Promise<{
        error: string;
        success?: undefined;
        room?: undefined;
    } | {
        success: boolean;
        room: string;
        error?: undefined;
    }>;
    sendCurrentStockStatus(shopId: string): Promise<void>;
    emitLowStockAlert(shopId: string, product: any): void;
}
