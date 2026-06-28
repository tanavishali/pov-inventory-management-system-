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
exports.StockGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const common_1 = require("@nestjs/common");
const products_service_1 = require("./products.service");
let StockGateway = class StockGateway {
    productsService;
    server;
    constructor(productsService) {
        this.productsService = productsService;
    }
    handleConnection(client) {
        console.log(`Client connected to WebSocket: ${client.id}`);
    }
    handleDisconnect(client) {
        console.log(`Client disconnected from WebSocket: ${client.id}`);
    }
    async handleJoinShop(data, client) {
        if (!data || !data.shopId)
            return { error: 'shopId is required' };
        client.join(data.shopId);
        console.log(`Socket client ${client.id} joined room ${data.shopId}`);
        await this.sendCurrentStockStatus(data.shopId);
        return { success: true, room: data.shopId };
    }
    async sendCurrentStockStatus(shopId) {
        try {
            const allProducts = await this.productsService.findAll(shopId);
            const lowStockItems = allProducts.filter(p => p.stock === 0 || p.stock <= (p.threshold ?? 10));
            this.server.to(shopId).emit('stock-status', {
                shopId,
                lowStockItems: lowStockItems.map(p => ({
                    id: p.id,
                    name: p.name,
                    stock: p.stock,
                    threshold: p.threshold ?? 10,
                })),
            });
        }
        catch (e) {
            console.error('Failed to send stock status:', e);
        }
    }
    emitLowStockAlert(shopId, product) {
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
};
exports.StockGateway = StockGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], StockGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('join-shop'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], StockGateway.prototype, "handleJoinShop", null);
exports.StockGateway = StockGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: '*',
        },
    }),
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)((0, common_1.forwardRef)(() => products_service_1.ProductsService))),
    __metadata("design:paramtypes", [products_service_1.ProductsService])
], StockGateway);
//# sourceMappingURL=stock.gateway.js.map