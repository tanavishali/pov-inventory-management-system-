import { BusinessSettingsService } from './business-settings.service';
import { UpdateBusinessSettingsDto } from './dto/update-business-settings.dto';
export declare class BusinessSettingsController {
    private readonly businessSettingsService;
    constructor(businessSettingsService: BusinessSettingsService);
    getSettings(req: any): Promise<import("./schemas/business-settings.schema").BusinessSettingsDocument>;
    updateSettings(req: any, updateDto: UpdateBusinessSettingsDto): Promise<{
        success: boolean;
        settings: import("./schemas/business-settings.schema").BusinessSettingsDocument;
    }>;
}
