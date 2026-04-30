/**
 * Billing Scheduler Service Unit Tests
 */

import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { BillingSchedulerService } from '../billing-scheduler.service';
import { SubscriptionManagerService } from '../../services/subscription-manager.service';
import { SubscriptionStateMachineService } from '../../services/subscription-state-machine.service';
import type { ISubscriptionRepository } from '../../infrastructure/repositories/subscription.repository.interface';
import type { Subscription } from '../../domain/entities/subscription.entity';
import { SubscriptionStatus } from '../../types/subscription-status.enum';
import { SubscriptionType } from '../../types/subscription-type.enum';
import { PaymentProvider } from '../../types/provider.enum';

// ============================================================================
// Mocks
// ============================================================================

const createMockSubscription = (overrides: Partial<Subscription> = {}): Subscription => ({
  id: 'sub_test123',
  merchantSubscriptionId: 'merchant_sub_test123',
  userId: 'user_test',
  appId: 'com.test.app',
  subscriptionType: SubscriptionType.USER_MANAGED,
  provider: PaymentProvider.RAZORPAY,
  planId: 'plan_test',
  pricing: {
    initialAmount: 4900,
    recurringAmount: 4900,
    currency: 'INR',
    frequency: 'MONTHLY',
    totalCycles: null,
  },
  status: SubscriptionStatus.ACTIVE,
  providerData: {
    subscriptionId: 'provider_sub_123',
    orderId: null,
    customerId: null,
    planId: 'provider_plan_123',
    mandateId: null,
    raw: {},
    lastSyncedAt: new Date(),
  },
  billingCycleCount: 0,
  nextBillingDate: new Date(Date.now() - 1000), // Past date - needs billing
  lastBillingDate: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  activatedAt: new Date(),
  cancelledAt: null,
  expiredAt: null,
  retryConfig: null,
  paymentFailures: [],
  consecutiveFailures: 0,
  isPremium: false,
  metadata: {
    environment: 'SANDBOX',
    configId: 'config_test',
    source: 'api',
    createdAt: new Date(),
    updatedAt: new Date(),
    tags: [],
    custom: {},
  },
  ...overrides,
});

