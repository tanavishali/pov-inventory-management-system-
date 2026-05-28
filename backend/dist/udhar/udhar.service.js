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
exports.UdharService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const udhar_schema_1 = require("./schemas/udhar.schema");
const shop_schema_1 = require("../shops/schemas/shop.schema");
let UdharService = class UdharService {
    udharModel;
    shopModel;
    constructor(udharModel, shopModel) {
        this.udharModel = udharModel;
        this.shopModel = shopModel;
    }
    async findAll(shopId) {
        const sId = typeof shopId === 'string' ? new mongoose_2.Types.ObjectId(shopId) : shopId;
        const activeShops = await this.shopModel.find({ shopId: sId }).exec();
        const activeShopIds = new Set(activeShops.map(s => s.id));
        const entries = await this.udharModel.find({ shopId: sId }).sort({ createdAt: 1 }).exec();
        return entries.filter(e => activeShopIds.has(e.customerId));
    }
    async create(shopId, createUdharDto) {
        const sId = typeof shopId === 'string' ? new mongoose_2.Types.ObjectId(shopId) : shopId;
        let transactionId = createUdharDto.id;
        if (!transactionId) {
            const entries = await this.udharModel.find({ shopId: sId }).exec();
            let maxId = 300;
            entries.forEach(e => {
                const num = parseInt(e.id);
                if (!isNaN(num) && num > maxId) {
                    maxId = num;
                }
            });
            transactionId = String(maxId + 1);
        }
        const newUdhar = new this.udharModel({
            ...createUdharDto,
            id: transactionId,
            shopId: sId,
        });
        return newUdhar.save();
    }
    async update(shopId, id, updateUdharDto) {
        const sId = typeof shopId === 'string' ? new mongoose_2.Types.ObjectId(shopId) : shopId;
        const { _id, id: bodyId, shopId: bodyShopId, createdAt, updatedAt, __v, ...safeUpdateData } = updateUdharDto;
        const query = mongoose_2.Types.ObjectId.isValid(id)
            ? { _id: new mongoose_2.Types.ObjectId(id), shopId: sId }
            : { id, shopId: sId };
        const entry = await this.udharModel.findOneAndUpdate(query, safeUpdateData, { new: true }).exec();
        if (!entry) {
            throw new common_1.NotFoundException(`Ledger entry with ID ${id} not found under this tenant`);
        }
        return entry;
    }
    async delete(shopId, id) {
        const sId = typeof shopId === 'string' ? new mongoose_2.Types.ObjectId(shopId) : shopId;
        const query = mongoose_2.Types.ObjectId.isValid(id)
            ? { _id: new mongoose_2.Types.ObjectId(id), shopId: sId }
            : { id, shopId: sId };
        const result = await this.udharModel.deleteOne(query).exec();
        if (result.deletedCount === 0) {
            throw new common_1.NotFoundException(`Ledger entry with ID ${id} not found under this tenant`);
        }
        return { message: 'Ledger entry deleted successfully', id };
    }
};
exports.UdharService = UdharService;
exports.UdharService = UdharService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(udhar_schema_1.Udhar.name)),
    __param(1, (0, mongoose_1.InjectModel)(shop_schema_1.Shop.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model])
], UdharService);
//# sourceMappingURL=udhar.service.js.map