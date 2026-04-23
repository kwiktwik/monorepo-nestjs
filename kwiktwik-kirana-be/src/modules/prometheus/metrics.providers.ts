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
    labelNames: ['method', 'route', 'status_code'],
  }),

  // HTTP request duration histogram
  makeHistogramProvider({
    name: 'http_request_duration_seconds',
    help: 'HTTP request duration in seconds',
    labelNames: ['method', 'route'],
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
];
