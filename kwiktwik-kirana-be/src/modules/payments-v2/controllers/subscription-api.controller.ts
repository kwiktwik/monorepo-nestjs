/**
 * Subscription API Controller
 * 
 * Provides REST API endpoints for subscription management.
 * Works with the unified payments-v2 module.
 */

import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  Logger,
  HttpCode,
  HttpStatus,
  Inject,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiHeader,
  ApiResponse,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { AppIdGuard } from '../../../common/guards/app-id.guard';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { AppId } from '../../../common/decorators/app-id.decorator';
import { SubscriptionManagerService } from '../services/subscription-manager.service';
import { PaymentConfigService } from '../config/payment-config.service';
import { CreateSubscriptionDto, SubscriptionResponseDto, SubscriptionStatusDto } from './dto/subscription.dto';
import { CancelSubscriptionDto } from './dto/cancel-subscription.dto';
import type { ISubscriptionRepository } from '../infrastructure/repositories/subscription.repository.interface';
import type { Subscription } from '../domain/entities/subscription.entity';
import type { PaymentProvider } from '../types/provider.enum';
import { HealthMetricsService } from '../../prometheus/health-metrics.service';
import { PrometheusMetricsInterceptor } from '../../../common/interceptors/prometheus-metrics.interceptor';

@ApiTags('Payments V2 - Subscriptions')
@ApiBearerAuth('JWT')
@ApiHeader({
  name: 'X-App-ID',
  required: true,
  description: 'App identifier (e.g., com.paymentalert.app)',
})
@Controller('v1/subscriptions')
@UseGuards(AppIdGuard, JwtAuthGuard)
@UseInterceptors(PrometheusMetricsInterceptor)
export class SubscriptionApiController {
  private readonly logger = new Logger(SubscriptionApiController.name);

