import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { MarkPaidDto } from './dto/mark-paid.dto';
export declare class PaymentsController {
    private readonly paymentsService;
    constructor(paymentsService: PaymentsService);
    findAll(): Promise<import("./schemas/payment.schema").PaymentDocument[]>;
    create(createPaymentDto: CreatePaymentDto): Promise<import("./schemas/payment.schema").PaymentDocument>;
    markAsPaid(id: string, markPaidDto: MarkPaidDto): Promise<import("./schemas/payment.schema").PaymentDocument>;
    remove(id: string): Promise<any>;
}
