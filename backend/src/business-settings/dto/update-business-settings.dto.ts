import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber } from 'class-validator';

export class UpdateBusinessSettingsDto {
  // Business Information
  @ApiPropertyOptional({ example: 'WholesalePro Distributors' })
  @IsOptional()
  @IsString()
  businessName?: string;

  @ApiPropertyOptional({ example: 'Muhammad Ali' })
  @IsOptional()
  @IsString()
  ownerName?: string;

  @ApiPropertyOptional({ example: '03246770536' })
  @IsOptional()
  @IsString()
  ownerPhone?: string;

  @ApiPropertyOptional({ example: '+92-42-1234567' })
  @IsOptional()
  @IsString()
  businessPhone?: string;

  @ApiPropertyOptional({ example: 'info@wholesalepro.pk' })
  @IsOptional()
  @IsString()
  businessEmail?: string;

  @ApiPropertyOptional({ example: 'Main Boulevard, Gulberg III, Lahore' })
  @IsOptional()
  @IsString()
  businessAddress?: string;

  @ApiPropertyOptional({ example: '1234567-8' })
  @IsOptional()
  @IsString()
  ntn?: string;

  @ApiPropertyOptional({ example: '42-00-1234-567-89' })
  @IsOptional()
  @IsString()
  strn?: string;

  @ApiPropertyOptional({ example: 'PKR — Pakistani Rupee (Rs)' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiPropertyOptional({ example: 'July' })
  @IsOptional()
  @IsString()
  financialYearStart?: string;

  // Invoice Settings
  @ApiPropertyOptional({ example: 'INV-' })
  @IsOptional()
  @IsString()
  invoicePrefix?: string;

  @ApiPropertyOptional({ example: 17 })
  @IsOptional()
  @IsNumber()
  invoiceTax?: number;

  @ApiPropertyOptional({ example: 'Thank you for your business. Goods once sold will not be returned.' })
  @IsOptional()
  @IsString()
  invoiceFooter?: string;

  @ApiPropertyOptional({ example: 'WholesalePro' })
  @IsOptional()
  @IsString()
  brandName?: string;

  @ApiPropertyOptional({ example: 'data:image/png;base64,...' })
  @IsOptional()
  @IsString()
  logoSrc?: string;
}
