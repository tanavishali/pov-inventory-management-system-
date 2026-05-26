import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { UsersService } from '../users/users.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Orders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('orders')
export class OrdersController {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly usersService: UsersService,
  ) {}

  private async getShopId(req: any): Promise<string> {
    const user = await this.usersService.findById(req.user.id);
    if (!user) return req.user.id;
    return user.role === 'admin' ? user._id.toString() : user.shopId?.toString() || req.user.id;
  }

  @Get()
  @ApiOperation({ summary: 'Get all orders for the current tenant shop' })
  async findAll(@Req() req: any) {
    const shopId = await this.getShopId(req);
    return this.ordersService.findAll(shopId);
  }

  @Post()
  @ApiOperation({ summary: 'Place a new order in the current tenant shop' })
  async create(@Req() req: any, @Body() createOrderDto: CreateOrderDto) {
    const shopId = await this.getShopId(req);
    return this.ordersService.create(shopId, createOrderDto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an order in the current tenant shop' })
  async update(
    @Req() req: any,
    @Param('id') id: string,
    @Body() updateOrderDto: UpdateOrderDto,
  ) {
    const shopId = await this.getShopId(req);
    return this.ordersService.update(shopId, id, updateOrderDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an order from the current tenant shop' })
  async remove(@Req() req: any, @Param('id') id: string) {
    const shopId = await this.getShopId(req);
    return this.ordersService.delete(shopId, id);
  }
}
