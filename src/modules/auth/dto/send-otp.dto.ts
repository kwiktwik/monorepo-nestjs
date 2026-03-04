import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, Matches, IsOptional } from 'class-validator';

export class SendOtpDto {
  @ApiProperty({
    example: '+919876543210',
    description: 'Phone number in E.164 format',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\+[1-9]\d{1,14}$/, {
    message: 'Phone number must be in E.164 format (e.g., +919876543210)',
  })
  phoneNumber: string;

  @ApiProperty({
    example: 'abc123',
    required: false,
    description: 'Optional app hash',
  })
  @IsString()
  @IsOptional()
  appHash?: string;
}
