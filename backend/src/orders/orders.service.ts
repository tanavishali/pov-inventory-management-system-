import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Order, OrderDocument } from './schemas/order.schema';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';

const INITIAL_ORDERS = [
  {
    id: 'INV-001', status: 'pending',
    customer: 'Ali Hassan', shop: 'Al-Noor Store', salesman: 'Usman Farooq',
    payment: 'Udaar', advance: 5000, date: '01 Mar 2026', time: '10:30 AM',
    products: [
      { name: 'Basmati Rice 5kg', qty: 10, price: 2200, ctn: 2 },
      { name: 'Cooking Oil 5L',   qty: 5,  price: 2600, ctn: 1 },
    ],
  },
  {
    id: 'INV-002', status: 'pending',
    customer: 'Rehman Bros', shop: 'Rehman Store', salesman: 'Asif Iqbal',
    payment: 'Paid', advance: 0, date: '01 Mar 2026', time: '11:15 AM',
    products: [
      { name: 'Sugar 50kg Bag', qty: 2, price: 6200, ctn: 1 },
      { name: 'Flour 10kg',     qty: 8, price: 1750, ctn: 2 },
    ],
  },
  {
    id: 'INV-003', status: 'approved',
    customer: 'Sana Traders', shop: 'Sana Mart', salesman: 'Kamran Shah',
    payment: 'Paid', advance: 0, date: '28 Feb 2026', time: '09:00 AM',
    products: [
      { name: 'Detergent Powder 1kg', qty: 20, price: 480, ctn: 4 },
      { name: 'Soap Bar x6',     qty: 15, price: 360, ctn: 3 },
      { name: 'Shampoo 200ml',   qty: 10, price: 280, ctn: 2 },
    ],
  },
  {
    id: 'INV-004', status: 'dispatched',
    customer: 'Khan Brothers', shop: 'Khan & Co.', salesman: 'Usman Farooq',
    payment: 'Paid', advance: 0, date: '27 Feb 2026', time: '02:45 PM',
    products: [
      { name: 'Tea Leaves 1kg',   qty: 12, price: 1600, ctn: 3 },
      { name: 'Milk Powder 400g', qty: 8,  price: 1150, ctn: 2 },
    ],
  },
  {
    id: 'INV-005', status: 'completed',
    customer: 'City Wholesale', shop: 'City Store', salesman: 'Asif Iqbal',
    payment: 'Udaar', advance: 20000, date: '25 Feb 2026', time: '04:00 PM',
    products: [
      { name: 'Basmati Rice 5kg', qty: 20, price: 2200, ctn: 4 },
      { name: 'Sugar 50kg Bag',   qty: 5,  price: 6200, ctn: 2 },
    ],
  },
  {
    id: 'INV-006', status: 'cancelled',
    customer: 'Raza Wholesale', shop: 'Raza Depot', salesman: 'Kamran Shah',
    payment: 'Paid', advance: 0, date: '24 Feb 2026', time: '01:00 PM',
    products: [
      { name: 'Lemon Juice 500ml', qty: 24, price: 310, ctn: 4 },
    ],
  },
];

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
  ) {}

  async findAll(shopId: Types.ObjectId | string): Promise<OrderDocument[]> {
    const sId = typeof shopId === 'string' ? new Types.ObjectId(shopId) : shopId;
    const count = await this.orderModel.countDocuments({ shopId: sId }).exec();
    
    // Auto-seed if this shop has zero orders in Mongoose
    if (count === 0) {
      const seeded = INITIAL_ORDERS.map(o => ({
        ...o,
        shopId: sId,
      }));
      await this.orderModel.insertMany(seeded);
    }
    
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
    
    return newOrder.save();
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
    
    const result = await this.orderModel.deleteOne({ id, shopId: sId }).exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException(`Order with ID ${id} not found in this shop`);
    }
    
    return { message: 'Order deleted successfully', id };
  }
}
