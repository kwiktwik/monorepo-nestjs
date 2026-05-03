/**
 * OrderManagerService Unit Tests
 */

import { Test, type TestingModule } from '@nestjs/testing';
import { OrderManagerService } from '../order-manager.service';
import { ProviderFactory } from '../../providers/factory/provider.factory';
import { PaymentConfigService } from '../../config/payment-config.service';

import { InMemoryOrderRepository } from '../../infrastructure/repositories/in-memory-order.repository';
import { InMemoryEventBus } from '../../common/events/in-memory-event-bus';
import { DRIZZLE_TOKEN } from '../../../../database/drizzle.module';
import type { IOrderRepository } from '../../infrastructure/repositories/order.repository.interface';
import type { IEventBus } from '../../common/events/event-bus.interface';
import type { OneTimeOrderProvider } from '../../providers/interfaces/order-provider.interface';
import type { Order } from '../../domain/entities/order.entity';
import { createOrder } from '../../domain/entities/order.entity';

// ─── Helpers ────────────────────────────────────────────────────

function makeMockProvider(): jest.Mocked<OneTimeOrderProvider> {
  return {
    provider: 'RAZORPAY',
    initialize: jest.fn(),
    getPublicConfig: jest.fn().mockReturnValue({ keyId: 'rzp_key' }),
    createOrder: jest.fn().mockResolvedValue({
      success: true,
      merchantOrderId: 'MORD_test_001',
      providerOrderId: 'order_rzp_123',
      redirectUrl: null,
      checkoutConfig: { keyId: 'rzp_key', orderId: 'order_rzp_123', amount: 10000, currency: 'INR' },
      state: 'created',
      expiresAt: null,
      error: null,
      errorCode: null,
    }),
    getOrderStatus: jest.fn().mockResolvedValue({
      merchantOrderId: 'MORD_test_001',
      providerOrderId: 'order_rzp_123',
      mappedStatus: 'CAPTURED',
      providerState: 'paid',
      amount: 10000,
      paymentDetails: [{ transactionId: 'pay_123', paymentMode: 'upi', amount: 10000, state: 'captured' }],
      rawResponse: {},
    }),
    verifyPayment: jest.fn().mockResolvedValue({
      verified: true,
      orderId: 'order_rzp_123',
      paymentId: 'pay_123',
      error: null,
    }),
    refundPayment: jest.fn().mockResolvedValue({
      success: true,
      refundId: 'rfnd_123',
      status: 'PENDING',
      error: null,
    }),
  };
}

const mockConfig = {
  configId: 'config_1',
  provider: 'RAZORPAY' as const,
  appId: 'app_test',
  environment: 'SANDBOX' as const,
  enabled: true,
  isDefault: true,
  webhookSecret: 'secret',
  keyId: 'rzp_key',
  keySecret: 'rzp_secret',
  accountId: null,
};

// ─── Tests ──────────────────────────────────────────────────────

