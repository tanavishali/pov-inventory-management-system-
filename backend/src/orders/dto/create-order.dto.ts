import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsNumber, IsArray, ValidateNested, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

class OrderProductDto {
  @ApiProperty({ example: 'Basmati Rice 5kg' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: 10 })
  @IsNotEmpty()
  @IsNumber()
  qty: number;

  @ApiProperty({ example: 2200 })
  @IsNotEmpty()
  @IsNumber()
  price: number;

  @ApiProperty({ example: 2, required: false })
  @IsOptional()
  @IsNumber()
  ctn?: number;
}

export class CreateOrderDto {
  @ApiProperty({ example: 'Ali Hassan' })
  @IsNotEmpty()
  @IsString()
  customer: string;

  @ApiProperty({ example: 'Al-Noor Store' })
  @IsNotEmpty()
  @IsString()
  shop: string;

  @ApiProperty({ example: '+92-300-1234567', required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ example: 'Usman Farooq', required: false })
  @IsOptional()
  @IsString()
  salesman?: string;

  @ApiProperty({ enum: ['Paid', 'Udaar'], default: 'Paid' })
  @IsNotEmpty()
  @IsEnum(['Paid', 'Udaar'])
  payment: string;

  @ApiProperty({ example: 5000, required: false })
  @IsOptional()
  @IsNumber()
  advance?: number;

  @ApiProperty({ type: [OrderProductDto] })
  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderProductDto)
  products: OrderProductDto[];
}
