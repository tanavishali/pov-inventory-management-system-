import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsNumber, IsArray, ValidateNested, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

class UdharProductDto {
  @ApiProperty({ example: 'Rice (50kg)' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: 2 })
  @IsNotEmpty()
  @IsNumber()
  qty: number;

  @ApiProperty({ example: 4500 })
  @IsNotEmpty()
  @IsNumber()
  price: number;
}

export class CreateUdharDto {
  @ApiProperty({ example: 'sync_INV-001', required: false })
  @IsOptional()
  @IsString()
  id?: string;

  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  @IsNumber()
  customerId: number;

  @ApiProperty({ example: '2024-02-01' })
  @IsNotEmpty()
  @IsString()
  date: string;

  @ApiProperty({ enum: ['udhar', 'payment'], example: 'udhar' })
  @IsNotEmpty()
  @IsEnum(['udhar', 'payment'])
  type: string;

  @ApiProperty({ example: 'Order #1001' })
  @IsNotEmpty()
  @IsString()
  desc: string;

  @ApiProperty({ type: [UdharProductDto], default: [], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UdharProductDto)
  products?: UdharProductDto[];

  @ApiProperty({ example: 9000, default: 0, required: false })
  @IsOptional()
  @IsNumber()
  total?: number;

  @ApiProperty({ example: 1000, default: 0, required: false })
  @IsOptional()
  @IsNumber()
  advance?: number;

  @ApiProperty({ example: 8000 })
  @IsNotEmpty()
  @IsNumber()
  udharAmt: number;
}
