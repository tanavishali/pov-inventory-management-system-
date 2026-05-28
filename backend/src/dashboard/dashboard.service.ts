import { Injectable } from '@nestjs/common';
import { OrdersService } from '../orders/orders.service';
import { ProductsService } from '../products/products.service';
import { ShopsService } from '../shops/shops.service';

function parseOrderDate(dateStr: string, timeStr?: string): Date {
  try {
    // Expected format: '28 May 2026' or '28-May-2026' or '2026-05-28'
    const parts = dateStr.replace(/-/g, ' ').split(' ');
    if (parts.length === 3) {
      const day = parseInt(parts[0]);
      const monthNames = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
      const month = monthNames.findIndex(m => parts[1].toLowerCase().startsWith(m));
      const year = parseInt(parts[2]);
      
      let hours = 0;
      let minutes = 0;
      if (timeStr) {
        // E.g. '04:12 PM'
        const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
        if (match) {
          hours = parseInt(match[1]);
          minutes = parseInt(match[2]);
          const ampm = match[3].toUpperCase();
          if (ampm === 'PM' && hours < 12) hours += 12;
          if (ampm === 'AM' && hours === 12) hours = 0;
        }
      }
      if (month !== -1) {
        return new Date(year, month, day, hours, minutes);
      }
    }
  } catch (e) {
    console.error('Failed to parse date:', dateStr, e);
  }
  return new Date();
}

