import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsEnum, IsNumber, IsOptional, MinLength, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

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

  @ApiProperty({ example: '2024-12-01', required: false })
  @IsOptional()
  purchasedOn?: string;

  @ApiProperty({ enum: ['Paid', 'Unpaid', 'Overdue'], required: false })
  @IsOptional()
  @IsEnum(['Paid', 'Unpaid', 'Overdue'])
  feeStatus?: string;

  @ApiProperty({ enum: ['Paid', 'Pending'], description: 'Whether this month\'s payment has been received', required: false })
  @IsOptional()
  @IsEnum(['Paid', 'Pending'])
  paymentStatus?: string;

  @ApiProperty({ enum: ['Cash', 'Bank Transfer', 'JazzCash', 'EasyPaisa'], required: false })
  @IsOptional()
  paymentMethod?: string;
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

  @ApiProperty({ enum: ['Paid', 'Unpaid', 'Overdue'], required: false })
  @IsOptional()
  @IsEnum(['Paid', 'Unpaid', 'Overdue'])
  feeStatus?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  expiryDate?: string;

  @ApiProperty({ enum: ['Cash', 'Bank Transfer', 'JazzCash', 'EasyPaisa'], required: false })
  @IsOptional()
  paymentMethod?: string;
}

export class RenewAdminDto {
  @ApiProperty({ example: 30, description: 'Number of days to extend the subscription', required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  days?: number;
}
