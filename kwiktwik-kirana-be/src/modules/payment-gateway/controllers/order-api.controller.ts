/**
 * Order API Controller
 *
 * REST endpoints for one-time order management.
 * Route: /api/v1/orders (no conflict with existing routes)
 */

import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  UseInterceptors,
  Logger,
  HttpCode,
  HttpStatus,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiHeader,
  ApiResponse,
  ApiParam,
  ApiProperty,
  ApiPropertyOptional,
} from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEnum, IsOptional, IsNumber, IsObject, Min } from 'class-validator';
import { AppIdGuard } from '../../../common/guards/app-id.guard';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { AppId } from '../../../common/decorators/app-id.decorator';
import { OrderManagerService } from '../services/order-manager.service';
import { EntitlementService } from '../services/entitlement.service';
import { PrometheusMetricsInterceptor } from '../../../common/interceptors/prometheus-metrics.interceptor';
import type { PaymentProvider } from '../types/provider.enum';

// ============================================================================
// DTOs
// ============================================================================

class CreateOneTimeOrderDto {
  @ApiProperty({ description: 'Amount in paise (e.g., 10000 = Rs 100)', example: 10000 })
  @IsNumber()
  @Min(100)
  readonly amount: number;

  @ApiPropertyOptional({ description: 'Currency code', example: 'INR', default: 'INR' })
  @IsOptional()
  @IsString()
  readonly currency?: string;

  @ApiProperty({ description: 'Payment provider', enum: ['RAZORPAY', 'PHONEPE'], example: 'RAZORPAY' })
  @IsEnum(['RAZORPAY', 'PHONEPE'])
  @IsNotEmpty()
  readonly provider: PaymentProvider;

  @ApiPropertyOptional({ description: 'Receipt identifier', example: 'receipt_001' })
  @IsOptional()
  @IsString()
  readonly receipt?: string;

  @ApiPropertyOptional({ description: 'Additional notes', example: { product: 'Premium Plan' } })
  @IsOptional()
  @IsObject()
  readonly notes?: Record<string, string>;

  @ApiPropertyOptional({ description: 'Redirect URL after payment (required for PhonePe)', example: 'https://example.com/payment/callback' })
  @IsOptional()
  @IsString()
  readonly redirectUrl?: string;

  @ApiPropertyOptional({ description: 'Customer contact number for checkout prefill', example: '9876543210' })
  @IsOptional()
  @IsString()
  readonly contact?: string;

  @ApiPropertyOptional({ description: 'Plan ID to associate with this order (enables premium entitlement on capture)', example: 'plan_yearly_399' })
  @IsOptional()
  @IsString()
  readonly planId?: string;
}

class VerifyPaymentDto {
  @ApiProperty({ description: 'Provider payment ID', example: 'pay_abc123' })
  @IsString()
  @IsNotEmpty()
  readonly providerPaymentId: string;

  @ApiProperty({ description: 'Payment signature for verification', example: 'hmac_signature_here' })
  @IsString()
  @IsNotEmpty()
  readonly signature: string;
}

class RefundOrderDto {
  @ApiPropertyOptional({ description: 'Amount to refund in paise (full refund if not specified)', example: 5000 })
  @IsOptional()
  @IsNumber()
  @Min(100)
  readonly amount?: number;

  @ApiPropertyOptional({ description: 'Reason for refund', example: 'Customer requested cancellation' })
  @IsOptional()
  @IsString()
  readonly reason?: string;
}

// ============================================================================
// Controller
// ============================================================================

@ApiTags('Orders')
@ApiBearerAuth('JWT')
@ApiHeader({
  name: 'X-App-ID',
  required: true,
  description: 'App identifier (e.g., com.paymentalert.app)',
})
@Controller('v1/orders')
@UseGuards(AppIdGuard, JwtAuthGuard)
@UseInterceptors(PrometheusMetricsInterceptor)
export class OrderApiController {
  private readonly logger = new Logger(OrderApiController.name);

