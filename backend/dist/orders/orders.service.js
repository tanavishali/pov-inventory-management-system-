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
exports.OrdersService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const order_schema_1 = require("./schemas/order.schema");
let OrdersService = class OrdersService {
    orderModel;
    constructor(orderModel) {
        this.orderModel = orderModel;
    }
    async findAll(shopId) {
        const sId = typeof shopId === 'string' ? new mongoose_2.Types.ObjectId(shopId) : shopId;
        return this.orderModel.find({ shopId: sId }).sort({ createdAt: -1 }).exec();
    }
    async create(shopId, createOrderDto) {
        const sId = typeof shopId === 'string' ? new mongoose_2.Types.ObjectId(shopId) : shopId;
        const orders = await this.orderModel.find({ shopId: sId }).exec();
        let maxNum = 0;
        orders.forEach(o => {
            if (o.id) {
                const match = o.id.match(/INV-(\d+)/);
                if (match) {
                    const num = parseInt(match[1]);
                    if (num > maxNum) {
                        maxNum = num;
                    }
                }
            }
        });
        const nextIdNum = maxNum + 1;
        const id = `INV-${String(nextIdNum).padStart(3, '0')}`;
        const now = new Date();
        const dateStr = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
        const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        const newOrder = new this.orderModel({
            ...createOrderDto,
            id,
            status: 'pending',
            date: dateStr,
            time: timeStr,
            shopId: sId,
        });
        return newOrder.save();
    }
    async update(shopId, id, updateOrderDto) {
        const sId = typeof shopId === 'string' ? new mongoose_2.Types.ObjectId(shopId) : shopId;
        const { _id, id: bodyId, shopId: bodyShopId, createdAt, updatedAt, __v, ...safeUpdateData } = updateOrderDto;
        const order = await this.orderModel.findOneAndUpdate({ id, shopId: sId }, safeUpdateData, { new: true }).exec();
        if (!order) {
            throw new common_1.NotFoundException(`Order with ID ${id} not found in this shop`);
        }
        return order;
    }
    async delete(shopId, id) {
        const sId = typeof shopId === 'string' ? new mongoose_2.Types.ObjectId(shopId) : shopId;
        const result = await this.orderModel.deleteOne({ id, shopId: sId }).exec();
        if (result.deletedCount === 0) {
            throw new common_1.NotFoundException(`Order with ID ${id} not found in this shop`);
        }
        return { message: 'Order deleted successfully', id };
    }
};
exports.OrdersService = OrdersService;
exports.OrdersService = OrdersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(order_schema_1.Order.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], OrdersService);
//# sourceMappingURL=orders.service.js.map