/**
 * Payment Observability Service
 * 
 * Provides metrics, tracing, and structured logging for the payments module.
 * Designed to be extensible for Prometheus, OpenTelemetry, etc.
 */

import { Injectable, Logger } from '@nestjs/common';

// ============================================================================
// Metrics Types
// ============================================================================

/**
 * Counter metric
 */
export interface CounterMetric {
  readonly name: string;
  readonly help: string;
  readonly labels: readonly string[];
  increment(labels?: Record<string, string | number>): void;
}

/**
 * Histogram metric
 */
export interface HistogramMetric {
  readonly name: string;
  readonly help: string;
  readonly labels: readonly string[];
  observe(value: number, labels?: Record<string, string | number>): void;
}

/**
 * Gauge metric
 */
export interface GaugeMetric {
  readonly name: string;
  readonly help: string;
  readonly labels: readonly string[];
  set(value: number, labels?: Record<string, string | number>): void;
  increment(labels?: Record<string, string | number>): void;
  decrement(labels?: Record<string, string | number>): void;
}

/**
 * Metrics summary
 */
export interface MetricsSummary {
  readonly counters: Record<string, { value: number; labels: Record<string, string> }[]>;
  readonly histograms: Record<string, { count: number; sum: number; labels: Record<string, string> }[]>;
  readonly gauges: Record<string, { value: number; labels: Record<string, string> }[]>;
}

// ============================================================================
// In-Memory Metrics Implementation
// ============================================================================

/**
 * In-memory counter implementation
 */
class InMemoryCounter implements CounterMetric {
  private values: Map<string, number> = new Map();

  constructor(
    public readonly name: string,
    public readonly help: string,
    public readonly labels: readonly string[],
  ) {}

  private labelKey(labels?: Record<string, string | number>): string {
    if (!labels) return '{}';
    return JSON.stringify(
      this.labels.reduce((acc, l) => {
        acc[l] = labels[l]?.toString() ?? '';
        return acc;
      }, {} as Record<string, string>),
    );
  }

  increment(labels?: Record<string, string | number>): void {
    const key = this.labelKey(labels);
    const current = this.values.get(key) ?? 0;
    this.values.set(key, current + 1);
  }

  getValues(): { value: number; labels: Record<string, string> }[] {
    return [...this.values.entries()].map(([key, value]) => ({
      value,
      labels: JSON.parse(key),
    }));
  }
}

/**
 * In-memory histogram implementation
 */
class InMemoryHistogram implements HistogramMetric {
  private values: Map<string, { count: number; sum: number }> = new Map();

  constructor(
    public readonly name: string,
    public readonly help: string,
    public readonly labels: readonly string[],
  ) {}

  private labelKey(labels?: Record<string, string | number>): string {
    if (!labels) return '{}';
    return JSON.stringify(
      this.labels.reduce((acc, l) => {
        acc[l] = labels[l]?.toString() ?? '';
        return acc;
      }, {} as Record<string, string>),
    );
  }

  observe(value: number, labels?: Record<string, string | number>): void {
    const key = this.labelKey(labels);
    const current = this.values.get(key) ?? { count: 0, sum: 0 };
    this.values.set(key, {
      count: current.count + 1,
      sum: current.sum + value,
    });
  }

  getValues(): { count: number; sum: number; labels: Record<string, string> }[] {
    return [...this.values.entries()].map(([key, value]) => ({
      ...value,
      labels: JSON.parse(key),
    }));
  }
}

/**
 * In-memory gauge implementation
 */
class InMemoryGauge implements GaugeMetric {
  private values: Map<string, number> = new Map();

  constructor(
    public readonly name: string,
    public readonly help: string,
    public readonly labels: readonly string[],
  ) {}

  private labelKey(labels?: Record<string, string | number>): string {
    if (!labels) return '{}';
    return JSON.stringify(
      this.labels.reduce((acc, l) => {
        acc[l] = labels[l]?.toString() ?? '';
        return acc;
      }, {} as Record<string, string>),
    );
  }

  set(value: number, labels?: Record<string, string | number>): void {
    const key = this.labelKey(labels);
    this.values.set(key, value);
  }

