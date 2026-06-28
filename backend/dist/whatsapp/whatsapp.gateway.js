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
Object.defineProperty(exports, "__esModule", { value: true });
exports.WhatsappGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const common_1 = require("@nestjs/common");
const whatsapp_service_1 = require("./whatsapp.service");
let WhatsappGateway = class WhatsappGateway {
    whatsappService;
    server;
    constructor(whatsappService) {
        this.whatsappService = whatsappService;
    }
    onModuleInit() {
        this.whatsappService.on('qr', ({ shopId, qr }) => {
            console.log(`Websocket emitting QR update to shop room ${shopId}`);
            this.server.to(shopId).emit('whatsapp-qr', { qr });
        });
        this.whatsappService.on('status', ({ shopId, status, phone }) => {
            console.log(`Websocket emitting status update "${status}" to shop room ${shopId}`);
            this.server.to(shopId).emit('whatsapp-status', { status, phone });
        });
    }
    handleConnection(client) {
        console.log(`Client connected to WhatsApp WS: ${client.id}`);
    }
    handleDisconnect(client) {
        console.log(`Client disconnected from WhatsApp WS: ${client.id}`);
    }
    async handleJoinWhatsapp(data, client) {
        if (!data || !data.shopId)
            return { error: 'shopId is required' };
        client.join(data.shopId);
        console.log(`Socket client ${client.id} joined WhatsApp room: ${data.shopId}`);
        const sessionInfo = this.whatsappService.getConnectionInfo(data.shopId);
        client.emit('whatsapp-status', sessionInfo);
        return { success: true };
    }
    async handleConnect(data) {
        if (!data || !data.shopId)
            return { error: 'shopId is required' };
        console.log(`Socket requested WhatsApp connection start for shop ${data.shopId}`);
        this.whatsappService.connect(data.shopId);
        return { success: true };
    }
    async handleDisconnectSession(data) {
        if (!data || !data.shopId)
            return { error: 'shopId is required' };
        console.log(`Socket requested WhatsApp disconnection for shop ${data.shopId}`);
        await this.whatsappService.disconnect(data.shopId);
        return { success: true };
    }
};
exports.WhatsappGateway = WhatsappGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], WhatsappGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('join-whatsapp'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], WhatsappGateway.prototype, "handleJoinWhatsapp", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('whatsapp-connect'),
    __param(0, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], WhatsappGateway.prototype, "handleConnect", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('whatsapp-disconnect'),
    __param(0, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], WhatsappGateway.prototype, "handleDisconnectSession", null);
exports.WhatsappGateway = WhatsappGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: '*',
        },
    }),
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [whatsapp_service_1.WhatsappService])
], WhatsappGateway);
//# sourceMappingURL=whatsapp.gateway.js.map