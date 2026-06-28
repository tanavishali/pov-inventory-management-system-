import { ShopsService } from './shops.service';
import { UsersService } from '../users/users.service';
import { CreateShopDto } from './dto/create-shop.dto';
import { UpdateShopDto } from './dto/update-shop.dto';
export declare class ShopsController {
    private readonly shopsService;
    private readonly usersService;
    constructor(shopsService: ShopsService, usersService: UsersService);
    private getShopId;
    findAll(req: any, search?: string, status?: string): Promise<import("./schemas/shop.schema").ShopDocument[]>;
    create(req: any, createShopDto: CreateShopDto): Promise<import("./schemas/shop.schema").ShopDocument>;
    update(req: any, id: number, updateShopDto: UpdateShopDto): Promise<import("./schemas/shop.schema").ShopDocument>;
    remove(req: any, id: number): Promise<any>;
}
