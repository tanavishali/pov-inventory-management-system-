import { UsersService } from '../users/users.service';
import { PaymentsService } from '../payments/payments.service';
import { CreateAdminDto, UpdateAdminDto, RenewAdminDto } from '../users/dto/admin-management.dto';
export declare class SuperAdminController {
    private usersService;
    private paymentsService;
    constructor(usersService: UsersService, paymentsService: PaymentsService);
    getStats(): Promise<{
        totalLicenses: number;
        activeShops: number;
        demoShops: number;
        lockedShops: number;
        unpaidAccounts: number;
        expectedMrr: number;
        totalCollected: number;
        totalPending: number;
        planStats: {
            Basic: number;
            Premium: number;
            Enterprise: number;
        };
        methodStats: {
            EasyPaisa: number;
            JazzCash: number;
            BankTransfer: number;
            Unspecified: number;
        };
        recentPayments: import("../payments/schemas/payment.schema").PaymentDocument[];
        recentAdmins: import("../users/schemas/user.schema").UserDocument[];
    }>;
    getRevenue(): Promise<{
        summary: {
            totalCollected: number;
            totalPending: number;
            expectedMrr: number;
            totalTransactions: number;
            paidTransactions: number;
            pendingTransactions: number;
        };
        revenueByMonth: unknown[];
        revenueByTier: unknown[];
        revenueByMethod: unknown[];
        paymentsList: import("../payments/schemas/payment.schema").PaymentDocument[];
    }>;
    createAdmin(createAdminDto: CreateAdminDto): Promise<import("../users/schemas/user.schema").UserDocument>;
    findAll(): Promise<import("../users/schemas/user.schema").UserDocument[]>;
    update(id: string, updateAdminDto: UpdateAdminDto): Promise<import("../users/schemas/user.schema").UserDocument | null>;
    remove(id: string): Promise<any>;
    renew(id: string, body: RenewAdminDto): Promise<import("../users/schemas/user.schema").UserDocument | {
        message: string;
    } | null>;
}
