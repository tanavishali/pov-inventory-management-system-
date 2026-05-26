import { OrdersService } from './orders.service';
import { UsersService } from '../users/users.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
export declare class OrdersController {
    private readonly ordersService;
    private readonly usersService;
    constructor(ordersService: OrdersService, usersService: UsersService);
    private getShopId;
    findAll(req: any): Promise<import("./schemas/order.schema").OrderDocument[]>;
    create(req: any, createOrderDto: CreateOrderDto): Promise<import("./schemas/order.schema").OrderDocument>;
    update(req: any, id: string, updateOrderDto: UpdateOrderDto): Promise<import("./schemas/order.schema").OrderDocument>;
    remove(req: any, id: string): Promise<any>;
}
