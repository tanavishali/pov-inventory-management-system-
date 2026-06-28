import { Model } from 'mongoose';
import { BusinessSettingsDocument } from './schemas/business-settings.schema';
import { UpdateBusinessSettingsDto } from './dto/update-business-settings.dto';
export declare class BusinessSettingsService {
    private businessSettingsModel;
    constructor(businessSettingsModel: Model<BusinessSettingsDocument>);
    getSettings(userId: string): Promise<BusinessSettingsDocument>;
    updateSettings(userId: string, updateDto: UpdateBusinessSettingsDto): Promise<BusinessSettingsDocument>;
}
