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
import { ApiTags, ApiBasicAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';
import { SubscriptionService } from '../phonepe-v2/application/services/subscription.service';
import type { RedemptionRepository } from '../phonepe-v2/application/interfaces/repository.interface';
import { Inject } from '@nestjs/common';
import { REDEMPTION_REPOSITORY } from '../phonepe-v2/constants';

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
@ApiBasicAuth('admin-basic')
@Controller('admin/phonepe')
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class PhonePeAdminController {
  constructor(
    private readonly subscriptionService: SubscriptionService,
    @Inject(REDEMPTION_REPOSITORY)
    private readonly redemptionRepo: RedemptionRepository,
  ) {}

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

  @Get('redemptions/:merchantOrderId/status')
  @ApiOperation({ summary: 'Get redemption status from local database' })
  @ApiQuery({
    name: 'checkPhonePe',
    required: false,
    description: 'Also check PhonePe API for latest status',
  })
  async getRedemptionStatus(
    @Param('merchantOrderId') merchantOrderId: string,
    @Query('appId') appId: string = 'com.kiranaapps.app',
    @Query('checkPhonePe') checkPhonePe?: string,
  ) {
    const redemption =
      await this.redemptionRepo.findByMerchantOrderId(merchantOrderId);

    if (!redemption) {
      return {
        error: 'Redemption not found in local database',
        merchantOrderId,
      };
    }

    const result: any = {
      local: {
        id: redemption.id,
        merchantOrderId: redemption.merchantOrderId,
        merchantSubscriptionId: redemption.merchantSubscriptionId,
        userId: redemption.userId,
        appId: redemption.appId,
        amount: redemption.amount,
        state: redemption.state,
        phonepeOrderId: redemption.phonepeOrderId,
        transactionId: redemption.transactionId,
        autoDebit: redemption.autoDebit,
        notifiedAt: redemption.notifiedAt,
        validAfter: redemption.validAfter,
        validUpto: redemption.validUpto,
        errorCode: redemption.errorCode,
        detailedErrorCode: redemption.detailedErrorCode,
        createdAt: redemption.createdAt,
        updatedAt: redemption.updatedAt,
      },
    };

    if (checkPhonePe === 'true' && appId) {
      try {
        const phonePeStatus = await this.subscriptionService.getOrderStatus(
          appId,
          merchantOrderId,
          true,
        );
        result.phonePe = phonePeStatus;

        // Check for mismatches
        if (phonePeStatus.state !== redemption.state) {
          result.mismatch = {
            localState: redemption.state,
            phonePeState: phonePeStatus.state,
            message: 'State mismatch detected between local and PhonePe',
          };
        }
      } catch (error) {
        result.phonePe = {
          error:
            error instanceof Error
              ? error.message
              : 'Failed to fetch from PhonePe',
        };
      }
    }

    return result;
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
