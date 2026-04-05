import { Test, TestingModule } from '@nestjs/testing';
import { DeviceSessionService } from './device-session.service';
import { DRIZZLE_TOKEN } from '../../database/drizzle.module';

type MockDb = {
  select: jest.Mock;
  from: jest.Mock;
  where: jest.Mock;
  orderBy: jest.Mock;
  limit: jest.Mock;
  insert: jest.Mock;
  values: jest.Mock;
};

describe('DeviceSessionService', () => {
  let service: DeviceSessionService;
  let mockDb: MockDb;

  const mockDeviceSession = {
    id: 'session-123',
    userId: 'user-123',
    appId: 'com.test.app',
    deviceModel: 'iPhone14,2',
    osVersion: '16.0',
    appVersion: '1.2.3',
    buildNumber: '123',
    platform: 'ios',
    manufacturer: 'Apple',
    brand: 'iPhone',
    locale: 'en-US',
    timezone: 'America/New_York',
    createdAt: new Date('2024-01-01'),
  };

  beforeEach(async () => {
    const mockChain = {
      select: jest.fn().mockReturnThis(),
      from: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      limit: jest.fn().mockResolvedValue([mockDeviceSession]),
      insert: jest.fn().mockReturnThis(),
      values: jest.fn().mockResolvedValue(undefined),
    };

    mockDb = mockChain;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeviceSessionService,
        {
          provide: DRIZZLE_TOKEN,
          useValue: mockDb,
        },
      ],
    }).compile();

    service = module.get<DeviceSessionService>(DeviceSessionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createDto = {
      appId: 'com.test.app',
      deviceModel: 'iPhone14,2',
      osVersion: '16.0',
      appVersion: '1.2.3',
      buildNumber: '123',
      platform: 'ios',
      manufacturer: 'Apple',
      brand: 'iPhone',
      locale: 'en-US',
      timezone: 'America/New_York',
    };

    it('should create device session when no previous session exists', async () => {
      mockDb.limit.mockResolvedValueOnce([]);

      const result = await service.create('user-123', createDto);

      expect(result.created).toBe(true);
      expect(result.message).toBe('Device session recorded');
      expect(mockDb.insert).toHaveBeenCalled();
      expect(mockDb.values).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user-123',
          appId: createDto.appId,
          deviceModel: createDto.deviceModel,
          osVersion: createDto.osVersion,
          appVersion: createDto.appVersion,
          buildNumber: createDto.buildNumber,
        }),
      );
    });

    it('should create device session when device model changes', async () => {
      mockDb.limit.mockResolvedValueOnce([
        { ...mockDeviceSession, deviceModel: 'iPhone13,1' },
      ]);

      const result = await service.create('user-123', createDto);

      expect(result.created).toBe(true);
      expect(mockDb.insert).toHaveBeenCalled();
    });

    it('should create device session when OS version changes', async () => {
      mockDb.limit.mockResolvedValueOnce([
        { ...mockDeviceSession, osVersion: '15.0' },
      ]);

      const result = await service.create('user-123', createDto);

      expect(result.created).toBe(true);
      expect(mockDb.insert).toHaveBeenCalled();
    });

    it('should create device session when app version changes', async () => {
      mockDb.limit.mockResolvedValueOnce([
        { ...mockDeviceSession, appVersion: '1.0.0' },
      ]);

      const result = await service.create('user-123', createDto);

      expect(result.created).toBe(true);
      expect(mockDb.insert).toHaveBeenCalled();
    });

    it('should create device session when build number changes', async () => {
      mockDb.limit.mockResolvedValueOnce([
        { ...mockDeviceSession, buildNumber: '100' },
      ]);

      const result = await service.create('user-123', createDto);

      expect(result.created).toBe(true);
      expect(mockDb.insert).toHaveBeenCalled();
    });

    it('should not create session when no major fields changed', async () => {
      mockDb.limit.mockResolvedValueOnce([
        {
          deviceModel: createDto.deviceModel,
          osVersion: createDto.osVersion,
          appVersion: createDto.appVersion,
          buildNumber: createDto.buildNumber,
        },
      ]);

      const result = await service.create('user-123', createDto);

      expect(result.created).toBe(false);
      expect(result.message).toBe('No change detected');
      expect(mockDb.insert).not.toHaveBeenCalled();
    });

    it('should handle optional fields as null when not provided', async () => {
      mockDb.limit.mockResolvedValueOnce([]);

      const minimalDto = {
        appId: 'com.test.app',
        deviceModel: 'Pixel 6',
        appVersion: '1.0.0',
        buildNumber: '1',
      };

      await service.create('user-123', minimalDto);

      expect(mockDb.values).toHaveBeenCalledWith(
        expect.objectContaining({
          osVersion: null,
          platform: null,
          manufacturer: null,
          brand: null,
          locale: null,
          timezone: null,
        }),
      );
    });

    it('should throw error when database insert fails', async () => {
      mockDb.limit.mockResolvedValueOnce([]);
      mockDb.values.mockRejectedValueOnce(new Error('DB Error'));

      await expect(service.create('user-123', createDto)).rejects.toThrow(
        'DB Error',
      );
    });
  });

  describe('getLatestForUser', () => {
    it('should return latest device session for user', async () => {
      mockDb.limit.mockResolvedValueOnce([mockDeviceSession]);

      const result = await service.getLatestForUser('user-123');

      expect(result).toEqual(mockDeviceSession);
      expect(mockDb.select).toHaveBeenCalled();
      expect(mockDb.from).toHaveBeenCalled();
      expect(mockDb.where).toHaveBeenCalled();
      expect(mockDb.orderBy).toHaveBeenCalled();
    });

    it('should return null when no sessions exist', async () => {
      mockDb.limit.mockResolvedValueOnce([]);

      const result = await service.getLatestForUser('user-123');

      expect(result).toBeNull();
    });
  });
});
