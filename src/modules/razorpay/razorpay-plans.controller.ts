import { Controller, Get, Param, UseGuards } from '@nestjs/common';
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
import { AppId } from '../../common/decorators/app-id.decorator';

@ApiTags('v1/plans')
@ApiBearerAuth('JWT')
@ApiHeader({ name: 'X-App-ID', required: true, description: 'App identifier' })
@Controller('v1/plans')
@UseGuards(AppIdGuard, JwtAuthGuard)
export class RazorpayPlansController {
  constructor(private readonly razorpayService: RazorpayService) {}

  @Get()
  @ApiOperation({ summary: 'Get all plans (Razorpay API mock)' })
  @ApiResponse({ status: 200, description: 'Plans retrieved successfully' })
  async getPlans(@AppId() appId: string) {
    return this.razorpayService.getPlans(appId);
  }

  @Get(':plan_id')
  @ApiOperation({ summary: 'Get a specific plan by ID (Razorpay API mock)' })
  @ApiResponse({ status: 200, description: 'Plan retrieved successfully' })
  @ApiResponse({ status: 400, description: 'Plan not found' })
  async getPlan(@AppId() appId: string, @Param('plan_id') planId: string) {
    return this.razorpayService.getPlan(appId, planId);
  }
}
