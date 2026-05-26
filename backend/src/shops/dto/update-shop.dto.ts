import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum } from 'class-validator';

export class UpdateShopDto {
  @ApiProperty({ example: 'Hassan Electronics Store', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ example: 'Ali Hassan', required: false })
  @IsOptional()
  @IsString()
  owner?: string;

  @ApiProperty({ example: '+92 300 1234567', required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ example: '42101-1234567-1', required: false })
  @IsOptional()
  @IsString()
  cnic?: string;

  @ApiProperty({ example: 'Main Market, Mall Road', required: false })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ example: 'Lahore', required: false })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiProperty({ enum: ['active', 'blocked'], required: false })
  @IsOptional()
  @IsEnum(['active', 'blocked'])
  status?: string;

  // Whitelisted DB fields
  @IsOptional()
  _id?: any;

  @IsOptional()
  id?: any;

  @IsOptional()
  shopId?: any;

  @IsOptional()
  createdAt?: any;

  @IsOptional()
  updatedAt?: any;

  @IsOptional()
  __v?: any;
}
