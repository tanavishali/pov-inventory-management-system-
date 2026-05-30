import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { BusinessSettingsService } from './business-settings.service';
import { UpdateBusinessSettingsDto } from './dto/update-business-settings.dto';

@ApiTags('Business Settings')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('business-settings')
export class BusinessSettingsController {
  constructor(private readonly businessSettingsService: BusinessSettingsService) {}

  @Get()
  @ApiOperation({ summary: 'Get current user business and invoice settings' })
  @ApiResponse({ status: 200, description: 'Return business settings' })
  async getSettings(@Request() req) {
    const userId = req.user.id;
    return this.businessSettingsService.getSettings(userId);
  }

  @Post()
  @ApiOperation({ summary: 'Update current user business and invoice settings' })
  @ApiResponse({ status: 200, description: 'Settings updated successfully' })
  async updateSettings(@Request() req, @Body() updateDto: UpdateBusinessSettingsDto) {
    const userId = req.user.id;
    const settings = await this.businessSettingsService.updateSettings(userId, updateDto);
    return { success: true, settings };
  }
}
