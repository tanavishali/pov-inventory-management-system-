import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ShopDocument = Shop & Document;

@Schema({ timestamps: true })
export class Shop {
  @Prop({ required: true })
  id: number; // Sequential customer/shop ID per wholesale distributor, starting at 1

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  owner: string;

  @Prop({ required: true })
  phone: string;

  @Prop({ required: false })
  cnic?: string;

  @Prop({ required: false })
  address?: string;

  @Prop({ required: false })
  city?: string;

  @Prop({ required: true, enum: ['active', 'blocked'], default: 'active' })
  status: string;

  @Prop({ required: true })
  created: string; // YYYY-MM-DD

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  shopId: Types.ObjectId; // References the distributor admin user who owns this tenant
}

export const ShopSchema = SchemaFactory.createForClass(Shop);
