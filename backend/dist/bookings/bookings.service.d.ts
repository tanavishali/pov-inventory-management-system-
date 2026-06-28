import { Model } from 'mongoose';
import { BookingDocument } from './schemas/booking.schema';
import { CreateBookingDto } from './dto/create-booking.dto';
export declare class BookingsService {
    private bookingModel;
    constructor(bookingModel: Model<BookingDocument>);
    create(dto: CreateBookingDto): Promise<BookingDocument>;
    findAll(): Promise<BookingDocument[]>;
    updateStatus(id: string, status: string): Promise<BookingDocument>;
    delete(id: string): Promise<any>;
}