  constructor(
    private readonly orderManager: OrderManagerService,
    private readonly entitlementService: EntitlementService,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Create a one-time order',
    description: 'Creates a one-time payment order with the specified provider. Returns checkout config (Razorpay) or redirect URL (PhonePe).',
  })
  @ApiResponse({ status: 201, description: 'Order created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request parameters' })
  async createOrder(
    @CurrentUser() user: { userId: string },
    @AppId() appId: string,
    @Body() dto: CreateOneTimeOrderDto,
  ) {
    this.logger.log(`Creating one-time order for user ${user.userId}, provider ${dto.provider}`);

    const result = await this.orderManager.createOrder({
      userId: user.userId,
      appId,
      provider: dto.provider,
      amount: dto.amount,
      currency: dto.currency,
      receipt: dto.receipt,
      notes: dto.notes,
      redirectUrl: dto.redirectUrl,
      contact: dto.contact,
      planId: dto.planId,
    });

    if (!result.success) {
      throw new BadRequestException(result.error ?? 'Failed to create order');
    }

    return {
      success: true,
      orderId: result.order!.id,
      merchantOrderId: result.order!.merchantOrderId,
      providerOrderId: result.providerOrderId,
      redirectUrl: result.redirectUrl,
      checkoutConfig: result.checkoutConfig,
      status: result.order!.status,
    };
  }

  @Post(':id/verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Verify payment',
    description: 'Verifies payment signature after client-side payment completion. For Razorpay, pass the signature from Checkout SDK. For PhonePe, payment is verified via order status check.',
  })
  @ApiParam({ name: 'id', description: 'Order ID', example: 'ord_abc123' })
  @ApiResponse({ status: 200, description: 'Payment verified' })
  @ApiResponse({ status: 400, description: 'Verification failed' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async verifyPayment(
    @CurrentUser() user: { userId: string },
    @AppId() appId: string,
    @Param('id') orderId: string,
    @Body() dto: VerifyPaymentDto,
  ) {
    const existing = await this.orderManager.getOrderStatus(orderId);
    if (!existing || existing.userId !== user.userId || existing.appId !== appId) {
      throw new NotFoundException('Order not found');
    }

    const result = await this.orderManager.verifyPayment({
      orderId,
      providerPaymentId: dto.providerPaymentId,
      signature: dto.signature,
    });

    if (!result.success) {
      throw new BadRequestException(result.error ?? 'Payment verification failed');
    }

    const entitlement = await this.entitlementService.getActiveEntitlement(user.userId, appId);

    return {
      success: true,
      orderId: result.order!.id,
      status: result.order!.status,
      paidAt: result.order!.paidAt,
      isPremium: !!entitlement,
      premiumExpiresAt: entitlement?.validUntil ?? null,
    };
  }

  @Get(':id/status')
  @ApiOperation({
    summary: 'Get order status',
    description: 'Returns the current status of an order. Syncs with the provider if the order is still pending.',
  })
  @ApiParam({ name: 'id', description: 'Order ID', example: 'ord_abc123' })
  @ApiResponse({ status: 200, description: 'Order status' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async getOrderStatus(
    @CurrentUser() user: { userId: string },
    @AppId() appId: string,
    @Param('id') orderId: string,
  ) {
    const order = await this.orderManager.syncOrderStatus(orderId);
    if (!order || order.userId !== user.userId || order.appId !== appId) {
      throw new NotFoundException('Order not found');
    }

    const entitlement = await this.entitlementService.getActiveEntitlement(user.userId, appId);

    return {
      orderId: order.id,
      merchantOrderId: order.merchantOrderId,
      status: order.status,
      amount: order.amount,
      currency: order.currency,
      provider: order.provider,
      paidAt: order.paidAt,
      createdAt: order.createdAt,
      isPremium: !!entitlement,
      premiumExpiresAt: entitlement?.validUntil ?? null,
    };
  }

  @Post(':id/refund')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Refund an order',
    description: 'Initiates a refund for a captured order. Supports partial refunds.',
  })
  @ApiParam({ name: 'id', description: 'Order ID', example: 'ord_abc123' })
  @ApiResponse({ status: 200, description: 'Refund initiated' })
  @ApiResponse({ status: 400, description: 'Refund failed' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async refundOrder(
    @CurrentUser() user: { userId: string },
    @AppId() appId: string,
    @Param('id') orderId: string,
    @Body() dto: RefundOrderDto,
  ) {
    const existing = await this.orderManager.getOrderStatus(orderId);
    if (!existing || existing.userId !== user.userId || existing.appId !== appId) {
      throw new NotFoundException('Order not found');
    }

    const result = await this.orderManager.refundOrder({
      orderId,
      amount: dto.amount,
      reason: dto.reason,
    });

    if (!result.success) {
      throw new BadRequestException(result.error ?? 'Refund failed');
    }

    return {
      success: true,
      orderId: result.order!.id,
      status: result.order!.status,
      refundId: result.refundId,
      refundedAt: result.order!.refundedAt,
    };
  }
}