import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class VerifyPaymentDto {
  @ApiProperty({ description: 'Razorpay payment ID from checkout' })
  @IsString()
  razorpay_payment_id: string;

  @ApiProperty({ description: 'Razorpay signature from checkout' })
  @IsString()
  razorpay_signature: string;

  @ApiPropertyOptional({
    description:
      'Razorpay subscription ID - required for subscription verification',
  })
  @IsOptional()
  @IsString()
  razorpay_subscription_id?: string;

  @ApiPropertyOptional({
    description: 'Razorpay order ID - required for order verification',
  })
  @IsOptional()
  @IsString()
  razorpay_order_id?: string;
}