  increment(labels?: Record<string, string | number>): void {
    const key = this.labelKey(labels);
    const current = this.values.get(key) ?? 0;
    this.values.set(key, current + 1);
  }

  decrement(labels?: Record<string, string | number>): void {
    const key = this.labelKey(labels);
    const current = this.values.get(key) ?? 0;
    this.values.set(key, current - 1);
  }

  getValues(): { value: number; labels: Record<string, string> }[] {
    return [...this.values.entries()].map(([key, value]) => ({
      value,
      labels: JSON.parse(key),
    }));
  }
}

// ============================================================================
// Payment Metrics Service
// ============================================================================

/**
 * Payment metrics service
 * 
 * Provides metrics collection for payment operations.
 */
@Injectable()
export class PaymentMetricsService {
  private readonly logger = new Logger(PaymentMetricsService.name);
  
  // Metrics registries
  private readonly counters: Map<string, InMemoryCounter> = new Map();
  private readonly histograms: Map<string, InMemoryHistogram> = new Map();
  private readonly gauges: Map<string, InMemoryGauge> = new Map();

  constructor() {
    // Initialize default metrics
    this.initializeDefaultMetrics();
  }

  /**
   * Initialize default payment metrics
   */
  private initializeDefaultMetrics(): void {
    // Subscription metrics
    this.createCounter(
      'payment_subscription_created_total',
      'Total subscriptions created',
      ['provider', 'app_id', 'subscription_type'],
    );

    this.createCounter(
      'payment_subscription_activated_total',
      'Total subscriptions activated',
      ['provider', 'app_id'],
    );

    this.createCounter(
      'payment_subscription_cancelled_total',
      'Total subscriptions cancelled',
      ['provider', 'app_id', 'reason'],
    );

    this.createCounter(
      'payment_subscription_expired_total',
      'Total subscriptions expired',
      ['provider', 'app_id'],
    );

    // Payment metrics
    this.createCounter(
      'payment_total',
      'Total payments processed',
      ['provider', 'status', 'app_id'],
    );

    this.createHistogram(
      'payment_amount',
      'Payment amount distribution',
      ['provider', 'app_id', 'currency'],
    );

    this.createHistogram(
      'payment_latency_seconds',
      'Payment processing latency',
      ['provider', 'operation'],
    );

    // Webhook metrics
    this.createCounter(
      'payment_webhook_received_total',
      'Total webhooks received',
      ['provider', 'event_type'],
    );

    this.createCounter(
      'payment_webhook_processed_total',
      'Total webhooks processed',
      ['provider', 'event_type', 'status'],
    );

    this.createHistogram(
      'payment_webhook_latency_seconds',
      'Webhook processing latency',
      ['provider', 'event_type'],
    );

    // Provider metrics
    this.createCounter(
      'payment_provider_error_total',
      'Total provider errors',
      ['provider', 'error_code', 'operation'],
    );

    this.createGauge(
      'payment_provider_health',
      'Provider health status (1 = healthy, 0 = unhealthy)',
      ['provider'],
    );
  }

  /**
   * Create a counter metric
   */
  createCounter(
    name: string,
    help: string,
    labels: readonly string[],
  ): CounterMetric {
    const counter = new InMemoryCounter(name, help, labels);
    this.counters.set(name, counter);
    return counter;
  }

  /**
   * Create a histogram metric
   */
  createHistogram(
    name: string,
    help: string,
    labels: readonly string[],
  ): HistogramMetric {
    const histogram = new InMemoryHistogram(name, help, labels);
    this.histograms.set(name, histogram);
    return histogram;
  }

  /**
   * Create a gauge metric
   */
  createGauge(
    name: string,
    help: string,
    labels: readonly string[],
  ): GaugeMetric {
    const gauge = new InMemoryGauge(name, help, labels);
    this.gauges.set(name, gauge);
    return gauge;
  }

  /**
   * Get a counter by name
   */
  getCounter(name: string): CounterMetric | undefined {
    return this.counters.get(name);
  }

  /**
   * Get a histogram by name
   */
  getHistogram(name: string): HistogramMetric | undefined {
    return this.histograms.get(name);
  }

  /**
   * Get a gauge by name
   */
  getGauge(name: string): GaugeMetric | undefined {
    return this.gauges.get(name);
  }

