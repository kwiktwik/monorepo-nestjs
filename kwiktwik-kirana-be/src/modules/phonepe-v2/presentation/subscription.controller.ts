import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiHeader,
} from '@nestjs/swagger';
import { SubscriptionService } from '../application/services/subscription.service';
import { AppIdGuard } from '../../../common/guards/app-id.guard';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { AppId } from '../../../common/decorators/app-id.decorator';
import {
  SetupSubscriptionDto,
  NotifyRedemptionDto,
  SubscriptionResponseDto,
  RedemptionResponseDto,
  SubscriptionStatusDto,
  OrderStatusDto,
  SyncStatusRequestDto,
} from './dto/subscription.dto';
import { ZodValidationPipe } from '../infrastructure/validation/zod-validation.pipe';
import {
  SetupSubscriptionSchema,
  NotifyRedemptionSchema,
} from '../infrastructure/validation/schemas';

@ApiTags('PhonePe Autopay')
@ApiBearerAuth('JWT')
@ApiHeader({
  name: 'X-App-ID',
  required: true,
  description: 'App identifier',
})
@Controller('phonepe-v2/subscriptions')
@UseGuards(AppIdGuard, JwtAuthGuard)
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Post()
  @UsePipes(new ZodValidationPipe(SetupSubscriptionSchema))
  @ApiOperation({
    summary: 'Setup a new subscription mandate',
    description:
      'Creates a subscription mandate. User will be redirected to PhonePe to approve.',
  })
  @ApiResponse({
    status: 201,
    description: 'Subscription setup initiated',
    type: SubscriptionResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async setupSubscription(
    @CurrentUser() user: { userId: string },
    @AppId() appId: string,
    @Body() dto: SetupSubscriptionDto,
  ): Promise<SubscriptionResponseDto> {
    return this.subscriptionService.setupSubscription({
      userId: user.userId,
      appId,
      planId: dto.planId,
      redirectUrl: dto.redirectUrl,
      merchantSubscriptionId: dto.merchantSubscriptionId,
      metadata: dto.metadata,
      mobileSdk: dto.mobileSdk,
    });
  }

  @Post('redeem')
  @UsePipes(new ZodValidationPipe(NotifyRedemptionSchema))
  @ApiOperation({
    summary: 'Notify user about upcoming charge',
    description:
      'Notifies user about redemption. PhonePe will auto-debit after 24h.',
  })
  @ApiResponse({
    status: 201,
    description: 'Redemption notification sent',
    type: RedemptionResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async notifyRedemption(
    @CurrentUser() user: { userId: string },
    @AppId() appId: string,
    @Body() dto: NotifyRedemptionDto,
  ): Promise<RedemptionResponseDto> {
    return this.subscriptionService.notifyRedemption({
      userId: user.userId,
      appId,
      merchantSubscriptionId: dto.merchantSubscriptionId,
      amount: dto.amount,
      metadata: dto.metadata,
    });
  }

  @Get('status')
  @ApiOperation({
    summary: 'Get subscription status',
    description: 'Fetches subscription status from PhonePe and local state',
  })
  @ApiResponse({
    status: 200,
    description: 'Subscription status',
    type: SubscriptionStatusDto,
  })
  @ApiResponse({ status: 404, description: 'Subscription not found' })
  async getSubscriptionStatus(
    @AppId() appId: string,
    @Query('merchantSubscriptionId') merchantSubscriptionId: string,
  ): Promise<SubscriptionStatusDto> {
    return this.subscriptionService.getSubscriptionStatus(
      appId,
      merchantSubscriptionId,
    );
  }

  @Get('my-subscriptions')
  @ApiOperation({
    summary: 'Get my subscriptions',
    description: 'Lists all subscriptions for the authenticated user',
  })
  @ApiResponse({
    status: 200,
    description: 'List of subscriptions',
    type: [SubscriptionStatusDto],
  })
  async getMySubscriptions(
    @CurrentUser() user: { userId: string },
    @AppId() appId: string,
  ): Promise<SubscriptionStatusDto[]> {
    return this.subscriptionService.getUserSubscriptions(user.userId, appId);
  }

  @Get('order-status')
  @ApiOperation({
    summary: 'Get order status',
    description:
      'Fetches detailed order status from PhonePe including payment details',
  })
  @ApiResponse({
    status: 200,
    description: 'Order status with payment details',
    type: OrderStatusDto,
  })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async getOrderStatus(
    @AppId() appId: string,
    @Query('merchantOrderId') merchantOrderId: string,
    @Query('details') details?: boolean,
  ): Promise<OrderStatusDto> {
    return this.subscriptionService.getOrderStatus(
      appId,
      merchantOrderId,
      details,
    );
  }

  @Post('sync-status')
  @ApiOperation({
    summary: 'Sync subscription status from PhonePe',
    description:
      'Manually sync subscription status from PhonePe (useful when webhook not received). Mobile app should call this after successful payment.',
  })
  @ApiResponse({
    status: 200,
    description: 'Subscription status synced',
    type: SubscriptionStatusDto,
  })
  @ApiResponse({ status: 404, description: 'Subscription not found' })
  async syncSubscriptionStatus(
    @AppId() appId: string,
    @Body() body: SyncStatusRequestDto,
  ): Promise<SubscriptionStatusDto> {
    // First check order status from PhonePe
    const orderStatus = await this.subscriptionService.getOrderStatus(
      appId,
      body.merchantOrderId,
      true,
    );

    // Sync subscription status from PhonePe
    // This will update local state if PhonePe shows ACTIVE
    return this.subscriptionService.getSubscriptionStatus(
      appId,
      body.merchantSubscriptionId,
    );
  }
}
