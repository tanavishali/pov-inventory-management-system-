import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';

export class MarkPaidDto {
  @ApiProperty({ enum: ['EasyPaisa', 'JazzCash', 'Bank Transfer'], default: 'EasyPaisa' })
  @IsEnum(['EasyPaisa', 'JazzCash', 'Bank Transfer'])
  @IsNotEmpty()
  method: string;
}
