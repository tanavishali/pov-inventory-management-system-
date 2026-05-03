import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsEnum, IsNumber, IsOptional, MinLength } from 'class-validator';

export class CreateAdminDto {
  @ApiProperty({ example: 'Al-Falah General Store' })
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'shop@email.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123' })
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @ApiProperty({ enum: ['Basic', 'Premium', 'Enterprise'], default: 'Basic' })
  @IsEnum(['Basic', 'Premium', 'Enterprise'])
  plan: string;

  @ApiProperty({ example: 1500 })
  @IsNumber()
  monthlyFee: number;

  @ApiProperty({ enum: ['Active', 'Locked', 'Demo'], default: 'Active' })
  @IsEnum(['Active', 'Locked', 'Demo'])
  status: string;

  @ApiProperty({ example: '2024-12-31', required: false })
  @IsOptional()
  expiryDate?: string;
}

export class UpdateAdminDto {
  @ApiProperty({ required: false })
  @IsOptional()
  name?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ enum: ['Basic', 'Premium', 'Enterprise'], required: false })
  @IsOptional()
  plan?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  monthlyFee?: number;

  @ApiProperty({ enum: ['Active', 'Locked', 'Demo'], required: false })
  @IsOptional()
  status?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  expiryDate?: string;
}
