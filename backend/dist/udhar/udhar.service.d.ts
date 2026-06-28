import { Model, Types } from 'mongoose';
import { UdharDocument } from './schemas/udhar.schema';
import { ShopDocument } from '../shops/schemas/shop.schema';
import { CreateUdharDto } from './dto/create-udhar.dto';
import { UpdateUdharDto } from './dto/update-udhar.dto';
export declare class UdharService {
    private udharModel;
    private shopModel;
    constructor(udharModel: Model<UdharDocument>, shopModel: Model<ShopDocument>);
    findAll(shopId: Types.ObjectId | string): Promise<UdharDocument[]>;
    create(shopId: Types.ObjectId | string, createUdharDto: CreateUdharDto): Promise<UdharDocument>;
    update(shopId: Types.ObjectId | string, id: string, updateUdharDto: UpdateUdharDto): Promise<UdharDocument>;
    delete(shopId: Types.ObjectId | string, id: string): Promise<any>;
}
