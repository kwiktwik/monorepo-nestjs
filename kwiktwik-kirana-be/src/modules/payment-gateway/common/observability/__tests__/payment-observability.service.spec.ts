/**
 * Unit tests for Payment Observability Services
 */

import { describe, it, expect, beforeEach, vi } from '@jest/globals';
import {
  PaymentMetricsService,
  PaymentTracingService,
  PaymentLoggerService,
} from '../payment-observability.service';

describe('PaymentMetricsService', () => {
  let service: PaymentMetricsService;

  beforeEach(() => {
    service = new PaymentMetricsService();
  });

  describe('counters', () => {
    it('should create and increment counter', () => {
      const counter = service.createCounter(
        'test_counter',
        'Test counter description',
        ['label1', 'label2'],
      );

      counter.increment({ label1: 'value1', label2: 'value2' });
      counter.increment({ label1: 'value1', label2: 'value2' });

      const values = (counter as any).getValues();
      expect(values).toHaveLength(1);
      expect(values[0].value).toBe(2);
      expect(values[0].labels).toEqual({ label1: 'value1', label2: 'value2' });
    });

    it('should track different label combinations separately', () => {
      const counter = service.createCounter('test_counter', 'Test', ['status']);

      counter.increment({ status: 'success' });
      counter.increment({ status: 'success' });
      counter.increment({ status: 'failed' });

      const values = (counter as any).getValues();
      expect(values).toHaveLength(2);
      expect(values.find((v: any) => v.labels.status === 'success')?.value).toBe(2);
      expect(values.find((v: any) => v.labels.status === 'failed')?.value).toBe(1);
    });

    it('should increment without labels', () => {
      const counter = service.createCounter('test_counter', 'Test', []);

      counter.increment();
      counter.increment();

      const values = (counter as any).getValues();
      expect(values[0].value).toBe(2);
    });
  });

  describe('histograms', () => {
    it('should create and observe histogram values', () => {
      const histogram = service.createHistogram(
        'test_histogram',
        'Test histogram',
        ['operation'],
      );

      histogram.observe(100, { operation: 'create' });
      histogram.observe(200, { operation: 'create' });
      histogram.observe(150, { operation: 'create' });

      const values = (histogram as any).getValues();
      expect(values).toHaveLength(1);
      expect(values[0].count).toBe(3);
      expect(values[0].sum).toBe(450);
    });
  });

  describe('gauges', () => {
    it('should create and set gauge values', () => {
      const gauge = service.createGauge('test_gauge', 'Test gauge', ['provider']);

      gauge.set(5, { provider: 'razorpay' });
      gauge.set(10, { provider: 'phonepe' });

      const values = (gauge as any).getValues();
      expect(values).toHaveLength(2);
      expect(values.find((v: any) => v.labels.provider === 'razorpay')?.value).toBe(5);
      expect(values.find((v: any) => v.labels.provider === 'phonepe')?.value).toBe(10);
    });

    it('should increment and decrement gauge', () => {
      const gauge = service.createGauge('test_gauge', 'Test gauge', []);

      gauge.set(10);
      gauge.increment();
      gauge.increment();

      let values = (gauge as any).getValues();
      expect(values[0].value).toBe(12);

      gauge.decrement();

      values = (gauge as any).getValues();
      expect(values[0].value).toBe(11);
    });
  });

  describe('convenience methods', () => {
    it('should record subscription created', () => {
      service.recordSubscriptionCreated('RAZORPAY', 'app_123', 'USER_MANAGED');

      const summary = service.getMetricsSummary();
      const counterValues = summary.counters['payment_subscription_created_total'];

      expect(counterValues).toHaveLength(1);
      expect(counterValues[0].value).toBe(1);
    });

    it('should record subscription activated', () => {
      service.recordSubscriptionActivated('RAZORPAY', 'app_123');

      const summary = service.getMetricsSummary();
      const counterValues = summary.counters['payment_subscription_activated_total'];

      expect(counterValues).toHaveLength(1);
      expect(counterValues[0].value).toBe(1);
    });

    it('should record subscription cancelled', () => {
      service.recordSubscriptionCancelled('RAZORPAY', 'app_123', 'user_request');

      const summary = service.getMetricsSummary();
      const counterValues = summary.counters['payment_subscription_cancelled_total'];

      expect(counterValues).toHaveLength(1);
      expect(counterValues[0].value).toBe(1);
    });

    it('should record payment', () => {
      service.recordPayment('RAZORPAY', 'success', 'app_123', 10000, 'INR');

      const summary = service.getMetricsSummary();

      const paymentTotal = summary.counters['payment_total'];
      expect(paymentTotal).toHaveLength(1);
      expect(paymentTotal[0].value).toBe(1);

      const paymentAmount = summary.histograms['payment_amount'];
      expect(paymentAmount).toHaveLength(1);
      expect(paymentAmount[0].sum).toBe(10000);
    });

    it('should record webhook received', () => {
      service.recordWebhookReceived('RAZORPAY', 'payment.captured');

      const summary = service.getMetricsSummary();
      const counterValues = summary.counters['payment_webhook_received_total'];

      expect(counterValues).toHaveLength(1);
      expect(counterValues[0].value).toBe(1);
    });

    it('should record webhook processed', () => {
      service.recordWebhookProcessed('RAZORPAY', 'payment.captured', 'success', 150);

      const summary = service.getMetricsSummary();

      const processed = summary.counters['payment_webhook_processed_total'];
      expect(processed).toHaveLength(1);
      expect(processed[0].value).toBe(1);

      const latency = summary.histograms['payment_webhook_latency_seconds'];
      expect(latency).toHaveLength(1);
      expect(latency[0].sum).toBe(0.15); // 150ms = 0.15s
    });

    it('should record provider error', () => {
      service.recordProviderError('RAZORPAY', 'INVALID_REQUEST', 'create_subscription');

      const summary = service.getMetricsSummary();
      const counterValues = summary.counters['payment_provider_error_total'];

      expect(counterValues).toHaveLength(1);
      expect(counterValues[0].value).toBe(1);
    });

    it('should set provider health', () => {
      service.setProviderHealth('RAZORPAY', true);
      service.setProviderHealth('PHONEPE', false);

      const summary = service.getMetricsSummary();
      const gaugeValues = summary.gauges['payment_provider_health'];

      expect(gaugeValues).toHaveLength(2);
      expect(gaugeValues.find((v: any) => v.labels.provider === 'RAZORPAY')?.value).toBe(1);
      expect(gaugeValues.find((v: any) => v.labels.provider === 'PHONEPE')?.value).toBe(0);
    });
  });

  describe('getMetricsSummary', () => {
    it('should return complete metrics summary', () => {
      service.recordPayment('RAZORPAY', 'success', 'app_123', 5000, 'INR');
      service.recordWebhookReceived('RAZORPAY', 'payment.captured');

      const summary = service.getMetricsSummary();

      expect(summary.counters).toBeDefined();
      expect(summary.histograms).toBeDefined();
      expect(summary.gauges).toBeDefined();
    });
  });

  describe('getCounter/getHistogram/getGauge', () => {
    it('should retrieve existing metrics', () => {
      const counter = service.getCounter('payment_total');
      const histogram = service.getHistogram('payment_amount');
      const gauge = service.getGauge('payment_provider_health');

      expect(counter).toBeDefined();
      expect(histogram).toBeDefined();
      expect(gauge).toBeDefined();
    });

    it('should return undefined for non-existent metrics', () => {
      const counter = service.getCounter('nonexistent');
      expect(counter).toBeUndefined();
    });
  });
});

