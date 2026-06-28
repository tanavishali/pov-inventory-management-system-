import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, MaxLength } from 'class-validator';

export class CreateBookingDto {
  @ApiProperty({ example: 'Ali Hassan' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(120)
  name: string;

  @ApiProperty({ example: 'Al-Falah General Store', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(160)
  business?: string;

  @ApiProperty({ example: '03001234567' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(20)
  phone: string;

  @ApiProperty({ example: 'Lahore', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  city?: string;

  @ApiProperty({ example: 'Premium', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(40)
  plan?: string;

  @ApiProperty({ example: 'Please call me in the evening.', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(600)
  message?: string;
}

export class UpdateBookingStatusDto {
  @ApiProperty({ enum: ['New', 'Contacted', 'Converted', 'Closed'] })
  @IsNotEmpty()
  @IsString()
  status: string;
}
