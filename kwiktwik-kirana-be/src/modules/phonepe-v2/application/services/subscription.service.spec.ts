import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { PhonePeHttpClient } from '../../infrastructure/http/phonepe-http.client';
import {
  SubscriptionRepository,
  RedemptionRepository,
} from '../interfaces/repository.interface';
import { Subscription } from '../../domain/entities/subscription.entity';
import { Redemption } from '../../domain/entities/redemption.entity';
import {
  SUBSCRIPTION_REPOSITORY,
  REDEMPTION_REPOSITORY,
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
            getSubscriptionStatus: jest.fn(),
            getOrderStatus: jest.fn(),
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
      amount: 100,
      maxAmount: 1000,
      frequency: 'MONTHLY' as const,
      redirectUrl: 'https://example.com/callback',
    };

    it('should setup a subscription successfully', async () => {
      subscriptionRepo.existsByMerchantSubscriptionId.mockResolvedValue(false);
      subscriptionRepo.create.mockImplementation((sub) => Promise.resolve(sub));
      subscriptionRepo.update.mockImplementation((sub) => Promise.resolve(sub));
      httpClient.setupSubscription.mockResolvedValue({
        orderId: 'phonepe_order_123',
        state: 'PENDING',
        expireAt: Date.now() + 1800000,
        redirectUrl: 'https://phonepe.com/checkout/123',
      });

      const result = await service.setupSubscription(setupRequest);

      expect(result).toHaveProperty('merchantSubscriptionId');
      expect(result).toHaveProperty('merchantOrderId');
      expect(result.redirectUrl).toBe('https://phonepe.com/checkout/123');
      expect(result.state).toBe('PENDING');
      expect(subscriptionRepo.create).toHaveBeenCalled();
      expect(httpClient.setupSubscription).toHaveBeenCalledWith(
        setupRequest.appId,
        expect.objectContaining({
          merchantOrderId: expect.any(String),
          amount: 10000,
          paymentFlow: expect.objectContaining({
            type: 'SUBSCRIPTION_CHECKOUT_SETUP',
            subscriptionDetails: expect.objectContaining({
              maxAmount: 100000,
              frequency: 'MONTHLY',
            }),
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
        expireAt: Date.now() + 1800000,
        redirectUrl: 'https://phonepe.com/checkout/123',
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
        expireAt: Date.now() + 1800000,
        redirectUrl: 'https://phonepe.com/checkout/123',
      });

      await service.setupSubscription(setupRequest);

      expect(httpClient.setupSubscription).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          amount: 10000, // 100 INR -> 10000 paise
        }),
      );
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
            type: 'SUBSCRIPTION_CHECKOUT_REDEMPTION',
            redemptionRetryStrategy: 'STANDARD',
            autoDebit: true,
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
