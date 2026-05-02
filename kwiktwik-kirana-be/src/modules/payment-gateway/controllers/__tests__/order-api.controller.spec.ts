/**
 * OrderApiController Unit Tests
 */

import { Test, type TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { OrderApiController } from '../order-api.controller';
import { OrderManagerService } from '../../services/order-manager.service';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AppIdGuard } from '../../../../common/guards/app-id.guard';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { PrometheusMetricsInterceptor } from '../../../../common/interceptors/prometheus-metrics.interceptor';
import type { Order } from '../../domain/entities/order.entity';
import { createOrder } from '../../domain/entities/order.entity';

// ─── Helpers ────────────────────────────────────────────────────

function fakeOrder(overrides: Partial<Order> = {}): Order {
  return createOrder({
    id: 'ord_001',
    merchantOrderId: 'MORD_001',
    userId: 'user_1',
    appId: 'app_test',
    orderType: 'ONE_TIME',
    subscriptionType: 'USER_MANAGED',
    provider: 'RAZORPAY',
    configId: 'cfg_1',
    environment: 'SANDBOX',
    amount: 10000,
    currency: 'INR',
    providerData: { orderId: 'order_rzp_001' },
    ...overrides,
  });
}

const mockUser = { userId: 'user_1' };
const mockAppId = 'app_test';

// ─── Tests ──────────────────────────────────────────────────────

