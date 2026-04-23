import { Module, OnModuleInit } from '@nestjs/common';
import { PrometheusModule as PrometheusModuleBase } from '@willsoto/nestjs-prometheus';
import { collectDefaultMetrics } from 'prom-client';
import { HealthMetricsService } from './health-metrics.service';
import { metricProviders } from './metrics.providers';
import { MetricsController } from './metrics.controller';

/**
 * Prometheus metrics module for monitoring
 *
 * Exposes metrics at /metrics endpoint (excluded from /api prefix)
 * Includes default Node.js metrics + custom application metrics
 */
@Module({
  imports: [
    // Register the base module for metric providers (counter, gauge, etc.)
    // We don't use its auto-controller - we use our own explicit controller
    PrometheusModuleBase.register({
      path: '/metrics-internal', // Different path to avoid conflicts
    }),
  ],
  controllers: [MetricsController],
  providers: [HealthMetricsService, ...metricProviders],
  exports: [HealthMetricsService, ...metricProviders],
})
export class PrometheusModule implements OnModuleInit {
  onModuleInit() {
    // Collect default Node.js metrics (event loop, heap, gc, etc.)
    collectDefaultMetrics({
      eventLoopMonitoringPrecision: 10,
    });
  }
}
