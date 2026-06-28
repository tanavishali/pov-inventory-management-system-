import { Model, Types } from 'mongoose';
import { ShopDocument } from './schemas/shop.schema';
import { CreateShopDto } from './dto/create-shop.dto';
import { UpdateShopDto } from './dto/update-shop.dto';
export declare class ShopsService {
    private shopModel;
    constructor(shopModel: Model<ShopDocument>);
    findAll(shopId: Types.ObjectId | string, search?: string, status?: string): Promise<ShopDocument[]>;
    create(shopId: Types.ObjectId | string, createShopDto: CreateShopDto): Promise<ShopDocument>;
    update(shopId: Types.ObjectId | string, id: number, updateShopDto: UpdateShopDto): Promise<ShopDocument>;
    delete(shopId: Types.ObjectId | string, id: number): Promise<any>;
}