describe('OrderManagerService', () => {
  let service: OrderManagerService;
  let orderRepo: IOrderRepository;
  let configService: PaymentConfigService;
  let mockProvider: jest.Mocked<OneTimeOrderProvider>;

  beforeEach(async () => {
    mockProvider = makeMockProvider();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderManagerService,
        {
          provide: ProviderFactory,
          useValue: {
            getOneTimeOrderProvider: jest.fn().mockReturnValue(mockProvider),
          },
        },
        {
          provide: PaymentConfigService,
          useValue: {
            getConfig: jest.fn().mockReturnValue(mockConfig),
          },
        },
        { provide: 'IOrderRepository', useClass: InMemoryOrderRepository },
        { provide: 'IEventBus', useClass: InMemoryEventBus },
        { provide: DRIZZLE_TOKEN, useValue: null },
      ],
    }).compile();

    service = module.get(OrderManagerService);
    orderRepo = module.get<IOrderRepository>('IOrderRepository');
    configService = module.get(PaymentConfigService);
  });

  // ──────────────────────────────────────────────────────────────
  // createOrder
  // ──────────────────────────────────────────────────────────────

  describe('createOrder', () => {
    const input = {
      userId: 'user_1',
      appId: 'app_test',
      provider: 'RAZORPAY' as const,
      amount: 10000,
      currency: 'INR',
    };

    it('should create order and persist it', async () => {
      const result = await service.createOrder(input);

      expect(result.success).toBe(true);
      expect(result.order).not.toBeNull();
      expect(result.order!.amount).toBe(10000);
      expect(result.order!.provider).toBe('RAZORPAY');
      expect(result.order!.orderType).toBe('ONE_TIME');
      expect(result.providerOrderId).toBe('order_rzp_123');
      expect(result.checkoutConfig).toHaveProperty('keyId', 'rzp_key');

      const saved = await orderRepo.findById(result.order!.id);
      expect(saved).not.toBeNull();
      expect(saved!.merchantOrderId).toBe(result.order!.merchantOrderId);
    });

    it('should return failure when config is not found', async () => {
      (configService.getConfig as jest.Mock).mockReturnValueOnce(null);

      const result = await service.createOrder(input);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Configuration not found');
      expect(result.order).toBeNull();
    });

    it('should return failure when provider fails', async () => {
      mockProvider.createOrder.mockResolvedValueOnce({
        success: false,
        merchantOrderId: 'MORD_fail',
        providerOrderId: '',
        redirectUrl: null,
        checkoutConfig: {},
        state: 'error',
        expiresAt: null,
        error: 'Invalid amount',
        errorCode: 'BAD_REQUEST',
      });

      const result = await service.createOrder(input);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid amount');
    });

    it('should handle unexpected errors gracefully', async () => {
      mockProvider.createOrder.mockRejectedValueOnce(new Error('Connection timeout'));

      const result = await service.createOrder(input);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Connection timeout');
    });

    it('should use INR as default currency', async () => {
      const result = await service.createOrder({
        ...input,
        currency: undefined,
      });

      expect(result.success).toBe(true);
      expect(mockProvider.createOrder).toHaveBeenCalledWith(
        expect.objectContaining({ currency: 'INR' }),
      );
    });
  });

  // ──────────────────────────────────────────────────────────────
  // verifyPayment
  // ──────────────────────────────────────────────────────────────

  describe('verifyPayment', () => {
    let order: Order;

    beforeEach(async () => {
      const createResult = await service.createOrder({
        userId: 'user_1',
        appId: 'app_test',
        provider: 'RAZORPAY',
        amount: 10000,
      });
      order = createResult.order!;
    });

    it('should verify payment and mark order as captured', async () => {
      const result = await service.verifyPayment({
        orderId: order.id,
        providerPaymentId: 'pay_123',
        signature: 'valid_sig',
      });

      expect(result.success).toBe(true);
      expect(result.order!.status).toBe('CAPTURED');
      expect(result.order!.paidAt).not.toBeNull();
      expect(result.order!.providerData.paymentId).toBe('pay_123');
    });

    it('should return already-captured order without re-verifying', async () => {
      await service.verifyPayment({
        orderId: order.id,
        providerPaymentId: 'pay_123',
        signature: 'valid_sig',
      });

      mockProvider.verifyPayment.mockClear();
      const result = await service.verifyPayment({
        orderId: order.id,
        providerPaymentId: 'pay_123',
        signature: 'valid_sig',
      });

      expect(result.success).toBe(true);
      expect(result.order!.status).toBe('CAPTURED');
      expect(mockProvider.verifyPayment).not.toHaveBeenCalled();
    });

    it('should fail when order not found', async () => {
      const result = await service.verifyPayment({
        orderId: 'ord_nonexistent',
        providerPaymentId: 'pay_123',
        signature: 'sig',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Order not found');
    });

    it('should fail when signature is invalid', async () => {
      mockProvider.verifyPayment.mockResolvedValueOnce({
        verified: false,
        orderId: 'order_rzp_123',
        paymentId: '',
        error: 'Invalid payment signature',
      });

      const result = await service.verifyPayment({
        orderId: order.id,
        providerPaymentId: 'pay_123',
        signature: 'bad_sig',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid payment signature');
    });

    it('should fail when config not found', async () => {
      (configService.getConfig as jest.Mock).mockReturnValueOnce(null);

      const result = await service.verifyPayment({
        orderId: order.id,
        providerPaymentId: 'pay_123',
        signature: 'sig',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Configuration not found');
    });
  });

  // ──────────────────────────────────────────────────────────────
  // getOrderStatus / syncOrderStatus
  // ──────────────────────────────────────────────────────────────

  describe('getOrderStatus', () => {
    it('should return order by id', async () => {
      const createResult = await service.createOrder({
        userId: 'user_1',
        appId: 'app_test',
        provider: 'RAZORPAY',
        amount: 5000,
      });

      const order = await service.getOrderStatus(createResult.order!.id);
      expect(order).not.toBeNull();
      expect(order!.amount).toBe(5000);
    });

    it('should return null for nonexistent order', async () => {
      const order = await service.getOrderStatus('ord_does_not_exist');
      expect(order).toBeNull();
    });
  });

  describe('syncOrderStatus', () => {
    let order: Order;

    beforeEach(async () => {
      const createResult = await service.createOrder({
        userId: 'user_1',
        appId: 'app_test',
        provider: 'RAZORPAY',
        amount: 10000,
      });
      order = createResult.order!;
    });

    it('should sync pending order and mark as captured', async () => {
      const synced = await service.syncOrderStatus(order.id);

      expect(synced).not.toBeNull();
      expect(synced!.status).toBe('CAPTURED');
      expect(synced!.paidAt).not.toBeNull();
    });

    it('should not re-sync captured orders', async () => {
      await service.verifyPayment({
        orderId: order.id,
        providerPaymentId: 'pay_123',
        signature: 'sig',
      });

      mockProvider.getOrderStatus.mockClear();

      const synced = await service.syncOrderStatus(order.id);
      expect(synced!.status).toBe('CAPTURED');
      expect(mockProvider.getOrderStatus).not.toHaveBeenCalled();
    });

    it('should mark order as failed when provider reports failure', async () => {
      mockProvider.getOrderStatus.mockResolvedValueOnce({
        merchantOrderId: order.merchantOrderId,
        providerOrderId: 'order_rzp_123',
        mappedStatus: 'FAILED',
        providerState: 'failed',
        amount: 10000,
        paymentDetails: [],
        rawResponse: {},
      });

      const synced = await service.syncOrderStatus(order.id);
      expect(synced!.status).toBe('FAILED');
    });

    it('should return null for nonexistent order', async () => {
      const result = await service.syncOrderStatus('ord_nonexistent');
      expect(result).toBeNull();
    });

    it('should return order unchanged if config not found', async () => {
      (configService.getConfig as jest.Mock).mockReturnValueOnce(null);

      const synced = await service.syncOrderStatus(order.id);
      expect(synced!.status).toBe('CREATED');
    });

    it('should return order unchanged when providerData.orderId is empty', async () => {
      // Simulate an order that failed provider creation (empty provider order ID)
      const failedOrder = createOrder({
        id: 'ord_no_provider',
        merchantOrderId: 'MORD_no_provider',
        userId: 'user_1',
        appId: 'app_test',
        orderType: 'ONE_TIME',
        subscriptionType: 'USER_MANAGED',
        provider: 'RAZORPAY',
        configId: 'config_1',
        environment: 'SANDBOX',
        amount: 5000,
        providerData: { orderId: '' },
      });
      await orderRepo.save(failedOrder);

      mockProvider.getOrderStatus.mockClear();
      const synced = await service.syncOrderStatus(failedOrder.id);

      expect(synced).not.toBeNull();
      expect(synced!.status).toBe('CREATED');
      expect(mockProvider.getOrderStatus).not.toHaveBeenCalled();
    });

    it('should return order unchanged when provider throws', async () => {
      mockProvider.getOrderStatus.mockRejectedValueOnce(new Error('Razorpay API unreachable'));

      const synced = await service.syncOrderStatus(order.id);

      expect(synced).not.toBeNull();
      expect(synced!.status).toBe('CREATED');
    });
  });

  // ──────────────────────────────────────────────────────────────
  // refundOrder
  // ──────────────────────────────────────────────────────────────

  describe('refundOrder', () => {
    let capturedOrder: Order;

    beforeEach(async () => {
      const createResult = await service.createOrder({
        userId: 'user_1',
        appId: 'app_test',
        provider: 'RAZORPAY',
        amount: 10000,
      });

      const verifyResult = await service.verifyPayment({
        orderId: createResult.order!.id,
        providerPaymentId: 'pay_123',
        signature: 'sig',
      });
      capturedOrder = verifyResult.order!;
    });

    it('should refund a captured order', async () => {
      const result = await service.refundOrder({
        orderId: capturedOrder.id,
        amount: 5000,
        reason: 'Customer request',
      });

      expect(result.success).toBe(true);
      expect(result.order!.status).toBe('REFUNDED');
      expect(result.order!.refundedAt).not.toBeNull();
      expect(result.refundId).toBe('rfnd_123');
    });

    it('should do full refund when amount not specified', async () => {
      const result = await service.refundOrder({
        orderId: capturedOrder.id,
      });

      expect(result.success).toBe(true);
      expect(mockProvider.refundPayment).toHaveBeenCalledWith(
        expect.objectContaining({ amount: 10000 }),
      );
    });

    it('should fail for non-captured order', async () => {
      const newResult = await service.createOrder({
        userId: 'user_1',
        appId: 'app_test',
        provider: 'RAZORPAY',
        amount: 3000,
      });

      const result = await service.refundOrder({
        orderId: newResult.order!.id,
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('cannot be refunded');
    });

    it('should fail when order not found', async () => {
      const result = await service.refundOrder({
        orderId: 'ord_ghost',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Order not found');
    });

    it('should fail when provider refund fails', async () => {
      mockProvider.refundPayment.mockResolvedValueOnce({
        success: false,
        refundId: '',
        status: 'FAILED',
        error: 'Insufficient balance',
      });

      const result = await service.refundOrder({
        orderId: capturedOrder.id,
        amount: 99999,
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Insufficient balance');
    });

    it('should fail when config not found', async () => {
      (configService.getConfig as jest.Mock).mockReturnValueOnce(null);

      const result = await service.refundOrder({
        orderId: capturedOrder.id,
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Configuration not found');
    });
  });
});