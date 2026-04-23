import { Module } from '@nestjs/common';
import { PrometheusModule as PrometheusModuleBase } from '@willsoto/nestjs-prometheus';
import { HealthMetricsService } from './health-metrics.service';
import { metricProviders } from './metrics.providers';

/**
 * Prometheus metrics module for monitoring
 *
 * Exposes metrics at /metrics endpoint (excluded from /api prefix)
 * Includes default Node.js metrics + custom application metrics
 */
@Module({
  imports: [
    PrometheusModuleBase.register({
      path: '/metrics',
    }),
  ],
  providers: [HealthMetricsService, ...metricProviders],
  exports: [HealthMetricsService, ...metricProviders],
})
export class PrometheusModule {}
