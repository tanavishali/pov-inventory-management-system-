import { Model, Types } from 'mongoose';
import { OrderDocument } from './schemas/order.schema';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { ProductsService } from '../products/products.service';
export declare class OrdersService {
    private orderModel;
    private readonly productsService;
    constructor(orderModel: Model<OrderDocument>, productsService: ProductsService);
    findAll(shopId: Types.ObjectId | string): Promise<OrderDocument[]>;
    create(shopId: Types.ObjectId | string, createOrderDto: CreateOrderDto): Promise<OrderDocument>;
    update(shopId: Types.ObjectId | string, id: string, updateOrderDto: UpdateOrderDto): Promise<OrderDocument>;
    delete(shopId: Types.ObjectId | string, id: string): Promise<any>;
}
