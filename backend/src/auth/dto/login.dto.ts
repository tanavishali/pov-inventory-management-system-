import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'super@pos.com', description: 'User email address' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'super123', description: 'User password' })
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}
