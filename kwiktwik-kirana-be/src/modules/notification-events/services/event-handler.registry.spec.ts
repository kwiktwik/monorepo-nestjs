import { Test, TestingModule } from '@nestjs/testing';
import { EventHandlerRegistry, HandlerResult } from './event-handler.registry';
import { EventEnvelope } from '../types/notification-event.types';
import { DefaultEventHandler } from './handlers/default.handler';
import { PaymentReceivedHandler } from './handlers/payment-received.handler';
import { OrderCompletedHandler } from './handlers/order-completed.handler';

describe('EventHandlerRegistry', () => {
  let registry: EventHandlerRegistry;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EventHandlerRegistry],
    }).compile();

    registry = module.get<EventHandlerRegistry>(EventHandlerRegistry);
  });

  it('should be defined', () => {
    expect(registry).toBeDefined();
  });

  describe('register', () => {
    it('should register a handler', () => {
      const handler = new DefaultEventHandler();
      registry.register(handler);

      expect(registry.hasHandler('*')).toBe(true);
      expect(registry.getRegisteredTypes()).toContain('*');
    });
  });

  describe('getHandler', () => {
    it('should return registered handler', () => {
      const handler = new PaymentReceivedHandler();
      registry.register(handler);

      const found = registry.getHandler('payment.received');
      expect(found).toBeDefined();
      expect(found?.eventType).toBe('payment.received');
    });

    it('should return default handler for unknown event type', () => {
      const defaultHandler = new DefaultEventHandler();
      registry.setDefaultHandler(defaultHandler);

      const found = registry.getHandler('unknown.event');
      expect(found).toBeDefined();
      expect(found?.eventType).toBe('*');
    });

    it('should return undefined if no handler and no default', () => {
      const found = registry.getHandler('unknown.event');
      expect(found).toBeUndefined();
    });
  });

  describe('processEvent', () => {
    it('should process event with registered handler', async () => {
      registry.register(new PaymentReceivedHandler());

      const envelope: EventEnvelope = {
        eventId: 'test-123',
        userId: 'user-123',
        eventType: 'payment.received',
        payload: { amount: 100, currency: 'INR' },
        channels: [],
        createdAt: new Date(),
      };

      const result: HandlerResult = await registry.processEvent(envelope);

      expect(result.success).toBe(true);
      expect(result.detail).toContain('100');
    });

    it('should fail for payment without amount', async () => {
      registry.register(new PaymentReceivedHandler());

      const envelope: EventEnvelope = {
        eventId: 'test-123',
        userId: 'user-123',
        eventType: 'payment.received',
        payload: { currency: 'INR' }, // missing amount
        channels: [],
        createdAt: new Date(),
      };

      const result: HandlerResult = await registry.processEvent(envelope);

      expect(result.success).toBe(false);
      expect(result.detail).toContain('amount');
    });

    it('should use default handler for unknown event types', async () => {
      registry.setDefaultHandler(new DefaultEventHandler());

      const envelope: EventEnvelope = {
        eventId: 'test-123',
        userId: 'user-123',
        eventType: 'some.random.event',
        payload: {},
        channels: [],
        createdAt: new Date(),
      };

      const result: HandlerResult = await registry.processEvent(envelope);

      expect(result.success).toBe(true);
      expect(result.detail).toContain('default handler');
    });

    it('should fail if no handler and no default', async () => {
      const envelope: EventEnvelope = {
        eventId: 'test-123',
        userId: 'user-123',
        eventType: 'unknown.event',
        payload: {},
        channels: [],
        createdAt: new Date(),
      };

      const result: HandlerResult = await registry.processEvent(envelope);

      expect(result.success).toBe(false);
      expect(result.detail).toContain('No handler registered');
    });
  });
});
