import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsString, IsOptional, IsIn, Min } from 'class-validator';

export class PaymentModeDto {
  @ApiPropertyOptional({
    enum: [
      'UPI_INTENT',
      'UPI_COLLECT',
      'UPI_QR',
      'NET_BANKING',
      'CARD',
      'PAY_PAGE',
    ],
    default: 'UPI_INTENT',
  })
  @IsOptional()
  @IsIn([
    'UPI_INTENT',
    'UPI_COLLECT',
    'UPI_QR',
    'NET_BANKING',
    'CARD',
    'PAY_PAGE',
  ])
  type?:
    | 'UPI_INTENT'
    | 'UPI_COLLECT'
    | 'UPI_QR'
    | 'NET_BANKING'
    | 'CARD'
    | 'PAY_PAGE';

  @ApiPropertyOptional({ description: 'VPA for UPI_COLLECT' })
  @IsOptional()
  @IsString()
  vpa?: string;

  @ApiPropertyOptional({ description: 'Phone number for UPI_COLLECT' })
  @IsOptional()
  @IsString()
  phoneNumber?: string;
}

export class CreateOrderDto {
  @ApiProperty({ description: 'Amount in rupees', example: 100 })
  @IsNumber()
  @Min(1)
  amount: number;

  @ApiProperty({ description: 'Redirect URL after payment' })
  @IsString()
  redirectUrl: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  disablePaymentRetry?: boolean;

  @ApiPropertyOptional({ type: PaymentModeDto })
  @IsOptional()
  paymentMode?: PaymentModeDto;
}

export class CreateOrderWithAuthDto {
  @ApiProperty({ description: 'Redirect URL after payment' })
  @IsString()
  redirectUrl: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  disablePaymentRetry?: boolean;

  @ApiPropertyOptional({ type: PaymentModeDto })
  @IsOptional()
  paymentMode?: PaymentModeDto;
}

export class CreateOrderTokenDto {
  @ApiProperty({ description: 'Amount in rupees', example: 100 })
  @IsNumber()
  @Min(1)
  amount: number;

  @ApiPropertyOptional({ description: 'Custom merchant order ID' })
  @IsOptional()
  @IsString()
  merchantOrderId?: string;

  @ApiPropertyOptional({ description: 'Expiry time in seconds', default: 1200 })
  @IsOptional()
  @IsNumber()
  expireAfter?: number;

  @ApiPropertyOptional({ description: 'Redirect URL after payment' })
  @IsOptional()
  @IsString()
  redirectUrl?: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  disablePaymentRetry?: boolean;

  @ApiPropertyOptional({ description: 'Metadata info' })
  @IsOptional()
  metaInfo?: Record<string, string | undefined>;

  @ApiPropertyOptional({ description: 'Payment flow configuration' })
  @IsOptional()
  paymentFlow?: {
    type: 'PG_CHECKOUT' | 'SUBSCRIPTION_CHECKOUT_SETUP';
    paymentModeConfig?: PaymentModeDto;
    subscriptionDetails?: {
      merchantSubscriptionId: string;
      subscriptionType: 'RECURRING';
      authWorkflowType: 'TRANSACTION' | 'PENNY_DROP';
      amountType: 'FIXED' | 'VARIABLE';
      maxAmount: number;
      frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'ON_DEMAND';
      productType: 'UPI_MANDATE';
    };
  };
}

export class CheckStatusDto {
  @ApiProperty({ description: 'Merchant order ID' })
  @IsString()
  merchantOrderId: string;

  @ApiPropertyOptional({ enum: ['standard', 'mobile'], default: 'standard' })
  @IsOptional()
  @IsIn(['standard', 'mobile'])
  type?: 'standard' | 'mobile';
}

export class InitiatePaymentDto {
  @ApiProperty({ description: 'Amount in rupees', example: 100 })
  @IsNumber()
  @Min(1)
  amount: number;

  @ApiProperty({ description: 'Redirect URL after payment' })
  @IsString()
  redirectUrl: string;

  @ApiPropertyOptional({ default: 'Payment' })
  @IsOptional()
  @IsString()
  message?: string;

  @ApiPropertyOptional({ description: 'Metadata info' })
  @IsOptional()
  metaInfo?: Record<string, string | undefined>;
}

export class SetupSubscriptionDto {
  @ApiPropertyOptional({ description: 'Initial amount in rupees' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  amount?: number;

  @ApiProperty({ description: 'Max debit amount in rupees' })
  @IsNumber()
  @Min(1)
  maxAmount: number;

  @ApiProperty({
    enum: ['DAILY', 'WEEKLY', 'MONTHLY', 'ON_DEMAND'],
    description: 'Subscription frequency',
  })
  @IsIn(['DAILY', 'WEEKLY', 'MONTHLY', 'ON_DEMAND'])
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'ON_DEMAND';

  @ApiProperty({ description: 'Redirect URL after authorization' })
  @IsString()
  redirectUrl: string;

  @ApiPropertyOptional({ description: 'Custom merchant subscription ID' })
  @IsOptional()
  @IsString()
  merchantSubscriptionId?: string;

  @ApiPropertyOptional({
    enum: ['TRANSACTION', 'PENNY_DROP'],
    default: 'TRANSACTION',
  })
  @IsOptional()
  @IsIn(['TRANSACTION', 'PENNY_DROP'])
  authWorkflowType?: 'TRANSACTION' | 'PENNY_DROP';

  @ApiPropertyOptional({ enum: ['FIXED', 'VARIABLE'], default: 'VARIABLE' })
  @IsOptional()
  @IsIn(['FIXED', 'VARIABLE'])
  amountType?: 'FIXED' | 'VARIABLE';

  @ApiPropertyOptional({ description: 'Metadata info' })
  @IsOptional()
  metaInfo?: Record<string, string | undefined>;
}