  // ============================================================================
  // Convenience Methods
  // ============================================================================

  /**
   * Record subscription created
   */
  recordSubscriptionCreated(
    provider: string,
    appId: string,
    subscriptionType: string,
  ): void {
    this.counters.get('payment_subscription_created_total')?.increment({
      provider,
      app_id: appId,
      subscription_type: subscriptionType,
    });
  }

  /**
   * Record subscription activated
   */
  recordSubscriptionActivated(provider: string, appId: string): void {
    this.counters.get('payment_subscription_activated_total')?.increment({
      provider,
      app_id: appId,
    });
  }

  /**
   * Record subscription cancelled
   */
  recordSubscriptionCancelled(
    provider: string,
    appId: string,
    reason: string,
  ): void {
    this.counters.get('payment_subscription_cancelled_total')?.increment({
      provider,
      app_id: appId,
      reason,
    });
  }

  /**
   * Record payment
   */
  recordPayment(
    provider: string,
    status: string,
    appId: string,
    amount: number,
    currency: string,
  ): void {
    this.counters.get('payment_total')?.increment({
      provider,
      status,
      app_id: appId,
    });

    this.histograms.get('payment_amount')?.observe(amount, {
      provider,
      app_id: appId,
      currency,
    });
  }

  /**
   * Record webhook received
   */
  recordWebhookReceived(provider: string, eventType: string): void {
    this.counters.get('payment_webhook_received_total')?.increment({
      provider,
      event_type: eventType,
    });
  }

  /**
   * Record webhook processed
   */
  recordWebhookProcessed(
    provider: string,
    eventType: string,
    status: 'success' | 'failed' | 'duplicate',
    latencyMs: number,
  ): void {
    this.counters.get('payment_webhook_processed_total')?.increment({
      provider,
      event_type: eventType,
      status,
    });

    this.histograms.get('payment_webhook_latency_seconds')?.observe(
      latencyMs / 1000,
      { provider, event_type: eventType },
    );
  }

  /**
   * Record provider error
   */
  recordProviderError(
    provider: string,
    errorCode: string,
    operation: string,
  ): void {
    this.counters.get('payment_provider_error_total')?.increment({
      provider,
      error_code: errorCode,
      operation,
    });
  }

  /**
   * Set provider health status
   */
  setProviderHealth(provider: string, healthy: boolean): void {
    this.gauges.get('payment_provider_health')?.set(healthy ? 1 : 0, {
      provider,
    });
  }

  /**
   * Get metrics summary
   */
  getMetricsSummary(): MetricsSummary {
    return {
      counters: Object.fromEntries(
        [...this.counters.entries()].map(([name, counter]) => [
          name,
          counter.getValues(),
        ]),
      ),
      histograms: Object.fromEntries(
        [...this.histograms.entries()].map(([name, histogram]) => [
          name,
          histogram.getValues(),
        ]),
      ),
      gauges: Object.fromEntries(
        [...this.gauges.entries()].map(([name, gauge]) => [
          name,
          gauge.getValues(),
        ]),
      ),
    };
  }
}

// ============================================================================
// Payment Tracing Service
// ============================================================================

/**
 * Span context for tracing
 */
export interface SpanContext {
  readonly traceId: string;
  readonly spanId: string;
  readonly parentSpanId?: string;
  readonly name: string;
  readonly startTime: Date;
  readonly endTime?: Date;
  readonly attributes: Record<string, string | number | boolean>;
  readonly events: { timestamp: Date; name: string; attributes: Record<string, unknown> }[];
}

/**
 * Payment tracing service
 * 
 * Provides distributed tracing for payment operations.
 */
@Injectable()
export class PaymentTracingService {
  private readonly logger = new Logger(PaymentTracingService.name);
  private readonly activeSpans: Map<string, SpanContext> = new Map();

  /**
   * Start a new span
   */
  startSpan(
    name: string,
    parentSpanId?: string,
    attributes?: Record<string, string | number | boolean>,
  ): string {
    const spanId = this.generateId();
    const traceId = parentSpanId
      ? this.activeSpans.get(parentSpanId)?.traceId ?? this.generateId()
      : this.generateId();

    const span: SpanContext = {
      traceId,
      spanId,
      parentSpanId,
      name,
      startTime: new Date(),
      attributes: attributes ?? {},
      events: [],
    };

    this.activeSpans.set(spanId, span);
    return spanId;
  }

