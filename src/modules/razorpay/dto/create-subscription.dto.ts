import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsNumber,
  IsIn,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class NotesDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsString()
  email: string;

  @ApiProperty({ example: '+919876543210' })
  @IsString()
  contact: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  image?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  callback_url?: string;
}

export class CreateSubscriptionV2Dto {
  @ApiPropertyOptional({ example: 'plan_S3FaBrk7sjPQEU' })
  @IsOptional()
  @IsString()
  plan_id?: string;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @IsNumber()
  quantity?: number;

  @ApiPropertyOptional({
    description: 'Subscription start timestamp in UNIX seconds',
  })
  @IsOptional()
  @IsNumber()
  start_at?: number;

  @ApiPropertyOptional({ description: 'Amount in paise (for display)' })
  @IsOptional()
  @IsNumber()
  amount?: number;

  @ApiPropertyOptional({ enum: ['intent', 'collect'], default: 'intent' })
  @IsOptional()
  @IsIn(['intent', 'collect'])
  flow?: 'intent' | 'collect';

  @ApiPropertyOptional({
    description: 'UPI ID/VPA - required for collect flow',
  })
  @IsOptional()
  @IsString()
  vpa?: string;

  @ApiProperty({ type: NotesDto })
  @ValidateNested()
  @Type(() => NotesDto)
  notes: NotesDto;

  @ApiPropertyOptional({ description: 'Is this a trial subscription' })
  @IsOptional()
  @IsString()
  @IsIn(['true', 'false'])
  is_trial?: string;

  @ApiPropertyOptional({
    description: 'User segment for dynamic plan selection',
  })
  @IsOptional()
  @IsString()
  user_segment?: string;
}
