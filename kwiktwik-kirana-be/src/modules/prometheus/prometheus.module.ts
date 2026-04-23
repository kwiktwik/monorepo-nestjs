import { Module } from '@nestjs/common';
import { PrometheusModule as PrometheusModuleBase } from '@willsoto/nestjs-prometheus';
import { metricProviders } from './metrics.providers';
import { HealthMetricsService } from './health-metrics.service';

/**
 * Prometheus metrics module for monitoring
 *
 * This module:
 * - Registers the PrometheusModule from @willsoto/nestjs-prometheus
 * - Provides custom application metrics via metricProviders
 * - Exports metric providers for injection into other services
 *
 * Note: The MetricsController is registered separately in AppModule to ensure
 * it's excluded from the global /api prefix (configured in main.ts).
 */
@Module({
  imports: [
    PrometheusModuleBase.register({
      // Enable default Node.js metrics (event loop lag, memory, CPU, etc.)
      defaultMetrics: {
        enabled: true,
      },
      // Disable the default controller since we provide our own in AppModule
      controller: class DummyController {},
    }),
  ],
  providers: [HealthMetricsService, ...metricProviders],
  exports: [HealthMetricsService, PrometheusModuleBase, ...metricProviders],
})
export class PrometheusModule {}
