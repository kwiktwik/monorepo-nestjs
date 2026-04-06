import {
  Controller,
  Get,
  Post,
  Query,
  Param,
  Body,
  ValidationPipe,
  UsePipes,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiBasicAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsEnum,
} from 'class-validator';
import { RazorpayService } from '../razorpay/razorpay.service';
import { Inject } from '@nestjs/common';
import { DRIZZLE_TOKEN } from '../../database/drizzle.module';
import * as schema from '../../database/schema';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq, and, desc } from 'drizzle-orm';
import { RazorpaySubscriptionStatuses } from '../../common/types/razorpay.types';

class GetUserSubscriptionsDto {
  @IsString()
  @IsNotEmpty()
  userId!: string;

  @IsString()
  @IsNotEmpty()
  appId!: string;
}

class GetSubscriptionStatusDto {
  @IsString()
  @IsNotEmpty()
  appId!: string;

  @IsString()
  @IsNotEmpty()
  userId!: string;
}

class GetOrderStatusDto {
  @IsString()
  @IsNotEmpty()
  appId!: string;

  @IsString()
  @IsNotEmpty()
  userId!: string;
}

class CancelSubscriptionDto {
  @IsOptional()
  cancelAtCycleEnd?: boolean;

  @IsOptional()
  reason?: string;
}

class CreateSubscriptionDto {
  @IsString()
  @IsOptional()
  planId?: string;

  @IsNumber()
  @IsOptional()
  quantity?: number;

  @IsString()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  contact?: string;

  @IsString()
  @IsOptional()
  name?: string;
}

