import { OrdersService } from '../orders/orders.service';
import { ShopsService } from '../shops/shops.service';
import { SalesmanService } from '../salesman/salesman.service';
export declare class ReportsService {
    private readonly ordersService;
    private readonly shopsService;
    private readonly salesmanService;
    constructor(ordersService: OrdersService, shopsService: ShopsService, salesmanService: SalesmanService);
    getReports(shopId: string, from?: string, to?: string): Promise<{
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
