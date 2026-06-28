import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { User, UserDocument } from '../users/schemas/user.schema';
import { CreateSalesmanDto } from './dto/create-salesman.dto';
import { UpdateSalesmanDto } from './dto/update-salesman.dto';

@Injectable()
export class SalesmanService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>
  ) {}

  async findAll(shopId: string, search?: string, status?: string): Promise<UserDocument[]> {
    const query: any = { shopId: new Types.ObjectId(shopId), role: 'salesman' };
    if (status && status !== 'all') {
      query.status = status === 'active' ? { $in: ['Active', 'active'] } : { $in: ['Locked', 'blocked'] };
    }
    if (search) {
      const re = new RegExp(search, 'i');
      query.$or = [{ name: re }, { email: re }, { phone: re }];
    }
    return this.userModel.find(query).sort({ createdAt: -1 }).exec();
  }

  async create(shopId: string, dto: CreateSalesmanDto): Promise<UserDocument> {
    // Check if email already taken
    const existing = await this.userModel.findOne({ email: dto.email.toLowerCase() }).exec();
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const createdSalesman = new this.userModel({
      ...dto,
      email: dto.email.toLowerCase(),
      password: hashedPassword,
      plainPassword: dto.password,
      role: 'salesman',
      shopId: new Types.ObjectId(shopId),
      // Default initial sales/orders to 0 if not provided
      sales: 0,
      orders: 0,
    });

    return createdSalesman.save();
  }

  async update(
    shopId: string,
    id: string,
    dto: UpdateSalesmanDto
  ): Promise<UserDocument> {
    // Find salesman under tenant shopId
    const salesman = await this.userModel
      .findOne({
        _id: new Types.ObjectId(id),
        shopId: new Types.ObjectId(shopId),
        role: 'salesman',
      })
      .exec();

    if (!salesman) {
      throw new NotFoundException('Salesman not found under this tenant');
    }

    // Check email uniqueness if changed
    if (dto.email && dto.email.toLowerCase() !== salesman.email) {
      const emailTaken = await this.userModel
        .findOne({ email: dto.email.toLowerCase() })
        .exec();
      if (emailTaken) {
        throw new ConflictException('Email already taken by another user');
      }
      salesman.email = dto.email.toLowerCase();
    }

    // Hash password if modified
    if (dto.password) {
      salesman.password = await bcrypt.hash(dto.password, 10);
      salesman.plainPassword = dto.password;
    }

    // Apply other updateable properties
    if (dto.name) salesman.name = dto.name;
    if (dto.phone) salesman.phone = dto.phone;
    if (dto.cnic !== undefined) salesman.cnic = dto.cnic;
    if (dto.joined !== undefined) salesman.joined = dto.joined;
    if (dto.status) salesman.status = dto.status;

    return salesman.save();
  }

  async delete(shopId: string, id: string): Promise<{ success: boolean }> {
    const result = await this.userModel
      .findOneAndDelete({
        _id: new Types.ObjectId(id),
        shopId: new Types.ObjectId(shopId),
        role: 'salesman',
      })
      .exec();

    if (!result) {
      throw new NotFoundException('Salesman not found under this tenant');
    }

    return { success: true };
  }
}
