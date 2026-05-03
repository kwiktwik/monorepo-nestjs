import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { AppIdGuard } from '../../common/guards/app-id.guard';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PrometheusMetricsInterceptor } from '../../common/interceptors/prometheus-metrics.interceptor';
import { AppId } from '../../common/decorators/app-id.decorator';
import { PaywallService, type PlanTypeFilter } from './paywall.service';

@ApiTags('paywall')
@ApiBearerAuth('JWT')
@Controller('v1/paywall')
@UseGuards(AppIdGuard, JwtAuthGuard)
@UseInterceptors(PrometheusMetricsInterceptor)
export class PaywallController {
  constructor(private readonly paywallService: PaywallService) {}

  @Get('plans')
  @ApiOperation({
    summary: 'Get all active plans (backend-driven)',
    description:
      'Returns screen-level text and all active plans with display metadata (badge, features, pricing, CTA). The client renders the paywall entirely from this response.',
  })
  @ApiQuery({
    name: 'language',
    required: false,
    description: 'Language code for localized content (default: en)',
    example: 'en',
  })
  @ApiQuery({
    name: 'type',
    required: false,
    enum: ['ONE_TIME', 'SUBSCRIPTION'],
    description: 'Filter by plan type',
  })
  @ApiResponse({ status: 200, description: 'Plans returned successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getPlans(
    @AppId() appId: string,
    @Query('language') language?: string,
    @Query('type') type?: PlanTypeFilter,
  ) {
    const config = await this.paywallService.getPaywallConfig(
      appId,
      language ?? 'en',
      type,
    );
    return { success: true, data: config };
  }

  @Get('plans/:planId')
  @ApiOperation({
    summary: 'Get a specific plan by ID',
    description: 'Returns a single plan by its ID for the current app.',
  })
  @ApiParam({
    name: 'planId',
    description: 'The plan ID',
    example: 'plan_S3FaBrk7sjPQEU',
  })
  @ApiResponse({ status: 200, description: 'Plan returned successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Plan not found' })
  async getPlanById(
    @AppId() appId: string,
    @Param('planId') planId: string,
  ) {
    const plan = await this.paywallService.getPlanById(appId, planId);
    return { success: true, data: plan };
  }
}