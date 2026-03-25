import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException, BadRequestException } from '@nestjs/common';
import { createHash } from 'crypto';
import { PhonePeWebhookController } from './webhook.controller';
import {
  SubscriptionRepository,
  RedemptionRepository,
} from '../../application/interfaces/repository.interface';
import { Subscription } from '../../domain/entities/subscription.entity';
import { Redemption } from '../../domain/entities/redemption.entity';
import { RedemptionSchedulerService } from '../../application/services/redemption-scheduler.service';
import {
  SUBSCRIPTION_REPOSITORY,
  REDEMPTION_REPOSITORY,
  SUBSCRIPTION_SETUP,
} from '../../constants';
import { DRIZZLE_TOKEN } from '../../../../database/drizzle.module';
import { NotificationService } from '../../../../modules/notification/notification.service';

describe('PhonePeWebhookController', () => {
  let controller: PhonePeWebhookController;
  let configService: jest.Mocked<ConfigService>;
  let subscriptionRepo: jest.Mocked<SubscriptionRepository>;
  let redemptionRepo: jest.Mocked<RedemptionRepository>;
  let redemptionScheduler: jest.Mocked<RedemptionSchedulerService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PhonePeWebhookController],
      providers: [
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
        {
          provide: SUBSCRIPTION_REPOSITORY,
          useValue: {
            findByMerchantSubscriptionId: jest.fn(),
            update: jest.fn(),
          },
        },
        {
          provide: REDEMPTION_REPOSITORY,
          useValue: {
            findByMerchantOrderId: jest.fn(),
            update: jest.fn(),
          },
        },
        {
          provide: RedemptionSchedulerService,
          useValue: {
            scheduleFirstRedemption: jest.fn().mockResolvedValue(undefined),
          },
        },
        {
          provide: DRIZZLE_TOKEN,
          useValue: {
            insert: jest.fn().mockReturnValue({ values: jest.fn() }),
            select: jest.fn().mockReturnValue({
              from: jest
                .fn()
                .mockReturnValue({ where: jest.fn().mockResolvedValue([]) }),
            }),
            update: jest.fn().mockReturnValue({
              set: jest.fn().mockReturnValue({ where: jest.fn() }),
            }),
          },
        },
        {
          provide: NotificationService,
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<PhonePeWebhookController>(PhonePeWebhookController);
    configService = module.get(ConfigService);
    subscriptionRepo = module.get(SUBSCRIPTION_REPOSITORY);
    redemptionRepo = module.get(REDEMPTION_REPOSITORY);
    redemptionScheduler = module.get(RedemptionSchedulerService);
  });

  describe('handleWebhook', () => {
    const webhookAuth = 'testuser:testpass';
    let validAuthHeader: string;

    beforeEach(() => {
      configService.get.mockReturnValue(webhookAuth);
      const expectedHash = createHash('sha256')
        .update(webhookAuth)
        .digest('hex');
      validAuthHeader = `SHA256 ${expectedHash}`;
    });

    it('should handle subscription.setup.order.completed event', async () => {
      const mockSubscription = {
        id: 'sub_id',
        merchantSubscriptionId: 'sub_123',
        state: 'ACTIVATION_IN_PROGRESS',
        phonepeSubscriptionId: null,
        markAsActivationInProgress: jest.fn(),
        activate: jest.fn(),
      } as unknown as Subscription;

      subscriptionRepo.findByMerchantSubscriptionId.mockResolvedValue(
        mockSubscription,
      );
      subscriptionRepo.update.mockResolvedValue(mockSubscription);

      const result = await controller.handleWebhook(
        {
          event: 'subscription.setup.order.completed',
          payload: {
            merchantId: 'merchant_123',
            merchantOrderId: 'order_123',
            orderId: 'phonepe_order_456',
            state: 'COMPLETED',
            paymentFlow: {
              type: SUBSCRIPTION_SETUP,
              merchantSubscriptionId: 'sub_123',
              subscriptionId: 'phonepe_sub_789',
            },
          },
        },
        validAuthHeader,
      );

      expect(result).toEqual({ received: true });
      expect(mockSubscription.activate).toHaveBeenCalledWith(
        'phonepe_sub_789',
        undefined,
      );
      expect(subscriptionRepo.update).toHaveBeenCalled();
    });

    it('should handle subscription.setup.order.failed event', async () => {
      const mockSubscription = {
        id: 'sub_id',
        merchantSubscriptionId: 'sub_123',
        state: 'ACTIVATION_IN_PROGRESS',
        markAsFailed: jest.fn(),
      } as unknown as Subscription;

      subscriptionRepo.findByMerchantSubscriptionId.mockResolvedValue(
        mockSubscription,
      );
      subscriptionRepo.update.mockResolvedValue(mockSubscription);

      const result = await controller.handleWebhook(
        {
          event: 'subscription.setup.order.failed',
          payload: {
            merchantId: 'merchant_123',
            merchantOrderId: 'order_123',
            orderId: 'phonepe_order_456',
            state: 'FAILED',
            paymentFlow: {
              type: SUBSCRIPTION_SETUP,
              merchantSubscriptionId: 'sub_123',
            },
            errorCode: 'USER_CANCELLED',
            detailedErrorCode: 'User cancelled the setup',
          },
        },
        validAuthHeader,
      );

      expect(result).toEqual({ received: true });
      expect(mockSubscription.markAsFailed).toHaveBeenCalled();
    });

    it('should handle subscription.paused event', async () => {
      const mockSubscription = {
        id: 'sub_id',
        merchantSubscriptionId: 'sub_123',
        state: 'ACTIVE',
        pause: jest.fn(),
      } as unknown as Subscription;

      subscriptionRepo.findByMerchantSubscriptionId.mockResolvedValue(
        mockSubscription,
      );
      subscriptionRepo.update.mockResolvedValue(mockSubscription);

      const result = await controller.handleWebhook(
        {
          event: 'subscription.paused',
          payload: {
            merchantSubscriptionId: 'sub_123',
            subscriptionId: 'phonepe_sub_789',
            state: 'PAUSED',
          },
        },
        validAuthHeader,
      );

      expect(result).toEqual({ received: true });
      expect(mockSubscription.pause).toHaveBeenCalled();
    });

    it('should handle subscription.cancelled event', async () => {
      const mockSubscription = {
        id: 'sub_id',
        merchantSubscriptionId: 'sub_123',
        state: 'ACTIVE',
        initiateCancellation: jest.fn(),
        confirmCancellation: jest.fn(),
      } as unknown as Subscription;

      subscriptionRepo.findByMerchantSubscriptionId.mockResolvedValue(
        mockSubscription,
      );
      subscriptionRepo.update.mockResolvedValue(mockSubscription);

      const result = await controller.handleWebhook(
        {
          event: 'subscription.cancelled',
          payload: {
            merchantSubscriptionId: 'sub_123',
            subscriptionId: 'phonepe_sub_789',
            state: 'CANCELLED',
          },
        },
        validAuthHeader,
      );

      expect(result).toEqual({ received: true });
      expect(mockSubscription.initiateCancellation).toHaveBeenCalled();
      expect(mockSubscription.confirmCancellation).toHaveBeenCalled();
    });

    it('should handle subscription.redemption.order.completed event', async () => {
      const mockRedemption = {
        id: 'red_id',
        merchantOrderId: 'order_123',
        state: 'NOTIFIED',
        complete: jest.fn(),
      } as unknown as Redemption;

      redemptionRepo.findByMerchantOrderId.mockResolvedValue(mockRedemption);
      redemptionRepo.update.mockResolvedValue(mockRedemption);

      const result = await controller.handleWebhook(
        {
          event: 'subscription.redemption.order.completed',
          payload: {
            merchantId: 'merchant_123',
            merchantOrderId: 'order_123',
            orderId: 'phonepe_order_456',
            state: 'COMPLETED',
            paymentFlow: {
              type: 'SUBSCRIPTION_REDEMPTION',
              merchantSubscriptionId: 'sub_123',
            },
            paymentDetails: [
              {
                transactionId: 'txn_789',
                state: 'COMPLETED',
              },
            ],
          },
        },
        validAuthHeader,
      );

      expect(result).toEqual({ received: true });
      expect(mockRedemption.complete).toHaveBeenCalledWith('txn_789');
      expect(redemptionRepo.update).toHaveBeenCalled();
    });

    it('should handle subscription.redemption.order.failed event', async () => {
      const mockRedemption = {
        id: 'red_id',
        merchantOrderId: 'order_123',
        state: 'NOTIFIED',
        fail: jest.fn(),
      } as unknown as Redemption;

      redemptionRepo.findByMerchantOrderId.mockResolvedValue(mockRedemption);
      redemptionRepo.update.mockResolvedValue(mockRedemption);

      const result = await controller.handleWebhook(
        {
          event: 'subscription.redemption.order.failed',
          payload: {
            merchantId: 'merchant_123',
            merchantOrderId: 'order_123',
            orderId: 'phonepe_order_456',
            state: 'FAILED',
            paymentFlow: {
              type: 'SUBSCRIPTION_REDEMPTION',
              merchantSubscriptionId: 'sub_123',
            },
            errorCode: 'INSUFFICIENT_FUNDS',
            detailedErrorCode: 'User has insufficient balance',
            paymentDetails: [
              {
                transactionId: 'txn_789',
                state: 'FAILED',
                errorCode: 'INSUFFICIENT_FUNDS',
                detailedErrorCode: 'User has insufficient balance',
              },
            ],
          },
        },
        validAuthHeader,
      );

      expect(result).toEqual({ received: true });
      expect(mockRedemption.fail).toHaveBeenCalledWith(
        'INSUFFICIENT_FUNDS',
        'User has insufficient balance',
      );
    });

    it('should throw UnauthorizedException for invalid auth', async () => {
      configService.get.mockReturnValue('testuser:testpass');

      await expect(
        controller.handleWebhook(
          {
            event: 'subscription.setup.order.completed',
            payload: {} as any,
          },
          'invalid_auth',
        ),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should allow requests when webhook auth is not configured', async () => {
      configService.get.mockReturnValue(undefined);

      const mockSubscription = {
        id: 'sub_id',
        merchantSubscriptionId: 'sub_123',
        state: 'ACTIVATION_IN_PROGRESS',
        activate: jest.fn(),
      } as unknown as Subscription;

      subscriptionRepo.findByMerchantSubscriptionId.mockResolvedValue(
        mockSubscription,
      );
      subscriptionRepo.update.mockResolvedValue(mockSubscription);

      const result = await controller.handleWebhook(
        {
          event: 'subscription.setup.order.completed',
          payload: {
            merchantId: 'merchant_123',
            merchantOrderId: 'order_123',
            orderId: 'phonepe_order_456',
            state: 'COMPLETED',
            paymentFlow: {
              type: SUBSCRIPTION_SETUP,
              merchantSubscriptionId: 'sub_123',
              subscriptionId: 'phonepe_sub_789',
            },
          },
        },
        '',
      );

      expect(result).toEqual({ received: true });
    });

    it('should handle missing subscription gracefully', async () => {
      subscriptionRepo.findByMerchantSubscriptionId.mockResolvedValue(null);

      const result = await controller.handleWebhook(
        {
          event: 'subscription.paused',
          payload: {
            merchantSubscriptionId: 'nonexistent_sub',
            subscriptionId: 'phonepe_sub_789',
            state: 'PAUSED',
          },
        },
        validAuthHeader,
      );

      expect(result).toEqual({ received: true });
      expect(subscriptionRepo.update).not.toHaveBeenCalled();
    });

    it('should handle missing redemption gracefully', async () => {
      redemptionRepo.findByMerchantOrderId.mockResolvedValue(null);

      const result = await controller.handleWebhook(
        {
          event: 'subscription.redemption.order.completed',
          payload: {
            merchantId: 'merchant_123',
            merchantOrderId: 'nonexistent_order',
            orderId: 'phonepe_order_456',
            state: 'COMPLETED',
            paymentFlow: {
              type: 'SUBSCRIPTION_REDEMPTION',
              merchantSubscriptionId: 'sub_123',
            },
          },
        },
        validAuthHeader,
      );

      expect(result).toEqual({ received: true });
      expect(redemptionRepo.update).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException for processing errors', async () => {
      subscriptionRepo.findByMerchantSubscriptionId.mockRejectedValue(
        new Error('Database error'),
      );

      await expect(
        controller.handleWebhook(
          {
            event: 'subscription.paused',
            payload: {
              merchantSubscriptionId: 'sub_123',
              subscriptionId: 'phonepe_sub_789',
              state: 'PAUSED',
            },
          },
          validAuthHeader,
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
