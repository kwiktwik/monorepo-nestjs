/**
 * Subscription DTOs
 * 
 * Data Transfer Objects for the Subscription API Controller.
 */

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// Import types from the types directory
import type { PaymentProvider } from '../../types/provider.enum';
import type { SubscriptionType } from '../../types/subscription-type.enum';
import type { SubscriptionStatus } from '../../types/subscription-status.enum';

/**
 * Create Subscription DTO
 */
export class CreateSubscriptionDto {
  @ApiProperty({
    description: 'Plan ID to subscribe to',
    example: 'plan_PHONEPE_AUTOPAY_001',
  })
  readonly planId: string;

  @ApiProperty({
    description: 'Payment provider',
    enum: ['RAZORPAY', 'PHONEPE'],
    example: 'RAZORPAY',
  })
  readonly provider: PaymentProvider;

  @ApiPropertyOptional({
    description: 'Subscription type',
    enum: ['PROVIDER_MANAGED', 'USER_MANAGED'],
    default: 'PROVIDER_MANAGED',
    example: 'PROVIDER_MANAGED',
  })
  readonly subscriptionType?: SubscriptionType;

  @ApiPropertyOptional({
    description: 'Customer email',
    example: 'user@example.com',
  })
  readonly email?: string;

  @ApiPropertyOptional({
    description: 'Customer phone number',
    example: '+919876543210',
  })
  readonly phone?: string;

  @ApiPropertyOptional({
    description: 'Additional metadata',
    example: { source: 'mobile_app', campaign: 'summer_sale' },
  })
  readonly metadata?: Record<string, string>;
}

/**
 * Subscription Response DTO
 */
export class SubscriptionResponseDto {
  @ApiProperty({
    description: 'Whether the operation was successful',
    example: true,
  })
  readonly success: boolean;

  @ApiPropertyOptional({
    description: 'Internal subscription ID',
    example: 'sub_abc123',
  })
  readonly subscriptionId?: string;

  @ApiPropertyOptional({
    description: 'Merchant subscription ID (our reference)',
    example: 'msub_xyz789',
  })
  readonly merchantSubscriptionId?: string;

  @ApiPropertyOptional({
    description: 'Provider subscription ID',
    example: 'sub_RAZORPAY123',
  })
  readonly providerSubscriptionId?: string | null;

  @ApiPropertyOptional({
    description: 'Order ID for initial payment',
    example: 'ord_def456',
  })
  readonly orderId?: string;

  @ApiPropertyOptional({
    description: 'Merchant order ID',
    example: 'mord_ghi789',
  })
  readonly merchantOrderId?: string;

  @ApiPropertyOptional({
    description: 'Provider order ID',
    example: 'order_RAZORPAY456',
  })
  readonly providerOrderId?: string | null;

  @ApiPropertyOptional({
    description: 'Payment intent URL for client-side processing',
    example: 'phonepe://pay?intent=...',
  })
  readonly intentUrl?: string | null;

  @ApiPropertyOptional({
    description: 'Current subscription status',
    enum: ['CREATED', 'ACTIVE', 'CANCELLED', 'EXPIRED'],
    example: 'CREATED',
  })
  readonly status?: SubscriptionStatus;

  @ApiPropertyOptional({
    description: 'Error message if operation failed',
    example: 'Provider not available',
  })
  readonly error?: string;
}

/**
 * Subscription Status DTO
 */
export class SubscriptionStatusDto {
  @ApiProperty({
    description: 'Internal subscription ID',
    example: 'sub_abc123',
  })
  readonly subscriptionId: string;

  @ApiProperty({
    description: 'Merchant subscription ID',
    example: 'msub_xyz789',
  })
  readonly merchantSubscriptionId: string;

  @ApiPropertyOptional({
    description: 'Provider subscription ID',
    example: 'sub_RAZORPAY123',
  })
  readonly providerSubscriptionId?: string | null;

  @ApiProperty({
    description: 'Current subscription status',
    enum: ['CREATED', 'PENDING_AUTH', 'ACTIVE', 'PAUSED', 'RETRYING', 'CANCELLED', 'EXPIRED', 'FAILED'],
    example: 'ACTIVE',
  })
  readonly status: SubscriptionStatus;

  @ApiProperty({
    description: 'Payment provider',
    enum: ['RAZORPAY', 'PHONEPE'],
    example: 'RAZORPAY',
  })
  readonly provider: PaymentProvider;

  @ApiProperty({
    description: 'Subscription type',
    enum: ['PROVIDER_MANAGED', 'USER_MANAGED'],
    example: 'PROVIDER_MANAGED',
  })
  readonly subscriptionType: SubscriptionType;

  @ApiProperty({
    description: 'Plan ID',
    example: 'plan_PHONEPE_AUTOPAY_001',
  })
  readonly planId: string;

  @ApiProperty({
    description: 'Whether user has premium access',
    example: true,
  })
  readonly isPremium: boolean;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2024-01-15T10:30:00Z',
  })
  readonly createdAt: Date;

  @ApiPropertyOptional({
    description: 'Activation timestamp',
    example: '2024-01-15T10:35:00Z',
  })
  readonly activatedAt?: Date | null;

  @ApiPropertyOptional({
    description: 'Cancellation timestamp',
    example: '2024-02-15T10:30:00Z',
  })
  readonly cancelledAt?: Date | null;

  @ApiPropertyOptional({
    description: 'Expiration timestamp',
    example: '2024-03-15T10:30:00Z',
  })
  readonly expiredAt?: Date | null;

  @ApiPropertyOptional({
    description: 'Next billing date',
    example: '2024-02-15T10:30:00Z',
  })
  readonly nextBillingDate?: Date | null;

  @ApiPropertyOptional({
    description: 'Number of completed billing cycles',
    example: 2,
  })
  readonly billingCycleCount?: number;
}

/**
 * Subscription List Response DTO
 */
export class SubscriptionListResponseDto {
  @ApiProperty({
    description: 'List of subscriptions',
    type: [SubscriptionStatusDto],
  })
  readonly subscriptions: SubscriptionStatusDto[];

  @ApiProperty({
    description: 'Total count',
    example: 5,
  })
  readonly total: number;

  @ApiProperty({
    description: 'Whether user has active premium',
    example: true,
  })
  readonly hasActivePremium: boolean;
}
