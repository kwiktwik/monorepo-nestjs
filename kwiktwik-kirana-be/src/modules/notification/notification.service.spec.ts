import { Test, TestingModule } from '@nestjs/testing';
import { NotificationService } from './notification.service';
import { DRIZZLE_TOKEN } from '../../database/drizzle.module';
import * as schema from '../../database/schema';

// Mock Firebase Admin
jest.mock('firebase-admin', () => ({
  apps: [],
  initializeApp: jest.fn(),
  messaging: () => ({
    sendEachForMulticast: jest.fn(),
  }),
}));

describe('NotificationService', () => {
  let service: NotificationService;
  let mockDb: any;

  const createChainableMock = () => {
    const chainable = {
      select: jest.fn().mockReturnThis(),
      from: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      limit: jest.fn().mockResolvedValue([]),
      orderBy: jest.fn().mockReturnThis(),
      offset: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      values: jest.fn().mockReturnThis(),
      returning: jest.fn().mockResolvedValue([{ id: 1 }]),
      update: jest.fn().mockReturnThis(),
      set: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
    };
    return chainable;
  };

  beforeEach(async () => {
    mockDb = createChainableMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationService,
        {
          provide: DRIZZLE_TOKEN,
          useValue: mockDb,
        },
      ],
    }).compile();

    service = module.get<NotificationService>(NotificationService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const mockUserId = 'test-user-id';
    const mockTimestamp = new Date('2024-01-01');

    beforeEach(() => {
      // Reset mocks
      jest.clearAllMocks();
    });

    it('should parse UPI notification from PhonePe', async () => {
      mockDb.limit.mockResolvedValueOnce([]); // No duplicate
      mockDb.returning
        .mockResolvedValueOnce([{ id: 1 }]) // notificationLogs
        .mockResolvedValueOnce([{ id: 100 }]); // enhancedNotifications

      const dto = {
        package_name: 'com.phonepe.app',
        title: 'You received ₹500 from John Doe',
        content: 'Payment successful',
        timestamp: mockTimestamp.toISOString(),
      };

      const result = await service.create(mockUserId, dto as any);

      expect(result.data[0]).toMatchObject({
        hasTransaction: true,
        amount: '500',
        payerName: 'John',
        transactionType: 'RECEIVED',
      });
    });

    it('should parse UPI notification from Google Pay', async () => {
      mockDb.limit.mockResolvedValueOnce([]); // No duplicate
      mockDb.returning
        .mockResolvedValueOnce([{ id: 1 }]) // notificationLogs
        .mockResolvedValueOnce([{ id: 101 }]); // enhancedNotifications

      const dto = {
        package_name: 'com.google.android.apps.nbu.paisa.user',
        title: '₹1000.00 received from Jane Smith',
        content: 'via Google Pay',
        timestamp: mockTimestamp.toISOString(),
      };

      const result = await service.create(mockUserId, dto as any);

      expect(result.data[0]).toMatchObject({
        hasTransaction: true,
        amount: '1000',
        transactionType: 'RECEIVED',
      });
    });

    it('should NOT parse Gmail notification as UPI even with payment text', async () => {
      mockDb.limit.mockResolvedValueOnce([]); // No duplicate
      mockDb.returning.mockResolvedValueOnce([{ id: 1 }]); // notificationLogs only

      const dto = {
        package_name: 'com.google.android.gm',
        title: 'Payment received',
        content: 'You received ₹500 from client',
        timestamp: mockTimestamp.toISOString(),
      };

      const result = await service.create(mockUserId, dto as any);

      // Gmail notification should NOT be treated as a transaction
      expect(result.data[0]).toMatchObject({
        hasTransaction: false,
        amount: null,
        payerName: null,
        transactionType: 'UNKNOWN',
      });

      // Verify enhancedNotifications.insert was NOT called (only notificationLogs)
      const enhancedNotificationCalls = mockDb.insert.mock.calls.filter(
        (call: any[]) => call[0] === schema.enhancedNotifications,
      );
      expect(enhancedNotificationCalls).toHaveLength(0);
    });

    it('should NOT parse WhatsApp notification as UPI', async () => {
      mockDb.limit.mockResolvedValueOnce([]); // No duplicate
      mockDb.returning.mockResolvedValueOnce([{ id: 1 }]); // notificationLogs only

      const dto = {
        package_name: 'com.whatsapp',
        title: 'Payment received',
        content: 'You received ₹1000 via UPI',
        timestamp: mockTimestamp.toISOString(),
      };

      const result = await service.create(mockUserId, dto as any);

      // WhatsApp notification should NOT be treated as a transaction
      expect(result.data[0]).toMatchObject({
        hasTransaction: false,
        amount: null,
      });
    });

    it('should use client-provided transaction details without parsing', async () => {
      mockDb.limit.mockResolvedValueOnce([]); // No duplicate
      mockDb.returning
        .mockResolvedValueOnce([{ id: 1 }]) // notificationLogs
        .mockResolvedValueOnce([{ id: 102 }]); // enhancedNotifications

      const dto = {
        package_name: 'com.google.android.gm', // Even Gmail!
        title: 'Some email',
        content: 'Email content',
        timestamp: mockTimestamp.toISOString(),
        has_transaction: true,
        amount: '999',
        payer_name: 'Client Name',
        transaction_type: 'RECEIVED',
      };

      const result = await service.create(mockUserId, dto as any);

      // When client provides transaction details, it should be used
      // even if package is not a UPI app
      expect(result.data[0]).toMatchObject({
        hasTransaction: true,
        amount: '999',
        payerName: 'Client Name',
        transactionType: 'RECEIVED',
      });
    });

    it('should handle notification without payment keywords', async () => {
      mockDb.limit.mockResolvedValueOnce([]); // No duplicate
      mockDb.returning.mockResolvedValueOnce([{ id: 1 }]); // notificationLogs only

      const dto = {
        package_name: 'com.phonepe.app',
        title: 'Welcome to PhonePe',
        content: 'Thanks for installing our app',
        timestamp: mockTimestamp.toISOString(),
      };

      const result = await service.create(mockUserId, dto as any);

      // No payment keywords, so no transaction
      expect(result.data[0]).toMatchObject({
        hasTransaction: false,
        amount: null,
      });
    });

    it('should handle duplicate notifications', async () => {
      mockDb.limit.mockResolvedValueOnce([{ id: 1 }]); // Duplicate found

      const dto = {
        package_name: 'com.phonepe.app',
        title: 'You received ₹500 from John',
        content: 'Payment successful',
        timestamp: mockTimestamp.toISOString(),
        notification_id: 'duplicate-id-123',
      };

      const result = await service.create(mockUserId, dto as any);

      expect(result.data[0]).toMatchObject({
        status: 'duplicate',
      });
    });
  });

  describe('UPI app validation', () => {
    const mockUserId = 'test-user-id';

    it('should handle all supported UPI apps', async () => {
      const upiApps = [
        'com.phonepe.app',
        'com.google.android.apps.nbu.paisa.user',
        'net.one97.paytm',
        'in.org.npci.upiapp',
        'com.paytm.business',
      ];

      for (const app of upiApps) {
        jest.clearAllMocks();
        mockDb.limit.mockResolvedValueOnce([]); // No duplicate
        mockDb.returning
          .mockResolvedValueOnce([{ id: 1 }]) // notificationLogs
          .mockResolvedValueOnce([{ id: 100 }]); // enhancedNotifications

        const dto = {
          package_name: app,
          title: 'You received ₹100 from Test',
          content: 'Payment successful',
          timestamp: new Date().toISOString(),
        };

        const result = await service.create(mockUserId, dto as any);
        expect(result.data[0]).toMatchObject({
          hasTransaction: true,
        });
      }
    });

    it('should reject non-UPI apps', async () => {
      const nonUpiApps = [
        'com.google.android.gm',
        'com.whatsapp',
        'com.facebook.katana',
        'com.instagram.android',
      ];

      for (const app of nonUpiApps) {
        jest.clearAllMocks();
        mockDb.limit.mockResolvedValueOnce([]); // No duplicate
        mockDb.returning.mockResolvedValueOnce([{ id: 1 }]); // notificationLogs only

        const dto = {
          package_name: app,
          title: 'You received ₹100 from Test',
          content: 'Payment successful',
          timestamp: new Date().toISOString(),
        };

        const result = await service.create(mockUserId, dto as any);
        expect(result.data[0]).toMatchObject({
          hasTransaction: false,
        });
      }
    });
  });
});
