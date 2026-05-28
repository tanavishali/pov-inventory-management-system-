import { Injectable, NotFoundException, Inject, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Product, ProductDocument } from './schemas/product.schema';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { StockGateway } from './stock.gateway';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    @Inject(forwardRef(() => StockGateway))
    private readonly stockGateway: StockGateway,
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
    
    const saved = await newProduct.save();
    
    // Notify via sockets
    try {
      this.stockGateway.sendCurrentStockStatus(sId.toString());
      if (saved.stock <= (saved.threshold ?? 10)) {
        this.stockGateway.emitLowStockAlert(sId.toString(), saved);
      }
    } catch (e) {
      console.error('Socket notification error on create:', e);
    }
    
    return saved;
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
    
    // Notify via sockets
    try {
      this.stockGateway.sendCurrentStockStatus(sId.toString());
      if (product.stock <= (product.threshold ?? 10)) {
        this.stockGateway.emitLowStockAlert(sId.toString(), product);
      }
    } catch (e) {
      console.error('Socket notification error on update:', e);
    }
    
    return product;
  }

  async delete(shopId: Types.ObjectId | string, id: number): Promise<any> {
    const sId = typeof shopId === 'string' ? new Types.ObjectId(shopId) : shopId;
    
    const result = await this.productModel.deleteOne({ id, shopId: sId }).exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException(`Product with ID ${id} not found in this shop`);
    }
    
    // Notify via sockets
    try {
      this.stockGateway.sendCurrentStockStatus(sId.toString());
    } catch (e) {
      console.error('Socket notification error on delete:', e);
    }
    
    return { message: 'Product deleted successfully', id };
  }

  async findLowStock(shopId: Types.ObjectId | string): Promise<ProductDocument[]> {
    const sId = typeof shopId === 'string' ? new Types.ObjectId(shopId) : shopId;
    const products = await this.productModel.find({ shopId: sId }).exec();
    return products.filter(p => p.stock <= (p.threshold ?? 10));
  }

  async decrementStock(shopId: Types.ObjectId | string, name: string, qty: number): Promise<ProductDocument | null> {
    const sId = typeof shopId === 'string' ? new Types.ObjectId(shopId) : shopId;
    
    // Case-insensitive name match to prevent sync mismatch
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
      } catch (e) {
        console.error('Socket notification error on stock decrement:', e);
      }
      
      return saved;
    }
    
    return null;
  }

  async incrementStock(shopId: Types.ObjectId | string, name: string, qty: number): Promise<ProductDocument | null> {
    const sId = typeof shopId === 'string' ? new Types.ObjectId(shopId) : shopId;
    
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
      } catch (e) {
        console.error('Socket notification error on stock increment:', e);
      }
      
      return saved;
    }
    
    return null;
  }
}
