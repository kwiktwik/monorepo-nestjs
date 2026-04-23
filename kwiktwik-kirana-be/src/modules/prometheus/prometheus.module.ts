import { Module } from '@nestjs/common';
import { PrometheusModule as PrometheusModuleBase } from '@willsoto/nestjs-prometheus';
import { HealthMetricsService } from './health-metrics.service';
import { metricProviders } from './metrics.providers';
import { MetricsController } from './metrics.controller';

/**
 * Prometheus metrics module for monitoring
 *
 * Exposes metrics at /metrics endpoint (excluded from global /api prefix)
 * Includes default Node.js metrics + custom application metrics
 */
@Module({
  imports: [
    PrometheusModuleBase.register({
      // Use custom controller instead of auto-registered one
      controller: MetricsController,
    }),
  ],
  providers: [HealthMetricsService, ...metricProviders],
  exports: [HealthMetricsService, ...metricProviders],
})
export class PrometheusModule {}
