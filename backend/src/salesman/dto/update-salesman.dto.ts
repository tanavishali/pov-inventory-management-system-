import { PartialType, ApiProperty } from '@nestjs/swagger';
import { CreateSalesmanDto } from './create-salesman.dto';
import { IsOptional, IsString, IsNumber } from 'class-validator';

export class UpdateSalesmanDto extends PartialType(CreateSalesmanDto) {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  _id?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  id?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  shopId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  role?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  sales?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  orders?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  createdAt?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  updatedAt?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  __v?: number;
}
