import { Controller, Get, Res } from '@nestjs/common';
import type { Response } from 'express';
import { register } from 'prom-client';

/**
 * Explicit metrics controller to ensure /metrics endpoint works.
 * This provides a reliable fallback since @willsoto/nestjs-prometheus
 * auto-controller can fail silently in some deployment scenarios.
 */
@Controller('metrics')
export class MetricsController {
  @Get()
  async getMetrics(@Res() res: Response): Promise<void> {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  }
}
