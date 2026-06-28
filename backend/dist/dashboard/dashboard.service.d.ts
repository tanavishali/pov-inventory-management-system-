import { OrdersService } from '../orders/orders.service';
import { ProductsService } from '../products/products.service';
import { ShopsService } from '../shops/shops.service';
export declare class DashboardService {
    private readonly ordersService;
    private readonly productsService;
    private readonly shopsService;
    constructor(ordersService: OrdersService, productsService: ProductsService, shopsService: ShopsService);
    getDashboardStats(shopId: string): Promise<any>;
}
