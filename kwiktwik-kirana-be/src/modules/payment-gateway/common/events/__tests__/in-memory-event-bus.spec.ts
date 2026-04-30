/**
 * Unit tests for InMemoryEventBus
 */

import { describe, it, expect, beforeEach, vi, afterEach } from '@jest/globals';
import { InMemoryEventBus } from '../in-memory-event-bus';
import {
  PaymentEvent,
  PaymentEventTypes,
  createPaymentEvent,
  generateCorrelationId,
} from '../event-bus.interface';

describe('InMemoryEventBus', () => {
  let eventBus: InMemoryEventBus;

  beforeEach(() => {
    eventBus = new InMemoryEventBus();
  });

  afterEach(() => {
    eventBus.onModuleDestroy();
  });

  describe('publish', () => {
    it('should publish event to all registered handlers', async () => {
      const handler1 = jest.fn();
      const handler2 = jest.fn();

      eventBus.subscribe({ eventType: 'test.event', handler: handler1 });
      eventBus.subscribe({ eventType: 'test.event', handler: handler2 });

      const event: PaymentEvent<{ value: string }> = {
        eventId: 'evt_123',
        eventType: 'test.event',
        version: 1,
        timestamp: new Date(),
        payload: { value: 'test' },
        metadata: {
          correlationId: 'corr_123',
          source: 'test',
          timestamp: new Date(),
          appId: 'test-app',
        },
      };

      await eventBus.publish(event);

      expect(handler1).toHaveBeenCalledTimes(1);
      expect(handler1).toHaveBeenCalledWith(event);
      expect(handler2).toHaveBeenCalledTimes(1);
      expect(handler2).toHaveBeenCalledWith(event);
    });

    it('should not call handlers for different event types', async () => {
      const handler = jest.fn();

      eventBus.subscribe({ eventType: 'test.event', handler });

      const event: PaymentEvent = {
        eventId: 'evt_123',
        eventType: 'different.event',
        version: 1,
        timestamp: new Date(),
        payload: {},
        metadata: {
          correlationId: 'corr_123',
          source: 'test',
          timestamp: new Date(),
          appId: 'test-app',
        },
      };

      await eventBus.publish(event);

      expect(handler).not.toHaveBeenCalled();
    });

    it('should handle async handlers', async () => {
      const handler = jest.fn().mockImplementation(async () => {
        await new Promise((resolve) => setTimeout(resolve, 10));
      });

      eventBus.subscribe({ eventType: 'test.event', handler });

      const event: PaymentEvent = {
        eventId: 'evt_123',
        eventType: 'test.event',
        version: 1,
        timestamp: new Date(),
        payload: {},
        metadata: {
          correlationId: 'corr_123',
          source: 'test',
          timestamp: new Date(),
          appId: 'test-app',
        },
      };

      await eventBus.publish(event);

      expect(handler).toHaveBeenCalledTimes(1);
    });

    it('should continue execution even if one handler fails', async () => {
      const failingHandler = jest.fn().mockRejectedValue(new Error('Handler failed'));
      const successHandler = jest.fn();

      eventBus.subscribe({ eventType: 'test.event', handler: failingHandler });
      eventBus.subscribe({ eventType: 'test.event', handler: successHandler });

      const event: PaymentEvent = {
        eventId: 'evt_123',
        eventType: 'test.event',
        version: 1,
        timestamp: new Date(),
        payload: {},
        metadata: {
          correlationId: 'corr_123',
          source: 'test',
          timestamp: new Date(),
          appId: 'test-app',
        },
      };

      await eventBus.publish(event);

      expect(failingHandler).toHaveBeenCalledTimes(1);
      expect(successHandler).toHaveBeenCalledTimes(1);
    });

    it('should execute handlers in priority order', async () => {
      const executionOrder: number[] = [];

      const handler1 = jest.fn().mockImplementation(() => executionOrder.push(1));
      const handler2 = jest.fn().mockImplementation(() => executionOrder.push(2));
      const handler3 = jest.fn().mockImplementation(() => executionOrder.push(3));

      eventBus.subscribe({ eventType: 'test.event', handler: handler1, priority: 1 });
      eventBus.subscribe({ eventType: 'test.event', handler: handler2, priority: 10 });
      eventBus.subscribe({ eventType: 'test.event', handler: handler3, priority: 5 });

      const event: PaymentEvent = {
        eventId: 'evt_123',
        eventType: 'test.event',
        version: 1,
        timestamp: new Date(),
        payload: {},
        metadata: {
          correlationId: 'corr_123',
          source: 'test',
          timestamp: new Date(),
          appId: 'test-app',
        },
      };

      await eventBus.publish(event);

      // Higher priority should execute first
      expect(executionOrder).toEqual([2, 3, 1]);
    });

    it('should not publish events when shutting down', async () => {
      const handler = jest.fn();

      eventBus.subscribe({ eventType: 'test.event', handler });

      eventBus.onModuleDestroy();

      const event: PaymentEvent = {
        eventId: 'evt_123',
        eventType: 'test.event',
        version: 1,
        timestamp: new Date(),
        payload: {},
        metadata: {
          correlationId: 'corr_123',
          source: 'test',
          timestamp: new Date(),
          appId: 'test-app',
        },
      };

      await eventBus.publish(event);

      expect(handler).not.toHaveBeenCalled();
    });
  });

  describe('subscribe', () => {
    it('should return an unsubscribe function', async () => {
      const handler = jest.fn();

      const unsubscribe = eventBus.subscribe({ eventType: 'test.event', handler });

      const event: PaymentEvent = {
        eventId: 'evt_123',
        eventType: 'test.event',
        version: 1,
        timestamp: new Date(),
        payload: {},
        metadata: {
          correlationId: 'corr_123',
          source: 'test',
          timestamp: new Date(),
          appId: 'test-app',
        },
      };

      await eventBus.publish(event);
      expect(handler).toHaveBeenCalledTimes(1);

      unsubscribe();

      await eventBus.publish(event);
      expect(handler).toHaveBeenCalledTimes(1); // Should not increase
    });

    it('should track subscriptions correctly', () => {
      const handler = jest.fn();

      eventBus.subscribe({ eventType: 'test.event', handler });
      eventBus.subscribe({ eventType: 'test.event2', handler });

      const stats = eventBus.getStats();

      expect(stats.totalSubscriptions).toBe(2);
      expect(stats.eventTypes).toBe(2);
    });
  });

  describe('subscribeToAll', () => {
    it('should subscribe to multiple event types', async () => {
      const handler = jest.fn();

      eventBus.subscribeToAll(['event1', 'event2', 'event3'], handler);

      const event1: PaymentEvent = {
        eventId: 'evt_1',
        eventType: 'event1',
        version: 1,
        timestamp: new Date(),
        payload: {},
        metadata: {
          correlationId: 'corr_123',
          source: 'test',
          timestamp: new Date(),
          appId: 'test-app',
        },
      };

      const event2: PaymentEvent = {
        eventId: 'evt_2',
        eventType: 'event2',
        version: 1,
        timestamp: new Date(),
        payload: {},
        metadata: {
          correlationId: 'corr_123',
          source: 'test',
          timestamp: new Date(),
          appId: 'test-app',
        },
      };

      await eventBus.publish(event1);
      await eventBus.publish(event2);

      expect(handler).toHaveBeenCalledTimes(2);
    });

    it('should return an unsubscribe function that removes all subscriptions', async () => {
      const handler = jest.fn();

      const unsubscribe = eventBus.subscribeToAll(['event1', 'event2'], handler);

      const event: PaymentEvent = {
        eventId: 'evt_1',
        eventType: 'event1',
        version: 1,
        timestamp: new Date(),
        payload: {},
        metadata: {
          correlationId: 'corr_123',
          source: 'test',
          timestamp: new Date(),
          appId: 'test-app',
        },
      };

      await eventBus.publish(event);
      expect(handler).toHaveBeenCalledTimes(1);

      unsubscribe();

      await eventBus.publish(event);
      expect(handler).toHaveBeenCalledTimes(1); // Should not increase
    });
  });

  describe('getHandlers', () => {
    it('should return all handlers for an event type', () => {
      const handler1 = jest.fn();
      const handler2 = jest.fn();

      eventBus.subscribe({ eventType: 'test.event', handler: handler1 });
      eventBus.subscribe({ eventType: 'test.event', handler: handler2, priority: 5 });

      const handlers = eventBus.getHandlers('test.event');

      expect(handlers).toHaveLength(2);
      expect(handlers[0].eventType).toBe('test.event');
      expect(handlers[1].priority).toBe(5);
    });

    it('should return empty array for unregistered event type', () => {
      const handlers = eventBus.getHandlers('nonexistent.event');

      expect(handlers).toHaveLength(0);
    });
  });

  describe('healthCheck', () => {
    it('should return healthy status', async () => {
      const result = await eventBus.healthCheck();

      expect(result.healthy).toBe(true);
      expect(result.message).toContain('healthy');
    });

    it('should return unhealthy status after shutdown', async () => {
      eventBus.onModuleDestroy();

      const result = await eventBus.healthCheck();

      expect(result.healthy).toBe(false);
    });
  });

  describe('getStats', () => {
    it('should return correct statistics', () => {
      const handler = jest.fn();

      eventBus.subscribe({ eventType: 'event1', handler });
      eventBus.subscribe({ eventType: 'event1', handler });
      eventBus.subscribe({ eventType: 'event2', handler });

      const stats = eventBus.getStats();

      expect(stats.totalSubscriptions).toBe(3);
      expect(stats.eventTypes).toBe(2);
      expect(stats.subscriptionsByType['event1']).toBe(2);
      expect(stats.subscriptionsByType['event2']).toBe(1);
    });
  });
});