describe('OrderApiController', () => {
  let controller: OrderApiController;
  let orderManager: jest.Mocked<Pick<OrderManagerService, 'createOrder' | 'verifyPayment' | 'getOrderStatus' | 'syncOrderStatus' | 'refundOrder'>>;

  beforeEach(async () => {
    orderManager = {
      createOrder: jest.fn(),
      verifyPayment: jest.fn(),
      getOrderStatus: jest.fn(),
      syncOrderStatus: jest.fn(),
      refundOrder: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrderApiController],
      providers: [
        { provide: OrderManagerService, useValue: orderManager },
      ],
    })
      .overrideGuard(AppIdGuard).useValue({ canActivate: () => true })
      .overrideGuard(JwtAuthGuard).useValue({ canActivate: () => true })
      .overrideInterceptor(PrometheusMetricsInterceptor).useValue({ intercept: (_ctx: any, next: any) => next.handle() })
      .compile();

    controller = module.get(OrderApiController);
  });

  // ──────────────────────────────────────────────────────────────
  // POST / — createOrder
  // ──────────────────────────────────────────────────────────────

  describe('POST / (createOrder)', () => {
    const dto = {
      amount: 10000,
      provider: 'RAZORPAY' as const,
      currency: 'INR',
    };

    it('should create order and return checkout data', async () => {
      const order = fakeOrder();
      orderManager.createOrder.mockResolvedValueOnce({
        success: true,
        order,
        providerOrderId: 'order_rzp_001',
        redirectUrl: null,
        checkoutConfig: { keyId: 'rzp_key', orderId: 'order_rzp_001', amount: 10000, currency: 'INR' },
        error: null,
      });

      const result = await controller.createOrder(mockUser, mockAppId, dto);

      expect(result.success).toBe(true);
      expect(result.orderId).toBe('ord_001');
      expect(result.merchantOrderId).toBe('MORD_001');
      expect(result.providerOrderId).toBe('order_rzp_001');
      expect(result.checkoutConfig).toHaveProperty('keyId', 'rzp_key');
      expect(orderManager.createOrder).toHaveBeenCalledWith({
        userId: 'user_1',
        appId: 'app_test',
        provider: 'RAZORPAY',
        amount: 10000,
        currency: 'INR',
        receipt: undefined,
        notes: undefined,
        redirectUrl: undefined,
      });
    });

    it('should throw BadRequestException on failure', async () => {
      orderManager.createOrder.mockResolvedValueOnce({
        success: false,
        order: null,
        providerOrderId: null,
        redirectUrl: null,
        checkoutConfig: {},
        error: 'Amount too low',
      });

      await expect(
        controller.createOrder(mockUser, mockAppId, dto),
      ).rejects.toThrow(BadRequestException);
    });

    it('should pass PhonePe redirectUrl through', async () => {
      const order = fakeOrder({ provider: 'PHONEPE' });
      orderManager.createOrder.mockResolvedValueOnce({
        success: true,
        order,
        providerOrderId: 'PPO_123',
        redirectUrl: 'https://phonepe.com/pay/session',
        checkoutConfig: { merchantId: 'pp_mid', orderId: 'PPO_123' },
        error: null,
      });

      const result = await controller.createOrder(mockUser, mockAppId, {
        amount: 10000,
        provider: 'PHONEPE',
        redirectUrl: 'https://myapp.com/callback',
      });

      expect(result.redirectUrl).toBe('https://phonepe.com/pay/session');
    });
  });

  // ──────────────────────────────────────────────────────────────
  // POST /:id/verify
  // ──────────────────────────────────────────────────────────────

  describe('POST /:id/verify (verifyPayment)', () => {
    const verifyDto = { providerPaymentId: 'pay_123', signature: 'valid_sig' };

    it('should verify payment successfully', async () => {
      const order = fakeOrder();
      const paidOrder = { ...order, status: 'CAPTURED' as const, paidAt: new Date() };

      orderManager.getOrderStatus.mockResolvedValueOnce(order);
      orderManager.verifyPayment.mockResolvedValueOnce({
        success: true,
        order: paidOrder,
        error: null,
      });

      const result = await controller.verifyPayment(mockUser, mockAppId, 'ord_001', verifyDto);

      expect(result.success).toBe(true);
      expect(result.status).toBe('CAPTURED');
      expect(result.paidAt).not.toBeNull();
    });

    it('should throw NotFoundException when order does not exist', async () => {
      orderManager.getOrderStatus.mockResolvedValueOnce(null);

      await expect(
        controller.verifyPayment(mockUser, mockAppId, 'ord_ghost', verifyDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when order belongs to a different user', async () => {
      const otherOrder = fakeOrder({ userId: 'other_user' });
      orderManager.getOrderStatus.mockResolvedValueOnce(otherOrder);

      await expect(
        controller.verifyPayment(mockUser, mockAppId, 'ord_001', verifyDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when order belongs to a different app', async () => {
      const otherOrder = fakeOrder({ appId: 'other_app' });
      orderManager.getOrderStatus.mockResolvedValueOnce(otherOrder);

      await expect(
        controller.verifyPayment(mockUser, mockAppId, 'ord_001', verifyDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when verification fails', async () => {
      const order = fakeOrder();
      orderManager.getOrderStatus.mockResolvedValueOnce(order);
      orderManager.verifyPayment.mockResolvedValueOnce({
        success: false,
        order,
        error: 'Invalid signature',
      });

      await expect(
        controller.verifyPayment(mockUser, mockAppId, 'ord_001', verifyDto),
      ).rejects.toThrow(BadRequestException);
    });
  });

  // ──────────────────────────────────────────────────────────────
  // GET /:id/status
  // ──────────────────────────────────────────────────────────────

  describe('GET /:id/status (getOrderStatus)', () => {
    it('should return order status', async () => {
      const order = fakeOrder();
      orderManager.syncOrderStatus.mockResolvedValueOnce(order);

      const result = await controller.getOrderStatus(mockUser, mockAppId, 'ord_001');

      expect(result.orderId).toBe('ord_001');
      expect(result.merchantOrderId).toBe('MORD_001');
      expect(result.status).toBe('CREATED');
      expect(result.amount).toBe(10000);
      expect(result.provider).toBe('RAZORPAY');
    });

    it('should throw NotFoundException when order not found', async () => {
      orderManager.syncOrderStatus.mockResolvedValueOnce(null);

      await expect(
        controller.getOrderStatus(mockUser, mockAppId, 'ord_ghost'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when user does not own order', async () => {
      const otherOrder = fakeOrder({ userId: 'someone_else' });
      orderManager.syncOrderStatus.mockResolvedValueOnce(otherOrder);

      await expect(
        controller.getOrderStatus(mockUser, mockAppId, 'ord_001'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ──────────────────────────────────────────────────────────────
  // POST /:id/refund
  // ──────────────────────────────────────────────────────────────

  describe('POST /:id/refund (refundOrder)', () => {
    it('should initiate refund successfully', async () => {
      const order = fakeOrder();
      const refundedOrder = { ...order, status: 'REFUNDED' as const, refundedAt: new Date() };

      orderManager.getOrderStatus.mockResolvedValueOnce(order);
      orderManager.refundOrder.mockResolvedValueOnce({
        success: true,
        order: refundedOrder,
        refundId: 'rfnd_001',
        error: null,
      });

      const result = await controller.refundOrder(mockUser, mockAppId, 'ord_001', {
        amount: 5000,
        reason: 'Customer request',
      });

      expect(result.success).toBe(true);
      expect(result.refundId).toBe('rfnd_001');
      expect(result.status).toBe('REFUNDED');
    });

    it('should throw NotFoundException when order not found', async () => {
      orderManager.getOrderStatus.mockResolvedValueOnce(null);

      await expect(
        controller.refundOrder(mockUser, mockAppId, 'ord_ghost', {}),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when refund fails', async () => {
      const order = fakeOrder();
      orderManager.getOrderStatus.mockResolvedValueOnce(order);
      orderManager.refundOrder.mockResolvedValueOnce({
        success: false,
        order,
        refundId: null,
        error: 'Already refunded',
      });

      await expect(
        controller.refundOrder(mockUser, mockAppId, 'ord_001', {}),
      ).rejects.toThrow(BadRequestException);
    });

    it('should allow full refund (empty body)', async () => {
      const order = fakeOrder();
      const refundedOrder = { ...order, status: 'REFUNDED' as const, refundedAt: new Date() };

      orderManager.getOrderStatus.mockResolvedValueOnce(order);
      orderManager.refundOrder.mockResolvedValueOnce({
        success: true,
        order: refundedOrder,
        refundId: 'rfnd_full',
        error: null,
      });

      const result = await controller.refundOrder(mockUser, mockAppId, 'ord_001', {});

      expect(result.success).toBe(true);
      expect(orderManager.refundOrder).toHaveBeenCalledWith({
        orderId: 'ord_001',
        amount: undefined,
        reason: undefined,
      });
    });
  });
});