@Injectable()
export class DashboardService {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly productsService: ProductsService,
    private readonly shopsService: ShopsService,
  ) {}

  async getDashboardStats(shopId: string): Promise<any> {
    const orders = await this.ordersService.findAll(shopId);
    const products = await this.productsService.findAll(shopId);
    const shops = await this.shopsService.findAll(shopId);

    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Compute stats partitioned by period
    const computePeriodStats = (sinceDate: Date) => {
      const filteredOrders = orders.filter(o => {
        const oDate = parseOrderDate(o.date, o.time);
        return oDate >= sinceDate;
      });

      const filteredShops = shops.filter(s => {
        if (!s.created) return false;
        const sDate = new Date(s.created);
        return sDate >= sinceDate;
      });

      // 1. Total Sales (derived from products array in order)
      const salesTotal = filteredOrders
        .filter(o => o.status !== 'cancelled')
        .reduce((sum, o) => {
          const oTotal = o.products.reduce((s, p) => s + (p.price * p.qty), 0);
          return sum + oTotal;
        }, 0);

      // 2. New Customers count
      const newCustomersCount = filteredShops.length;

      // 3. Orders Placed count
      const ordersPlacedCount = filteredOrders.length;

      // 4. Delivered Orders count
      const deliveredCount = filteredOrders.filter(o => o.status === 'completed' || o.status === 'approved').length;

      // 5. Total Loss (sum of cancelled orders)
      const totalLoss = filteredOrders
        .filter(o => o.status === 'cancelled')
        .reduce((sum, o) => {
          const oTotal = o.products.reduce((s, p) => s + (p.price * p.qty), 0);
          return sum + oTotal;
        }, 0);

      // 6. Gross Profit (profit margins based on database products pricing or fallback 25%)
      let grossProfit = 0;
      filteredOrders
        .filter(o => o.status !== 'cancelled')
        .forEach(o => {
          o.products.forEach(op => {
            const dbProd = products.find(p => p.name.toLowerCase() === op.name.toLowerCase());
            if (dbProd && dbProd.purchase !== undefined && dbProd.selling !== undefined) {
              grossProfit += (dbProd.selling - dbProd.purchase) * op.qty;
            } else {
              grossProfit += op.price * op.qty * 0.25; // fallback to 25% margin
            }
          });
        });

      return {
        sales: Math.round(salesTotal).toLocaleString(),
        newC: newCustomersCount.toLocaleString(),
        profit: Math.round(grossProfit).toLocaleString(),
        loss: Math.round(totalLoss).toLocaleString(),
        orders: ordersPlacedCount.toLocaleString(),
        delivery: deliveredCount.toLocaleString(),
      };
    };

    // Low stock count (independent of period)
    const lowStockCount = products.filter(p => {
      const thresh = p.threshold !== undefined && p.threshold !== null ? Number(p.threshold) : 10;
      return p.stock <= thresh;
    }).length;

    const periodData = {
      daily: { ...computePeriodStats(oneDayAgo), stock: lowStockCount.toString() },
      weekly: { ...computePeriodStats(sevenDaysAgo), stock: lowStockCount.toString() },
      monthly: { ...computePeriodStats(thirtyDaysAgo), stock: lowStockCount.toString() },
    };

    // 7. Low Stock Alerts list (top 5 critical items)
    const lowStockAlerts = products
      .filter(p => {
        const thresh = p.threshold !== undefined && p.threshold !== null ? Number(p.threshold) : 10;
        return p.stock <= thresh;
      })
      .sort((a, b) => a.stock - b.stock)
      .slice(0, 5)
      .map(p => ({
        name: p.name,
        cat: p.cat || 'FMCG',
        stock: `${p.stock} pcs`,
        status: p.stock === 0 ? 'low' : 'mid',
        label: p.stock === 0 ? 'Critical' : 'Low',
      }));

    // 8. Top Selling Products list (top 5 by revenue)
    const productRevenues: { [name: string]: { revenue: number; cat: string } } = {};
    orders
      .filter(o => o.status !== 'cancelled')
      .forEach(o => {
        o.products.forEach(op => {
          const rev = op.price * op.qty;
          if (!productRevenues[op.name]) {
            const dbProd = products.find(p => p.name.toLowerCase() === op.name.toLowerCase());
            productRevenues[op.name] = { revenue: 0, cat: dbProd?.cat || 'FMCG' };
          }
          productRevenues[op.name].revenue += rev;
        });
      });

    const totalRevenue = Object.values(productRevenues).reduce((sum, p) => sum + p.revenue, 0);

    const topSellingColors = ['#0ea5e9', '#6366f1', '#f59e0b', '#10b981', '#ec4899'];
    const topSellingProducts = Object.entries(productRevenues)
      .map(([name, data]) => ({ name, revenue: data.revenue, cat: data.cat }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)
      .map((item, index) => ({
        name: item.name,
        revenue: `₨ ${Math.round(item.revenue).toLocaleString()}`,
        pct: totalRevenue > 0 ? Math.round((item.revenue / totalRevenue) * 100) : 0,
        color: topSellingColors[index % topSellingColors.length],
      }));

    // 9. Recent Orders list (top 5 latest orders)
    const recentOrders = orders
      .slice(0, 5)
      .map(o => {
        const itemsText = o.products.length === 1 ? '1 item' : `${o.products.length} items`;
        let statusType = 'low';
        let statusLabel = 'Pending';
        if (o.status === 'completed' || o.status === 'approved') {
          statusType = 'ok';
          statusLabel = 'Delivered';
        } else if (o.status === 'dispatched') {
          statusType = 'mid';
          statusLabel = 'In Transit';
        } else if (o.status === 'cancelled') {
          statusType = 'low';
          statusLabel = 'Cancelled';
        }

        const oTotal = o.products.reduce((s, p) => s + (p.price * p.qty), 0);

        return {
          id: o.id.startsWith('#') ? o.id : `#${o.id}`,
          customer: o.shop || o.customer,
          items: itemsText,
          amount: `₨ ${Math.round(oTotal || 0).toLocaleString()}`,
          status: statusType,
          statusLabel: statusLabel,
          date: o.date.split(' ').slice(0, 2).join(' '), // e.g. '28 May 2026' -> '28 May'
        };
      });

    return {
      periodData,
      lowStockAlerts,
      topSellingProducts,
      recentOrders,
    };
  }
}
