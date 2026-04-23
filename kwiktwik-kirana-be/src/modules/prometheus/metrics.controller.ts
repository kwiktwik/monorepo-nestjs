import { Controller, Get, Res } from '@nestjs/common';
import { PrometheusController } from '@willsoto/nestjs-prometheus';
import type { Response } from 'express';

/**
 * Explicit metrics controller extending the library's base controller.
 * This ensures /metrics endpoint works reliably in all deployment scenarios.
 */
@Controller()
export class MetricsController extends PrometheusController {
  @Get('metrics')
  async index(@Res({ passthrough: true }) res: Response): Promise<string> {
    return super.index(res);
  }

  @Get('metric')
  async indexAlt(@Res({ passthrough: true }) res: Response): Promise<string> {
    return super.index(res);
  }
}
