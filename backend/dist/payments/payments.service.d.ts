import { OnModuleInit } from '@nestjs/common';
import { Model } from 'mongoose';
import { PaymentDocument } from './schemas/payment.schema';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { MarkPaidDto } from './dto/mark-paid.dto';
export declare class PaymentsService implements OnModuleInit {
    private paymentModel;
    constructor(paymentModel: Model<PaymentDocument>);
    onModuleInit(): Promise<void>;
    findAll(): Promise<PaymentDocument[]>;
    create(createPaymentDto: CreatePaymentDto): Promise<PaymentDocument>;
    markAsPaid(id: string, markPaidDto: MarkPaidDto): Promise<PaymentDocument>;
    delete(id: string): Promise<any>;
}
