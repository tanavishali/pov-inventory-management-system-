import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type BusinessSettingsDocument = BusinessSettings & Document;

@Schema({ timestamps: true })
export class BusinessSettings {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true, index: true })
  userId: Types.ObjectId;

  // Business Information
  @Prop({ default: 'WholesalePro Distributors' })
  businessName: string;

  @Prop({ default: '' })
  ownerName: string;

  @Prop({ default: '' })
  ownerPhone: string;

  @Prop({ default: '+92-42-1234567' })
  businessPhone: string;

  @Prop({ default: 'info@wholesalepro.pk' })
  businessEmail: string;

  @Prop({ default: 'Main Boulevard, Gulberg III, Lahore' })
  businessAddress: string;

  @Prop({ default: '' })
  ntn: string;

  @Prop({ default: '' })
  strn: string;

  @Prop({ default: 'PKR — Pakistani Rupee (Rs)' })
  currency: string;

  @Prop({ default: 'July' })
  financialYearStart: string;

  // Invoice Settings
  @Prop({ default: 'INV-' })
  invoicePrefix: string;

  @Prop({ default: 17 })
  invoiceTax: number;

  @Prop({ default: 'Thank you for your business. Goods once sold will not be returned.' })
  invoiceFooter: string;

  // Branding Settings
  @Prop({ default: 'WholesalePro' })
  brandName: string;

  @Prop({ default: '' })
  logoSrc: string;
}

export const BusinessSettingsSchema = SchemaFactory.createForClass(BusinessSettings);
