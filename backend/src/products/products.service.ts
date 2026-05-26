import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Product, ProductDocument } from './schemas/product.schema';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
  ) {}

  async findAll(shopId: Types.ObjectId | string): Promise<ProductDocument[]> {
    const sId = typeof shopId === 'string' ? new Types.ObjectId(shopId) : shopId;
    return this.productModel.find({ shopId: sId }).sort({ id: 1 }).exec();
  }

  async create(shopId: Types.ObjectId | string, createProductDto: CreateProductDto): Promise<ProductDocument> {
    const sId = typeof shopId === 'string' ? new Types.ObjectId(shopId) : shopId;
    
    // Calculate the next sequential product ID for this shop
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

  async update(shopId: Types.ObjectId | string, id: number, updateProductDto: UpdateProductDto): Promise<ProductDocument> {
    const sId = typeof shopId === 'string' ? new Types.ObjectId(shopId) : shopId;
    
    // Strip out database metadata fields to prevent trying to overwrite _id or shopId in MongoDB
    const { _id, id: bodyId, shopId: bodyShopId, createdAt, updatedAt, __v, ...safeUpdateData } = updateProductDto as any;

    const product = await this.productModel.findOneAndUpdate(
      { id, shopId: sId },
      safeUpdateData,
      { new: true },
    ).exec();
    
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found in this shop`);
    }
    
    return product;
  }

  async delete(shopId: Types.ObjectId | string, id: number): Promise<any> {
    const sId = typeof shopId === 'string' ? new Types.ObjectId(shopId) : shopId;
    
    const result = await this.productModel.deleteOne({ id, shopId: sId }).exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException(`Product with ID ${id} not found in this shop`);
    }
    
    return { message: 'Product deleted successfully', id };
  }
}
