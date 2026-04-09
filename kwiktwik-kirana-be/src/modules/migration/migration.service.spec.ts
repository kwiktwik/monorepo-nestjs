import { Test, TestingModule } from '@nestjs/testing';
import { MigrationService } from './migration.service';
import { DRIZZLE_TOKEN } from '../../database/drizzle.module';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { BetterAuthValidator } from './services/better-auth-validator.service';
import { KiranaFeDataService } from './services/kirana-fe-data.service';
import { TableMigrationService } from './services/table-migration.service';
import {
  MigrationState,
  MigrationErrorCode,
} from './interfaces/migration.interfaces';

describe('MigrationService', () => {
  let service: MigrationService;
  let mockDb: any;
  let mockJwtService: any;
  let mockConfigService: any;
  let mockBetterAuthValidator: any;
  let mockKiranaFeDataService: any;
  let mockTableMigrationService: any;

  beforeEach(async () => {
    mockDb = {
      insert: jest.fn().mockReturnThis(),
      values: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      from: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      limit: jest.fn().mockResolvedValue([]),
      update: jest.fn().mockReturnThis(),
      set: jest.fn().mockReturnThis(),
    };

    mockJwtService = {
      sign: jest.fn().mockReturnValue('mock-jwt-token'),
    };

    mockConfigService = {
      get: jest.fn((key: string, defaultValue: any) => defaultValue),
    };

    mockBetterAuthValidator = {
      validateSessionWithDetails: jest.fn(),
    };

    mockKiranaFeDataService = {
      fetchAllUserData: jest.fn(),
      checkMigrationStatusInOldSystem: jest.fn(),
      markUserAsMigratedInOldSystem: jest.fn(),
    };

    mockTableMigrationService = {
      migrateUser: jest.fn().mockResolvedValue([{ id: 'user-1' }]),
      migrateMetadata: jest.fn().mockResolvedValue([{ id: 'meta-1' }]),
      migrateAccounts: jest.fn().mockResolvedValue([]),
      migratePushTokens: jest.fn().mockResolvedValue([]),
      migrateDeviceSessions: jest.fn().mockResolvedValue([]),
      migrateUserImages: jest.fn().mockResolvedValue([]),
      migratePlayStoreRatings: jest.fn().mockResolvedValue([]),
      migrateSubscriptions: jest.fn().mockResolvedValue([]),
      migrateOrders: jest.fn().mockResolvedValue([]),
      migrateAbandonedCheckouts: jest.fn().mockResolvedValue([]),
      migratePhonepeOrders: jest.fn().mockResolvedValue([]),
      migratePhonepeSubscriptions: jest.fn().mockResolvedValue([]),
      migrateEnhancedNotifications: jest.fn().mockResolvedValue([]),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MigrationService,
        { provide: DRIZZLE_TOKEN, useValue: mockDb },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: BetterAuthValidator, useValue: mockBetterAuthValidator },
        { provide: KiranaFeDataService, useValue: mockKiranaFeDataService },
        { provide: TableMigrationService, useValue: mockTableMigrationService },
      ],
    }).compile();

    service = module.get<MigrationService>(MigrationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('migrateUser', () => {
    const mockSessionData = {
      userId: 'user-123',
      phoneNumber: '+919876543210',
    };

    const mockSourceData = {
      user: { id: 'user-123', phoneNumber: '+919876543210' },
      metadata: [],
      accounts: [],
      pushTokens: [],
      deviceSessions: [],
      userImages: [],
      playStoreRatings: [],
      subscriptions: [],
      orders: [],
      abandonedCheckouts: [],
      phonepeOrders: [],
      phonepeSubscriptions: [],
      enhancedNotifications: [],
    };

    it('should fail when session validation fails', async () => {
      mockBetterAuthValidator.validateSessionWithDetails.mockResolvedValue({
        success: false,
        errorDetails: {
          httpStatus: 401,
          responseBody: 'Unauthorized',
          durationMs: 100,
          kiranaFeUrl: 'http://test',
          tokenType: 'bearer',
          tokenLength: 20,
          errorType: 'UNAUTHORIZED',
          suggestion: 'Check token',
        },
        errorMessage: 'Session invalid',
      });

      const result = await service.migrateUser('invalid-token', 'device-1');

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe(MigrationErrorCode.SESSION_INVALID);
    });

    it('should migrate user successfully', async () => {
      mockBetterAuthValidator.validateSessionWithDetails.mockResolvedValue({
        success: true,
        session: mockSessionData,
      });
      mockKiranaFeDataService.checkMigrationStatusInOldSystem.mockResolvedValue(
        {
          isMigrated: false,
        },
      );
      mockKiranaFeDataService.fetchAllUserData.mockResolvedValue(
        mockSourceData,
      );

      const result = await service.migrateUser('valid-token', 'device-1');

      expect(result.success).toBe(true);
      expect(result.userId).toBe('user-123');
      expect(result.token).toBe('mock-jwt-token');
    });

    it('should handle already migrated user in old system', async () => {
      mockBetterAuthValidator.validateSessionWithDetails.mockResolvedValue({
        success: true,
        session: mockSessionData,
      });
      mockKiranaFeDataService.checkMigrationStatusInOldSystem.mockResolvedValue(
        {
          isMigrated: true,
          migratedAt: new Date(),
        },
      );
      mockKiranaFeDataService.fetchAllUserData.mockResolvedValue(
        mockSourceData,
      );

      const result = await service.migrateUser('token', 'device-1');

      expect(result.success).toBe(true);
    });
  });
});
