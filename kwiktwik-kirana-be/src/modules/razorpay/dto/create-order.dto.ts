import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsNumber,
  IsObject,
  Min,
} from 'class-validator';

export class CreateOrderDto {
  @ApiProperty({
    description: 'Amount in paise (e.g. 29900 for ₹299)',
    example: 29900,
  })
  @IsNumber()
  @Min(100)
  amount: number;

  @ApiPropertyOptional({
    description: 'Currency code (default INR)',
    example: 'INR',
    default: 'INR',
  })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiPropertyOptional({
    description: 'Receipt ID for your internal reference (max 40 chars)',
    example: 'receipt_001',
  })
  @IsOptional()
  @IsString()
  receipt?: string;

  @ApiPropertyOptional({
    description: 'Key-value pairs for additional info (max 15 pairs)',
    example: { email: 'user@example.com', description: 'Premium plan' },
  })
  @IsOptional()
  @IsObject()
  notes?: Record<string, string>;
}