describe('Event Bus Helper Functions', () => {
  describe('createPaymentEvent', () => {
    it('should create a valid payment event', () => {
      const payload = { subscriptionId: 'sub_123' };
      const metadata = {
        correlationId: 'corr_123',
        source: 'test',
        timestamp: new Date(),
        appId: 'test-app',
      };

      const event = createPaymentEvent(
        PaymentEventTypes.SUBSCRIPTION_CREATED,
        payload,
        metadata,
      );

      expect(event.eventType).toBe(PaymentEventTypes.SUBSCRIPTION_CREATED);
      expect(event.version).toBe(1);
      expect(event.payload).toBe(payload);
      expect(event.metadata).toBe(metadata);
      expect(event.eventId).toMatch(/^evt_/);
      expect(event.timestamp).toBeInstanceOf(Date);
    });

    it('should use provided event ID', () => {
      const event = createPaymentEvent(
        'test.event',
        {},
        {
          correlationId: 'corr_123',
          source: 'test',
          timestamp: new Date(),
          appId: 'test-app',
        },
        'custom_event_id',
      );

      expect(event.eventId).toBe('custom_event_id');
    });
  });

  describe('generateCorrelationId', () => {
    it('should generate unique correlation IDs', () => {
      const id1 = generateCorrelationId();
      const id2 = generateCorrelationId();

      expect(id1).toMatch(/^corr_/);
      expect(id2).toMatch(/^corr_/);
      expect(id1).not.toBe(id2);
    });
  });
});

describe('PaymentEventTypes', () => {
  it('should have all expected event types', () => {
    expect(PaymentEventTypes.SUBSCRIPTION_CREATED).toBe('payment.subscription.created');
    expect(PaymentEventTypes.SUBSCRIPTION_ACTIVATED).toBe('payment.subscription.activated');
    expect(PaymentEventTypes.SUBSCRIPTION_CANCELLED).toBe('payment.subscription.cancelled');
    expect(PaymentEventTypes.PAYMENT_SUCCESSFUL).toBe('payment.payment.successful');
    expect(PaymentEventTypes.PAYMENT_FAILED).toBe('payment.payment.failed');
    expect(PaymentEventTypes.WEBHOOK_RECEIVED).toBe('payment.webhook.received');
  });
});
