import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UdharService } from './udhar.service';
import { UsersService } from '../users/users.service';
import { CreateUdharDto } from './dto/create-udhar.dto';
import { UpdateUdharDto } from './dto/update-udhar.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Udhar')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('udhar')
export class UdharController {
  constructor(
    private readonly udharService: UdharService,
    private readonly usersService: UsersService,
  ) {}

  private async getShopId(req: any): Promise<string> {
    const user = await this.usersService.findById(req.user.id);
    if (!user) return req.user.id;
    return user.role === 'admin' ? user._id.toString() : user.shopId?.toString() || req.user.id;
  }

  @Get()
  @ApiOperation({ summary: 'Get all credit ledger entries for the current tenant' })
  async findAll(@Req() req: any) {
    const shopId = await this.getShopId(req);
    return this.udharService.findAll(shopId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new credit ledger entry under this tenant' })
  async create(@Req() req: any, @Body() createUdharDto: CreateUdharDto) {
    const shopId = await this.getShopId(req);
    return this.udharService.create(shopId, createUdharDto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a credit ledger entry under this tenant' })
  async update(
    @Req() req: any,
    @Param('id') id: string,
    @Body() updateUdharDto: UpdateUdharDto,
  ) {
    const shopId = await this.getShopId(req);
    return this.udharService.update(shopId, id, updateUdharDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a credit ledger entry from this tenant' })
  async remove(@Req() req: any, @Param('id') id: string) {
    const shopId = await this.getShopId(req);
    return this.udharService.delete(shopId, id);
  }
}
