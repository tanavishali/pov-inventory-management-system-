import { ProductsService } from './products.service';
import { UsersService } from '../users/users.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
export declare class ProductsController {
    private readonly productsService;
    private readonly usersService;
    constructor(productsService: ProductsService, usersService: UsersService);
    private getShopId;
    findAll(req: any, search?: string, filter?: string, sort?: string): Promise<import("./schemas/product.schema").ProductDocument[]>;
    findLowStock(req: any): Promise<import("./schemas/product.schema").ProductDocument[]>;
    create(req: any, createProductDto: CreateProductDto): Promise<import("./schemas/product.schema").ProductDocument>;
    update(req: any, id: string, updateProductDto: UpdateProductDto): Promise<import("./schemas/product.schema").ProductDocument>;
    remove(req: any, id: string): Promise<any>;
}
