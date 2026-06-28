import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Booking, BookingDocument } from './schemas/booking.schema';
import { CreateBookingDto } from './dto/create-booking.dto';

@Injectable()
export class BookingsService {
  constructor(
    @InjectModel(Booking.name) private bookingModel: Model<BookingDocument>,
  ) {}

  async create(dto: CreateBookingDto): Promise<BookingDocument> {
    const created = new this.bookingModel({ ...dto, status: 'New' });
    return created.save();
  }

  async findAll(): Promise<BookingDocument[]> {
    return this.bookingModel.find().sort({ createdAt: -1 }).exec();
  }

  async updateStatus(id: string, status: string): Promise<BookingDocument> {
    const updated = await this.bookingModel
      .findByIdAndUpdate(id, { status }, { new: true })
      .exec();
    if (!updated) throw new NotFoundException('Booking not found');
    return updated;
  }

  async delete(id: string): Promise<any> {
    const res = await this.bookingModel.findByIdAndDelete(id).exec();
    if (!res) throw new NotFoundException('Booking not found');
    return { message: 'Booking deleted', id };
  }
}
