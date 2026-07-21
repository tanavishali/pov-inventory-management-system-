import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(userData: any): Promise<UserDocument> {
    const password = userData.password;
    if (typeof password === 'string') {
      userData.plainPassword = password;
      userData.password = await bcrypt.hash(password, 10);
    }
    const createdUser = new this.userModel(userData);
    return createdUser.save();
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async findById(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id).exec();
  }

  async update(id: string, updateData: any): Promise<UserDocument | null> {
    const password = updateData.password;
    if (typeof password === 'string') {
      updateData.plainPassword = password;
      updateData.password = await bcrypt.hash(password, 10);
    }
    return this.userModel.findByIdAndUpdate(id, updateData, { new: true }).exec();
  }

  async findAllAdmins(): Promise<UserDocument[]> {
    const admins = await this.userModel.find({ role: 'admin' }).exec();
    await this.autoLockExpired(admins);
    return admins;
  }

  async findAllAdminsPaginated(opts: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  }): Promise<{
    data: UserDocument[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    counts: { all: number; Active: number; Locked: number; Demo: number };
  }> {
    const page = Math.max(1, parseInt(String(opts.page)) || 1);
    const limit = Math.max(1, parseInt(String(opts.limit)) || 4);

    const filter: any = { role: 'admin' };
    if (opts.status && opts.status !== 'all') filter.status = opts.status;
    if (opts.search?.trim()) {
      const re = new RegExp(opts.search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      filter.$or = [{ name: re }, { email: re }];
    }

    const [data, total, all, active, locked, demo] = await Promise.all([
      this.userModel.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).exec(),
      this.userModel.countDocuments(filter).exec(),
      this.userModel.countDocuments({ role: 'admin' }).exec(),
      this.userModel.countDocuments({ role: 'admin', status: 'Active' }).exec(),
      this.userModel.countDocuments({ role: 'admin', status: 'Locked' }).exec(),
      this.userModel.countDocuments({ role: 'admin', status: 'Demo' }).exec(),
    ]);

    await this.autoLockExpired(data);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
      counts: { all, Active: active, Locked: locked, Demo: demo },
    };
  }

  // Lazily persists Locked/Overdue for accounts whose subscription has passed its
  // expiryDate — self-heals whichever admins are fetched, without a background job.
  private async autoLockExpired(admins: UserDocument[]): Promise<void> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (const admin of admins) {
      if (admin.status === 'Locked' || !admin.expiryDate) continue;
      const exp = new Date(admin.expiryDate);
      if (!isNaN(exp.getTime()) && exp < today) {
        admin.status = 'Locked';
        admin.feeStatus = 'Overdue';
        await admin.save();
      }
    }
  }

  async delete(id: string): Promise<any> {
    return this.userModel.findByIdAndDelete(id).exec();
  }
}
