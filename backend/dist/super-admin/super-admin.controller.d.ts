import { UsersService } from '../users/users.service';
import { CreateAdminDto, UpdateAdminDto } from '../users/dto/admin-management.dto';
export declare class SuperAdminController {
    private usersService;
    constructor(usersService: UsersService);
    createAdmin(createAdminDto: CreateAdminDto): Promise<import("../users/schemas/user.schema").UserDocument>;
    findAll(): Promise<import("../users/schemas/user.schema").UserDocument[]>;
    update(id: string, updateAdminDto: UpdateAdminDto): Promise<import("../users/schemas/user.schema").UserDocument | null>;
    remove(id: string): Promise<any>;
    renew(id: string, days: number): Promise<import("../users/schemas/user.schema").UserDocument | {
        message: string;
    } | null>;
}
