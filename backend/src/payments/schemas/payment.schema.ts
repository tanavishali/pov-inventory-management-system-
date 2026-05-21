import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PaymentDocument = Payment & Document;

@Schema({ timestamps: true })
export class Payment {
  @Prop({ required: true, unique: true })
  id: string; // Sequential friendly ID like 'PAY-001'

  @Prop({ required: true })
  shop: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  amount: number;

  @Prop({ required: true })
  plan: string;

  @Prop()
  method?: string;

  @Prop({ required: true })
  date: string;

  @Prop({ required: true, enum: ['Paid', 'Pending'], default: 'Pending' })
  status: string;

  @Prop({ required: true })
  month: string;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);
