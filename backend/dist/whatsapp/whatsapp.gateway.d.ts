import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { OnModuleInit } from '@nestjs/common';
import { WhatsappService } from './whatsapp.service';
export declare class WhatsappGateway implements OnGatewayConnection, OnGatewayDisconnect, OnModuleInit {
    private readonly whatsappService;
    server: Server;
    constructor(whatsappService: WhatsappService);
    onModuleInit(): void;
    handleConnection(client: Socket): void;
    handleDisconnect(client: Socket): void;
    handleJoinWhatsapp(data: {
        shopId: string;
    }, client: Socket): Promise<{
        error: string;
        success?: undefined;
    } | {
        success: boolean;
        error?: undefined;
    }>;
    handleConnect(data: {
        shopId: string;
    }): Promise<{
        error: string;
        success?: undefined;
    } | {
        success: boolean;
        error?: undefined;
    }>;
    handleDisconnectSession(data: {
        shopId: string;
    }): Promise<{
        error: string;
        success?: undefined;
    } | {
        success: boolean;
        error?: undefined;
    }>;
}
