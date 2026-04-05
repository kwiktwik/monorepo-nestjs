import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  UseGuards,
  Logger,
  Headers,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiHeader,
  ApiResponse,
} from '@nestjs/swagger';
import { RazorpayService } from './razorpay.service';
import { AppIdGuard } from '../../common/guards/app-id.guard';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AppId } from '../../common/decorators/app-id.decorator';
import { CreateSubscriptionV2Dto } from './dto/create-subscription.dto';
import { VerifyPaymentDto } from './dto/verify-payment.dto';

@ApiTags('razorpay')
@ApiBearerAuth('JWT')
@ApiHeader({ name: 'X-App-ID', required: true, description: 'App identifier' })
@ApiHeader({
  name: 'X-App-Version',
  required: false,
  description: 'App version (e.g., 1.2.3)',
})
@ApiHeader({
  name: 'X-Build-Number',
  required: false,
  description: 'Build number (e.g., 123)',
})
@Controller('razorpay')
@UseGuards(AppIdGuard, JwtAuthGuard)
export class RazorpayController {
  private readonly logger = new Logger(RazorpayController.name);

  constructor(private readonly razorpayService: RazorpayService) {}

  @Post('subscriptions/v2')
  @ApiOperation({
    summary: 'Create subscription (v2) - intent or collect flow',
  })
  @ApiResponse({ status: 200, description: 'Subscription created' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async createSubscriptionV2(
    @CurrentUser() user: { userId: string },
    @AppId() appId: string,
    @Body() dto: CreateSubscriptionV2Dto,
    @Headers('x-app-version') appVersion?: string,
    @Headers('x-build-number') buildNumber?: string,
  ) {
    this.logger.log(
      `[createSubscriptionV2] Incoming request | userId=${user.userId} appId=${appId} body=${JSON.stringify(dto)} appVersion=${appVersion} buildNumber=${buildNumber}`,
    );

    let planId = dto.plan_id;

    if (!planId) {
      planId = this.razorpayService.getDynamicPlanId(appId, user.userId, {
        isTrial: dto.is_trial === 'true',
        userSegment: dto.user_segment,
      });
      this.logger.log(
        `[createSubscriptionV2] Resolved dynamic planId=${planId} | isTrial=${dto.is_trial} userSegment=${dto.user_segment}`,
      );
    } else {
      this.logger.log(`[createSubscriptionV2] Using provided planId=${planId}`);
    }

    // Merge headers into notes
    const notes = {
      ...dto.notes,
      ...(appVersion && { app_version: appVersion }),
      ...(buildNumber && { build_number: buildNumber }),
    };

    return this.razorpayService.createSubscriptionV2(user.userId, appId, {
      plan_id: planId,
      quantity: dto.quantity ?? 1,
      start_at: dto.start_at,
      flow: dto.flow ?? 'intent',
      vpa: dto.vpa,
      notes,
    });
  }

  @Post('verify')
  @ApiOperation({ summary: 'Verify Razorpay payment (order or subscription)' })
  @ApiResponse({ status: 200, description: 'Payment verified successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({
    status: 401,
    description: 'Invalid signature or unauthorized',
  })
  async verifyPayment(@AppId() appId: string, @Body() dto: VerifyPaymentDto) {
    return this.razorpayService.verifyPayment(appId, dto);
  }

  @Get('plans')
  @ApiOperation({ summary: 'Get all plans' })
  @ApiResponse({ status: 200, description: 'Plans retrieved successfully' })
  async getPlans(@AppId() appId: string) {
    return this.razorpayService.getPlans(appId);
  }

  @Get('plans/:plan_id')
  @ApiOperation({ summary: 'Get a specific plan by ID' })
  @ApiResponse({ status: 200, description: 'Plan retrieved successfully' })
  @ApiResponse({ status: 400, description: 'Plan not found' })
  async getPlan(@AppId() appId: string, @Param('plan_id') planId: string) {
    return this.razorpayService.getPlan(appId, planId);
  }

  /**
   * Check the live status of a Razorpay order before creating a new one.
   *
   * Client flow:
   *   1. Store the razorpay_order_id locally when an order is created.
   *   2. If the payment callback is not received, call this endpoint.
   *   3. If `alreadyPaid === true`  → payment was successful, skip re-ordering.
   *   4. If `alreadyPaid === false` → safe to retry / create a new order.
   */
  @Get('orders/:razorpayOrderId/status')
  @ApiOperation({
    summary: 'Check pre-existing order status (anti-duplicate guard)',
    description:
      'Fetches live order status from Razorpay via instance.orders.fetch(). ' +
      'Call this BEFORE creating a new order when a previous payment callback was missed. ' +
      'If alreadyPaid is true, the user has already been charged — do NOT create another order.',
  })
  @ApiResponse({
    status: 200,
    description:
      'Order status returned. Check `alreadyPaid` field before proceeding.',
    schema: {
      example: {
        razorpayOrderId: 'order_ABC123',
        status: 'paid',
        amount: 199,
        currency: 'INR',
        attempts: 1,
        localStatus: 'captured',
        subscriptionStatus: 'active',
        alreadyPaid: true,
        localOrderId: 'ord_x1y2',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Order not found on Razorpay' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getOrderStatus(
    @CurrentUser() user: { userId: string },
    @AppId() appId: string,
    @Param('razorpayOrderId') razorpayOrderId: string,
  ) {
    this.logger.log(
      `[getOrderStatus] userId=${user.userId} appId=${appId} razorpayOrderId=${razorpayOrderId}`,
    );
    return this.razorpayService.getOrderStatus(
      appId,
      user.userId,
      razorpayOrderId,
    );
  }
}