@ApiTags('admin-razorpay')
@ApiBasicAuth('admin-basic')
@Controller('razorpay')
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class RazorpayAdminController {
  constructor(
    private readonly razorpayService: RazorpayService,
    @Inject(DRIZZLE_TOKEN)
    private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  @Get('subscriptions')
  @ApiOperation({ summary: 'Get all subscriptions for a user' })
  async getUserSubscriptions(@Query() query: GetUserSubscriptionsDto) {
    const subscriptions = await this.db
      .select()
      .from(schema.subscriptions)
      .where(
        and(
          eq(schema.subscriptions.userId, query.userId),
          eq(schema.subscriptions.appId, query.appId),
        ),
      )
      .orderBy(desc(schema.subscriptions.createdAt));

    return { subscriptions, count: subscriptions.length };
  }

  @Get('subscriptions/:subscriptionId')
  @ApiOperation({ summary: 'Get subscription details by internal ID' })
  async getSubscriptionById(@Param('subscriptionId') subscriptionId: string) {
    const subscriptions = await this.db
      .select()
      .from(schema.subscriptions)
      .where(eq(schema.subscriptions.id, subscriptionId))
      .limit(1);

    if (subscriptions.length === 0) {
      return { error: 'Subscription not found' };
    }

    return { subscription: subscriptions[0] };
  }

  @Get('subscriptions/razorpay/:razorpaySubscriptionId/status')
  @ApiOperation({ summary: 'Get live subscription status from Razorpay' })
  async getRazorpaySubscriptionStatus(
    @Param('razorpaySubscriptionId') razorpaySubscriptionId: string,
    @Query() query: GetSubscriptionStatusDto,
  ) {
    try {
      const status = await this.razorpayService.getSubscriptionStatus(
        query.appId,
        query.userId,
        razorpaySubscriptionId,
      );
      return status;
    } catch (error) {
      return {
        error:
          error instanceof Error
            ? error.message
            : 'Failed to fetch subscription status',
      };
    }
  }

  @Get('orders')
  @ApiOperation({ summary: 'Get all orders for a user' })
  async getUserOrders(
    @Query('userId') userId: string,
    @Query('appId') appId: string,
    @Query('limit') limit?: string,
  ) {
    const query = this.db
      .select()
      .from(schema.orders)
      .where(
        and(eq(schema.orders.userId, userId), eq(schema.orders.appId, appId)),
      )
      .orderBy(desc(schema.orders.createdAt));

    if (limit) {
      const limitNum = parseInt(limit, 10);
      if (!isNaN(limitNum) && limitNum > 0) {
        query.limit(limitNum);
      }
    }

    const orders = await query;
    return { orders, count: orders.length };
  }

  @Get('orders/:orderId')
  @ApiOperation({ summary: 'Get order details by internal ID' })
  async getOrderById(@Param('orderId') orderId: string) {
    const orders = await this.db
      .select()
      .from(schema.orders)
      .where(eq(schema.orders.id, orderId))
      .limit(1);

    if (orders.length === 0) {
      return { error: 'Order not found' };
    }

    return { order: orders[0] };
  }

  @Get('orders/razorpay/:razorpayOrderId/status')
  @ApiOperation({ summary: 'Get live order status from Razorpay' })
  async getRazorpayOrderStatus(
    @Param('razorpayOrderId') razorpayOrderId: string,
    @Query() query: GetOrderStatusDto,
  ) {
    try {
      const status = await this.razorpayService.getOrderStatus(
        query.appId,
        query.userId,
        razorpayOrderId,
      );
      return status;
    } catch (error) {
      return {
        error:
          error instanceof Error
            ? error.message
            : 'Failed to fetch order status',
      };
    }
  }

  @Get('plans')
  @ApiOperation({ summary: 'Get all plans from Razorpay' })
  async getPlans(@Query('appId') appId: string) {
    try {
      const plans = await this.razorpayService.getPlans(appId);
      return { plans };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Failed to fetch plans',
      };
    }
  }

  @Get('plans/:planId')
  @ApiOperation({ summary: 'Get specific plan details from Razorpay' })
  async getPlan(
    @Query('appId') appId: string,
    @Param('planId') planId: string,
  ) {
    try {
      const plan = await this.razorpayService.getPlan(appId, planId);
      return { plan };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Failed to fetch plan',
      };
    }
  }

  @Post('subscriptions/:subscriptionId/cancel')
  @ApiOperation({ summary: 'Cancel a subscription' })
  async cancelSubscription(
    @Param('subscriptionId') subscriptionId: string,
    @Query('appId') appId: string,
    @Body() body: CancelSubscriptionDto,
  ) {
    const subscriptions = await this.db
      .select()
      .from(schema.subscriptions)
      .where(eq(schema.subscriptions.id, subscriptionId))
      .limit(1);

    if (subscriptions.length === 0) {
      return { error: 'Subscription not found' };
    }

    const subscription = subscriptions[0];

    // Update local status to cancelled
    await this.db
      .update(schema.subscriptions)
      .set({
        status: 'cancelled',
        updatedAt: new Date(),
      })
      .where(eq(schema.subscriptions.id, subscriptionId));

    return {
      message: 'Subscription cancelled successfully',
      subscriptionId,
      razorpaySubscriptionId: subscription.razorpaySubscriptionId,
      cancelledAt: new Date().toISOString(),
    };
  }

  @Post('subscriptions/:subscriptionId/sync')
  @ApiOperation({ summary: 'Sync subscription status from Razorpay' })
  async syncSubscription(
    @Param('subscriptionId') subscriptionId: string,
    @Query('appId') appId: string,
    @Query('userId') userId: string,
  ) {
    const subscriptions = await this.db
      .select()
      .from(schema.subscriptions)
      .where(eq(schema.subscriptions.id, subscriptionId))
      .limit(1);

    if (subscriptions.length === 0) {
      return { error: 'Subscription not found' };
    }

    const subscription = subscriptions[0];

    if (!subscription.razorpaySubscriptionId) {
      return { error: 'No Razorpay subscription ID associated' };
    }

    try {
      const status = await this.razorpayService.getSubscriptionStatus(
        appId,
        userId,
        subscription.razorpaySubscriptionId,
      );

      return {
        message: 'Subscription synced successfully',
        subscriptionId,
        previousStatus: subscription.status,
        currentStatus: status.status,
        synced: status.synced,
        isActive: status.isActive,
      };
    } catch (error) {
      return {
        error:
          error instanceof Error
            ? error.message
            : 'Failed to sync subscription',
      };
    }
  }

  @Get('subscriptions/stats/overview')
  @ApiOperation({ summary: 'Get subscription statistics' })
  async getSubscriptionStats(@Query('appId') appId: string) {
    const allSubscriptions = await this.db
      .select({
        status: schema.subscriptions.status,
      })
      .from(schema.subscriptions)
      .where(eq(schema.subscriptions.appId, appId));

    const stats = {
      total: allSubscriptions.length,
      active: 0,
      created: 0,
      authenticated: 0,
      pending: 0,
      halted: 0,
      paused: 0,
      cancelled: 0,
      completed: 0,
      expired: 0,
    };

    for (const sub of allSubscriptions) {
      if (sub.status in stats) {
        stats[sub.status as keyof typeof stats]++;
      }
    }

    return { appId, stats };
  }

  @Get('webhook-logs')
  @ApiOperation({ summary: 'Get recent webhook logs' })
  @ApiQuery({ name: 'appId', required: false })
  @ApiQuery({
    name: 'provider',
    required: false,
    description: 'Filter by provider (razorpay, phonepe)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of logs to return (default: 50)',
  })
  async getWebhookLogs(
    @Query('appId') appId?: string,
    @Query('provider') provider?: string,
    @Query('limit') limit?: string,
  ) {
    let query = this.db
      .select()
      .from(schema.webhookLogs)
      .orderBy(desc(schema.webhookLogs.createdAt));

    if (appId) {
      query = query.where(eq(schema.webhookLogs.appId, appId)) as typeof query;
    }

    if (provider) {
      query = query.where(
        eq(schema.webhookLogs.provider, provider as any),
      ) as typeof query;
    }

    const limitNum = limit ? parseInt(limit, 10) : 50;
    if (!isNaN(limitNum) && limitNum > 0) {
      query = query.limit(limitNum) as typeof query;
    }

    const logs = await query;
    return { logs, count: logs.length };
  }

  @Get('users/:userId/subscription-status')
  @ApiOperation({ summary: 'Get complete subscription status for a user' })
  async getCompleteUserSubscriptionStatus(
    @Param('userId') userId: string,
    @Query('appId') appId: string,
  ) {
    // Get all subscriptions
    const subscriptions = await this.db
      .select()
      .from(schema.subscriptions)
      .where(
        and(
          eq(schema.subscriptions.userId, userId),
          eq(schema.subscriptions.appId, appId),
        ),
      )
      .orderBy(desc(schema.subscriptions.createdAt));

    // Get recent orders
    const orders = await this.db
      .select()
      .from(schema.orders)
      .where(
        and(eq(schema.orders.userId, userId), eq(schema.orders.appId, appId)),
      )
      .orderBy(desc(schema.orders.createdAt))
      .limit(10);

    // Check for active subscription
    const activeSubscription = subscriptions.find(
      (s) => s.status === RazorpaySubscriptionStatuses.ACTIVE,
    );

    const authenticatedSubscription = subscriptions.find(
      (s) => s.status === RazorpaySubscriptionStatuses.AUTHENTICATED,
    );

    return {
      userId,
      appId,
      hasActiveSubscription: !!activeSubscription,
      hasAuthenticatedSubscription: !!authenticatedSubscription,
      activeSubscription: activeSubscription || null,
      authenticatedSubscription: authenticatedSubscription || null,
      totalSubscriptions: subscriptions.length,
      subscriptions: subscriptions.map((s) => ({
        id: s.id,
        status: s.status,
        razorpaySubscriptionId: s.razorpaySubscriptionId,
        planId: s.razorpayPlanId,
        createdAt: s.createdAt,
        chargeAt: s.chargeAt,
        currentStart: s.currentStart,
        currentEnd: s.currentEnd,
      })),
      recentOrders: orders.map((o) => ({
        id: o.id,
        status: o.status,
        razorpayOrderId: o.razorpayOrderId,
        amount: o.amount,
        createdAt: o.createdAt,
      })),
    };
  }
}
