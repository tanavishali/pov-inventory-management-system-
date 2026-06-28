import { ReportsService } from './reports.service';
import { UsersService } from '../users/users.service';
export declare class ReportsController {
    private readonly reportsService;
    private readonly usersService;
    constructor(reportsService: ReportsService, usersService: UsersService);
    private getShopId;
    getReports(req: any, from?: string, to?: string): Promise<{
        stats: {
            totalRevenue: number;
            totalOrders: number;
            activeShops: number;
            activeSalesmen: number;
            revenueTrend: number | null;
            ordersTrend: number | null;
        };
        monthlyRevenue: number[];
        monthlyOrders: any[];
        cityBreakdown: {
            city: string;
            count: number;
            pct: number;
        }[];
        topSalesmen: {
            name: string;
            orders: number;
            revenue: number;
        }[];
        recentOrders: {
            id: string;
            shop: string;
            amount: number;
            status: string;
        }[];
        topShops: {
            pct: number;
            name: string;
            city: string;
            orders: number;
        }[];
    }>;
}
