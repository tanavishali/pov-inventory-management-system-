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
const stock_gateway_1 = require("./stock.gateway");
let ProductsService = class ProductsService {
    productModel;
    stockGateway;
    constructor(productModel, stockGateway) {
        this.productModel = productModel;
        this.stockGateway = stockGateway;
    }
    async findAll(shopId, search, filter, sort) {
        const sId = typeof shopId === 'string' ? new mongoose_2.Types.ObjectId(shopId) : shopId;
        const query = { shopId: sId };
        if (search) {
            const re = new RegExp(search, 'i');
            query.$or = [{ name: re }, { cat: re }];
        }
        if (filter === 'out') {
            query.stock = 0;
        }
        else if (filter === 'low') {
            query.$expr = { $and: [{ $gt: ['$stock', 0] }, { $lte: ['$stock', { $ifNull: ['$threshold', 10] }] }] };
        }
        else if (filter === 'in-stock') {
            query.$expr = { $gt: ['$stock', { $ifNull: ['$threshold', 10] }] };
        }
        const sortMap = {
            name: { name: 1 },
            'price-h': { selling: -1 },
            'price-l': { selling: 1 },
            'stock-l': { stock: 1 },
        };
        const sortOpt = (sort && sortMap[sort]) || { id: 1 };
        return this.productModel.find(query).sort(sortOpt).exec();
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
        const saved = await newProduct.save();
        try {
            this.stockGateway.sendCurrentStockStatus(sId.toString());
            if (saved.stock <= (saved.threshold ?? 10)) {
                this.stockGateway.emitLowStockAlert(sId.toString(), saved);
            }
        }
        catch (e) {
            console.error('Socket notification error on create:', e);
        }
        return saved;
    }
    async update(shopId, id, updateProductDto) {
        const sId = typeof shopId === 'string' ? new mongoose_2.Types.ObjectId(shopId) : shopId;
        const { _id, id: bodyId, shopId: bodyShopId, createdAt, updatedAt, __v, ...safeUpdateData } = updateProductDto;
        const product = await this.productModel.findOneAndUpdate({ id, shopId: sId }, safeUpdateData, { new: true }).exec();
        if (!product) {
            throw new common_1.NotFoundException(`Product with ID ${id} not found in this shop`);
        }
        try {
            this.stockGateway.sendCurrentStockStatus(sId.toString());
            if (product.stock <= (product.threshold ?? 10)) {
                this.stockGateway.emitLowStockAlert(sId.toString(), product);
            }
        }
        catch (e) {
            console.error('Socket notification error on update:', e);
        }
        return product;
    }
    async delete(shopId, id) {
        const sId = typeof shopId === 'string' ? new mongoose_2.Types.ObjectId(shopId) : shopId;
        const result = await this.productModel.deleteOne({ id, shopId: sId }).exec();
        if (result.deletedCount === 0) {
            throw new common_1.NotFoundException(`Product with ID ${id} not found in this shop`);
        }
        try {
            this.stockGateway.sendCurrentStockStatus(sId.toString());
        }
        catch (e) {
            console.error('Socket notification error on delete:', e);
        }
        return { message: 'Product deleted successfully', id };
    }
    async findLowStock(shopId) {
        const sId = typeof shopId === 'string' ? new mongoose_2.Types.ObjectId(shopId) : shopId;
        const products = await this.productModel.find({ shopId: sId }).exec();
        return products.filter(p => p.stock <= (p.threshold ?? 10));
    }
    async decrementStock(shopId, name, qty) {
        const sId = typeof shopId === 'string' ? new mongoose_2.Types.ObjectId(shopId) : shopId;
        const product = await this.productModel.findOne({
            shopId: sId,
            name: { $regex: new RegExp(`^${name}$`, 'i') }
        }).exec();
        if (product) {
            product.stock = Math.max(0, product.stock - qty);
            const saved = await product.save();
            try {
                this.stockGateway.sendCurrentStockStatus(sId.toString());
                if (saved.stock <= (saved.threshold ?? 10)) {
                    this.stockGateway.emitLowStockAlert(sId.toString(), saved);
                }
            }
            catch (e) {
                console.error('Socket notification error on stock decrement:', e);
            }
            return saved;
        }
        return null;
    }
    async incrementStock(shopId, name, qty) {
        const sId = typeof shopId === 'string' ? new mongoose_2.Types.ObjectId(shopId) : shopId;
        const product = await this.productModel.findOne({
            shopId: sId,
            name: { $regex: new RegExp(`^${name}$`, 'i') }
        }).exec();
        if (product) {
            product.stock = product.stock + qty;
            const saved = await product.save();
            try {
                this.stockGateway.sendCurrentStockStatus(sId.toString());
                if (saved.stock <= (saved.threshold ?? 10)) {
                    this.stockGateway.emitLowStockAlert(sId.toString(), saved);
                }
            }
            catch (e) {
                console.error('Socket notification error on stock increment:', e);
            }
            return saved;
        }
        return null;
    }
};
exports.ProductsService = ProductsService;
exports.ProductsService = ProductsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(product_schema_1.Product.name)),
    __param(1, (0, common_1.Inject)((0, common_1.forwardRef)(() => stock_gateway_1.StockGateway))),
    __metadata("design:paramtypes", [mongoose_2.Model,
        stock_gateway_1.StockGateway])
], ProductsService);
//# sourceMappingURL=products.service.js.map