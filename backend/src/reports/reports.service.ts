import { Injectable } from '@nestjs/common';
import { OrdersService } from '../orders/orders.service';
import { ShopsService } from '../shops/shops.service';
import { SalesmanService } from '../salesman/salesman.service';

@Injectable()
export class ReportsService {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly shopsService: ShopsService,
    private readonly salesmanService: SalesmanService,
  ) {}

  async getReports(shopId: string, from?: string, to?: string) {
    const [orders, shops, salesmen] = await Promise.all([
      this.ordersService.findAll(shopId),
      this.shopsService.findAll(shopId),
      this.salesmanService.findAll(shopId),
    ]);

    const toDate   = to   ? new Date(to   + 'T23:59:59') : new Date();
    const fromDate = from ? new Date(from) : new Date(toDate.getTime() - 365 * 24 * 60 * 60 * 1000);

    const periodLen = toDate.getTime() - fromDate.getTime();
    const prevFromDate = new Date(fromDate.getTime() - periodLen);
    const prevToDate   = new Date(fromDate.getTime());

    const inRange = (createdAt: any, start: Date, end: Date) => {
      const d = new Date(createdAt);
      return d >= start && d <= end;
    };

    const filteredOrders = orders.filter(o => inRange((o as any).createdAt, fromDate, toDate));
    const prevOrders     = orders.filter(o => inRange((o as any).createdAt, prevFromDate, prevToDate));

    const orderRevenue = (list: typeof orders) =>
      list
        .filter(o => o.status !== 'cancelled')
        .reduce((sum, o) => sum + o.products.reduce((s, p) => s + p.price * p.qty, 0), 0);

    const totalRevenue = orderRevenue(filteredOrders);
    const prevRevenue  = orderRevenue(prevOrders);
    const totalOrders  = filteredOrders.length;
    const prevOrdCount = prevOrders.length;

    const activeShops    = shops.filter(s => s.status === 'active').length;
    const activeSalesmen = salesmen.filter(s => (s as any).status === 'Active').length;

    const pctChange = (curr: number, prev: number): number | null =>
      prev > 0 ? Math.round(((curr - prev) / prev) * 100) : null;

    // Monthly breakdown for the current calendar year
    const currentYear = new Date().getFullYear();
    const monthlyRevenue = Array(12).fill(0);
    const monthlyOrders  = Array(12).fill(0);
    orders.forEach(o => {
      const d = new Date((o as any).createdAt);
      if (d.getFullYear() === currentYear) {
        const m = d.getMonth();
        monthlyOrders[m]++;
        if (o.status !== 'cancelled') {
          monthlyRevenue[m] += o.products.reduce((s, p) => s + p.price * p.qty, 0);
        }
      }
    });

    // City breakdown — join orders.shop name to shops.city
    const shopCityMap = new Map<string, string>();
    shops.forEach(s => shopCityMap.set(s.name.toLowerCase(), (s as any).city || 'Other'));

    const cityCounts: Record<string, number> = {};
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

    // Top salesmen by revenue in selected period
    const salesmanStats: Record<string, { orders: number; revenue: number }> = {};
    filteredOrders.filter(o => o.status !== 'cancelled').forEach(o => {
      const name = o.salesman?.trim() || 'Admin';
      if (!salesmanStats[name]) salesmanStats[name] = { orders: 0, revenue: 0 };
      salesmanStats[name].orders++;
      salesmanStats[name].revenue += o.products.reduce((s, p) => s + p.price * p.qty, 0);
    });

    const topSalesmen = Object.entries(salesmanStats)
      .map(([name, stats]) => ({ name, orders: stats.orders, revenue: Math.round(stats.revenue) }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 6);

    // Recent orders (latest 8 in range)
    const recentOrders = filteredOrders.slice(0, 8).map(o => {
      const amount = Math.round(o.products.reduce((s, p) => s + p.price * p.qty, 0));
      const status =
        o.status === 'completed' || o.status === 'approved' ? 'paid' :
        o.status === 'cancelled' ? 'cancelled' : 'pending';
      return {
        id:     o.id.startsWith('#') ? o.id : `#${o.id}`,
        shop:   o.shop || o.customer,
        amount,
        status,
      };
    });

    // Top shops by order count in selected period
    const shopOrderCounts: Record<string, { count: number; city: string }> = {};
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
        totalRevenue:    Math.round(totalRevenue),
        totalOrders,
        activeShops,
        activeSalesmen,
        revenueTrend:    pctChange(totalRevenue, prevRevenue),
        ordersTrend:     pctChange(totalOrders, prevOrdCount),
      },
      monthlyRevenue: monthlyRevenue.map(v => Math.round(v)),
      monthlyOrders,
      cityBreakdown,
      topSalesmen,
      recentOrders,
      topShops,
    };
  }
}
