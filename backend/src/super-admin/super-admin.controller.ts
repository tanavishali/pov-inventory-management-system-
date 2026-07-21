import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, ConflictException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from '../users/users.service';
import { PaymentsService } from '../payments/payments.service';
import { CreateAdminDto, UpdateAdminDto, RenewAdminDto } from '../users/dto/admin-management.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Super Admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('super-admin')
@Controller('super-admin')
export class SuperAdminController {
  constructor(
    private usersService: UsersService,
    private paymentsService: PaymentsService,
  ) {}

  @Get('stats')
  @ApiOperation({ summary: 'Get aggregated platform overview statistics' })
  async getStats() {
    const admins = await this.usersService.findAllAdmins();
    const payments = await this.paymentsService.findAll();

    // 1. Total Licenses Sold: Count of all admins
    const totalLicenses = admins.length;

    // 2. Active Shops: Count where status is 'Active'
    const activeShops = admins.filter(u => u.status === 'Active').length;

    // 3. Demo Shops: Count where status is 'Demo'
    const demoShops = admins.filter(u => u.status === 'Demo').length;

    // 4. Locked Shops: Count where status is 'Locked'
    const lockedShops = admins.filter(u => u.status === 'Locked').length;

    // 5. Unpaid Accounts: Count admins where feeStatus is 'Unpaid' or 'Overdue'
    const unpaidAccounts = admins.filter(u => u.feeStatus === 'Unpaid' || u.feeStatus === 'Overdue').length;

    // 6. Expected Monthly Recurring Revenue (MRR): Sum of monthlyFee for all active shop admins
    const expectedMrr = admins
      .filter(u => u.status === 'Active')
      .reduce((sum, u) => sum + (u.monthlyFee || 0), 0);

    // 7. Total Collected Revenue: Sum of Paid payments
    const totalCollected = payments
      .filter(p => p.status === 'Paid')
      .reduce((sum, p) => sum + p.amount, 0);

    // 8. Pending Collection: Sum of Pending payments
    const totalPending = payments
      .filter(p => p.status === 'Pending')
      .reduce((sum, p) => sum + p.amount, 0);

    // 9. Plan Distribution
    const planStats = {
      Basic: admins.filter(u => u.plan === 'Basic').length,
      Premium: admins.filter(u => u.plan === 'Premium').length,
      Enterprise: admins.filter(u => u.plan === 'Enterprise').length,
    };

    // 10. Payment Method Distribution
    const methodStats = {
      EasyPaisa: payments.filter(p => p.method === 'EasyPaisa').length,
      JazzCash: payments.filter(p => p.method === 'JazzCash').length,
      BankTransfer: payments.filter(p => p.method === 'Bank Transfer').length,
      Unspecified: payments.filter(p => !p.method).length,
    };

    // 11. Recent Payments (latest 5)
    const recentPayments = payments.slice(0, 5);

    // 12. Recent Admins (latest 5)
    const recentAdmins = admins.slice(-5).reverse();

    return {
      totalLicenses,
      activeShops,
      demoShops,
      lockedShops,
      unpaidAccounts,
      expectedMrr,
      totalCollected,
      totalPending,
      planStats,
      methodStats,
      recentPayments,
      recentAdmins,
    };
  }

  @Get('revenue')
  @ApiOperation({ summary: 'Get detailed platform revenue analytics' })
  async getRevenue() {
    const admins = await this.usersService.findAllAdmins();
    const payments = await this.paymentsService.findAll();

    // Calculate overall revenue metrics
    const totalCollected = payments
      .filter(p => p.status === 'Paid')
      .reduce((sum, p) => sum + p.amount, 0);

    const totalPending = payments
      .filter(p => p.status === 'Pending')
      .reduce((sum, p) => sum + p.amount, 0);

    const expectedMrr = admins
      .filter(u => u.status === 'Active')
      .reduce((sum, u) => sum + (u.monthlyFee || 0), 0);

    // Group revenue by Month
    const monthlyStats = {};
    payments.forEach(p => {
      const m = p.month || 'Unspecified';
      if (!monthlyStats[m]) {
        monthlyStats[m] = { month: m, expected: 0, collected: 0, pending: 0 };
      }
      monthlyStats[m].expected += p.amount;
      if (p.status === 'Paid') {
        monthlyStats[m].collected += p.amount;
      } else {
        monthlyStats[m].pending += p.amount;
      }
    });
    const revenueByMonth = Object.values(monthlyStats);

    // Group revenue by Subscription Tier (Plan)
    const tierStats = {};
    payments.forEach(p => {
      const tier = p.plan || 'Basic';
      if (!tierStats[tier]) {
        tierStats[tier] = { tier, collected: 0, count: 0 };
      }
      if (p.status === 'Paid') {
        tierStats[tier].collected += p.amount;
        tierStats[tier].count += 1;
      }
    });
    const revenueByTier = Object.values(tierStats);

    // Group revenue by Payment Gateway Method
    const methodStats = {};
    payments.filter(p => p.status === 'Paid').forEach(p => {
      const method = p.method || 'Unspecified';
      if (!methodStats[method]) {
        methodStats[method] = { method, collected: 0, count: 0 };
      }
      methodStats[method].collected += p.amount;
      methodStats[method].count += 1;
    });
    const revenueByMethod = Object.values(methodStats);

    // Dynamic summary statistics
    const statsSummary = {
      totalCollected,
      totalPending,
      expectedMrr,
      totalTransactions: payments.length,
      paidTransactions: payments.filter(p => p.status === 'Paid').length,
      pendingTransactions: payments.filter(p => p.status === 'Pending').length,
    };

    return {
      summary: statsSummary,
      revenueByMonth,
      revenueByTier,
      revenueByMethod,
      paymentsList: payments
    };
  }

