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
exports.ShopsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const shop_schema_1 = require("./schemas/shop.schema");
let ShopsService = class ShopsService {
    shopModel;
    constructor(shopModel) {
        this.shopModel = shopModel;
    }
    async findAll(shopId, search, status) {
        const sId = typeof shopId === 'string' ? new mongoose_2.Types.ObjectId(shopId) : shopId;
        const query = { shopId: sId };
        if (status && status !== 'all')
            query.status = status;
        if (search) {
            const re = new RegExp(search, 'i');
            query.$or = [{ name: re }, { owner: re }, { city: re }, { phone: re }];
        }
        return this.shopModel.find(query).sort({ id: 1 }).exec();
    }
    async create(shopId, createShopDto) {
        const sId = typeof shopId === 'string' ? new mongoose_2.Types.ObjectId(shopId) : shopId;
        const shops = await this.shopModel.find({ shopId: sId }).exec();
        const ids = shops.map(s => s.id).filter(id => id > 0);
        const maxId = ids.length ? Math.max(...ids) : 0;
        const nextId = maxId + 1;
        const today = new Date().toISOString().split('T')[0];
        const newShop = new this.shopModel({
            ...createShopDto,
            id: nextId,
            created: today,
            shopId: sId,
            status: createShopDto.status || 'active',
        });
        return newShop.save();
    }
    async update(shopId, id, updateShopDto) {
        const sId = typeof shopId === 'string' ? new mongoose_2.Types.ObjectId(shopId) : shopId;
        const { _id, id: bodyId, shopId: bodyShopId, createdAt, updatedAt, __v, ...safeUpdateData } = updateShopDto;
        const shop = await this.shopModel.findOneAndUpdate({ id, shopId: sId }, safeUpdateData, { new: true }).exec();
        if (!shop) {
            throw new common_1.NotFoundException(`Customer shop with ID ${id} not found under this tenant`);
        }
        return shop;
    }
    async delete(shopId, id) {
        const sId = typeof shopId === 'string' ? new mongoose_2.Types.ObjectId(shopId) : shopId;
        const result = await this.shopModel.deleteOne({ id, shopId: sId }).exec();
        if (result.deletedCount === 0) {
            throw new common_1.NotFoundException(`Customer shop with ID ${id} not found under this tenant`);
        }
        try {
            await this.shopModel.db.collection('udhars').deleteMany({ customerId: id, shopId: sId });
        }
        catch (e) {
            console.error('Failed to cascade delete udhars:', e);
        }
        return { message: 'Customer shop deleted successfully', id };
    }
};
exports.ShopsService = ShopsService;
exports.ShopsService = ShopsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(shop_schema_1.Shop.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], ShopsService);
//# sourceMappingURL=shops.service.js.map