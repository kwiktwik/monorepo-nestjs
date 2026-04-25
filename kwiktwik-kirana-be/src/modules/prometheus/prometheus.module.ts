import { Module, Global } from '@nestjs/common';
import { PrometheusModule as PrometheusModuleBase } from '@willsoto/nestjs-prometheus';
import { metricProviders } from './metrics.providers';
import { HealthMetricsService } from './health-metrics.service';
import { MetricsController } from './metrics.controller';
import { PrometheusMetricsInterceptor } from '../../common/interceptors/prometheus-metrics.interceptor';
import { DatabaseMetricsService } from './database-metrics.service';

/**
 * Prometheus Module - Provides metrics collection and exposure capabilities
 *
 * This module:
 * - Registers the base Prometheus module for metrics endpoint
 * - Provides custom metric providers (counters, gauges, histograms)
 * - Exports the PrometheusMetricsInterceptor for use in other modules
 * - Provides health metrics service
 *
 * Import this module in any module that uses @UseInterceptors(PrometheusMetricsInterceptor)
 */
@Global()
@Module({
  imports: [
    PrometheusModuleBase.register({
      path: '/metrics',
    }),
  ],
  controllers: [MetricsController],
  providers: [
    HealthMetricsService,
    DatabaseMetricsService,
    PrometheusMetricsInterceptor,
    ...metricProviders,
  ],
  exports: [
    PrometheusMetricsInterceptor,
    ...metricProviders,
    HealthMetricsService,
  ],
})
export class PrometheusModule {}
