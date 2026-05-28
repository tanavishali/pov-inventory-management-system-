import { Model } from 'mongoose';
import { UserDocument } from '../users/schemas/user.schema';
import { CreateSalesmanDto } from './dto/create-salesman.dto';
import { UpdateSalesmanDto } from './dto/update-salesman.dto';
export declare class SalesmanService {
    private readonly userModel;
    constructor(userModel: Model<UserDocument>);
    findAll(shopId: string): Promise<UserDocument[]>;
    create(shopId: string, dto: CreateSalesmanDto): Promise<UserDocument>;
    update(shopId: string, id: string, dto: UpdateSalesmanDto): Promise<UserDocument>;
    delete(shopId: string, id: string): Promise<{
        success: boolean;
    }>;
}
