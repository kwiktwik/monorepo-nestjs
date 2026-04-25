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
    // Auth metrics
    @InjectMetric('auth_login_attempts_total')
    private readonly authLoginAttempts: Counter<string>,
    @InjectMetric('auth_login_success_total')
    private readonly authLoginSuccess: Counter<string>,
    @InjectMetric('auth_login_failures_total')
    private readonly authLoginFailures: Counter<string>,
    @InjectMetric('auth_otp_sent_total')
    private readonly authOtpSent: Counter<string>,
    @InjectMetric('auth_otp_verified_total')
    private readonly authOtpVerified: Counter<string>,
    @InjectMetric('auth_duration_seconds')
    private readonly authDuration: Histogram<string>,
    @InjectMetric('auth_active_sessions')
    private readonly authActiveSessions: Gauge<string>,
    // Subscription metrics
    @InjectMetric('subscriptions_created_total')
    private readonly subscriptionsCreated: Counter<string>,
    @InjectMetric('subscriptions_status_changed_total')
    private readonly subscriptionsStatusChanged: Counter<string>,
    @InjectMetric('subscriptions_cancelled_total')
    private readonly subscriptionsCancelled: Counter<string>,
    @InjectMetric('subscriptions_active')
    private readonly subscriptionsActive: Gauge<string>,
    @InjectMetric('subscriptions_revenue_total')
    private readonly subscriptionsRevenue: Counter<string>,
    @InjectMetric('subscriptions_billing_events_total')
    private readonly subscriptionsBillingEvents: Counter<string>,
    // Database metrics
    @InjectMetric('db_pool_connections')
    private readonly dbPoolConnections: Gauge<string>,
    @InjectMetric('db_transaction_duration_seconds')
    private readonly dbTransactionDuration: Histogram<string>,
  ) {}

  /**
   * Record an HTTP request metric
   */
  recordHttpRequest(method: string, route: string, statusCode: number, provider: string = ''): void {
    try {
      this.httpRequestsTotal.inc({
        method,
        route,
        status_code: statusCode.toString(),
        provider,
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
    provider: string = '',
  ): void {
    try {
      this.httpRequestDuration.observe(
        { method, route, provider },
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

  // ============================================================================
  // Auth Metrics
  // ============================================================================

  /**
   * Record a login attempt
   */
  recordLoginAttempt(provider: string, appId: string): void {
    try {
      this.authLoginAttempts.inc({ provider, app_id: appId });
    } catch (error) {
      this.logger.warn(`Failed to record login attempt metric: ${error.message}`);
    }
  }

  /**
   * Record a successful login
   */
  recordLoginSuccess(provider: string, appId: string): void {
    try {
      this.authLoginSuccess.inc({ provider, app_id: appId });
    } catch (error) {
      this.logger.warn(`Failed to record login success metric: ${error.message}`);
    }
  }

  /**
   * Record a failed login
   */
  recordLoginFailure(provider: string, appId: string, reason: string): void {
    try {
      this.authLoginFailures.inc({ provider, app_id: appId, reason });
    } catch (error) {
      this.logger.warn(`Failed to record login failure metric: ${error.message}`);
    }
  }

  /**
   * Record OTP sent
   */
  recordOtpSent(appId: string): void {
    try {
      this.authOtpSent.inc({ app_id: appId });
    } catch (error) {
      this.logger.warn(`Failed to record OTP sent metric: ${error.message}`);
    }
  }

  /**
   * Record OTP verification
   */
  recordOtpVerified(appId: string, success: boolean): void {
    try {
      this.authOtpVerified.inc({ app_id: appId, status: success ? 'success' : 'failure' });
    } catch (error) {
      this.logger.warn(`Failed to record OTP verified metric: ${error.message}`);
    }
  }

  /**
   * Record authentication operation duration
   */
  recordAuthDuration(operation: string, durationSeconds: number): void {
    try {
      this.authDuration.observe({ operation }, durationSeconds);
    } catch (error) {
      this.logger.warn(`Failed to record auth duration metric: ${error.message}`);
    }
  }

  /**
   * Update active sessions count
   */
  updateActiveSessions(appId: string, count: number): void {
    try {
      this.authActiveSessions.set({ app_id: appId }, count);
    } catch (error) {
      this.logger.warn(`Failed to update active sessions metric: ${error.message}`);
    }
  }

  // ============================================================================
  // Subscription Metrics
  // ============================================================================

  /**
   * Record subscription creation
   */
  recordSubscriptionCreated(provider: string, planId: string, appId: string): void {
    try {
      this.subscriptionsCreated.inc({ provider, plan_id: planId, app_id: appId });
    } catch (error) {
      this.logger.warn(`Failed to record subscription created metric: ${error.message}`);
    }
  }

  /**
   * Record subscription status change
   */
  recordSubscriptionStatusChange(provider: string, fromStatus: string, toStatus: string): void {
    try {
      this.subscriptionsStatusChanged.inc({ provider, from_status: fromStatus, to_status: toStatus });
    } catch (error) {
      this.logger.warn(`Failed to record subscription status change metric: ${error.message}`);
    }
  }

  /**
   * Record subscription cancellation
   */
  recordSubscriptionCancelled(provider: string, reason?: string): void {
    try {
      this.subscriptionsCancelled.inc({ provider, reason: reason || 'unknown' });
    } catch (error) {
      this.logger.warn(`Failed to record subscription cancelled metric: ${error.message}`);
    }
  }

  /**
   * Update active subscriptions count
   */
  updateActiveSubscriptions(provider: string, planId: string, appId: string, count: number): void {
    try {
      this.subscriptionsActive.set({ provider, plan_id: planId, app_id: appId }, count);
    } catch (error) {
      this.logger.warn(`Failed to update active subscriptions metric: ${error.message}`);
    }
  }

  /**
   * Record subscription revenue
   */
  recordSubscriptionRevenue(provider: string, type: 'initial' | 'recurring', appId: string, amountPaise: number): void {
    try {
      this.subscriptionsRevenue.inc({ provider, type, app_id: appId }, amountPaise);
    } catch (error) {
      this.logger.warn(`Failed to record subscription revenue metric: ${error.message}`);
    }
  }

  /**
   * Record billing event
   */
  recordBillingEvent(provider: string, status: 'success' | 'failure'): void {
    try {
      this.subscriptionsBillingEvents.inc({ provider, status });
    } catch (error) {
      this.logger.warn(`Failed to record billing event metric: ${error.message}`);
    }
  }

  // ============================================================================
  // Database Metrics
  // ============================================================================

  /**
   * Update database pool metrics
   */
  updateDbPoolMetrics(metrics: { total: number; idle: number; waiting: number }): void {
    try {
      this.dbPoolConnections.set({ type: 'total' }, metrics.total);
      this.dbPoolConnections.set({ type: 'idle' }, metrics.idle);
      this.dbPoolConnections.set({ type: 'waiting' }, metrics.waiting);
    } catch (error) {
      this.logger.warn(`Failed to update DB pool metrics: ${error.message}`);
    }
  }

  /**
   * Record database transaction duration
   */
  recordDbTransactionDuration(operation: string, durationSeconds: number): void {
    try {
      this.dbTransactionDuration.observe({ operation }, durationSeconds);
    } catch (error) {
      this.logger.warn(`Failed to record DB transaction duration: ${error.message}`);
    }
  }
}
