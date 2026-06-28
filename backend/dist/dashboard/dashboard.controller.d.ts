import { DashboardService } from './dashboard.service';
import { UsersService } from '../users/users.service';
export declare class DashboardController {
    private readonly dashboardService;
    private readonly usersService;
    constructor(dashboardService: DashboardService, usersService: UsersService);
    private getShopId;
    getDashboardStats(req: any): Promise<any>;
}
