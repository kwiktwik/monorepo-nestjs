import { Controller, Get, Res } from '@nestjs/common';
import type { Response } from 'express';
import { register } from 'prom-client';

/**
 * Custom metrics controller that serves prometheus metrics
 * 
 * This controller is registered directly in AppModule (not through PrometheusModule)
 * so it respects the global prefix exclusion configured in main.ts.
 * 
 * The /metrics endpoint is excluded from the /api prefix for load balancer health checks.
 */
@Controller('metrics')
export class MetricsController {
  @Get()
  async getMetrics(@Res() res: Response) {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  }
}
