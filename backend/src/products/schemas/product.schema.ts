import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ProductDocument = Product & Document;

@Schema({ timestamps: true })
export class Product {
  @Prop({ required: true })
  id: number; // Sequential product ID per shop, starting at 1

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  cat: string;

  @Prop({ required: true })
  purchase: number;

  @Prop({ required: true })
  selling: number;

  @Prop({ required: true, default: 0 })
  stock: number;

  @Prop({ required: true, default: 10 })
  threshold: number;

  @Prop({ required: true, default: 0 })
  ctn: number;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  shopId: Types.ObjectId; // References the admin user who owns this tenant shop
}

export const ProductSchema = SchemaFactory.createForClass(Product);