describe('BillingSchedulerService', () => {
  let service: BillingSchedulerService;
  let subscriptionManager: jest.Mocked<SubscriptionManagerService>;
  let stateMachine: jest.Mocked<SubscriptionStateMachineService>;
  let subscriptionRepo: jest.Mocked<ISubscriptionRepository>;

  beforeEach(async () => {
    const mockSubscriptionManager = {
      chargeSubscription: jest.fn(),
      cancelSubscription: jest.fn(),
      getSubscription: jest.fn(),
    };

    const mockStateMachine = {
      transition: jest.fn(),
      activate: jest.fn(),
      pause: jest.fn(),
      resume: jest.fn(),
      cancel: jest.fn(),
      expire: jest.fn(),
      complete: jest.fn(),
    };

    const mockSubscriptionRepo = {
      findById: jest.fn(),
      findByMerchantId: jest.fn(),
      findByUserId: jest.fn(),
      findActiveByUserId: jest.fn(),
      findByStatus: jest.fn(),
      findNeedingBilling: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BillingSchedulerService,
        {
          provide: SubscriptionManagerService,
          useValue: mockSubscriptionManager,
        },
        {
          provide: SubscriptionStateMachineService,
          useValue: mockStateMachine,
        },
        {
          provide: 'ISubscriptionRepository',
          useValue: mockSubscriptionRepo,
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string, defaultValue?: unknown) => defaultValue),
          },
        },
      ],
    }).compile();

    service = module.get<BillingSchedulerService>(BillingSchedulerService);
    subscriptionManager = module.get(SubscriptionManagerService);
    stateMachine = module.get(SubscriptionStateMachineService);
    subscriptionRepo = module.get('ISubscriptionRepository');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ============================================================================
  // Initialization Tests
  // ============================================================================

  describe('initialization', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });

    it('should return status', () => {
      const status = service.getStatus();
      
      expect(status).toHaveProperty('enabled');
      expect(status).toHaveProperty('isRunning');
      expect(status).toHaveProperty('lastRunAt');
      expect(status).toHaveProperty('lastRunResult');
    });
  });

  // ============================================================================
  // Billing Run Tests
  // ============================================================================

  describe('triggerBillingRun', () => {
    it('should return empty result when no subscriptions need billing', async () => {
      subscriptionRepo.findNeedingBilling.mockResolvedValue([]);

      const result = await service.triggerBillingRun();

      expect(result.processed).toBe(0);
      expect(result.successful).toBe(0);
      expect(result.failed).toBe(0);
      expect(result.skipped).toBe(0);
      expect(subscriptionRepo.findNeedingBilling).toHaveBeenCalled();
    });

    it('should process subscriptions that need billing', async () => {
      const subscription = createMockSubscription();
      subscriptionRepo.findNeedingBilling.mockResolvedValue([subscription]);
      subscriptionManager.chargeSubscription.mockResolvedValue({
        success: true,
        subscription,
        order: {
          id: 'order_123',
          merchantOrderId: 'merchant_order_123',
          userId: 'user_test',
          appId: 'com.test.app',
          orderType: 'SUBSCRIPTION_RECURRING',
          subscriptionType: SubscriptionType.USER_MANAGED,
          provider: PaymentProvider.RAZORPAY,
          configId: 'config_test',
          environment: 'SANDBOX',
          subscriptionId: 'sub_test123',
          amount: 4900,
          currency: 'INR',
          status: 'CAPTURED',
          providerData: {
            orderId: 'provider_order_123',
            paymentId: null,
            refundId: null,
            tokenId: null,
            transactionId: 'txn_123',
            raw: {},
            intentUrl: null,
          },
          metadata: {
            environment: 'SANDBOX',
            configId: 'config_test',
            description: null,
            notes: {},
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          createdAt: new Date(),
          updatedAt: new Date(),
          paidAt: null,
          refundedAt: null,
          expiresAt: null,
        },
        transactionId: 'txn_123',
        error: null,
      });

      const result = await service.triggerBillingRun();

      expect(result.processed).toBe(1);
      expect(result.successful).toBe(1);
      expect(result.failed).toBe(0);
      expect(subscriptionManager.chargeSubscription).toHaveBeenCalledWith({
        subscriptionId: subscription.id,
        amount: subscription.pricing.recurringAmount,
      });
    });

    it('should skip provider-managed subscriptions', async () => {
      const providerManagedSubscription = createMockSubscription({
        subscriptionType: SubscriptionType.PROVIDER_MANAGED,
      });
      subscriptionRepo.findNeedingBilling.mockResolvedValue([providerManagedSubscription]);

      const result = await service.triggerBillingRun();

      expect(result.processed).toBe(1);
      expect(result.successful).toBe(0);
      expect(result.skipped).toBe(1);
      expect(subscriptionManager.chargeSubscription).not.toHaveBeenCalled();
    });

    it('should skip subscriptions not in billable state', async () => {
      const cancelledSubscription = createMockSubscription({
        status: SubscriptionStatus.CANCELLED,
      });
      subscriptionRepo.findNeedingBilling.mockResolvedValue([cancelledSubscription]);

      const result = await service.triggerBillingRun();

      expect(result.processed).toBe(1);
      expect(result.successful).toBe(0);
      expect(result.skipped).toBe(1);
      expect(subscriptionManager.chargeSubscription).not.toHaveBeenCalled();
    });

    it('should handle failed charges', async () => {
      const subscription = createMockSubscription();
      subscriptionRepo.findNeedingBilling.mockResolvedValue([subscription]);
      subscriptionManager.chargeSubscription.mockResolvedValue({
        success: false,
        subscription,
        order: null,
        transactionId: null,
        error: 'Payment failed',
      });

      const result = await service.triggerBillingRun();

      expect(result.processed).toBe(1);
      expect(result.successful).toBe(0);
      expect(result.failed).toBe(1);
    });

    it('should skip subscriptions in retry backoff period', async () => {
      const subscription = createMockSubscription({
        retryConfig: {
          maxAttempts: 3,
          baseDelayMinutes: 60,
          backoffMultiplier: 2,
          currentAttempt: 1,
          nextRetryAt: new Date(Date.now() + 3600000), // 1 hour in future
          gracePeriodEndAt: null,
        },
      });
      subscriptionRepo.findNeedingBilling.mockResolvedValue([subscription]);

      const result = await service.triggerBillingRun();

      expect(result.processed).toBe(1);
      expect(result.skipped).toBe(1);
      expect(subscriptionManager.chargeSubscription).not.toHaveBeenCalled();
    });

    it('should handle subscriptions that exceeded retry limit', async () => {
      const subscription = createMockSubscription({
        consecutiveFailures: 5, // Exceeds default max of 3
      });
      subscriptionRepo.findNeedingBilling.mockResolvedValue([subscription]);
      
      // Mock state machine transition
      stateMachine.transition.mockResolvedValue({
        success: true,
        subscription: { ...subscription, status: SubscriptionStatus.FAILED },
        previousStatus: SubscriptionStatus.ACTIVE,
        newStatus: SubscriptionStatus.FAILED,
        event: 'PAYMENT_FAILED_PERMANENTLY',
      });
      subscriptionRepo.save.mockResolvedValue({ ...subscription, status: SubscriptionStatus.FAILED });

      const result = await service.triggerBillingRun();

      expect(result.processed).toBe(1);
      expect(result.failed).toBe(1);
      expect(result.results[0].error).toBe('Exceeded retry limit');
      expect(stateMachine.transition).toHaveBeenCalledWith(
        subscription,
        'PAYMENT_FAILED_PERMANENTLY',
        expect.objectContaining({
          reason: 'Exceeded maximum retry attempts',
        }),
      );
      expect(subscriptionRepo.save).toHaveBeenCalled();
    });

    it('should skip subscriptions that have completed all cycles', async () => {
      const subscription = createMockSubscription({
        billingCycleCount: 12,
        pricing: {
          initialAmount: 4900,
          recurringAmount: 4900,
          currency: 'INR',
          frequency: 'MONTHLY',
          totalCycles: 12, // Same as billingCycleCount
        },
      });
      subscriptionRepo.findNeedingBilling.mockResolvedValue([subscription]);
      
      // Mock state machine transition
      stateMachine.transition.mockResolvedValue({
        success: true,
        subscription: { ...subscription, status: SubscriptionStatus.COMPLETED },
        previousStatus: SubscriptionStatus.ACTIVE,
        newStatus: SubscriptionStatus.COMPLETED,
        event: 'ALL_CYCLES_COMPLETED',
      });
      subscriptionRepo.save.mockResolvedValue({ ...subscription, status: SubscriptionStatus.COMPLETED });

      const result = await service.triggerBillingRun();

      expect(result.processed).toBe(1);
      expect(result.skipped).toBe(1);
      expect(result.results[0].error).toBe('Skipped - all cycles completed');
      expect(stateMachine.transition).toHaveBeenCalledWith(
        subscription,
        'ALL_CYCLES_COMPLETED',
        expect.objectContaining({
          totalCycles: 12,
          billingCycleCount: 12,
        }),
      );
      expect(subscriptionRepo.save).toHaveBeenCalled();
      expect(subscriptionManager.chargeSubscription).not.toHaveBeenCalled();
    });

    it('should charge subscriptions that have not completed all cycles', async () => {
      const subscription = createMockSubscription({
        billingCycleCount: 5,
        pricing: {
          initialAmount: 4900,
          recurringAmount: 4900,
          currency: 'INR',
          frequency: 'MONTHLY',
          totalCycles: 12, // More than billingCycleCount
        },
      });
      subscriptionRepo.findNeedingBilling.mockResolvedValue([subscription]);
      subscriptionManager.chargeSubscription.mockResolvedValue({
        success: true,
        subscription,
        order: null,
        transactionId: 'txn_123',
        error: null,
      });

      const result = await service.triggerBillingRun();

      expect(result.processed).toBe(1);
      expect(result.successful).toBe(1);
      expect(subscriptionManager.chargeSubscription).toHaveBeenCalled();
    });

    it('should charge subscriptions with unlimited cycles (null totalCycles)', async () => {
      const subscription = createMockSubscription({
        billingCycleCount: 100, // High count but unlimited cycles
        pricing: {
          initialAmount: 4900,
          recurringAmount: 4900,
          currency: 'INR',
          frequency: 'MONTHLY',
          totalCycles: null, // Unlimited
        },
      });
      subscriptionRepo.findNeedingBilling.mockResolvedValue([subscription]);
      subscriptionManager.chargeSubscription.mockResolvedValue({
        success: true,
        subscription,
        order: null,
        transactionId: 'txn_123',
        error: null,
      });

      const result = await service.triggerBillingRun();

      expect(result.processed).toBe(1);
      expect(result.successful).toBe(1);
      expect(subscriptionManager.chargeSubscription).toHaveBeenCalled();
    });

    it('should process multiple subscriptions in batch', async () => {
      const subscriptions = [
        createMockSubscription({ id: 'sub_1' }),
        createMockSubscription({ id: 'sub_2' }),
        createMockSubscription({ id: 'sub_3' }),
      ];
      subscriptionRepo.findNeedingBilling.mockResolvedValue(subscriptions);
      subscriptionManager.chargeSubscription.mockResolvedValue({
        success: true,
        subscription: subscriptions[0],
        order: null,
        transactionId: 'txn_123',
        error: null,
      });

      const result = await service.triggerBillingRun();

      expect(result.processed).toBe(3);
      expect(result.successful).toBe(3);
      expect(subscriptionManager.chargeSubscription).toHaveBeenCalledTimes(3);
    });

    it('should handle exceptions during charge', async () => {
      const subscription = createMockSubscription();
      subscriptionRepo.findNeedingBilling.mockResolvedValue([subscription]);
      subscriptionManager.chargeSubscription.mockRejectedValue(new Error('Network error'));

      const result = await service.triggerBillingRun();

      expect(result.processed).toBe(1);
      expect(result.failed).toBe(1);
      expect(result.results[0].error).toBe('Network error');
    });
  });

  // ============================================================================
  // Status Tests
  // ============================================================================

  describe('getStatus', () => {
    it('should return current status', () => {
      const status = service.getStatus();

      expect(status.enabled).toBe(true);
      expect(status.isRunning).toBe(false);
      expect(status.lastRunAt).toBeNull();
      expect(status.lastRunResult).toBeNull();
    });

    it('should update status after billing run', async () => {
      subscriptionRepo.findNeedingBilling.mockResolvedValue([]);

      await service.triggerBillingRun();

      const status = service.getStatus();
      expect(status.lastRunAt).not.toBeNull();
      expect(status.lastRunResult).not.toBeNull();
      expect(status.lastRunResult?.processed).toBe(0);
    });
  });

  // ============================================================================
  // Configuration Tests
  // ============================================================================

  describe('configuration', () => {
    it('should use default configuration when env vars not set', () => {
      const status = service.getStatus();
      expect(status.enabled).toBe(true); // Default
    });

    it('should disable scheduler when env var is false', async () => {
      // Create new service instance with scheduler disabled
      const originalEnv = process.env.PAYMENT_BILLING_SCHEDULER_ENABLED;
      process.env.PAYMENT_BILLING_SCHEDULER_ENABLED = 'false';

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          BillingSchedulerService,
          {
            provide: SubscriptionManagerService,
            useValue: { chargeSubscription: jest.fn() },
          },
          {
            provide: SubscriptionStateMachineService,
            useValue: { transition: jest.fn() },
          },
          {
            provide: 'ISubscriptionRepository',
            useValue: { findNeedingBilling: jest.fn() },
          },
          {
            provide: ConfigService,
            useValue: { get: jest.fn() },
          },
        ],
      }).compile();

      const disabledService = module.get<BillingSchedulerService>(BillingSchedulerService);
      const disabledStatus = disabledService.getStatus();

      expect(disabledStatus.enabled).toBe(false);

      // Restore env
      if (originalEnv === undefined) {
        delete process.env.PAYMENT_BILLING_SCHEDULER_ENABLED;
      } else {
        process.env.PAYMENT_BILLING_SCHEDULER_ENABLED = originalEnv;
      }
    });
  });

  // ============================================================================
  // Concurrency Tests
  // ============================================================================

  describe('concurrency', () => {
    it('should not run multiple billing jobs simultaneously', async () => {
      const subscriptions = [
        createMockSubscription({ id: 'sub_1' }),
        createMockSubscription({ id: 'sub_2' }),
      ];
      subscriptionRepo.findNeedingBilling.mockResolvedValue(subscriptions);
      
      // Make chargeSubscription slow
      subscriptionManager.chargeSubscription.mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({
          success: true,
          subscription: null,
          order: null,
          transactionId: 'txn',
          error: null,
        }), 100)),
      );

      // Start first run
      const firstRunPromise = service.triggerBillingRun();
      
      // Try to start second run while first is running
      const secondRunResult = await service.triggerBillingRun();

      // Second run should be skipped
      expect(secondRunResult.processed).toBe(0);

      // Wait for first run to complete
      await firstRunPromise;
    });
  });
});
