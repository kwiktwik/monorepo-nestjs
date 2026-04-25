import { Test, TestingModule } from '@nestjs/testing';
import { MigrationController } from './migration.controller';
import { MigrationService } from './migration.service';
import { AppIdGuard } from '../../common/guards/app-id.guard';

describe('MigrationController', () => {
  let controller: MigrationController;
  let service: MigrationService;

  const mockMigrationService = {
    migrateUser: jest.fn(),
    getMigrationStatus: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MigrationController],
      providers: [
        { provide: MigrationService, useValue: mockMigrationService },
      ],
    })
      .overrideGuard(AppIdGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<MigrationController>(MigrationController);
    service = module.get<MigrationService>(MigrationService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('migrateSession', () => {
    it('should start migration successfully', async () => {
      const dto = {
        betterAuthToken: 'test-token',
        deviceId: 'device-1',
        deviceInfo: { model: 'iPhone' },
      };

      const mockResult = {
        success: true,
        migrationId: 'mig-123',
        userId: 'user-123',
        token: 'jwt-token',
        migratedTables: ['user'],
        recordsMigrated: 1,
        duration: 1000,
      };

      mockMigrationService.migrateUser.mockResolvedValue(mockResult);

      const result = await controller.migrateSession(dto, 'com.kiranaapps.app');

      expect(service.migrateUser).toHaveBeenCalledWith(
        dto.betterAuthToken,
        dto.deviceId,
        dto.deviceInfo,
      );
      expect(result).toMatchObject({
        success: true,
        migrationId: 'mig-123',
        token: 'jwt-token',
      });
    });

    it('should throw error for unsupported app', async () => {
      const dto = {
        betterAuthToken: 'test-token',
        deviceId: 'device-1',
      };

      await expect(
        controller.migrateSession(dto, 'com.other.app'),
      ).rejects.toThrow('Migration only supported for com.kiranaapps.app');
    });

    it('should handle migration failure', async () => {
      const dto = {
        betterAuthToken: 'invalid-token',
        deviceId: 'device-1',
      };

      const mockResult = {
        success: false,
        migrationId: 'mig-123',
        userId: '',
        error: {
          code: 'ERR_SESSION_002',
          message: 'Invalid session',
        },
        migratedTables: [],
        recordsMigrated: 0,
        duration: 100,
      };

      mockMigrationService.migrateUser.mockResolvedValue(mockResult);

      await expect(
        controller.migrateSession(dto, 'com.kiranaapps.app'),
      ).rejects.toThrow();
    });
  });

  describe('getMigrationStatus', () => {
    it('should return migration status', async () => {
      const mockStatus = {
        migrationId: 'mig-123',
        status: 'completed',
        userId: 'user-123',
      };

      mockMigrationService.getMigrationStatus.mockResolvedValue(mockStatus);

      const result = await controller.getMigrationStatus(
        { migrationId: 'mig-123' },
        'com.kiranaapps.app',
      );

      expect(service.getMigrationStatus).toHaveBeenCalledWith('mig-123');
      expect(result).toEqual(mockStatus);
    });

    it('should throw error when migration not found', async () => {
      mockMigrationService.getMigrationStatus.mockResolvedValue(null);

      await expect(
        controller.getMigrationStatus(
          { migrationId: 'mig-123' },
          'com.kiranaapps.app',
        ),
      ).rejects.toThrow('Migration not found');
    });
  });

  describe('migrationProgress', () => {
    it('should return observable for SSE', (done) => {
      const result = controller.migrationProgress({ migrationId: 'mig-123' });

      expect(result).toBeDefined();

      // Subscribe to get first value
      const subscription = result.subscribe({
        next: (event) => {
          expect(event.data).toBeDefined();
          expect(event.data.progress).toBeDefined();
          subscription.unsubscribe();
          done();
        },
      });
    });
  });
});
