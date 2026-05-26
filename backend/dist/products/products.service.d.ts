import { Model, Types } from 'mongoose';
import { ProductDocument } from './schemas/product.schema';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
export declare class ProductsService {
    private productModel;
    constructor(productModel: Model<ProductDocument>);
    findAll(shopId: Types.ObjectId | string): Promise<ProductDocument[]>;
    create(shopId: Types.ObjectId | string, createProductDto: CreateProductDto): Promise<ProductDocument>;
    update(shopId: Types.ObjectId | string, id: number, updateProductDto: UpdateProductDto): Promise<ProductDocument>;
    delete(shopId: Types.ObjectId | string, id: number): Promise<any>;
}
