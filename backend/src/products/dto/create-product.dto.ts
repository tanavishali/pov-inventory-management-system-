import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateProductDto {
  @ApiProperty({ example: 'Basmati Rice 5kg' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: 'FMCG' })
  @IsNotEmpty()
  @IsString()
  cat: string;

  @ApiProperty({ example: 1800 })
  @IsNotEmpty()
  @IsNumber()
  purchase: number;

  @ApiProperty({ example: 2200 })
  @IsNotEmpty()
  @IsNumber()
  selling: number;

  @ApiProperty({ example: 8, required: false })
  @IsOptional()
  @IsNumber()
  stock?: number;

  @ApiProperty({ example: 10, required: false })
  @IsOptional()
  @IsNumber()
  threshold?: number;

  @ApiProperty({ example: 12, required: false })
  @IsOptional()
  @IsNumber()
  ctn?: number;
}
