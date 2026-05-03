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
      updateData.password = await bcrypt.hash(password, 10);
    }
    return this.userModel.findByIdAndUpdate(id, updateData, { new: true }).exec();
  }

  async findAllAdmins(): Promise<UserDocument[]> {
    return this.userModel.find({ role: 'admin' }).exec();
  }

  async delete(id: string): Promise<any> {
    return this.userModel.findByIdAndDelete(id).exec();
  }
}
