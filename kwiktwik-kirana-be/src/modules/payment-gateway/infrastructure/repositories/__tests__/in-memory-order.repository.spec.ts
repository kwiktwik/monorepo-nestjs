/**
 * Unit tests for InMemoryOrderRepository
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import { InMemoryOrderRepository } from '../in-memory-order.repository';
import {
  Order,
  createOrder,
  transitionOrderStatus,
  markOrderAsPaid,
} from '../../../domain/entities/order.entity';

describe('InMemoryOrderRepository', () => {
  let repository: InMemoryOrderRepository;

  const createTestOrder = (
    overrides: Partial<{
      id: string;
      merchantOrderId: string;
      userId: string;
      appId: string;
      provider: string;
      subscriptionId: string;
      status: string;
    }> = {},
  ): Order => {
    const id = overrides.id ?? 'order_123';
    return createOrder({
      id,
      merchantOrderId: overrides.merchantOrderId ?? `merchant_${id}`,
      userId: overrides.userId ?? 'user_123',
      appId: overrides.appId ?? 'app_123',
      orderType: 'ONE_TIME',
      subscriptionType: 'USER_MANAGED',
      provider: (overrides.provider as 'RAZORPAY' | 'PHONEPE') ?? 'RAZORPAY',
      configId: 'config_123',
      environment: 'SANDBOX',
      subscriptionId: overrides.subscriptionId,
      amount: 10000,
      providerData: {
        orderId: `provider_${id}`,
      },
    });
  };

  beforeEach(() => {
    repository = new InMemoryOrderRepository();
  });

  describe('save and findById', () => {
    it('should save and retrieve an order', async () => {
      const order = createTestOrder();

      await repository.save(order);
      const found = await repository.findById('order_123');

      expect(found).toEqual(order);
    });

    it('should return null for non-existent order', async () => {
      const found = await repository.findById('nonexistent');

      expect(found).toBeNull();
    });

    it('should update existing order on save', async () => {
      const order = createTestOrder();
      await repository.save(order);

      const updated = transitionOrderStatus(order, 'PENDING');
      await repository.save(updated);

      const found = await repository.findById('order_123');
      expect(found?.status).toBe('PENDING');
    });
  });

  describe('findByMerchantId', () => {
    it('should find order by merchant order ID', async () => {
      const order = createTestOrder();
      await repository.save(order);

      const found = await repository.findByMerchantId('merchant_order_123');

      expect(found).toEqual(order);
    });

    it('should return null for non-existent merchant ID', async () => {
      const found = await repository.findByMerchantId('nonexistent');

      expect(found).toBeNull();
    });
  });

  describe('findByProviderOrderId', () => {
    it('should find order by provider order ID', async () => {
      const order = createTestOrder();
      await repository.save(order);

      const found = await repository.findByProviderOrderId(
        'RAZORPAY',
        'provider_order_123',
      );

      expect(found).toEqual(order);
    });

    it('should return null for non-existent provider order ID', async () => {
      const found = await repository.findByProviderOrderId(
        'RAZORPAY',
        'nonexistent',
      );

      expect(found).toBeNull();
    });

    it('should return null for wrong provider', async () => {
      const order = createTestOrder();
      await repository.save(order);

      const found = await repository.findByProviderOrderId(
        'PHONEPE',
        'provider_order_123',
      );

      expect(found).toBeNull();
    });
  });

  describe('findByUserId', () => {
    it('should find all orders for a user', async () => {
      const order1 = createTestOrder({ id: 'order_1', userId: 'user_1' });
      const order2 = createTestOrder({ id: 'order_2', userId: 'user_1' });
      const order3 = createTestOrder({ id: 'order_3', userId: 'user_2' });

      await repository.save(order1);
      await repository.save(order2);
      await repository.save(order3);

      const found = await repository.findByUserId('user_1');

      expect(found).toHaveLength(2);
      expect(found.map((o) => o.id)).toContain('order_1');
      expect(found.map((o) => o.id)).toContain('order_2');
    });

    it('should return empty array for user with no orders', async () => {
      const found = await repository.findByUserId('nonexistent');

      expect(found).toHaveLength(0);
    });
  });

  describe('findBySubscriptionId', () => {
    it('should find all orders for a subscription', async () => {
      const order1 = createTestOrder({
        id: 'order_1',
        subscriptionId: 'sub_123',
      });
      const order2 = createTestOrder({
        id: 'order_2',
        subscriptionId: 'sub_123',
      });
      const order3 = createTestOrder({
        id: 'order_3',
        subscriptionId: 'sub_456',
      });

      await repository.save(order1);
      await repository.save(order2);
      await repository.save(order3);

      const found = await repository.findBySubscriptionId('sub_123');

      expect(found).toHaveLength(2);
    });

    it('should return empty array for subscription with no orders', async () => {
      const found = await repository.findBySubscriptionId('nonexistent');

      expect(found).toHaveLength(0);
    });
  });

  describe('findByAppId', () => {
    it('should find all orders for an app', async () => {
      const order1 = createTestOrder({ id: 'order_1', appId: 'app_1' });
      const order2 = createTestOrder({ id: 'order_2', appId: 'app_1' });
      const order3 = createTestOrder({ id: 'order_3', appId: 'app_2' });

      await repository.save(order1);
      await repository.save(order2);
      await repository.save(order3);

      const found = await repository.findByAppId('app_1');

      expect(found).toHaveLength(2);
    });
  });

  describe('findPending', () => {
    it('should find orders with CREATED or PENDING status', async () => {
      const createdOrder = createTestOrder({ id: 'order_created' });
      const pendingOrder = createTestOrder({ id: 'order_pending' });
      const pendingTransitioned = transitionOrderStatus(pendingOrder, 'PENDING');
      const capturedOrder = createTestOrder({ id: 'order_captured' });
      const capturedTransitioned = markOrderAsPaid(capturedOrder, 'pay_123');

      await repository.save(createdOrder);
      await repository.save(pendingTransitioned);
      await repository.save(capturedTransitioned);

      const found = await repository.findPending();

      expect(found).toHaveLength(2);
      expect(found.map((o) => o.id)).toContain('order_created');
      expect(found.map((o) => o.id)).toContain('order_pending');
    });

    it('should return empty array if no pending orders', async () => {
      const order = createTestOrder();
      const captured = markOrderAsPaid(order, 'pay_123');
      await repository.save(captured);

      const found = await repository.findPending();

      expect(found).toHaveLength(0);
    });
  });

  describe('findNeedingCapture', () => {
    it('should find orders with AUTHORIZED status', async () => {
      const authorizedOrder = createTestOrder({ id: 'order_auth' });
      const authorized = transitionOrderStatus(authorizedOrder, 'AUTHORIZED');
      const pendingOrder = createTestOrder({ id: 'order_pending' });
      const pending = transitionOrderStatus(pendingOrder, 'PENDING');

      await repository.save(authorized);
      await repository.save(pending);

      const found = await repository.findNeedingCapture();

      expect(found).toHaveLength(1);
      expect(found[0].id).toBe('order_auth');
    });

    it('should return empty array if no orders needing capture', async () => {
      const order = createTestOrder();
      await repository.save(order);

      const found = await repository.findNeedingCapture();

      expect(found).toHaveLength(0);
    });
  });

  describe('delete', () => {
    it('should delete an order', async () => {
      const order = createTestOrder();
      await repository.save(order);

      const result = await repository.delete('order_123');

      expect(result).toBe(true);
      expect(await repository.findById('order_123')).toBeNull();
    });

    it('should return false for non-existent order', async () => {
      const result = await repository.delete('nonexistent');

      expect(result).toBe(false);
    });

    it('should remove from all indexes', async () => {
      const order = createTestOrder();
      await repository.save(order);

      await repository.delete('order_123');

      expect(await repository.findByMerchantId('merchant_order_123')).toBeNull();
      expect(
        await repository.findByProviderOrderId('RAZORPAY', 'provider_order_123'),
      ).toBeNull();
    });
  });

  describe('exists', () => {
    it('should return true for existing order', async () => {
      const order = createTestOrder();
      await repository.save(order);

      const result = await repository.exists('order_123');

      expect(result).toBe(true);
    });

    it('should return false for non-existent order', async () => {
      const result = await repository.exists('nonexistent');

      expect(result).toBe(false);
    });
  });

  describe('clear and count', () => {
    it('should clear all orders', async () => {
      await repository.save(createTestOrder({ id: 'order_1' }));
      await repository.save(createTestOrder({ id: 'order_2' }));

      expect(repository.count()).toBe(2);

      repository.clear();

      expect(repository.count()).toBe(0);
    });

    it('should return correct count', async () => {
      await repository.save(createTestOrder({ id: 'order_1' }));
      await repository.save(createTestOrder({ id: 'order_2' }));
      await repository.save(createTestOrder({ id: 'order_3' }));

      expect(repository.count()).toBe(3);
    });
  });
});
