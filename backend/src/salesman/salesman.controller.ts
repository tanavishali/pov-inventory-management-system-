import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SalesmanService } from './salesman.service';
import { UsersService } from '../users/users.service';
import { CreateSalesmanDto } from './dto/create-salesman.dto';
import { UpdateSalesmanDto } from './dto/update-salesman.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Salesman')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('salesman')
export class SalesmanController {
  constructor(
    private readonly salesmanService: SalesmanService,
    private readonly usersService: UsersService
  ) {}

  private async getShopId(req: any): Promise<string> {
    const user = await this.usersService.findById(req.user.id);
    if (!user) return req.user.id;
    return user.role === 'admin' ? user._id.toString() : user.shopId?.toString() || req.user.id;
  }

  @Get()
  @ApiOperation({ summary: 'Get all salesmen for the current tenant' })
  async findAll(@Req() req: any) {
    const shopId = await this.getShopId(req);
    return this.salesmanService.findAll(shopId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new salesman under the current tenant' })
  async create(@Req() req: any, @Body() createSalesmanDto: CreateSalesmanDto) {
    const shopId = await this.getShopId(req);
    return this.salesmanService.create(shopId, createSalesmanDto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a salesman under the current tenant' })
  async update(
    @Req() req: any,
    @Param('id') id: string,
    @Body() updateSalesmanDto: UpdateSalesmanDto
  ) {
    const shopId = await this.getShopId(req);
    return this.salesmanService.update(shopId, id, updateSalesmanDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a salesman from the current tenant' })
  async remove(@Req() req: any, @Param('id') id: string) {
    const shopId = await this.getShopId(req);
    return this.salesmanService.delete(shopId, id);
  }
}
