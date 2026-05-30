import { Controller, Post, Body, Get, Patch, UseGuards, Request, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LoginDto } from './dto/login.dto';
import { UpdateProfileDto } from '../users/dto/update-profile.dto';
import { Public } from './decorators/public.decorator';
import * as bcrypt from 'bcryptjs';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
  ) {}

  @Public()
  @Post('login')
  @ApiOperation({ summary: 'User login' })
  @ApiResponse({ status: 200, description: 'Return access token and user info' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() loginDto: LoginDto) {
    const user = await this.authService.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }
    return this.authService.login(user);
  }

  @Post('logout')
  @ApiOperation({ summary: 'User logout' })
  async logout() {
    return { message: 'Successfully logged out' };
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile with full details' })
  @ApiResponse({ status: 200, description: 'Return full user profile' })
  async getProfile(@Request() req) {
    const user = await this.usersService.findById(req.user.id);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    const { password, ...profile } = user.toObject();
    return profile;
  }

  @UseGuards(JwtAuthGuard)
  @Patch('profile')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiResponse({ status: 200, description: 'Profile updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid current password or validation error' })
  async updateProfile(@Request() req, @Body() updateDto: UpdateProfileDto) {
    const userId = req.user.id;

    // If user wants to change password, verify current password first
    if (updateDto.newPassword) {
      if (!updateDto.currentPassword) {
        throw new BadRequestException('Current password is required to set a new password');
      }
      const user = await this.usersService.findById(userId);
      if (!user) {
        throw new UnauthorizedException('User not found');
      }
      const isMatch = await bcrypt.compare(updateDto.currentPassword, user.password);
      if (!isMatch) {
        throw new BadRequestException('Current password is incorrect');
      }
    }

    // Build sanitized update object (only allowed profile fields)
    const updateData: any = {};
    if (updateDto.name !== undefined) updateData.name = updateDto.name;
    if (updateDto.email !== undefined) updateData.email = updateDto.email;
    if (updateDto.phone !== undefined) updateData.phone = updateDto.phone;
    if (updateDto.address !== undefined) updateData.address = updateDto.address;
    if (updateDto.city !== undefined) updateData.city = updateDto.city;
    if (updateDto.language !== undefined) updateData.language = updateDto.language;
    if (updateDto.avatar !== undefined) updateData.avatar = updateDto.avatar;
    if (updateDto.newPassword) updateData.password = updateDto.newPassword;

    const updated = await this.usersService.update(userId, updateData);
    if (!updated) {
      throw new UnauthorizedException('User not found');
    }

    const { password, ...profile } = updated.toObject();
    return { success: true, user: profile };
  }
}
