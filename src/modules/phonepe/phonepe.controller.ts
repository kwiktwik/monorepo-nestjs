import { Controller, Post, Body, UseGuards, Get, Query } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiHeader,
  ApiResponse,
} from '@nestjs/swagger';
import { PhonePeService } from './phonepe.service';
import { AppIdGuard } from '../../common/guards/app-id.guard';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AppId } from '../../common/decorators/app-id.decorator';
import {
  CreateOrderDto,
  CreateOrderWithAuthDto,
  CreateOrderTokenDto,
  CheckStatusDto,
  InitiatePaymentDto,
  SetupSubscriptionDto,
} from './dto/create-order.dto';

@ApiTags('phonepe')
@ApiBearerAuth('JWT')
@ApiHeader({ name: 'X-App-ID', required: true, description: 'App identifier' })
@Controller('phonepe')
@UseGuards(AppIdGuard, JwtAuthGuard)
export class PhonePeController {
  constructor(private readonly phonePeService: PhonePeService) {}

  @Post('create-order')
  @ApiOperation({ summary: 'Create a PhonePe order' })
  @ApiResponse({ status: 200, description: 'Order created' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async createOrder(
    @CurrentUser() user: { userId: string },
    @AppId() appId: string,
    @Body() dto: CreateOrderDto,
  ) {
    return this.phonePeService.createOrder(user.userId, appId, {
      amount: dto.amount,
      redirectUrl: dto.redirectUrl,
      disablePaymentRetry: dto.disablePaymentRetry,
      paymentMode: dto.paymentMode,
    });
  }

  @Post('create-order-with-auth')
  @ApiOperation({
    summary: 'Create a PhonePe order with auth token (₹5 fixed amount)',
  })
  @ApiResponse({ status: 200, description: 'Order created with auth token' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async createOrderWithAuth(
    @CurrentUser() user: { userId: string },
    @AppId() appId: string,
    @Body() dto: CreateOrderWithAuthDto,
  ) {
    return this.phonePeService.createOrderWithAuth(user.userId, appId, {
      redirectUrl: dto.redirectUrl,
      disablePaymentRetry: dto.disablePaymentRetry,
      paymentMode: dto.paymentMode,
    });
  }

  @Post('create-order-token')
  @ApiOperation({ summary: 'Create a PhonePe order token' })
  @ApiResponse({ status: 200, description: 'Order token created' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async createOrderToken(
    @CurrentUser() user: { userId: string },
    @AppId() appId: string,
    @Body() dto: CreateOrderTokenDto,
  ) {
    return this.phonePeService.createOrderToken(user.userId, appId, {
      amount: dto.amount,
      merchantOrderId: dto.merchantOrderId,
      expireAfter: dto.expireAfter,
      redirectUrl: dto.redirectUrl,
      disablePaymentRetry: dto.disablePaymentRetry,
      metaInfo: dto.metaInfo,
      paymentFlow: dto.paymentFlow,
    });
  }

  @Post('initiate-payment')
  @ApiOperation({ summary: 'Initiate a PhonePe standard checkout payment' })
  @ApiResponse({ status: 200, description: 'Payment initiated' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async initiatePayment(
    @CurrentUser() user: { userId: string },
    @AppId() appId: string,
    @Body() dto: InitiatePaymentDto,
  ) {
    return this.phonePeService.initiatePayment(user.userId, appId, {
      amount: dto.amount,
      redirectUrl: dto.redirectUrl,
      message: dto.message,
      metaInfo: dto.metaInfo,
    });
  }

  @Post('check-status')
  @ApiOperation({ summary: 'Check PhonePe order status' })
  @ApiResponse({ status: 200, description: 'Status retrieved' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async checkStatus(@AppId() appId: string, @Body() dto: CheckStatusDto) {
    return this.phonePeService.checkStatus(
      appId,
      dto.merchantOrderId,
      dto.type,
    );
  }

  @Post('setup-subscription')
  @ApiOperation({ summary: 'Setup a PhonePe subscription mandate' })
  @ApiResponse({ status: 200, description: 'Subscription setup initiated' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async setupSubscription(
    @CurrentUser() user: { userId: string },
    @AppId() appId: string,
    @Body() dto: SetupSubscriptionDto,
  ) {
    return this.phonePeService.setupSubscription(user.userId, appId, {
      amount: dto.amount,
      maxAmount: dto.maxAmount,
      frequency: dto.frequency,
      redirectUrl: dto.redirectUrl,
      merchantSubscriptionId: dto.merchantSubscriptionId,
      authWorkflowType: dto.authWorkflowType,
      amountType: dto.amountType,
      metaInfo: dto.metaInfo,
    });
  }

  @Post('get-auth-token')
  @ApiOperation({ summary: 'Get PhonePe OAuth token' })
  @ApiResponse({ status: 200, description: 'Token retrieved' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getAuthToken(@AppId() appId: string) {
    return this.phonePeService.getAuthToken(appId);
  }

  @Get('sdk-config')
  @ApiOperation({ summary: 'Get PhonePe SDK configuration' })
  @ApiResponse({ status: 200, description: 'SDK config retrieved' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getSdkConfig(
    @CurrentUser() user: { userId: string },
    @AppId() appId: string,
  ) {
    return this.phonePeService.getSdkConfig(user.userId, appId);
  }

  @Get('status')
  @ApiOperation({
    summary: 'Check order status via GET (backward compatibility)',
  })
  @ApiResponse({ status: 200, description: 'Status retrieved' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getStatus(
    @AppId() appId: string,
    @Query('merchantOrderId') merchantOrderId: string,
    @Query('type') type?: 'standard' | 'mobile',
  ) {
    return this.phonePeService.checkStatus(
      appId,
      merchantOrderId,
      type || 'standard',
    );
  }
}
