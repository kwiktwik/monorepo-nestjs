import { Injectable, Logger } from '@nestjs/common';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { Counter, Gauge, Histogram } from 'prom-client';

/**
 * Service for tracking custom application metrics
 * Used by health controller and other components
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
  ) {}

  /**
   * Record an HTTP request metric
   */
  recordHttpRequest(method: string, route: string, statusCode: number): void {
    this.httpRequestsTotal.inc({
      method,
      route,
      status_code: statusCode.toString(),
    });
  }

  /**
   * Record HTTP request duration
   */
  recordHttpRequestDuration(
    method: string,
    route: string,
    durationSeconds: number,
  ): void {
    this.httpRequestDuration.observe(
      { method, route },
      durationSeconds,
    );
  }

  /**
   * Update memory metrics from current process state
   */
  updateMemoryMetrics(): void {
    const mem = process.memoryUsage();
    const heapUsedMB = Math.round(mem.heapUsed / 1024 / 1024);
    const heapTotalMB = Math.round(mem.heapTotal / 1024 / 1024);
    const rssMB = Math.round(mem.rss / 1024 / 1024);

    this.memoryHeapUsed.set(heapUsedMB);
    this.memoryHeapTotal.set(heapTotalMB);
    this.memoryRss.set(rssMB);
  }

  /**
   * Update health check status metric
   * 0 = critical, 1 = warning, 2 = ok
   */
  updateHealthStatus(status: 'ok' | 'warning' | 'critical'): void {
    const statusValue = status === 'ok' ? 2 : status === 'warning' ? 1 : 0;
    this.healthCheckStatus.set(statusValue);
  }

  /**
   * Update application uptime metric
   */
  updateUptime(startTime: number): void {
    const uptimeSeconds = Math.round((Date.now() - startTime) / 1000);
    this.appUptime.set(uptimeSeconds);
  }
}