  @Post('admins')
  @ApiOperation({ summary: 'Create a new Shop Admin (Shop Owner)' })
  async createAdmin(@Body() createAdminDto: CreateAdminDto) {
    const isDemo = createAdminDto.status === 'Demo';
    const today = new Date();
    const defaultExpiry = new Date();
    defaultExpiry.setDate(defaultExpiry.getDate() + (isDemo ? 14 : 30));

    const feeStatus = createAdminDto.feeStatus
      || (createAdminDto.paymentStatus
        ? (createAdminDto.paymentStatus === 'Paid' ? 'Paid' : 'Unpaid')
        : (createAdminDto.status === 'Active' ? 'Paid' : 'Unpaid'));

    let admin;
    try {
      admin = await this.usersService.create({
        ...createAdminDto,
        role: 'admin',
        purchasedOn: createAdminDto.purchasedOn || today.toISOString().split('T')[0],
        expiryDate: createAdminDto.expiryDate || defaultExpiry.toISOString().split('T')[0],
        feeStatus,
      });
    } catch (err) {
      if (err?.code === 11000 || err?.errorResponse?.code === 11000) {
        throw new ConflictException('Yeh email already registered hai. Doosra email use karein.');
      }
      throw err;
    }

    // Every new account gets this month's payment record so it shows up on the Payments page.
    await this.paymentsService.create({
      shop: admin.name,
      email: admin.email,
      amount: admin.monthlyFee,
      plan: admin.plan,
      method: createAdminDto.paymentMethod,
      status: feeStatus === 'Paid' ? 'Paid' : 'Pending',
    });

    return admin;
  }

  @Get('admins')
  @ApiOperation({ summary: 'List Shop Admins (paginated)' })
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
  ) {
    return this.usersService.findAllAdminsPaginated({ page: Number(page), limit: Number(limit), status, search });
  }

  @Patch('admins/:id')
  @ApiOperation({ summary: 'Update Shop Admin details' })
  async update(@Param('id') id: string, @Body() updateAdminDto: UpdateAdminDto) {
    const { password, ...safeData } = updateAdminDto as any;
    const dataToUpdate = (password && !password.startsWith('$2b$') && !password.startsWith('$2a$'))
      ? { ...safeData, password }
      : safeData;
    try {
      return await this.usersService.update(id, dataToUpdate);
    } catch (err) {
      if (err?.code === 11000 || err?.errorResponse?.code === 11000) {
        throw new ConflictException('Yeh email already kisi aur account mein use ho rahi hai.');
      }
      throw err;
    }
  }

  @Delete('admins/:id')
  @ApiOperation({ summary: 'Delete a Shop Admin' })
  remove(@Param('id') id: string) {
    return this.usersService.delete(id);
  }

  @Post('admins/:id/renew')
  @ApiOperation({ summary: 'Renew or extend Shop Admin subscription' })
  async renew(@Param('id') id: string, @Body() body: RenewAdminDto) {
    const user = await this.usersService.findById(id);
    if (!user) return { message: 'User not found' };

    const safeDays = (body?.days && body.days > 0) ? body.days : 30;
    // Extend from the LATER of today or the current expiry, so renewing never
    // shortens an active subscription and always pushes an expired one forward.
    const now = new Date();
    const base = user.expiryDate ? new Date(user.expiryDate) : now;
    const start = base > now ? base : now;
    start.setDate(start.getDate() + safeDays);

    return this.usersService.update(id, {
      expiryDate: start.toISOString().split('T')[0],
      status: 'Active',
      feeStatus: 'Paid',
    });
  }
}
