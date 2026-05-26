import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsNumber, IsString } from 'class-validator';

export class UpdateProductDto {
  @ApiProperty({ example: 'Basmati Rice 5kg', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ example: 'FMCG', required: false })
  @IsOptional()
  @IsString()
  cat?: string;

  @ApiProperty({ example: 1800, required: false })
  @IsOptional()
  @IsNumber()
  purchase?: number;

  @ApiProperty({ example: 2200, required: false })
  @IsOptional()
  @IsNumber()
  selling?: number;

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
