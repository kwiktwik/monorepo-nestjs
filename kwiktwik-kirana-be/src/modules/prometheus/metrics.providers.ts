import {
  makeCounterProvider,
  makeGaugeProvider,
  makeHistogramProvider,
} from '@willsoto/nestjs-prometheus';

/**
 * Custom metric providers for the application
 * These providers create and register metrics with the prometheus client
 */
export const metricProviders = [
  // HTTP request counter
  makeCounterProvider({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'route', 'status_code', 'provider'],
  }),

  // HTTP request duration histogram
  makeHistogramProvider({
    name: 'http_request_duration_seconds',
    help: 'HTTP request duration in seconds',
    labelNames: ['method', 'route', 'provider'],
    buckets: [0.001, 0.005, 0.015, 0.05, 0.1, 0.2, 0.3, 0.5, 1, 2, 5],
  }),

  // Memory metrics
  makeGaugeProvider({
    name: 'nodejs_memory_heap_used_mb',
    help: 'Memory heap used in MB',
  }),
  makeGaugeProvider({
    name: 'nodejs_memory_heap_total_mb',
    help: 'Memory heap total in MB',
  }),
  makeGaugeProvider({
    name: 'nodejs_memory_rss_mb',
    help: 'Resident set size in MB',
  }),

  // Health check status
  makeGaugeProvider({
    name: 'health_check_status',
    help: 'Health check status (0=critical, 1=warning, 2=ok)',
  }),

  // Application uptime
  makeGaugeProvider({
    name: 'app_uptime_seconds',
    help: 'Application uptime in seconds',
  }),

  // Business metrics
  makeCounterProvider({
    name: 'orders_created_total',
    help: 'Total number of orders created',
    labelNames: ['status'],
  }),
  makeCounterProvider({
    name: 'payments_processed_total',
    help: 'Total number of payments processed',
    labelNames: ['provider', 'status'],
  }),

  // ==========================================
  // Auth Metrics
  // ==========================================

  // Login attempts counter
  makeCounterProvider({
    name: 'auth_login_attempts_total',
    help: 'Total number of login attempts',
    labelNames: ['provider', 'app_id'],
  }),

  // Login success counter
  makeCounterProvider({
    name: 'auth_login_success_total',
    help: 'Total number of successful logins',
    labelNames: ['provider', 'app_id'],
  }),

  // Login failure counter
  makeCounterProvider({
    name: 'auth_login_failures_total',
    help: 'Total number of failed logins',
    labelNames: ['provider', 'app_id', 'reason'],
  }),

  // OTP metrics
  makeCounterProvider({
    name: 'auth_otp_sent_total',
    help: 'Total number of OTPs sent',
    labelNames: ['app_id'],
  }),

  makeCounterProvider({
    name: 'auth_otp_verified_total',
    help: 'Total number of OTP verifications',
    labelNames: ['app_id', 'status'],
  }),

  // Auth duration histogram
  makeHistogramProvider({
    name: 'auth_duration_seconds',
    help: 'Authentication operation duration in seconds',
    labelNames: ['operation'],
    buckets: [0.01, 0.05, 0.1, 0.25, 0.5, 1, 2, 5],
  }),

  // Active sessions gauge
  makeGaugeProvider({
    name: 'auth_active_sessions',
    help: 'Number of active user sessions',
    labelNames: ['app_id'],
  }),

  // ==========================================
  // Subscription Metrics
  // ==========================================

  // Subscription counter
  makeCounterProvider({
    name: 'subscriptions_created_total',
    help: 'Total number of subscriptions created',
    labelNames: ['provider', 'plan_id', 'app_id'],
  }),

  // Subscription status changes
  makeCounterProvider({
    name: 'subscriptions_status_changed_total',
    help: 'Total number of subscription status changes',
    labelNames: ['provider', 'from_status', 'to_status'],
  }),

  // Subscription cancellations
  makeCounterProvider({
    name: 'subscriptions_cancelled_total',
    help: 'Total number of subscriptions cancelled',
    labelNames: ['provider', 'reason'],
  }),

  // Active subscriptions gauge
  makeGaugeProvider({
    name: 'subscriptions_active',
    help: 'Number of active subscriptions',
    labelNames: ['provider', 'plan_id', 'app_id'],
  }),

  // Revenue counter (in paise)
  makeCounterProvider({
    name: 'subscriptions_revenue_total',
    help: 'Total subscription revenue in paise',
    labelNames: ['provider', 'type', 'app_id'],
  }),

  // Billing events
  makeCounterProvider({
    name: 'subscriptions_billing_events_total',
    help: 'Total number of billing events',
    labelNames: ['provider', 'status'],
  }),

  // Subscription duration histogram (days)
  makeHistogramProvider({
    name: 'subscriptions_duration_days',
    help: 'Subscription duration in days',
    labelNames: ['provider'],
    buckets: [1, 7, 30, 90, 180, 365, 730],
  }),
];
