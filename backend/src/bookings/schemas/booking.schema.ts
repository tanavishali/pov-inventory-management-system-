import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type BookingDocument = Booking & Document;

@Schema({ timestamps: true })
export class Booking {
  @Prop({ required: true })
  name: string;

  @Prop()
  business?: string;

  @Prop({ required: true })
  phone: string;

  @Prop()
  city?: string;

  @Prop()
  plan?: string;

  @Prop()
  message?: string;

  @Prop({ required: true, enum: ['New', 'Contacted', 'Converted', 'Closed'], default: 'New' })
  status: string;
}

export const BookingSchema = SchemaFactory.createForClass(Booking);
