import { Module } from '@nestjs/common';
import { PrometheusModule as PrometheusModuleBase } from '@willsoto/nestjs-prometheus';
import { HealthMetricsService } from './health-metrics.service';

/**
 * Prometheus metrics module for monitoring
 * 
 * Exposes metrics at /metrics endpoint (excluded from /api prefix)
 * Includes default Node.js metrics + custom application metrics
 */
@Module({
  imports: [
    PrometheusModuleBase.register({
      // Metrics will be available at /metrics (excluded from global /api prefix)
      path: '/metrics',
      defaultMetrics: {
        enabled: true,
        config: {
          // Include event loop lag, GC stats, and other Node.js metrics
          eventLoopMonitoringPrecision: 10,
        },
      },
    }),
  ],
  providers: [HealthMetricsService],
  exports: [HealthMetricsService],
})
export class PrometheusModule {}
