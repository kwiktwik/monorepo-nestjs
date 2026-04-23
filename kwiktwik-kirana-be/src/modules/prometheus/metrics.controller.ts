import { Controller, Get, Res } from '@nestjs/common';
import { PrometheusController } from '@willsoto/nestjs-prometheus';
import type { Response } from 'express';

/**
 * Custom metrics controller that extends PrometheusController
 * 
 * This controller is registered directly in AppModule.controllers
 * so it respects the global prefix exclusion configured in main.ts.
 * 
 * The /metrics endpoint is excluded from the /api prefix for load balancer health checks.
 */
@Controller('metrics')
export class MetricsController extends PrometheusController {
  @Get()
  async index(@Res({ passthrough: true }) response: Response) {
    return super.index(response);
  }
}
