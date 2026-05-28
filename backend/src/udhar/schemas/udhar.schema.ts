import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UdharDocument = Udhar & Document;

@Schema()
class UdharProduct {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  qty: number;

  @Prop({ required: true })
  price: number;
}

const UdharProductSchema = SchemaFactory.createForClass(UdharProduct);

@Schema({ timestamps: true })
export class Udhar {
  @Prop({ required: true })
  id: string; // Sequential ID (manual e.g. "301") or order sync ID (e.g. "sync_INV-001")

  @Prop({ required: true })
  customerId: number; // Matches the numeric id of the customer retail shop from the shops collection

  @Prop({ required: true })
  date: string; // YYYY-MM-DD

  @Prop({ required: true, enum: ['udhar', 'payment'] })
  type: string; // 'udhar' or 'payment'

  @Prop({ required: true })
  desc: string; // e.g. "Order #1001" or "Cash received"

  @Prop({ type: [UdharProductSchema], default: [] })
  products: UdharProduct[];

  @Prop({ required: true, default: 0 })
  total: number; // Full bill amount

  @Prop({ required: true, default: 0 })
  advance: number; // Advance paid

  @Prop({ required: true })
  udharAmt: number; // Positive remainder for credit, negative amount for cash payments

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  shopId: Types.ObjectId; // References the distributor admin user who owns this tenant
}

export const UdharSchema = SchemaFactory.createForClass(Udhar);
