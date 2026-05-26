import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, IsArray, ValidateNested, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

class UpdateOrderProductDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsNumber()
  qty?: number;

  @IsOptional()
  @IsNumber()
  price?: number;

  @IsOptional()
  @IsNumber()
  ctn?: number;
}

export class UpdateOrderDto {
  @ApiProperty({ example: 'Ali Hassan', required: false })
  @IsOptional()
  @IsString()
  customer?: string;

  @ApiProperty({ example: 'Al-Noor Store', required: false })
  @IsOptional()
  @IsString()
  shop?: string;

  @ApiProperty({ example: '+92-300-1234567', required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ example: 'Usman Farooq', required: false })
  @IsOptional()
  @IsString()
  salesman?: string;

  @ApiProperty({ enum: ['Paid', 'Udaar'], required: false })
  @IsOptional()
  @IsEnum(['Paid', 'Udaar'])
  payment?: string;

  @ApiProperty({ example: 5000, required: false })
  @IsOptional()
  @IsNumber()
  advance?: number;

  @ApiProperty({ enum: ['pending', 'approved', 'dispatched', 'completed', 'cancelled'], required: false })
  @IsOptional()
  @IsEnum(['pending', 'approved', 'dispatched', 'completed', 'cancelled'])
  status?: string;

  @ApiProperty({ type: [UpdateOrderProductDto], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateOrderProductDto)
  products?: UpdateOrderProductDto[];

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
