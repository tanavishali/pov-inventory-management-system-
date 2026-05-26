import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type OrderDocument = Order & Document;

@Schema()
class OrderProduct {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  qty: number;

  @Prop({ required: true })
  price: number;

  @Prop({ default: 0 })
  ctn: number;
}

@Schema({ timestamps: true })
export class Order {
  @Prop({ required: true })
  id: string; // Sequential invoice ID per shop, like 'INV-001'

  @Prop({
    required: true,
    enum: ['pending', 'approved', 'dispatched', 'completed', 'cancelled'],
    default: 'pending',
  })
  status: string;

  @Prop({ required: true })
  customer: string;

  @Prop({ required: true })
  shop: string;

  @Prop()
  phone?: string;

  @Prop()
  salesman?: string;

  @Prop({ required: true, enum: ['Paid', 'Udaar'], default: 'Paid' })
  payment: string;

  @Prop({ default: 0 })
  advance?: number;

  @Prop({ required: true })
  date: string;

  @Prop({ required: true })
  time: string;

  @Prop({ type: [OrderProduct], required: true })
  products: OrderProduct[];

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  shopId: Types.ObjectId; // References the admin user who owns this tenant shop
}

export const OrderSchema = SchemaFactory.createForClass(Order);
