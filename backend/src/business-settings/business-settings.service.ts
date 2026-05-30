import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { BusinessSettings, BusinessSettingsDocument } from './schemas/business-settings.schema';
import { UpdateBusinessSettingsDto } from './dto/update-business-settings.dto';

@Injectable()
export class BusinessSettingsService {
  constructor(
    @InjectModel(BusinessSettings.name)
    private businessSettingsModel: Model<BusinessSettingsDocument>,
  ) {}

  async getSettings(userId: string): Promise<BusinessSettingsDocument> {
    const userObjectId = new Types.ObjectId(userId);
    let settings = await this.businessSettingsModel.findOne({ userId: userObjectId }).exec();
    
    if (!settings) {
      // Create defaults if not exists
      settings = new this.businessSettingsModel({ userId: userObjectId });
      await settings.save();
    }
    
    return settings;
  }

  async updateSettings(
    userId: string,
    updateDto: UpdateBusinessSettingsDto,
  ): Promise<BusinessSettingsDocument> {
    const userObjectId = new Types.ObjectId(userId);
    
    let settings = await this.businessSettingsModel.findOne({ userId: userObjectId }).exec();
    
    if (!settings) {
      settings = new this.businessSettingsModel({
        userId: userObjectId,
        ...updateDto,
      });
    } else {
      Object.assign(settings, updateDto);
    }
    
    return settings.save();
  }
}
