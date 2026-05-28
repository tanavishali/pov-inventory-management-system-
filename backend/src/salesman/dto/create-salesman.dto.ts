import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsEmail, IsOptional, IsEnum } from 'class-validator';

export class CreateSalesmanDto {
  @ApiProperty({ example: 'Ahmed Khan' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: 'ahmed@sales.com' })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'ahmed@123' })
  @IsNotEmpty()
  @IsString()
  password: string;

  @ApiProperty({ example: '+92-300-1234567' })
  @IsNotEmpty()
  @IsString()
  phone: string;

  @ApiProperty({ example: '35202-1234567-1', required: false })
  @IsOptional()
  @IsString()
  cnic?: string;

  @ApiProperty({ example: '2024-01-15', required: false })
  @IsOptional()
  @IsString()
  joined?: string;

  @ApiProperty({ enum: ['Active', 'Locked', 'Demo'], default: 'Active', required: false })
  @IsOptional()
  @IsEnum(['Active', 'Locked', 'Demo'])
  status?: string;
}
