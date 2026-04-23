import { UseInterceptors, applyDecorators } from '@nestjs/common';
import { PrometheusMetricsInterceptor } from '../../common/interceptors/prometheus-metrics.interceptor';

/**
 * Decorator that enables Prometheus monitoring for a controller or method
 * Automatically tracks request count and duration metrics
 * 
 * Usage:
 * @Controller('api/endpoint')
 * @MonitorMetrics()  // Apply to entire controller
 * export class MyController {}
 * 
 * Or for specific methods:
 * @Get()
 * @MonitorMetrics()  // Apply to single method
 * getData() {}
 */
export function MonitorMetrics() {
  return applyDecorators(
    UseInterceptors(PrometheusMetricsInterceptor),
  );
}
