import { SalesmanService } from './salesman.service';
import { UsersService } from '../users/users.service';
import { CreateSalesmanDto } from './dto/create-salesman.dto';
import { UpdateSalesmanDto } from './dto/update-salesman.dto';
export declare class SalesmanController {
    private readonly salesmanService;
    private readonly usersService;
    constructor(salesmanService: SalesmanService, usersService: UsersService);
    private getShopId;
    findAll(req: any): Promise<import("../users/schemas/user.schema").UserDocument[]>;
    create(req: any, createSalesmanDto: CreateSalesmanDto): Promise<import("../users/schemas/user.schema").UserDocument>;
    update(req: any, id: string, updateSalesmanDto: UpdateSalesmanDto): Promise<import("../users/schemas/user.schema").UserDocument>;
    remove(req: any, id: string): Promise<{
        success: boolean;
    }>;
}