  constructor(
    private readonly subscriptionManager: SubscriptionManagerService,
    private readonly configService: PaymentConfigService,
    private readonly metrics: HealthMetricsService,
    @Inject('ISubscriptionRepository')
    private readonly subscriptionRepo: ISubscriptionRepository,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new subscription',
    description:
      'Creates a subscription with the specified provider and plan. Returns payment intent URL for client-side processing.',
  })
  @ApiResponse({
    status: 201,
    description: 'Subscription created successfully',
    type: SubscriptionResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid request parameters' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 409, description: 'User already has an active subscription' })
  async createSubscription(
    @CurrentUser() user: { userId: string },
    @AppId() appId: string,
    @Body() dto: CreateSubscriptionDto,
  ): Promise<SubscriptionResponseDto> {
    this.logger.log(
      `Creating subscription for user ${user.userId}, app ${appId}, provider ${dto.provider}`,
    );

    // Get plan configuration to determine amounts
    const planConfig = this.configService.getPlanConfig(appId, dto.planId);
    if (!planConfig) {
      throw new BadRequestException(`Plan ${dto.planId} not configured for app ${appId}`);
    }

    const result = await this.subscriptionManager.createSubscription({
      userId: user.userId,
      appId,
      planId: dto.planId,
      provider: dto.provider as PaymentProvider,
      subscriptionType: dto.subscriptionType ?? 'PROVIDER_MANAGED',
      initialAmount: planConfig.initialAmount,
      recurringAmount: planConfig.recurringAmount,
      frequency: planConfig.frequency,
      customerEmail: dto.email,
      customerPhone: dto.phone,
      metadata: dto.metadata,
    });

    // Record subscription metrics
    if (result.success && result.subscription) {
      this.metrics.recordSubscriptionCreated(
        dto.provider,
        dto.planId,
        appId,
      );
      // Record initial revenue
      if (planConfig.initialAmount > 0) {
        this.metrics.recordSubscriptionRevenue(
          dto.provider,
          'initial',
          appId,
          planConfig.initialAmount,
        );
      }
    }

    return {
      success: result.success,
      subscriptionId: result.subscription?.id,
      merchantSubscriptionId: result.subscription?.merchantSubscriptionId,
      providerSubscriptionId: result.providerSubscriptionId,
      orderId: result.order?.id,
      merchantOrderId: result.order?.merchantOrderId,
      providerOrderId: result.providerOrderId,
      intentUrl: result.intentUrl,
      status: result.subscription?.status,
      error: result.error ?? undefined,
    };
  }

  @Get()
  @ApiOperation({
    summary: 'Get user subscriptions',
    description: 'Returns all subscriptions for the authenticated user',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Filter by subscription status',
    example: 'ACTIVE',
  })
  @ApiResponse({
    status: 200,
    description: 'List of subscriptions',
    type: [SubscriptionStatusDto],
  })
  async getUserSubscriptions(
    @CurrentUser() user: { userId: string },
    @AppId() appId: string,
    @Query('status') status?: string,
  ): Promise<SubscriptionStatusDto[]> {
    const subscriptions = await this.subscriptionRepo.findByUserAndApp(
      user.userId,
      appId,
      status,
    );

    return subscriptions.map((sub) => this.toStatusDto(sub));
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get subscription by ID',
    description: 'Returns detailed subscription information',
  })
  @ApiParam({
    name: 'id',
    description: 'Subscription ID',
    example: 'sub_abc123',
  })
  @ApiResponse({
    status: 200,
    description: 'Subscription details',
    type: SubscriptionStatusDto,
  })
  @ApiResponse({ status: 404, description: 'Subscription not found' })
  async getSubscription(
    @CurrentUser() user: { userId: string },
    @AppId() appId: string,
    @Param('id') subscriptionId: string,
  ): Promise<SubscriptionStatusDto> {
    const subscription = await this.subscriptionRepo.findById(subscriptionId);

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    // Verify ownership
    if (subscription.userId !== user.userId || subscription.appId !== appId) {
      throw new NotFoundException('Subscription not found');
    }

    return this.toStatusDto(subscription);
  }

  @Post(':id/cancel')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Cancel subscription',
    description:
      'Initiates subscription cancellation. For provider-managed subscriptions, this also cancels at the provider.',
  })
  @ApiParam({
    name: 'id',
    description: 'Subscription ID',
    example: 'sub_abc123',
  })
  @ApiResponse({
    status: 200,
    description: 'Subscription cancelled successfully',
    type: SubscriptionStatusDto,
  })
  @ApiResponse({ status: 404, description: 'Subscription not found' })
  @ApiResponse({ status: 400, description: 'Subscription cannot be cancelled' })
  async cancelSubscription(
    @CurrentUser() user: { userId: string },
    @AppId() appId: string,
    @Param('id') subscriptionId: string,
    @Body() dto?: CancelSubscriptionDto,
  ): Promise<SubscriptionStatusDto> {
    this.logger.log(
      `Cancelling subscription ${subscriptionId} for user ${user.userId}`,
    );

    // Verify ownership first
    const existing = await this.subscriptionRepo.findById(subscriptionId);
    if (!existing || existing.userId !== user.userId || existing.appId !== appId) {
      throw new NotFoundException('Subscription not found');
    }

    const result = await this.subscriptionManager.cancelSubscription({
      subscriptionId,
      reason: dto?.reason,
    });

    if (!result.subscription) {
      throw new BadRequestException(result.error ?? 'Failed to cancel subscription');
    }

    // Record cancellation metric
    this.metrics.recordSubscriptionCancelled(
      existing.provider,
      dto?.reason,
    );
    this.metrics.recordSubscriptionStatusChange(
      existing.provider,
      existing.status,
      'CANCELLED',
    );

    return this.toStatusDto(result.subscription);
  }

  @Post(':id/verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Verify subscription status',
    description:
      'Verifies subscription status from the provider and updates local state. Call this after payment completion.',
  })
  @ApiResponse({
    status: 200,
    description: 'Subscription status verified',
    type: SubscriptionStatusDto,
  })
  async verifySubscription(
    @CurrentUser() user: { userId: string },
    @AppId() appId: string,
    @Param('id') subscriptionId: string,
  ): Promise<SubscriptionStatusDto> {
    // Verify ownership first
    const existing = await this.subscriptionRepo.findById(subscriptionId);
    if (!existing || existing.userId !== user.userId || existing.appId !== appId) {
      throw new NotFoundException('Subscription not found');
    }

    const subscription = await this.subscriptionManager.syncSubscriptionStatus(subscriptionId);

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    // Record status change if different from previous
    if (subscription.status !== existing.status) {
      this.metrics.recordSubscriptionStatusChange(
        existing.provider,
        existing.status,
        subscription.status,
      );

      // Record billing event if subscription became active
      if (subscription.status === 'ACTIVE' && existing.status !== 'ACTIVE') {
        this.metrics.recordBillingEvent(existing.provider, 'success');
      }
    }

    return this.toStatusDto(subscription);
  }

  /**
   * Convert subscription to status DTO
   */
  private toStatusDto(subscription: Subscription): SubscriptionStatusDto {
    return {
      subscriptionId: subscription.id,
      merchantSubscriptionId: subscription.merchantSubscriptionId,
      providerSubscriptionId: subscription.providerData?.subscriptionId ?? null,
      status: subscription.status,
      provider: subscription.provider,
      subscriptionType: subscription.subscriptionType,
      planId: subscription.planId,
      isPremium: subscription.isPremium,
      createdAt: subscription.createdAt,
      activatedAt: subscription.activatedAt ?? null,
      cancelledAt: subscription.cancelledAt ?? null,
      expiredAt: subscription.expiredAt ?? null,
      nextBillingDate: subscription.nextBillingDate ?? null,
      billingCycleCount: subscription.billingCycleCount,
    };
  }
}
