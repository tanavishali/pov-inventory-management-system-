import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Query, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ShopsService } from './shops.service';
import { UsersService } from '../users/users.service';
import { CreateShopDto } from './dto/create-shop.dto';
import { UpdateShopDto } from './dto/update-shop.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Shops')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('shops')
export class ShopsController {
  constructor(
    private readonly shopsService: ShopsService,
    private readonly usersService: UsersService,
  ) {}

  private async getShopId(req: any): Promise<string> {
    const user = await this.usersService.findById(req.user.id);
    if (!user) return req.user.id;
    return user.role === 'admin' ? user._id.toString() : user.shopId?.toString() || req.user.id;
  }

  @Get()
  @ApiOperation({ summary: 'Get all customer retail shops for the current tenant' })
  async findAll(@Req() req: any, @Query('search') search?: string, @Query('status') status?: string) {
    const shopId = await this.getShopId(req);
    return this.shopsService.findAll(shopId, search, status);
  }

  @Post()
  @ApiOperation({ summary: 'Add a new customer retail shop to the current tenant' })
  async create(@Req() req: any, @Body() createShopDto: CreateShopDto) {
    const shopId = await this.getShopId(req);
    return this.shopsService.create(shopId, createShopDto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a customer retail shop in the current tenant' })
  async update(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateShopDto: UpdateShopDto,
  ) {
    const shopId = await this.getShopId(req);
    return this.shopsService.update(shopId, id, updateShopDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a customer retail shop from the current tenant' })
  async remove(@Req() req: any, @Param('id', ParseIntPipe) id: number) {
    const shopId = await this.getShopId(req);
    return this.shopsService.delete(shopId, id);
  }
}
