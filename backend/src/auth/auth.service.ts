import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (user && user.password && (await bcrypt.compare(pass, user.password))) {
      const { password, ...result } = user.toObject();
      return result;
    }
    return null;
  }

  /**
   * Blocks access when a tenant's subscription has expired or its shop has been locked.
   * - super-admin never expires
   * - admin uses its own status/expiryDate
   * - salesman inherits the parent admin's (shopId) status/expiryDate
   * Accounts without an expiryDate are treated as not expired.
   * When expiry has just passed, the shop is persisted as Locked/Overdue here so the
   * Users list reflects it immediately without needing a background job.
   */
  async assertSubscriptionActive(user: any): Promise<void> {
    if (!user || user.role === 'super-admin') return;

    let owner = user;
    if (user.role === 'salesman' && user.shopId) {
      owner = await this.usersService.findById(user.shopId.toString());
    }
    if (!owner) return;

    if (owner.status === 'Locked') {
      throw new UnauthorizedException(
        'Your account has been locked. Please contact the administrator to renew your plan.',
      );
    }

    if (!owner.expiryDate) return;

    const exp = new Date(owner.expiryDate);
    if (isNaN(exp.getTime())) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Valid through the expiry date itself; expired only once it is in the past.
    if (exp < today) {
      await this.usersService
        .update(owner._id.toString(), { status: 'Locked', feeStatus: 'Overdue' })
        .catch(() => {});
      throw new UnauthorizedException(
        'Your subscription has expired. Please contact the administrator to renew your plan.',
      );
    }
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user._id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        plan: user.plan,
        feeStatus: user.feeStatus,
        expiryDate: user.expiryDate,
      },
    };
  }
}
