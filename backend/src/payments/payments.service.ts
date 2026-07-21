import { Injectable, OnModuleInit, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Payment, PaymentDocument } from './schemas/payment.schema';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { MarkPaidDto } from './dto/mark-paid.dto';

@Injectable()
export class PaymentsService implements OnModuleInit {
  constructor(
    @InjectModel(Payment.name) private paymentModel: Model<PaymentDocument>,
  ) {}

  async onModuleInit() {
    const count = await this.paymentModel.countDocuments().exec();
    if (count === 0) {
      const initialPayments = [
        { id: 'PAY-001', shop: 'Hassan Electronics',  email: 'admin@pos.com',  amount: 2500, plan: 'Premium',    method: 'EasyPaisa',  date: '01 Apr 2026', status: 'Paid',    month: 'April 2026' },
        { id: 'PAY-002', shop: 'Sana General Store',   email: 'sana@pos.com',   amount: 1500, plan: 'Basic',      method: 'JazzCash',   date: '01 Apr 2026', status: 'Pending', month: 'April 2026' },
        { id: 'PAY-003', shop: 'Al-Madina Traders',    email: 'almadina@pos.com',amount: 3500, plan: 'Enterprise', method: 'Bank Transfer',date: '28 Mar 2026', status: 'Paid',   month: 'March 2026' },
        { id: 'PAY-004', shop: 'City Wholesale',       email: 'city@pos.com',   amount: 2500, plan: 'Premium',    method: 'EasyPaisa',  date: '25 Mar 2026', status: 'Paid',    month: 'March 2026' },
        { id: 'PAY-005', shop: 'Khan Brothers Store',  email: 'khan@pos.com',   amount: 1500, plan: 'Basic',      method: '',           date: '01 Apr 2026', status: 'Pending', month: 'April 2026' },
        { id: 'PAY-006', shop: 'Raza Depot',           email: 'raza@pos.com',   amount: 2500, plan: 'Premium',    method: 'JazzCash',   date: '20 Mar 2026', status: 'Paid',    month: 'March 2026' },
        { id: 'PAY-007', shop: 'Al-Falah Mart',        email: 'alfalah@pos.com',amount: 1500, plan: 'Basic',      method: '',           date: '01 Apr 2026', status: 'Pending', month: 'April 2026' },
        { id: 'PAY-008', shop: 'Rehman Traders',       email: 'rehman@pos.com', amount: 3500, plan: 'Enterprise', method: 'Bank Transfer',date: '15 Mar 2026', status: 'Paid',  month: 'March 2026' },
      ];
      await this.paymentModel.insertMany(initialPayments);
      console.log('Payment records seeded successfully in the database.');
    }
  }

  async findAll(): Promise<PaymentDocument[]> {
    // Sort descending by creation date so new ones show at top, or sort by id descending
    return this.paymentModel.find().sort({ createdAt: -1 }).exec();
  }

  async findAllPaginated(opts: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  }): Promise<{
    data: PaymentDocument[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    stats: { totalPaid: number; totalPending: number; paidCount: number; pendingCount: number; totalCount: number };
  }> {
    const page = Math.max(1, parseInt(String(opts.page)) || 1);
    const limit = Math.max(1, parseInt(String(opts.limit)) || 4);

    const filter: any = {};
    if (opts.status && opts.status !== 'all') filter.status = opts.status;
    if (opts.search?.trim()) {
      const re = new RegExp(opts.search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      filter.$or = [{ shop: re }, { email: re }, { id: re }];
    }

    const [data, total, allPayments] = await Promise.all([
      this.paymentModel.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).exec(),
      this.paymentModel.countDocuments(filter).exec(),
      this.paymentModel.find().exec(),
    ]);

    // Summary cards reflect the whole collection, not just the current page.
    const stats = {
      totalPaid: allPayments.filter(p => p.status === 'Paid').reduce((s, p) => s + p.amount, 0),
      totalPending: allPayments.filter(p => p.status === 'Pending').reduce((s, p) => s + p.amount, 0),
      paidCount: allPayments.filter(p => p.status === 'Paid').length,
      pendingCount: allPayments.filter(p => p.status === 'Pending').length,
      totalCount: allPayments.length,
    };

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
      stats,
    };
  }

  async create(createPaymentDto: CreatePaymentDto): Promise<PaymentDocument> {
    // Generate sequential friendly ID
    // Find payment with highest number or count
    const payments = await this.paymentModel.find().exec();
    let maxNum = 0;
    payments.forEach(p => {
      if (p.id) {
        const match = p.id.match(/PAY-(\d+)/);
        if (match) {
          const num = parseInt(match[1]);
          if (num > maxNum) {
            maxNum = num;
          }
        }
      }
    });

    const nextIdNum = maxNum + 1;
    const id = `PAY-${String(nextIdNum).padStart(3, '0')}`;

    const newPayment = new this.paymentModel({
      ...createPaymentDto,
      id,
      status: createPaymentDto.status || 'Pending',
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      month: createPaymentDto.month || new Date().toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }),
    });

    return newPayment.save();
  }

  async markAsPaid(id: string, markPaidDto: MarkPaidDto): Promise<PaymentDocument> {
    const payment = await this.paymentModel.findOne({ id }).exec();
    if (!payment) {
      throw new NotFoundException(`Payment record with ID ${id} not found`);
    }

    payment.status = 'Paid';
    payment.method = markPaidDto.method;
    payment.date = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

    return payment.save();
  }

  async delete(id: string): Promise<any> {
    const result = await this.paymentModel.deleteOne({ id }).exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException(`Payment record with ID ${id} not found`);
    }
    return { message: 'Payment record deleted successfully', id };
  }
}
