import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsEnum } from 'class-validator';

export class CreateShopDto {
  @ApiProperty({ example: 'Hassan Electronics Store' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: 'Ali Hassan' })
  @IsNotEmpty()
  @IsString()
  owner: string;

  @ApiProperty({ example: '+92 300 1234567' })
  @IsNotEmpty()
  @IsString()
  phone: string;

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

  @ApiProperty({ enum: ['active', 'blocked'], default: 'active', required: false })
  @IsOptional()
  @IsEnum(['active', 'blocked'])
  status?: string;
}