describe('PaymentTracingService', () => {
  let service: PaymentTracingService;

  beforeEach(() => {
    service = new PaymentTracingService();
  });

  describe('startSpan', () => {
    it('should start a new span with unique ID', () => {
      const spanId = service.startSpan('test-operation');

      expect(spanId).toBeDefined();
      expect(spanId.length).toBeGreaterThan(0);

      const spans = service.getActiveSpans();
      expect(spans).toHaveLength(1);
      expect(spans[0].name).toBe('test-operation');
    });

    it('should start span with parent span', () => {
      const parentSpanId = service.startSpan('parent-operation');
      const childSpanId = service.startSpan('child-operation', parentSpanId);

      const spans = service.getActiveSpans();
      const childSpan = spans.find((s) => s.spanId === childSpanId);

      expect(childSpan?.parentSpanId).toBe(parentSpanId);
      expect(childSpan?.traceId).toBe(
        spans.find((s) => s.spanId === parentSpanId)?.traceId,
      );
    });

    it('should start span with attributes', () => {
      const spanId = service.startSpan('test-operation', undefined, {
        userId: 'user_123',
        appId: 'app_456',
      });

      const spans = service.getActiveSpans();
      const span = spans.find((s) => s.spanId === spanId);

      expect(span?.attributes).toEqual({
        userId: 'user_123',
        appId: 'app_456',
      });
    });
  });

  describe('addAttribute', () => {
    it('should add attribute to span', () => {
      const spanId = service.startSpan('test-operation');

      service.addAttribute(spanId, 'key', 'value');

      const spans = service.getActiveSpans();
      expect(spans[0].attributes.key).toBe('value');
    });

    it('should not fail for non-existent span', () => {
      expect(() => {
        service.addAttribute('nonexistent', 'key', 'value');
      }).not.toThrow();
    });
  });

  describe('addEvent', () => {
    it('should add event to span', () => {
      const spanId = service.startSpan('test-operation');

      service.addEvent(spanId, 'event_name', { detail: 'some detail' });

      const spans = service.getActiveSpans();
      expect(spans[0].events).toHaveLength(1);
      expect(spans[0].events[0].name).toBe('event_name');
    });
  });

  describe('endSpan', () => {
    it('should end span and return it', () => {
      const spanId = service.startSpan('test-operation');

      const completedSpan = service.endSpan(spanId);

      expect(completedSpan).toBeDefined();
      expect(completedSpan?.endTime).toBeDefined();
      expect(service.getActiveSpans()).toHaveLength(0);
    });

    it('should return null for non-existent span', () => {
      const result = service.endSpan('nonexistent');
      expect(result).toBeNull();
    });
  });

  describe('withSpan', () => {
    it('should execute function within span', async () => {
      const result = await service.withSpan('test-operation', async (spanId) => {
        service.addAttribute(spanId, 'custom', 'value');
        return 'success';
      });

      expect(result).toBe('success');
      expect(service.getActiveSpans()).toHaveLength(0);
    });

    it('should capture errors in span', async () => {
      await expect(
        service.withSpan('test-operation', async () => {
          throw new Error('Test error');
        }),
      ).rejects.toThrow('Test error');

      // Span should still be ended
      expect(service.getActiveSpans()).toHaveLength(0);
    });
  });
});

describe('PaymentLoggerService', () => {
  let service: PaymentLoggerService;

  beforeEach(() => {
    service = new PaymentLoggerService();
  });

  describe('log methods', () => {
    it('should log debug message without throwing', () => {
      expect(() => {
        service.debug('Test debug message', { userId: 'user_123' });
      }).not.toThrow();
    });

    it('should log info message without throwing', () => {
      expect(() => {
        service.log('Test info message', { appId: 'app_123' });
      }).not.toThrow();
    });

    it('should log warning message without throwing', () => {
      expect(() => {
        service.warn('Test warning message');
      }).not.toThrow();
    });

    it('should log error message without throwing', () => {
      const error = new Error('Test error');
      expect(() => {
        service.error('Test error message', error, { operation: 'test' });
      }).not.toThrow();
    });

    it('should log error message without error object', () => {
      expect(() => {
        service.error('Test error message', undefined, { operation: 'test' });
      }).not.toThrow();
    });
  });
});
