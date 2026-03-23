import {
  Controller,
  Get,
  Post,
  Query,
  Param,
  Body,
  ValidationPipe,
  UsePipes,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';
import { SubscriptionService } from '../phonepe-v2/application/services/subscription.service';

class GetSubscriptionsDto {
  @IsString()
  @IsNotEmpty()
  userId!: string;

  @IsString()
  @IsNotEmpty()
  appId!: string;
}

class GetOrderStatusDto {
  @IsString()
  @IsNotEmpty()
  appId!: string;

  @IsOptional()
  details?: string;
}

class NotifyRedemptionDto {
  @IsNumber()
  amount!: number;

  @IsOptional()
  metadata?: Record<string, unknown>;
}

@ApiTags('admin-phonepe')
@Controller('admin/phonepe')
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class PhonePeAdminController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Get('subscriptions')
  @ApiOperation({ summary: 'Get all subscriptions for a user' })
  async getUserSubscriptions(@Query() query: GetSubscriptionsDto) {
    const subscriptions = await this.subscriptionService.getUserSubscriptions(
      query.userId,
      query.appId,
    );
    return { subscriptions };
  }

  @Get('subscriptions/:merchantSubscriptionId/status')
  @ApiOperation({ summary: 'Get subscription status from PhonePe' })
  @ApiQuery({ name: 'appId', required: true })
  async getSubscriptionStatus(
    @Param('merchantSubscriptionId') merchantSubscriptionId: string,
    @Query('appId') appId: string,
  ) {
    const status = await this.subscriptionService.getSubscriptionStatus(
      appId,
      merchantSubscriptionId,
    );
    return { status };
  }

  @Get('orders/:merchantOrderId/status')
  @ApiOperation({ summary: 'Get order status with payment details' })
  async getOrderStatus(
    @Param('merchantOrderId') merchantOrderId: string,
    @Query() query: GetOrderStatusDto,
  ) {
    const status = await this.subscriptionService.getOrderStatus(
      query.appId,
      merchantOrderId,
      query.details === 'true',
    );
    return { status };
  }

  @Post('subscriptions/:merchantSubscriptionId/sync')
  @ApiOperation({ summary: 'Sync subscription status from order status' })
  @ApiQuery({ name: 'appId', required: true })
  @ApiQuery({ name: 'merchantOrderId', required: true })
  async syncSubscriptionFromOrder(
    @Param('merchantSubscriptionId') merchantSubscriptionId: string,
    @Query('appId') appId: string,
    @Query('merchantOrderId') merchantOrderId: string,
  ) {
    const status = await this.subscriptionService.syncSubscriptionFromOrder(
      appId,
      merchantOrderId,
      merchantSubscriptionId,
    );
    return { status };
  }

  @Post('subscriptions/:merchantSubscriptionId/notify-redemption')
  @ApiOperation({ summary: 'Trigger a redemption notification' })
  @ApiQuery({ name: 'appId', required: true })
  @ApiQuery({ name: 'userId', required: true })
  async notifyRedemption(
    @Param('merchantSubscriptionId') merchantSubscriptionId: string,
    @Query('appId') appId: string,
    @Query('userId') userId: string,
    @Body() body: NotifyRedemptionDto,
  ) {
    const result = await this.subscriptionService.notifyRedemption({
      userId,
      appId,
      merchantSubscriptionId,
      amount: body.amount,
      metadata: body.metadata,
    });
    return { result };
  }
}
