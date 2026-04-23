import { Injectable, Logger } from '@nestjs/common';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { Counter, Gauge, Histogram } from 'prom-client';

/**
 * Service for tracking custom application metrics
 * Used by health controller and other components
 * 
 * Metrics are automatically exposed at /metrics endpoint by PrometheusModule
 */
@Injectable()
export class HealthMetricsService {
  private readonly logger = new Logger(HealthMetricsService.name);

  constructor(
    @InjectMetric('http_requests_total')
    private readonly httpRequestsTotal: Counter<string>,
    @InjectMetric('http_request_duration_seconds')
    private readonly httpRequestDuration: Histogram<string>,
    @InjectMetric('nodejs_memory_heap_used_mb')
    private readonly memoryHeapUsed: Gauge<string>,
    @InjectMetric('nodejs_memory_heap_total_mb')
    private readonly memoryHeapTotal: Gauge<string>,
    @InjectMetric('nodejs_memory_rss_mb')
    private readonly memoryRss: Gauge<string>,
    @InjectMetric('health_check_status')
    private readonly healthCheckStatus: Gauge<string>,
    @InjectMetric('app_uptime_seconds')
    private readonly appUptime: Gauge<string>,
    @InjectMetric('orders_created_total')
    private readonly ordersCreated: Counter<string>,
    @InjectMetric('payments_processed_total')
    private readonly paymentsProcessed: Counter<string>,
  ) {}

  /**
   * Record an HTTP request metric
   */
  recordHttpRequest(method: string, route: string, statusCode: number): void {
    try {
      this.httpRequestsTotal.inc({
        method,
        route,
        status_code: statusCode.toString(),
      });
    } catch (error) {
      this.logger.warn(`Failed to record HTTP request metric: ${error.message}`);
    }
  }

  /**
   * Record HTTP request duration
   */
  recordHttpRequestDuration(
    method: string,
    route: string,
    durationSeconds: number,
  ): void {
    try {
      this.httpRequestDuration.observe(
        { method, route },
        durationSeconds,
      );
    } catch (error) {
      this.logger.warn(`Failed to record HTTP duration metric: ${error.message}`);
    }
  }

  /**
   * Update memory metrics from current process state
   */
  updateMemoryMetrics(): void {
    try {
      const mem = process.memoryUsage();
      const heapUsedMB = Math.round(mem.heapUsed / 1024 / 1024);
      const heapTotalMB = Math.round(mem.heapTotal / 1024 / 1024);
      const rssMB = Math.round(mem.rss / 1024 / 1024);

      this.memoryHeapUsed.set(heapUsedMB);
      this.memoryHeapTotal.set(heapTotalMB);
      this.memoryRss.set(rssMB);
    } catch (error) {
      this.logger.warn(`Failed to update memory metrics: ${error.message}`);
    }
  }

  /**
   * Update health check status metric
   * 0 = critical, 1 = warning, 2 = ok
   */
  updateHealthStatus(status: 'ok' | 'warning' | 'critical'): void {
    try {
      const statusValue = status === 'ok' ? 2 : status === 'warning' ? 1 : 0;
      this.healthCheckStatus.set(statusValue);
    } catch (error) {
      this.logger.warn(`Failed to update health status metric: ${error.message}`);
    }
  }

  /**
   * Update application uptime metric
   */
  updateUptime(startTime: number): void {
    try {
      const uptimeSeconds = Math.round((Date.now() - startTime) / 1000);
      this.appUptime.set(uptimeSeconds);
    } catch (error) {
      this.logger.warn(`Failed to update uptime metric: ${error.message}`);
    }
  }

  /**
   * Record order creation
   */
  recordOrderCreated(status: string): void {
    try {
      this.ordersCreated.inc({ status });
    } catch (error) {
      this.logger.warn(`Failed to record order metric: ${error.message}`);
    }
  }

  /**
   * Record payment processing
   */
  recordPaymentProcessed(provider: string, status: string): void {
    try {
      this.paymentsProcessed.inc({ provider, status });
    } catch (error) {
      this.logger.warn(`Failed to record payment metric: ${error.message}`);
    }
  }
}
