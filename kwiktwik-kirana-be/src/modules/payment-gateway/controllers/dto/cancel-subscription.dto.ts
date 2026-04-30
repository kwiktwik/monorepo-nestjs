/**
 * Cancel Subscription DTO
 */

import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CancelSubscriptionDto {
  @ApiPropertyOptional({
    description: 'Reason for cancellation',
    example: 'No longer needed',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  readonly reason?: string;
}