  /**
   * Add attribute to span
   */
  addAttribute(
    spanId: string,
    key: string,
    value: string | number | boolean,
  ): void {
    const span = this.activeSpans.get(spanId);
    if (span) {
      this.activeSpans.set(spanId, {
        ...span,
        attributes: { ...span.attributes, [key]: value },
      });
    }
  }

  /**
   * Add event to span
   */
  addEvent(
    spanId: string,
    name: string,
    attributes?: Record<string, unknown>,
  ): void {
    const span = this.activeSpans.get(spanId);
    if (span) {
      this.activeSpans.set(spanId, {
        ...span,
        events: [
          ...span.events,
          { timestamp: new Date(), name, attributes: attributes ?? {} },
        ],
      });
    }
  }

  /**
   * End a span
   */
  endSpan(spanId: string): SpanContext | null {
    const span = this.activeSpans.get(spanId);
    if (!span) return null;

    const completedSpan: SpanContext = {
      ...span,
      endTime: new Date(),
    };

    this.activeSpans.delete(spanId);

    // Log completed span
    const durationMs = completedSpan.endTime!.getTime() - span.startTime.getTime();
    this.logger.debug({
      message: `Span completed: ${span.name}`,
      traceId: span.traceId,
      spanId: span.spanId,
      durationMs,
      attributes: span.attributes,
    });

    return completedSpan;
  }

  /**
   * Execute a function within a span
   */
  async withSpan<T>(
    name: string,
    fn: (spanId: string) => Promise<T>,
    attributes?: Record<string, string | number | boolean>,
  ): Promise<T> {
    const spanId = this.startSpan(name, undefined, attributes);
    try {
      const result = await fn(spanId);
      this.addAttribute(spanId, 'status', 'ok');
      return result;
    } catch (error) {
      this.addAttribute(spanId, 'status', 'error');
      this.addAttribute(
        spanId,
        'error.message',
        error instanceof Error ? error.message : 'Unknown error',
      );
      throw error;
    } finally {
      this.endSpan(spanId);
    }
  }

  /**
   * Get active spans
   */
  getActiveSpans(): SpanContext[] {
    return [...this.activeSpans.values()];
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return Math.random().toString(36).substring(2, 18);
  }
}

// ============================================================================
// Payment Logger Service
// ============================================================================

/**
 * Structured log entry
 */
export interface StructuredLogEntry {
  readonly timestamp: string;
  readonly level: 'debug' | 'log' | 'warn' | 'error';
  readonly message: string;
  readonly context: string;
  readonly traceId?: string;
  readonly spanId?: string;
  readonly [key: string]: unknown;
}

/**
 * Payment logger service
 * 
 * Provides structured logging for payment operations.
 */
@Injectable()
export class PaymentLoggerService {
  private readonly logger = new Logger('Payment');

  /**
   * Log debug message
   */
  debug(message: string, context?: Record<string, unknown>): void {
    this.logger.debug(this.formatEntry('debug', message, context));
  }

  /**
   * Log info message
   */
  log(message: string, context?: Record<string, unknown>): void {
    this.logger.log(this.formatEntry('log', message, context));
  }

  /**
   * Log warning message
   */
  warn(message: string, context?: Record<string, unknown>): void {
    this.logger.warn(this.formatEntry('warn', message, context));
  }

  /**
   * Log error message
   */
  error(message: string, error?: Error, context?: Record<string, unknown>): void {
    const entry = this.formatEntry('error', message, {
      ...context,
      error: error
        ? {
            message: error.message,
            stack: error.stack,
            name: error.name,
          }
        : undefined,
    });
    this.logger.error(entry);
  }

  /**
   * Format log entry
   */
  private formatEntry(
    level: 'debug' | 'log' | 'warn' | 'error',
    message: string,
    context?: Record<string, unknown>,
  ): string {
    const entry: StructuredLogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context: 'Payment',
      ...context,
    };
    return JSON.stringify(entry);
  }
}
