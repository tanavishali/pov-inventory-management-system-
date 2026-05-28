import { Injectable, NotFoundException, Inject, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Order, OrderDocument } from './schemas/order.schema';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { ProductsService } from '../products/products.service';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @Inject(forwardRef(() => ProductsService))
    private readonly productsService: ProductsService,
  ) {}

  async findAll(shopId: Types.ObjectId | string): Promise<OrderDocument[]> {
    const sId = typeof shopId === 'string' ? new Types.ObjectId(shopId) : shopId;
    return this.orderModel.find({ shopId: sId }).sort({ createdAt: -1 }).exec();
  }

  async create(shopId: Types.ObjectId | string, createOrderDto: CreateOrderDto): Promise<OrderDocument> {
    const sId = typeof shopId === 'string' ? new Types.ObjectId(shopId) : shopId;
    
    // Find highest invoice number for this shop to generate next ID
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
    
    const savedOrder = await newOrder.save();

    // Decrement product stock in database for each product in the order
    if (savedOrder.products && savedOrder.products.length > 0) {
      for (const p of savedOrder.products) {
        try {
          await this.productsService.decrementStock(sId.toString(), p.name, p.qty);
        } catch (e) {
          console.error(`Failed to decrement stock for product "${p.name}":`, e);
        }
      }
    }
    
    return savedOrder;
  }

  async update(shopId: Types.ObjectId | string, id: string, updateOrderDto: UpdateOrderDto): Promise<OrderDocument> {
    const sId = typeof shopId === 'string' ? new Types.ObjectId(shopId) : shopId;
    
    // Strip out database metadata fields to prevent immutable property errors
    const { _id, id: bodyId, shopId: bodyShopId, createdAt, updatedAt, __v, ...safeUpdateData } = updateOrderDto as any;
    
    const order = await this.orderModel.findOneAndUpdate(
      { id, shopId: sId },
      safeUpdateData,
      { new: true },
    ).exec();
    
    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found in this shop`);
    }
    
    return order;
  }

  async delete(shopId: Types.ObjectId | string, id: string): Promise<any> {
    const sId = typeof shopId === 'string' ? new Types.ObjectId(shopId) : shopId;
    
    // Find the order first to get its products so we can restore the stock
    const order = await this.orderModel.findOne({ id, shopId: sId }).exec();
    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found in this shop`);
    }
    
    // Restore product stock
    if (order.products && order.products.length > 0) {
      for (const p of order.products) {
        try {
          await this.productsService.incrementStock(sId.toString(), p.name, p.qty);
        } catch (e) {
          console.error(`Failed to restore stock for product "${p.name}":`, e);
        }
      }
    }
    
    await this.orderModel.deleteOne({ id, shopId: sId }).exec();
    
    return { message: 'Order deleted successfully', id };
  }
}
