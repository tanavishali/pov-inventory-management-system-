"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const payment_schema_1 = require("./schemas/payment.schema");
let PaymentsService = class PaymentsService {
    paymentModel;
    constructor(paymentModel) {
        this.paymentModel = paymentModel;
    }
    async onModuleInit() {
        const count = await this.paymentModel.countDocuments().exec();
        if (count === 0) {
            const initialPayments = [
                { id: 'PAY-001', shop: 'Hassan Electronics', email: 'admin@pos.com', amount: 2500, plan: 'Premium', method: 'EasyPaisa', date: '01 Apr 2026', status: 'Paid', month: 'April 2026' },
                { id: 'PAY-002', shop: 'Sana General Store', email: 'sana@pos.com', amount: 1500, plan: 'Basic', method: 'JazzCash', date: '01 Apr 2026', status: 'Pending', month: 'April 2026' },
                { id: 'PAY-003', shop: 'Al-Madina Traders', email: 'almadina@pos.com', amount: 3500, plan: 'Enterprise', method: 'Bank Transfer', date: '28 Mar 2026', status: 'Paid', month: 'March 2026' },
                { id: 'PAY-004', shop: 'City Wholesale', email: 'city@pos.com', amount: 2500, plan: 'Premium', method: 'EasyPaisa', date: '25 Mar 2026', status: 'Paid', month: 'March 2026' },
                { id: 'PAY-005', shop: 'Khan Brothers Store', email: 'khan@pos.com', amount: 1500, plan: 'Basic', method: '', date: '01 Apr 2026', status: 'Pending', month: 'April 2026' },
                { id: 'PAY-006', shop: 'Raza Depot', email: 'raza@pos.com', amount: 2500, plan: 'Premium', method: 'JazzCash', date: '20 Mar 2026', status: 'Paid', month: 'March 2026' },
                { id: 'PAY-007', shop: 'Al-Falah Mart', email: 'alfalah@pos.com', amount: 1500, plan: 'Basic', method: '', date: '01 Apr 2026', status: 'Pending', month: 'April 2026' },
                { id: 'PAY-008', shop: 'Rehman Traders', email: 'rehman@pos.com', amount: 3500, plan: 'Enterprise', method: 'Bank Transfer', date: '15 Mar 2026', status: 'Paid', month: 'March 2026' },
            ];
            await this.paymentModel.insertMany(initialPayments);
            console.log('Payment records seeded successfully in the database.');
        }
    }
    async findAll() {
        return this.paymentModel.find().sort({ createdAt: -1 }).exec();
    }
    async create(createPaymentDto) {
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
            status: 'Pending',
            date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
            month: createPaymentDto.month || new Date().toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }),
        });
        return newPayment.save();
    }
    async markAsPaid(id, markPaidDto) {
        const payment = await this.paymentModel.findOne({ id }).exec();
        if (!payment) {
            throw new common_1.NotFoundException(`Payment record with ID ${id} not found`);
        }
        payment.status = 'Paid';
        payment.method = markPaidDto.method;
        payment.date = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
        return payment.save();
    }
    async delete(id) {
        const result = await this.paymentModel.deleteOne({ id }).exec();
        if (result.deletedCount === 0) {
            throw new common_1.NotFoundException(`Payment record with ID ${id} not found`);
        }
        return { message: 'Payment record deleted successfully', id };
    }
};
exports.PaymentsService = PaymentsService;
exports.PaymentsService = PaymentsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(payment_schema_1.Payment.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], PaymentsService);
//# sourceMappingURL=payments.service.js.map