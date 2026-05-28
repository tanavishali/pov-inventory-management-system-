import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { UsersService } from '../users/users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Dashboard')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(
    private readonly dashboardService: DashboardService,
    private readonly usersService: UsersService,
  ) {}

  private async getShopId(req: any): Promise<string> {
    const user = await this.usersService.findById(req.user.id);
    if (!user) return req.user.id;
    return user.role === 'admin' ? user._id.toString() : user.shopId?.toString() || req.user.id;
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get aggregated tenant dashboard metrics' })
  async getDashboardStats(@Req() req: any) {
    const shopId = await this.getShopId(req);
    return this.dashboardService.getDashboardStats(shopId);
  }
}
