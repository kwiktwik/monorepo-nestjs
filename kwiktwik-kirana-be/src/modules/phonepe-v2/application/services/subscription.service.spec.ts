import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { PhonePeHttpClient } from '../../infrastructure/http/phonepe-http.client';
import { PhonePeAuthManager } from '../../infrastructure/http/auth-manager';
import {
  SubscriptionRepository,
  RedemptionRepository,
} from '../interfaces/repository.interface';
import { Subscription } from '../../domain/entities/subscription.entity';
import { Redemption } from '../../domain/entities/redemption.entity';
import {
  SUBSCRIPTION_REPOSITORY,
  REDEMPTION_REPOSITORY,
  SUBSCRIPTION_SETUP,
} from '../../constants';

describe('SubscriptionService', () => {
  let service: SubscriptionService;
  let httpClient: jest.Mocked<PhonePeHttpClient>;
  let subscriptionRepo: jest.Mocked<SubscriptionRepository>;
  let redemptionRepo: jest.Mocked<RedemptionRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubscriptionService,
        {
          provide: PhonePeHttpClient,
          useValue: {
            setupSubscription: jest.fn(),
            notifyRedemption: jest.fn(),
            executeRedemption: jest.fn(),
            getSubscriptionStatus: jest.fn(),
            getOrderStatus: jest.fn(),
          },
        },
        {
          provide: PhonePeAuthManager,
          useValue: {
            getCredentials: jest.fn().mockReturnValue({
              merchantId: 'PGTESTPAYUAT',
            }),
          },
        },
        {
          provide: SUBSCRIPTION_REPOSITORY,
          useValue: {
            create: jest.fn(),
            findById: jest.fn(),
            findByMerchantSubscriptionId: jest.fn(),
            findByUserId: jest.fn(),
            findActive: jest.fn(),
            update: jest.fn(),
            existsByMerchantSubscriptionId: jest.fn(),
          },
        },
        {
          provide: REDEMPTION_REPOSITORY,
          useValue: {
            create: jest.fn(),
            findById: jest.fn(),
            findByMerchantOrderId: jest.fn(),
            findBySubscriptionId: jest.fn(),
            findActiveBySubscriptionId: jest.fn(),
            update: jest.fn(),
            findPendingNotifications: jest.fn(),
            findStuckRedemptions: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<SubscriptionService>(SubscriptionService);
    httpClient = module.get(PhonePeHttpClient);
    subscriptionRepo = module.get(SUBSCRIPTION_REPOSITORY);
    redemptionRepo = module.get(REDEMPTION_REPOSITORY);
  });

  describe('setupSubscription', () => {
    const setupRequest = {
      userId: 'user123',
      appId: 'app123',
      planId: 'plan_PHONEPE_AUTOPAY_001',
      deviceOS: 'ANDROID' as const,
      targetApp: 'com.phonepe.app',
    };

    it('should setup a subscription successfully', async () => {
      subscriptionRepo.existsByMerchantSubscriptionId.mockResolvedValue(false);
      subscriptionRepo.create.mockImplementation((sub) => Promise.resolve(sub));
      subscriptionRepo.update.mockImplementation((sub) => Promise.resolve(sub));
      httpClient.setupSubscription.mockResolvedValue({
        orderId: 'phonepe_order_123',
        state: 'PENDING',
        intentUrl:
          'ppesim://mandate?pa=VRUAT@ybl&pn=SUBSCRIBEMID&am=300&tr=phonepe_order_123',
      });

      const result = await service.setupSubscription(setupRequest);

      expect(result).toHaveProperty('merchantSubscriptionId');
      expect(result).toHaveProperty('merchantOrderId');
      expect(result.intentUrl).toBe(
        'ppesim://mandate?pa=VRUAT@ybl&pn=SUBSCRIBEMID&am=300&tr=phonepe_order_123',
      );
      expect(result.state).toBe('PENDING');
      expect(subscriptionRepo.create).toHaveBeenCalled();
      expect(httpClient.setupSubscription).toHaveBeenCalledWith(
        setupRequest.appId,
        expect.objectContaining({
          merchantOrderId: expect.any(String),
          amount: 100, // ₹1 from plan
          paymentFlow: expect.objectContaining({
            type: SUBSCRIPTION_SETUP,
            merchantSubscriptionId: expect.any(String),
            maxAmount: 19900, // ₹199 from plan
            frequency: 'MONTHLY',
            paymentMode: expect.objectContaining({
              type: 'UPI_INTENT',
              targetApp: 'com.phonepe.app',
            }),
          }),
          deviceContext: expect.objectContaining({
            deviceOS: 'ANDROID',
          }),
        }),
      );
    });

    it('should throw BadRequestException if subscription ID already exists', async () => {
      subscriptionRepo.existsByMerchantSubscriptionId.mockResolvedValue(true);

      await expect(
        service.setupSubscription({
          ...setupRequest,
          merchantSubscriptionId: 'existing_sub',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should use custom merchantSubscriptionId if provided', async () => {
      subscriptionRepo.existsByMerchantSubscriptionId.mockResolvedValue(false);
      subscriptionRepo.create.mockImplementation((sub) => Promise.resolve(sub));
      subscriptionRepo.update.mockImplementation((sub) => Promise.resolve(sub));
      httpClient.setupSubscription.mockResolvedValue({
        orderId: 'phonepe_order_123',
        state: 'PENDING',
        intentUrl:
          'ppesim://mandate?pa=VRUAT@ybl&pn=SUBSCRIBEMID&am=300&tr=phonepe_order_123',
      });

      const result = await service.setupSubscription({
        ...setupRequest,
        merchantSubscriptionId: 'my_custom_sub_123',
      });

      expect(result.merchantSubscriptionId).toBe('my_custom_sub_123');
    });

    it('should convert amounts from rupees to paise', async () => {
      subscriptionRepo.existsByMerchantSubscriptionId.mockResolvedValue(false);
      subscriptionRepo.create.mockImplementation((sub) => Promise.resolve(sub));
      subscriptionRepo.update.mockImplementation((sub) => Promise.resolve(sub));
      httpClient.setupSubscription.mockResolvedValue({
        orderId: 'phonepe_order_123',
        state: 'PENDING',
        intentUrl:
          'ppesim://mandate?pa=VRUAT@ybl&pn=SUBSCRIBEMID&am=300&tr=phonepe_order_123',
      });

      await service.setupSubscription(setupRequest);

      expect(httpClient.setupSubscription).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          amount: 100, // ₹1 -> 100 paise (from plan_PHONEPE_AUTOPAY_001)
        }),
      );
    });

    it('should use iOS defaults when deviceOS is IOS', async () => {
      subscriptionRepo.existsByMerchantSubscriptionId.mockResolvedValue(false);
      subscriptionRepo.create.mockImplementation((sub) => Promise.resolve(sub));
      subscriptionRepo.update.mockImplementation((sub) => Promise.resolve(sub));
      httpClient.setupSubscription.mockResolvedValue({
        orderId: 'phonepe_order_123',
        state: 'PENDING',
        intentUrl:
          'ppesim://mandate?pa=VRUAT@ybl&pn=SUBSCRIBEMID&am=300&tr=phonepe_order_123',
      });

      await service.setupSubscription({
        ...setupRequest,
        deviceOS: 'IOS',
        targetApp: 'PHONEPE',
      });

      expect(httpClient.setupSubscription).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          deviceContext: expect.objectContaining({
            deviceOS: 'IOS',
          }),
          paymentFlow: expect.objectContaining({
            paymentMode: expect.objectContaining({
              type: 'UPI_INTENT',
              targetApp: 'PHONEPE',
            }),
          }),
        }),
      );
    });

    it('should sync subscription from order status and activate if completed', async () => {
      const mockSubscription = {
        id: 'sub_id',
        merchantSubscriptionId: 'sub_123',
        userId: 'user123',
        appId: 'app123',
        state: 'ACTIVATION_IN_PROGRESS',
        maxAmount: 19900,
        frequency: 'MONTHLY',
        activate: jest.fn(),
        canRedeem: jest.fn().mockReturnValue(false),
        metadata: { environment: 'SANDBOX' },
      } as unknown as Subscription;

      subscriptionRepo.findByMerchantSubscriptionId.mockResolvedValue(
        mockSubscription,
      );
      subscriptionRepo.update.mockImplementation((sub) => Promise.resolve(sub));
      httpClient.getOrderStatus.mockResolvedValue({
        merchantId: 'PGTESTPAYUAT',
        merchantOrderId: 'order_123',
        orderId: 'phonepe_order_123',
        state: 'COMPLETED',
        amount: 100,
        expireAt: Date.now() + 1800000,
        paymentDetails: [
          {
            transactionId: 'txn_123',
            paymentMode: 'UPI_AUTO_PAY',
            timestamp: Date.now(),
            amount: 100,
            state: 'COMPLETED',
          },
        ],
      });
      httpClient.getSubscriptionStatus.mockResolvedValue({
        merchantSubscriptionId: 'sub_123',
        subscriptionId: 'phonepe_sub_123',
        state: 'ACTIVE',
        productType: 'UPI_MANDATE',
        authInstrumentType: null,
        authWorkflowType: 'TRANSACTION',
        amountType: 'FIXED',
        currency: 'INR',
        maxAmount: 19900,
        frequency: 'MONTHLY',
        expireAt: Date.now() + 86400000 * 30,
        pauseStartDate: null,
        pauseEndDate: null,
      });

      const result = await service.syncSubscriptionFromOrder(
        'app123',
        'order_123',
        'sub_123',
      );

      expect(mockSubscription.activate).toHaveBeenCalledWith(
        'phonepe_order_123',
      );
      expect(subscriptionRepo.update).toHaveBeenCalled();
      expect(result.state).toBe('ACTIVE');
    });

    it('should not activate subscription if order is not completed', async () => {
      const mockSubscription = {
        id: 'sub_id',
        merchantSubscriptionId: 'sub_123',
        userId: 'user123',
        appId: 'app123',
        state: 'ACTIVATION_IN_PROGRESS',
        maxAmount: 19900,
        frequency: 'MONTHLY',
        activate: jest.fn(),
        canRedeem: jest.fn().mockReturnValue(false),
        metadata: { environment: 'SANDBOX' },
      } as unknown as Subscription;

      subscriptionRepo.findByMerchantSubscriptionId.mockResolvedValue(
        mockSubscription,
      );
      httpClient.getOrderStatus.mockResolvedValue({
        merchantId: 'PGTESTPAYUAT',
        merchantOrderId: 'order_123',
        orderId: 'phonepe_order_123',
        state: 'PENDING',
        amount: 100,
        expireAt: Date.now() + 1800000,
      });
      httpClient.getSubscriptionStatus.mockResolvedValue({
        merchantSubscriptionId: 'sub_123',
        subscriptionId: 'phonepe_sub_123',
        state: 'ACTIVATION_IN_PROGRESS',
        productType: 'UPI_MANDATE',
        authInstrumentType: null,
        authWorkflowType: 'TRANSACTION',
        amountType: 'FIXED',
        currency: 'INR',
        maxAmount: 19900,
        frequency: 'MONTHLY',
        expireAt: Date.now() + 86400000 * 30,
        pauseStartDate: null,
        pauseEndDate: null,
      });

      const result = await service.syncSubscriptionFromOrder(
        'app123',
        'order_123',
        'sub_123',
      );

      expect(mockSubscription.activate).not.toHaveBeenCalled();
      expect(result.state).toBe('ACTIVATION_IN_PROGRESS');
    });
  });

  describe('notifyRedemption', () => {
    const notifyRequest = {
      userId: 'user123',
      appId: 'app123',
      merchantSubscriptionId: 'sub_123',
      amount: 100,
    };

    const mockSubscription = {
      id: 'sub_id',
      merchantSubscriptionId: 'sub_123',
      userId: 'user123',
      appId: 'app123',
      state: 'ACTIVE',
      maxAmount: 100000,
      frequency: 'MONTHLY',
      canRedeem: jest.fn().mockReturnValue(true),
    } as unknown as Subscription;

    it('should notify redemption successfully', async () => {
      subscriptionRepo.findByMerchantSubscriptionId.mockResolvedValue(
        mockSubscription,
      );
      redemptionRepo.findActiveBySubscriptionId.mockResolvedValue(null);
      redemptionRepo.create.mockImplementation((red) => Promise.resolve(red));
      redemptionRepo.update.mockImplementation((red) => Promise.resolve(red));
      httpClient.notifyRedemption.mockResolvedValue({
        orderId: 'phonepe_order_456',
        state: 'NOTIFICATION_IN_PROGRESS',
        expireAt: Date.now() + 86400000,
      });

      const result = await service.notifyRedemption(notifyRequest);

      expect(result).toHaveProperty('merchantOrderId');
      expect(result.state).toBe('NOTIFICATION_IN_PROGRESS');
      expect(redemptionRepo.create).toHaveBeenCalled();
      expect(httpClient.notifyRedemption).toHaveBeenCalledWith(
        notifyRequest.appId,
        expect.objectContaining({
          merchantOrderId: expect.any(String),
          amount: 10000,
          paymentFlow: expect.objectContaining({
            type: 'SUBSCRIPTION_REDEMPTION',
            merchantSubscriptionId: 'sub_123',
          }),
        }),
      );
    });

    it('should throw NotFoundException if subscription not found', async () => {
      subscriptionRepo.findByMerchantSubscriptionId.mockResolvedValue(null);

      await expect(service.notifyRedemption(notifyRequest)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException if subscription does not belong to user', async () => {
      subscriptionRepo.findByMerchantSubscriptionId.mockResolvedValue({
        ...mockSubscription,
        userId: 'different_user',
      } as unknown as Subscription);

      await expect(service.notifyRedemption(notifyRequest)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if subscription does not belong to app', async () => {
      subscriptionRepo.findByMerchantSubscriptionId.mockResolvedValue({
        ...mockSubscription,
        appId: 'different_app',
      } as unknown as Subscription);

      await expect(service.notifyRedemption(notifyRequest)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if subscription is not active', async () => {
      subscriptionRepo.findByMerchantSubscriptionId.mockResolvedValue({
        ...mockSubscription,
        state: 'PAUSED',
        canRedeem: jest.fn().mockReturnValue(false),
      } as unknown as Subscription);

      await expect(service.notifyRedemption(notifyRequest)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if active redemption already exists', async () => {
      subscriptionRepo.findByMerchantSubscriptionId.mockResolvedValue(
        mockSubscription,
      );
      redemptionRepo.findActiveBySubscriptionId.mockResolvedValue({
        id: 'existing_redemption',
      } as Redemption);

      await expect(service.notifyRedemption(notifyRequest)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should convert amount from rupees to paise', async () => {
      subscriptionRepo.findByMerchantSubscriptionId.mockResolvedValue(
        mockSubscription,
      );
      redemptionRepo.findActiveBySubscriptionId.mockResolvedValue(null);
      redemptionRepo.create.mockImplementation((red) => Promise.resolve(red));
      redemptionRepo.update.mockImplementation((red) => Promise.resolve(red));
      httpClient.notifyRedemption.mockResolvedValue({
        orderId: 'phonepe_order_456',
        state: 'NOTIFICATION_IN_PROGRESS',
        expireAt: Date.now() + 86400000,
      });

      await service.notifyRedemption(notifyRequest);

      expect(httpClient.notifyRedemption).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          amount: 10000, // 100 INR -> 10000 paise
        }),
      );
    });
  });

  describe('executeRedemption', () => {
    const executeRequest = {
      userId: 'user123',
      appId: 'app123',
      merchantSubscriptionId: 'sub_123',
      amount: 100,
    };

    const mockSubscription = {
      id: 'sub_id',
      merchantSubscriptionId: 'sub_123',
      userId: 'user123',
      appId: 'app123',
      state: 'ACTIVE',
      maxAmount: 100000,
      frequency: 'MONTHLY',
      canRedeem: jest.fn().mockReturnValue(true),
    } as unknown as Subscription;

    it('should execute redemption directly (merchant-controlled)', async () => {
      subscriptionRepo.findByMerchantSubscriptionId.mockResolvedValue(
        mockSubscription,
      );
      redemptionRepo.create.mockImplementation((red) => Promise.resolve(red));
      redemptionRepo.update.mockImplementation((red) => Promise.resolve(red));
      httpClient.executeRedemption.mockResolvedValue({
        orderId: 'phonepe_order_789',
        state: 'PENDING',
        expireAt: Date.now() + 86400000,
      });

      const result = await service.executeRedemption(executeRequest);

      expect(result).toHaveProperty('merchantOrderId');
      expect(result.state).toBe('PENDING');
      expect(redemptionRepo.create).toHaveBeenCalled();
      expect(httpClient.executeRedemption).toHaveBeenCalledWith(
        executeRequest.appId,
        expect.objectContaining({
          merchantOrderId: expect.any(String),
          amount: 10000,
          paymentFlow: expect.objectContaining({
            type: 'SUBSCRIPTION_REDEMPTION',
            merchantSubscriptionId: 'sub_123',
          }),
        }),
      );
    });

    it('should throw NotFoundException if subscription not found', async () => {
      subscriptionRepo.findByMerchantSubscriptionId.mockResolvedValue(null);

      await expect(service.executeRedemption(executeRequest)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException if subscription is not active', async () => {
      subscriptionRepo.findByMerchantSubscriptionId.mockResolvedValue({
        ...mockSubscription,
        state: 'PAUSED',
        canRedeem: jest.fn().mockReturnValue(false),
      } as unknown as Subscription);

      await expect(service.executeRedemption(executeRequest)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('getSubscriptionStatus', () => {
    const mockPhonePeStatus = {
      merchantSubscriptionId: 'sub_123',
      subscriptionId: 'phonepe_sub_456',
      state: 'ACTIVE',
      productType: 'UPI_MANDATE',
      authInstrumentType: null,
      authWorkflowType: 'TRANSACTION' as const,
      amountType: 'VARIABLE' as const,
      currency: 'INR',
      maxAmount: 100000,
      frequency: 'MONTHLY' as const,
      expireAt: Date.now() + 86400000 * 30,
      pauseStartDate: null,
      pauseEndDate: null,
    };

    const mockLocalSubscription = {
      id: 'sub_id',
      merchantSubscriptionId: 'sub_123',
      phonepeSubscriptionId: 'phonepe_sub_456',
      userId: 'user123',
      appId: 'app123',
      state: 'ACTIVE',
      maxAmount: 100000,
      frequency: 'MONTHLY',
      canRedeem: jest.fn().mockReturnValue(true),
      metadata: { environment: 'SANDBOX' },
    } as unknown as Subscription;

    it('should return status from PhonePe API', async () => {
      httpClient.getSubscriptionStatus.mockResolvedValue(mockPhonePeStatus);
      subscriptionRepo.findByMerchantSubscriptionId.mockResolvedValue(
        mockLocalSubscription,
      );
      subscriptionRepo.update.mockImplementation((sub) => Promise.resolve(sub));

      const result = await service.getSubscriptionStatus('app123', 'sub_123');

      expect(result.state).toBe('ACTIVE');
      expect(result.maxAmount).toBe(1000); // Converted from paise to rupees
      expect(result.canRedeem).toBe(true);
      expect(httpClient.getSubscriptionStatus).toHaveBeenCalledWith(
        'app123',
        'sub_123',
        'SANDBOX',
      );
    });

    it('should fallback to local state if PhonePe API fails', async () => {
      httpClient.getSubscriptionStatus.mockRejectedValue(
        new Error('API Error'),
      );
      subscriptionRepo.findByMerchantSubscriptionId.mockResolvedValue(
        mockLocalSubscription,
      );

      const result = await service.getSubscriptionStatus('app123', 'sub_123');

      expect(result.state).toBe('ACTIVE');
      expect(result.maxAmount).toBe(1000);
    });

    it('should throw NotFoundException if subscription not found locally or in PhonePe', async () => {
      httpClient.getSubscriptionStatus.mockRejectedValue(
        new Error('API Error'),
      );
      subscriptionRepo.findByMerchantSubscriptionId.mockResolvedValue(null);

      await expect(
        service.getSubscriptionStatus('app123', 'nonexistent_sub'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getUserSubscriptions', () => {
    it('should return all user subscriptions', async () => {
      const mockSubscriptions = [
        {
          merchantSubscriptionId: 'sub_1',
          phonepeSubscriptionId: 'phonepe_sub_1',
          state: 'ACTIVE',
          maxAmount: 100000,
          frequency: 'MONTHLY',
          canRedeem: jest.fn().mockReturnValue(true),
        },
        {
          merchantSubscriptionId: 'sub_2',
          phonepeSubscriptionId: null,
          state: 'CREATED',
          maxAmount: 50000,
          frequency: 'DAILY',
          canRedeem: jest.fn().mockReturnValue(false),
        },
      ] as unknown as Subscription[];

      subscriptionRepo.findByUserId.mockResolvedValue(mockSubscriptions);

      const result = await service.getUserSubscriptions('user123', 'app123');

      expect(result).toHaveLength(2);
      expect(result[0].state).toBe('ACTIVE');
      expect(result[0].canRedeem).toBe(true);
      expect(result[1].state).toBe('CREATED');
      expect(result[1].canRedeem).toBe(false);
      expect(subscriptionRepo.findByUserId).toHaveBeenCalledWith(
        'user123',
        'app123',
      );
    });

    it('should return empty array if user has no subscriptions', async () => {
      subscriptionRepo.findByUserId.mockResolvedValue([]);

      const result = await service.getUserSubscriptions('user123', 'app123');

      expect(result).toHaveLength(0);
    });
  });
});
