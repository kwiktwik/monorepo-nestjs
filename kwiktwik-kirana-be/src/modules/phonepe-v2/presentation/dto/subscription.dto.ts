import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsOptional,
  IsUrl,
  IsEnum,
  Min,
  IsDate,
  IsObject,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum Frequency {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  FORTNIGHTLY = 'FORTNIGHTLY',
  MONTHLY = 'MONTHLY',
  BIMONTHLY = 'BIMONTHLY',
  QUARTERLY = 'QUARTERLY',
  HALFYEARLY = 'HALFYEARLY',
  YEARLY = 'YEARLY',
  ONDEMAND = 'ONDEMAND',
}

export enum AuthWorkflowType {
  TRANSACTION = 'TRANSACTION',
  PENNY_DROP = 'PENNY_DROP',
}

export enum AmountType {
  FIXED = 'FIXED',
  VARIABLE = 'VARIABLE',
}

export enum UpiPaymentMode {
  UPI_INTENT = 'UPI_INTENT',
  UPI_COLLECT = 'UPI_COLLECT',
  UPI_QR = 'UPI_QR',
}

export class SetupSubscriptionDto {
  @ApiProperty({
    description: 'Plan ID from configuration (e.g., plan_PHONEPE_AUTOPAY_001)',
    example: 'plan_PHONEPE_AUTOPAY_001',
  })
  @IsString()
  planId: string;

  @ApiPropertyOptional({
    description:
      'URL to redirect user after mandate approval (only for web checkout)',
    example: 'https://yourapp.com/subscription/callback',
  })
  @IsOptional()
  @IsString()
  redirectUrl?: string;

  @ApiPropertyOptional({
    description: 'Custom merchant subscription ID',
  })
  @IsOptional()
  @IsString()
  merchantSubscriptionId?: string;

  @ApiPropertyOptional({
    description: 'Additional metadata',
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;

  @ApiPropertyOptional({
    description: 'Use mobile SDK flow (default: true, no redirectUrl needed)',
    example: true,
  })
  @IsOptional()
  mobileSdk?: boolean;
}

export class NotifyRedemptionDto {
  @ApiProperty({
    description: 'Merchant subscription ID',
    example: 'sub_abc123',
  })
  @IsString()
  merchantSubscriptionId: string;

  @ApiProperty({
    description: 'Amount to charge (in rupees)',
    example: 100,
  })
  @IsNumber()
  @Min(1)
  amount: number;

  @ApiPropertyOptional({
    description: 'Additional metadata',
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}

export class SubscriptionResponseDto {
  @ApiProperty({
    description: 'PhonePe order ID - required for SDK initialization',
    example: 'OM2401241327446521266639W',
  })
  orderId: string;

  @ApiProperty({
    description:
      'SDK Token - extracted from redirectUrl for mobile SDK initialization',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  token: string;

  @ApiProperty({
    description: 'Your internal merchant subscription ID',
    example: 'sub_abc123',
  })
  merchantSubscriptionId: string;

  @ApiProperty({
    description: 'Your internal merchant order ID',
    example: 'order_xyz789',
  })
  merchantOrderId: string;

  @ApiProperty({
    description: 'Redirect URL for web checkout (fallback)',
    example: 'https://phonepe.com/checkout/...',
  })
  redirectUrl: string;

  @ApiProperty({
    description: 'Current state of the order',
    example: 'PENDING',
  })
  state: string;

  @ApiProperty({
    description: 'Order expiry timestamp',
    type: Date,
  })
  expireAt: Date;

  @ApiProperty({
    description: 'Merchant ID for SDK configuration',
    example: 'PGTESTPAYUAT',
  })
  merchantId: string;
}

export class RedemptionResponseDto {
  @ApiProperty({
    description: 'PhonePe order ID - required for SDK initialization',
    example: 'OM2401241327446521266639W',
  })
  orderId: string;

  @ApiProperty({
    description: 'Your internal merchant order ID',
    example: 'order_xyz789',
  })
  merchantOrderId: string;

  @ApiProperty({
    description: 'Current state of the redemption',
    example: 'NOTIFICATION_IN_PROGRESS',
  })
  state: string;

  @ApiProperty({
    description: 'Order expiry timestamp',
    type: Date,
  })
  expireAt: Date;
}

export class SubscriptionStatusDto {
  @ApiProperty()
  merchantSubscriptionId: string;

  @ApiProperty({ nullable: true })
  phonepeSubscriptionId: string | null;

  @ApiProperty()
  state: string;

  @ApiProperty()
  maxAmount: number;

  @ApiProperty()
  frequency: string;

  @ApiProperty()
  canRedeem: boolean;
}

export class PaymentDetailsDto {
  @ApiProperty({
    description: 'PhonePe transaction ID',
    example: 'TXN2401241327446521266640W',
  })
  transactionId: string;

  @ApiProperty({
    description: 'Payment mode used',
    example: 'UPI_AUTO_PAY',
    nullable: true,
  })
  paymentMode: string | null;

  @ApiProperty({
    description: 'Transaction timestamp',
    type: Date,
  })
  timestamp: Date;

  @ApiProperty({
    description: 'Amount in rupees',
    example: 100,
  })
  amount: number;

  @ApiProperty({
    description: 'Transaction state',
    example: 'COMPLETED',
  })
  state: string;
}

export class OrderStatusDto {
  @ApiProperty({
    description: 'Merchant ID',
    example: 'PGTESTPAYUAT',
  })
  merchantId: string;

  @ApiProperty({
    description: 'Merchant order ID',
    example: 'order_xyz789',
  })
  merchantOrderId: string;

  @ApiProperty({
    description: 'PhonePe order ID',
    example: 'OM2401241327446521266639W',
  })
  orderId: string;

  @ApiProperty({
    description: 'Order state',
    example: 'COMPLETED',
  })
  state: string;

  @ApiProperty({
    description: 'Amount in rupees',
    example: 100,
  })
  amount: number;

  @ApiProperty({
    description: 'Order expiry timestamp',
    type: Date,
  })
  expireAt: Date;

  @ApiProperty({
    description: 'Payment transaction details',
    type: [PaymentDetailsDto],
    nullable: true,
  })
  paymentDetails?: PaymentDetailsDto[];
}
