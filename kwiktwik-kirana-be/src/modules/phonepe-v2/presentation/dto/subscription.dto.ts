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

export class SetupSubscriptionDto {
  @ApiPropertyOptional({
    description: 'Initial amount to charge during setup (in rupees)',
    example: 100,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  amount?: number;

  @ApiProperty({
    description:
      'Maximum amount that can be charged per redemption (in rupees)',
    example: 1000,
  })
  @IsNumber()
  @Min(1)
  maxAmount: number;

  @ApiProperty({
    enum: Frequency,
    description: 'Frequency of recurring payments',
    example: Frequency.MONTHLY,
  })
  @IsEnum(Frequency)
  frequency: Frequency;

  @ApiProperty({
    description: 'URL to redirect user after mandate approval',
    example: 'https://yourapp.com/subscription/callback',
  })
  @IsUrl()
  redirectUrl: string;

  @ApiPropertyOptional({
    description: 'Custom merchant subscription ID',
  })
  @IsOptional()
  @IsString()
  merchantSubscriptionId?: string;

  @ApiPropertyOptional({
    enum: AuthWorkflowType,
    default: AuthWorkflowType.TRANSACTION,
  })
  @IsOptional()
  @IsEnum(AuthWorkflowType)
  authWorkflowType?: AuthWorkflowType;

  @ApiPropertyOptional({
    enum: AmountType,
    default: AmountType.VARIABLE,
  })
  @IsOptional()
  @IsEnum(AmountType)
  amountType?: AmountType;

  @ApiPropertyOptional({
    description: 'Subscription expiry date',
    type: Date,
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  expireAt?: Date;

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
  @ApiProperty()
  merchantSubscriptionId: string;

  @ApiProperty()
  merchantOrderId: string;

  @ApiProperty()
  redirectUrl: string;

  @ApiProperty()
  state: string;

  @ApiProperty({ type: Date })
  expireAt: Date;
}

export class RedemptionResponseDto {
  @ApiProperty()
  merchantOrderId: string;

  @ApiProperty()
  state: string;

  @ApiProperty({ type: Date })
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
