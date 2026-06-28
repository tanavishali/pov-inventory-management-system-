import { BookingsService } from './bookings.service';
import { CreateBookingDto, UpdateBookingStatusDto } from './dto/create-booking.dto';
export declare class BookingsController {
    private readonly bookingsService;
    constructor(bookingsService: BookingsService);
    create(dto: CreateBookingDto): Promise<import("./schemas/booking.schema").BookingDocument>;
    findAll(): Promise<import("./schemas/booking.schema").BookingDocument[]>;
    updateStatus(id: string, dto: UpdateBookingStatusDto): Promise<import("./schemas/booking.schema").BookingDocument>;
    remove(id: string): Promise<any>;
}
