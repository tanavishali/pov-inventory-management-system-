import { UdharService } from './udhar.service';
import { UsersService } from '../users/users.service';
import { CreateUdharDto } from './dto/create-udhar.dto';
import { UpdateUdharDto } from './dto/update-udhar.dto';
export declare class UdharController {
    private readonly udharService;
    private readonly usersService;
    constructor(udharService: UdharService, usersService: UsersService);
    private getShopId;
    findAll(req: any): Promise<import("./schemas/udhar.schema").UdharDocument[]>;
    create(req: any, createUdharDto: CreateUdharDto): Promise<import("./schemas/udhar.schema").UdharDocument>;
    update(req: any, id: string, updateUdharDto: UpdateUdharDto): Promise<import("./schemas/udhar.schema").UdharDocument>;
    remove(req: any, id: string): Promise<any>;
}
