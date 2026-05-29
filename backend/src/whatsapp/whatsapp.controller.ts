import { Controller, Get, Post, Body, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { WhatsappService } from './whatsapp.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('WhatsApp')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('whatsapp')
export class WhatsappController {
  constructor(private readonly whatsappService: WhatsappService) {}

  @Get('settings')
  @ApiOperation({ summary: 'Get allowed admin numbers for the current tenant' })
  async getSettings(@Req() req: any) {
    const shopId = req.user.id; // Admin user ID is the shopId / tenant identifier
    const allowedNumbers = await this.whatsappService.getSettings(shopId);
    return { allowedNumbers };
  }

  @Post('settings')
  @ApiOperation({ summary: 'Update allowed admin numbers for the current tenant' })
  async updateSettings(@Req() req: any, @Body() body: { allowedNumbers: string[] }) {
    const shopId = req.user.id;
    const allowed = body.allowedNumbers || [];
    const admin = await this.whatsappService.updateSettings(shopId, allowed);
    return { success: true, allowedNumbers: admin.whatsappAdminNumbers };
  }

  @Post('disconnect')
  @ApiOperation({ summary: 'Disconnect and unlink WhatsApp device for the current tenant' })
  async disconnect(@Req() req: any) {
    const shopId = req.user.id;
    await this.whatsappService.disconnect(shopId);
    return { success: true, message: 'WhatsApp session disconnected successfully' };
  }

  @Post('connect')
  @ApiOperation({ summary: 'Initialize WhatsApp connection/pairing session for the current tenant' })
  async connect(@Req() req: any) {
    const shopId = req.user.id;
    // Async execution
    this.whatsappService.connect(shopId);
    return { success: true, message: 'WhatsApp connection session initialized' };
  }
}
