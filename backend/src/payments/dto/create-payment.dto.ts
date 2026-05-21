import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsEnum, IsNumber, IsOptional } from 'class-validator';

export class CreatePaymentDto {
  @ApiProperty({ example: 'Hassan Electronics' })
  @IsNotEmpty()
  shop: string;

  @ApiProperty({ example: 'admin@pos.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 2500 })
  @IsNumber()
  amount: number;

  @ApiProperty({ enum: ['Basic', 'Premium', 'Enterprise'], default: 'Basic' })
  @IsEnum(['Basic', 'Premium', 'Enterprise'])
  plan: string;

  @ApiProperty({ enum: ['EasyPaisa', 'JazzCash', 'Bank Transfer'], required: false })
  @IsOptional()
  method?: string;

  @ApiProperty({ example: 'April 2026', required: false })
  @IsOptional()
  month?: string;
}
