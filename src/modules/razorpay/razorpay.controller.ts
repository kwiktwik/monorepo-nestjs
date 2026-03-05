import { Controller, Post, Get, Body, Param, UseGuards } from '@nestjs/common';
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
@Controller('razorpay')
@UseGuards(AppIdGuard, JwtAuthGuard)
export class RazorpayController {
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
  ) {
    let planId = dto.plan_id;

    if (!planId) {
      planId = this.razorpayService.getDynamicPlanId(appId, user.userId, {
        isTrial: dto.is_trial === 'true',
        userSegment: dto.user_segment,
      });
    }

    return this.razorpayService.createSubscriptionV2(user.userId, appId, {
      plan_id: planId,
      quantity: dto.quantity ?? 1,
      start_at: dto.start_at,
      flow: dto.flow ?? 'intent',
      vpa: dto.vpa,
      notes: dto.notes,
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
}
