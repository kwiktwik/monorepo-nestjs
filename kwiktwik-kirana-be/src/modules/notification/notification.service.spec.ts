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

  describe('createV2', () => {
    const mockUserId = 'test-user-id';
    const mockTimestamp = new Date('2024-01-01');

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should save pre-parsed transaction notification', async () => {
      mockDb.limit.mockResolvedValueOnce([]); // No duplicate
      mockDb.returning
        .mockResolvedValueOnce([{ id: 1 }]) // notificationLogs
        .mockResolvedValueOnce([{ id: 100 }]); // enhancedNotifications

      const dto = {
        notificationId: 'com.phonepe.app_1709876543210_abc123',
        packageName: 'com.phonepe.app',
        title: 'Payment Received',
        content: 'You received ₹500 from John Doe',
        timestamp: mockTimestamp.toISOString(),
        bigText: 'You received ₹500 from John Doe via UPI',
        appName: 'PhonePe',
        hasTransaction: true,
        amount: '500',
        payerName: 'John Doe',
        transactionType: 'RECEIVED' as const,
        processingTimeMs: 150,
        processingMetadata: { parsedBy: 'android-v2' },
      };

      const result = await service.createV2(mockUserId, dto);

      expect(result.data[0]).toMatchObject({
        status: 'success',
        hasTransaction: true,
        amount: '500',
        payerName: 'John Doe',
        transactionType: 'RECEIVED',
        notificationLogId: 1,
      });

      // Should insert into both tables for transaction notifications
      expect(mockDb.insert).toHaveBeenCalledTimes(2);
    });

    it('should save non-transaction notification (only to notificationLogs)', async () => {
      mockDb.limit.mockResolvedValueOnce([]); // No duplicate
      mockDb.returning.mockResolvedValueOnce([{ id: 2 }]); // notificationLogs only

      const dto = {
        notificationId: 'com.whatsapp_1709876543210_def456',
        packageName: 'com.whatsapp',
        title: 'New Message',
        content: 'Hello! How are you?',
        timestamp: mockTimestamp.toISOString(),
        hasTransaction: false,
        transactionType: 'UNKNOWN' as const,
        appName: 'WhatsApp',
      };

      const result = await service.createV2(mockUserId, dto);

      expect(result.data[0]).toMatchObject({
        status: 'success',
        hasTransaction: false,
        amount: null,
        transactionType: 'UNKNOWN',
        notificationLogId: 2,
      });

      // Should only insert into notificationLogs
      expect(mockDb.insert).toHaveBeenCalledTimes(1);
    });

    it('should handle duplicate notificationId', async () => {
      mockDb.limit.mockResolvedValueOnce([{ id: 1 }]); // Duplicate found

      const dto = {
        notificationId: 'duplicate-id-123',
        packageName: 'com.phonepe.app',
        title: 'Payment Received',
        content: 'You received ₹500',
        timestamp: mockTimestamp.toISOString(),
        hasTransaction: true,
        amount: '500',
        transactionType: 'RECEIVED' as const,
      };

      const result = await service.createV2(mockUserId, dto);

      expect(result.data[0]).toMatchObject({
        status: 'duplicate',
        notificationId: 'duplicate-id-123',
      });

      // Should not insert anything for duplicates
      expect(mockDb.insert).not.toHaveBeenCalled();
    });

    it('should derive appName from packageName if not provided', async () => {
      mockDb.limit.mockResolvedValueOnce([]);
      mockDb.returning.mockResolvedValueOnce([{ id: 3 }]);

      const dto = {
        notificationId: 'test-123',
        packageName: 'com.phonepe.app',
        title: 'Test',
        content: 'Test content',
        timestamp: mockTimestamp.toISOString(),
        hasTransaction: false,
        transactionType: 'UNKNOWN' as const,
        // appName not provided
      };

      await service.createV2(mockUserId, dto);

      // Check that appName was derived
      expect(mockDb.values).toHaveBeenCalledWith(
        expect.objectContaining({
          appName: 'PhonePe',
        }),
      );
    });

    it('should handle SENT transaction type', async () => {
      mockDb.limit.mockResolvedValueOnce([]);
      mockDb.returning
        .mockResolvedValueOnce([{ id: 4 }])
        .mockResolvedValueOnce([{ id: 104 }]);

      const dto = {
        notificationId: 'test-sent-123',
        packageName: 'com.phonepe.app',
        title: 'Payment Sent',
        content: 'You sent ₹200 to Jane',
        timestamp: mockTimestamp.toISOString(),
        hasTransaction: true,
        amount: '200',
        payerName: 'Jane',
        transactionType: 'SENT' as const,
      };

      const result = await service.createV2(mockUserId, dto);

      expect(result.data[0]).toMatchObject({
        transactionType: 'SENT',
        amount: '200',
      });
    });

    it('should handle optional metadata fields', async () => {
      mockDb.limit.mockResolvedValueOnce([]);
      mockDb.returning
        .mockResolvedValueOnce([{ id: 5 }])
        .mockResolvedValueOnce([{ id: 105 }]);

      const dto = {
        notificationId: 'test-metadata-123',
        packageName: 'com.phonepe.app',
        title: 'Payment',
        content: 'Test',
        timestamp: mockTimestamp.toISOString(),
        hasTransaction: true,
        amount: '100',
        transactionType: 'RECEIVED' as const,
        ttsAnnounced: true,
        teamNotificationSent: true,
        processingMetadata: {
          parsedBy: 'android-v2',
          parseTimeMs: 50,
          version: '1.0.0',
        },
      };

      await service.createV2(mockUserId, dto);

      expect(mockDb.values).toHaveBeenCalledWith(
        expect.objectContaining({
          ttsAnnounced: true,
          teamNotificationSent: true,
          processingMetadata: {
            parsedBy: 'android-v2',
            parseTimeMs: 50,
            version: '1.0.0',
          },
        }),
      );
    });
  });
});
