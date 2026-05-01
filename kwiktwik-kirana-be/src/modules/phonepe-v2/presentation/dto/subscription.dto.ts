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

export enum DeviceOS {
  ANDROID = 'ANDROID',
  IOS = 'IOS',
}

export class SetupSubscriptionDto {
  @ApiProperty({
    description: 'Plan ID from configuration (e.g., plan_PHONEPE_AUTOPAY_001)',
    example: 'plan_PHONEPE_AUTOPAY_001',
  })
  @IsString()
  planId: string;

  @ApiPropertyOptional({
    description: 'Custom merchant subscription ID',
  })
  @IsOptional()
  @IsString()
  merchantSubscriptionId?: string;

  @ApiPropertyOptional({
    description: 'Device OS for UPI intent',
    enum: DeviceOS,
    example: 'ANDROID',
  })
  @IsOptional()
  @IsEnum(DeviceOS)
  deviceOS?: DeviceOS;

  @ApiPropertyOptional({
    description:
      'Target UPI app package name (Android) or app identifier (iOS). For Android: com.phonepe.app, com.google.android.apps.nbu.paisa.user, etc. For iOS: PHONEPE, GPAY, PAYTM, etc.',
    example: 'com.phonepe.app',
  })
  @IsOptional()
  @IsString()
  targetApp?: string;

  @ApiPropertyOptional({
    description: 'Additional metadata',
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
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
    description: 'PhonePe order ID',
    example: 'OM2401241327446521266639W',
  })
  orderId: string;

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
    description: 'UPI intent URL to invoke payment app (e.g., PhonePe, GPay)',
    example:
      'ppesim://mandate?pa=VRUAT@ybl&pn=SUBSCRIBEMID&am=300&tr=OM2408072246197385675168',
  })
  intentUrl: string;

  @ApiProperty({
    description: 'Current state of the order',
    example: 'PENDING',
  })
  state: string;

  @ApiProperty({
    description: 'Merchant ID',
    example: 'PGTESTPAYUAT',
  })
  merchantId: string;
}

export class SyncStatusRequestDto {
  @ApiProperty({
    description: 'Merchant order ID from subscription setup',
    example: 'order_xyz789',
  })
  @IsString()
  merchantOrderId: string;

  @ApiProperty({
    description: 'Merchant subscription ID',
    example: 'sub_abc123',
  })
  @IsString()
  merchantSubscriptionId: string;
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
