import { Model, Types } from 'mongoose';
import { ProductDocument } from './schemas/product.schema';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { StockGateway } from './stock.gateway';
export declare class ProductsService {
    private productModel;
    private readonly stockGateway;
    constructor(productModel: Model<ProductDocument>, stockGateway: StockGateway);
    findAll(shopId: Types.ObjectId | string, search?: string, filter?: string, sort?: string): Promise<ProductDocument[]>;
    create(shopId: Types.ObjectId | string, createProductDto: CreateProductDto): Promise<ProductDocument>;
    update(shopId: Types.ObjectId | string, id: number, updateProductDto: UpdateProductDto): Promise<ProductDocument>;
    delete(shopId: Types.ObjectId | string, id: number): Promise<any>;
    findLowStock(shopId: Types.ObjectId | string): Promise<ProductDocument[]>;
    decrementStock(shopId: Types.ObjectId | string, name: string, qty: number): Promise<ProductDocument | null>;
    incrementStock(shopId: Types.ObjectId | string, name: string, qty: number): Promise<ProductDocument | null>;
}
