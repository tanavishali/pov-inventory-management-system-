import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BusinessSettings, BusinessSettingsSchema } from './schemas/business-settings.schema';
import { BusinessSettingsService } from './business-settings.service';
import { BusinessSettingsController } from './business-settings.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: BusinessSettings.name, schema: BusinessSettingsSchema },
    ]),
  ],
  providers: [BusinessSettingsService],
  controllers: [BusinessSettingsController],
  exports: [BusinessSettingsService],
})
export class BusinessSettingsModule {}
