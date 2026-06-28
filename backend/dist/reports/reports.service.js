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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportsService = void 0;
const common_1 = require("@nestjs/common");
const orders_service_1 = require("../orders/orders.service");
const shops_service_1 = require("../shops/shops.service");
const salesman_service_1 = require("../salesman/salesman.service");
let ReportsService = class ReportsService {
    ordersService;
    shopsService;
    salesmanService;
    constructor(ordersService, shopsService, salesmanService) {
        this.ordersService = ordersService;
        this.shopsService = shopsService;
        this.salesmanService = salesmanService;
    }
    async getReports(shopId, from, to) {
        const [orders, shops, salesmen] = await Promise.all([
            this.ordersService.findAll(shopId),
            this.shopsService.findAll(shopId),
            this.salesmanService.findAll(shopId),
        ]);
        const toDate = to ? new Date(to + 'T23:59:59') : new Date();
        const fromDate = from ? new Date(from) : new Date(toDate.getTime() - 365 * 24 * 60 * 60 * 1000);
        const periodLen = toDate.getTime() - fromDate.getTime();
        const prevFromDate = new Date(fromDate.getTime() - periodLen);
        const prevToDate = new Date(fromDate.getTime());
        const inRange = (createdAt, start, end) => {
            const d = new Date(createdAt);
            return d >= start && d <= end;
        };
        const filteredOrders = orders.filter(o => inRange(o.createdAt, fromDate, toDate));
        const prevOrders = orders.filter(o => inRange(o.createdAt, prevFromDate, prevToDate));
        const orderRevenue = (list) => list
            .filter(o => o.status !== 'cancelled')
            .reduce((sum, o) => sum + o.products.reduce((s, p) => s + p.price * p.qty, 0), 0);
        const totalRevenue = orderRevenue(filteredOrders);
        const prevRevenue = orderRevenue(prevOrders);
        const totalOrders = filteredOrders.length;
        const prevOrdCount = prevOrders.length;
        const activeShops = shops.filter(s => s.status === 'active').length;
        const activeSalesmen = salesmen.filter(s => s.status === 'Active').length;
        const pctChange = (curr, prev) => prev > 0 ? Math.round(((curr - prev) / prev) * 100) : null;
        const currentYear = new Date().getFullYear();
        const monthlyRevenue = Array(12).fill(0);
        const monthlyOrders = Array(12).fill(0);
        orders.forEach(o => {
            const d = new Date(o.createdAt);
            if (d.getFullYear() === currentYear) {
                const m = d.getMonth();
                monthlyOrders[m]++;
                if (o.status !== 'cancelled') {
                    monthlyRevenue[m] += o.products.reduce((s, p) => s + p.price * p.qty, 0);
                }
            }
        });
        const shopCityMap = new Map();
        shops.forEach(s => shopCityMap.set(s.name.toLowerCase(), s.city || 'Other'));
        const cityCounts = {};
        filteredOrders.filter(o => o.status !== 'cancelled').forEach(o => {
            const city = shopCityMap.get(o.shop?.toLowerCase()) || 'Other';
            cityCounts[city] = (cityCounts[city] || 0) + 1;
        });
        const totalCityOrders = Object.values(cityCounts).reduce((a, b) => a + b, 0);
        const cityBreakdown = Object.entries(cityCounts)
            .map(([city, count]) => ({
            city,
            count,
            pct: totalCityOrders > 0 ? Math.round((count / totalCityOrders) * 100) : 0,
        }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 6);
        const salesmanStats = {};
        filteredOrders.filter(o => o.status !== 'cancelled').forEach(o => {
            const name = o.salesman?.trim() || 'Admin';
            if (!salesmanStats[name])
                salesmanStats[name] = { orders: 0, revenue: 0 };
            salesmanStats[name].orders++;
            salesmanStats[name].revenue += o.products.reduce((s, p) => s + p.price * p.qty, 0);
        });
        const topSalesmen = Object.entries(salesmanStats)
            .map(([name, stats]) => ({ name, orders: stats.orders, revenue: Math.round(stats.revenue) }))
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 6);
        const recentOrders = filteredOrders.slice(0, 8).map(o => {
            const amount = Math.round(o.products.reduce((s, p) => s + p.price * p.qty, 0));
            const status = o.status === 'completed' || o.status === 'approved' ? 'paid' :
                o.status === 'cancelled' ? 'cancelled' : 'pending';
            return {
                id: o.id.startsWith('#') ? o.id : `#${o.id}`,
                shop: o.shop || o.customer,
                amount,
                status,
            };
        });
        const shopOrderCounts = {};
        filteredOrders.filter(o => o.status !== 'cancelled').forEach(o => {
            const shopName = o.shop || 'Unknown';
            if (!shopOrderCounts[shopName]) {
                shopOrderCounts[shopName] = { count: 0, city: shopCityMap.get(shopName.toLowerCase()) || '' };
            }
            shopOrderCounts[shopName].count++;
        });
        const sortedShops = Object.entries(shopOrderCounts)
            .map(([name, d]) => ({ name, city: d.city, orders: d.count }))
            .sort((a, b) => b.orders - a.orders)
            .slice(0, 8);
        const maxShopOrders = sortedShops[0]?.orders || 1;
        const topShops = sortedShops.map(s => ({
            ...s,
            pct: Math.round((s.orders / maxShopOrders) * 100),
        }));
        return {
            stats: {
                totalRevenue: Math.round(totalRevenue),
                totalOrders,
                activeShops,
                activeSalesmen,
                revenueTrend: pctChange(totalRevenue, prevRevenue),
                ordersTrend: pctChange(totalOrders, prevOrdCount),
            },
            monthlyRevenue: monthlyRevenue.map(v => Math.round(v)),
            monthlyOrders,
            cityBreakdown,
            topSalesmen,
            recentOrders,
            topShops,
        };
    }
};
exports.ReportsService = ReportsService;
exports.ReportsService = ReportsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [orders_service_1.OrdersService,
        shops_service_1.ShopsService,
        salesman_service_1.SalesmanService])
], ReportsService);
//# sourceMappingURL=reports.service.js.map