import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { UsersService } from '../users/users.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Products')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('products')
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService,
    private readonly usersService: UsersService,
  ) {}

  private async getShopId(req: any): Promise<string> {
    const user = await this.usersService.findById(req.user.id);
    if (!user) return req.user.id;
    return user.role === 'admin' ? user._id.toString() : user.shopId?.toString() || req.user.id;
  }

  @Get()
  @ApiOperation({ summary: 'Get all products for the current tenant shop' })
  async findAll(@Req() req: any, @Query('search') search?: string, @Query('filter') filter?: string, @Query('sort') sort?: string) {
    const shopId = await this.getShopId(req);
    return this.productsService.findAll(shopId, search, filter, sort);
  }

  @Get('low-stock')
  @ApiOperation({ summary: 'Get all low stock products for the current tenant shop' })
  async findLowStock(@Req() req: any) {
    const shopId = await this.getShopId(req);
    return this.productsService.findLowStock(shopId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new product in the current tenant shop' })
  async create(@Req() req: any, @Body() createProductDto: CreateProductDto) {
    const shopId = await this.getShopId(req);
    return this.productsService.create(shopId, createProductDto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a product in the current tenant shop' })
  async update(
    @Req() req: any,
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    const shopId = await this.getShopId(req);
    return this.productsService.update(shopId, parseInt(id), updateProductDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a product from the current tenant shop' })
  async remove(@Req() req: any, @Param('id') id: string) {
    const shopId = await this.getShopId(req);
    return this.productsService.delete(shopId, parseInt(id));
  }
}
