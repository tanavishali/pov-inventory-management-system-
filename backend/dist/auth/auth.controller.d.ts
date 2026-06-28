import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { UpdateProfileDto } from '../users/dto/update-profile.dto';
export declare class AuthController {
    private authService;
    private usersService;
    constructor(authService: AuthService, usersService: UsersService);
    login(loginDto: LoginDto): Promise<{
        access_token: string;
        user: {
            id: any;
            name: any;
            email: any;
            role: any;
            status: any;
            plan: any;
            feeStatus: any;
            expiryDate: any;
        };
    }>;
    logout(): Promise<{
        message: string;
    }>;
    getProfile(req: any): Promise<any>;
    updateProfile(req: any, updateDto: UpdateProfileDto): Promise<{
        success: boolean;
        user: any;
    }>;
}
