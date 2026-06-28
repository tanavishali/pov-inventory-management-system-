import { Model } from 'mongoose';
import { UserDocument } from './schemas/user.schema';
export declare class UsersService {
    private userModel;
    constructor(userModel: Model<UserDocument>);
    create(userData: any): Promise<UserDocument>;
    findByEmail(email: string): Promise<UserDocument | null>;
    findById(id: string): Promise<UserDocument | null>;
    update(id: string, updateData: any): Promise<UserDocument | null>;
    findAllAdmins(): Promise<UserDocument[]>;
    delete(id: string): Promise<any>;
}
