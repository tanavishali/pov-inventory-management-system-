import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from '../users/users.service';
import { CreateAdminDto, UpdateAdminDto } from '../users/dto/admin-management.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Super Admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('super-admin')
@Controller('super-admin')
export class SuperAdminController {
  constructor(private usersService: UsersService) {}

  @Post('admins')
  @ApiOperation({ summary: 'Create a new Shop Admin (Shop Owner)' })
  createAdmin(@Body() createAdminDto: CreateAdminDto) {
    return this.usersService.create({
      ...createAdminDto,
      role: 'admin',
    });
  }

  @Get('admins')
  @ApiOperation({ summary: 'List all Shop Admins' })
  findAll() {
    return this.usersService.findAllAdmins();
  }

  @Patch('admins/:id')
  @ApiOperation({ summary: 'Update Shop Admin details' })
  update(@Param('id') id: string, @Body() updateAdminDto: UpdateAdminDto) {
    return this.usersService.update(id, updateAdminDto);
  }

  @Delete('admins/:id')
  @ApiOperation({ summary: 'Delete a Shop Admin' })
  remove(@Param('id') id: string) {
    return this.usersService.delete(id);
  }

  @Post('admins/:id/renew')
  @ApiOperation({ summary: 'Renew or extend Shop Admin subscription' })
  async renew(@Param('id') id: string, @Body('days') days: number) {
    const user = await this.usersService.findById(id);
    if (!user) return { message: 'User not found' };

    const currentExpiry = user.expiryDate ? new Date(user.expiryDate) : new Date();
    currentExpiry.setDate(currentExpiry.getDate() + (days || 30));
    
    return this.usersService.update(id, {
      expiryDate: currentExpiry.toISOString().split('T')[0],
      status: 'Active',
      feeStatus: 'Paid',
    });
  }
}
