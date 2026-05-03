import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({
    required: true,
    enum: ['super-admin', 'admin', 'salesman'],
    default: 'admin',
  })
  role: string;

  @Prop({
    required: true,
    enum: ['Active', 'Locked', 'Demo'],
    default: 'Active',
  })
  status: string;

  // Admin Specific Fields
  @Prop()
  plan?: string;

  @Prop()
  monthlyFee?: number;

  @Prop({ enum: ['Paid', 'Unpaid', 'Overdue'] })
  feeStatus?: string;

  @Prop()
  purchasedOn?: string;

  @Prop()
  expiryDate?: string;

  // Salesman Specific Fields
  @Prop()
  phone?: string;

  @Prop()
  cnic?: string;

  @Prop()
  joined?: string;

  @Prop({ default: 0 })
  sales?: number;

  @Prop({ default: 0 })
  orders?: number;

  // Linkage
  @Prop({ type: Types.ObjectId, ref: 'User' })
  shopId?: Types.ObjectId; // For admins (self) and salesmen (linked to admin)
}

export const UserSchema = SchemaFactory.createForClass(User);
