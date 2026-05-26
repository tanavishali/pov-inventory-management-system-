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
exports.ProductsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const product_schema_1 = require("./schemas/product.schema");
let ProductsService = class ProductsService {
    productModel;
    constructor(productModel) {
        this.productModel = productModel;
    }
    async findAll(shopId) {
        const sId = typeof shopId === 'string' ? new mongoose_2.Types.ObjectId(shopId) : shopId;
        return this.productModel.find({ shopId: sId }).sort({ id: 1 }).exec();
    }
    async create(shopId, createProductDto) {
        const sId = typeof shopId === 'string' ? new mongoose_2.Types.ObjectId(shopId) : shopId;
        const products = await this.productModel.find({ shopId: sId }).exec();
        let maxId = 0;
        products.forEach(p => {
            if (p.id > maxId) {
                maxId = p.id;
            }
        });
        const nextId = maxId + 1;
        const newProduct = new this.productModel({
            ...createProductDto,
            id: nextId,
            shopId: sId,
        });
        return newProduct.save();
    }
    async update(shopId, id, updateProductDto) {
        const sId = typeof shopId === 'string' ? new mongoose_2.Types.ObjectId(shopId) : shopId;
        const { _id, id: bodyId, shopId: bodyShopId, createdAt, updatedAt, __v, ...safeUpdateData } = updateProductDto;
        const product = await this.productModel.findOneAndUpdate({ id, shopId: sId }, safeUpdateData, { new: true }).exec();
        if (!product) {
            throw new common_1.NotFoundException(`Product with ID ${id} not found in this shop`);
        }
        return product;
    }
    async delete(shopId, id) {
        const sId = typeof shopId === 'string' ? new mongoose_2.Types.ObjectId(shopId) : shopId;
        const result = await this.productModel.deleteOne({ id, shopId: sId }).exec();
        if (result.deletedCount === 0) {
            throw new common_1.NotFoundException(`Product with ID ${id} not found in this shop`);
        }
        return { message: 'Product deleted successfully', id };
    }
};
exports.ProductsService = ProductsService;
exports.ProductsService = ProductsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(product_schema_1.Product.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], ProductsService);
//# sourceMappingURL=products.service.js.map