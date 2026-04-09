import { Test, TestingModule } from '@nestjs/testing';
import { FeatureToggleService } from './feature-toggle.service';
import { DRIZZLE_TOKEN } from '../../database/drizzle.module';
import { BadRequestException } from '@nestjs/common';

describe('FeatureToggleService', () => {
  let service: FeatureToggleService;
  let mockDb: any;

  const mockFlag = {
    id: 1,
    appId: 'com.test.app',
    key: 'new_feature',
    description: 'A new feature',
    isEnabled: true,
    defaultValue: { enabled: true, value: 'test' },
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockExperiment = {
    id: 1,
    featureFlagId: 1,
    name: 'Test Experiment',
    status: 'running',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockCohort = {
    id: 1,
    experimentId: 1,
    name: 'control',
    weight: 50,
    config: { enabled: true },
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    mockDb = {
      select: jest.fn().mockReturnThis(),
      from: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      limit: jest.fn().mockResolvedValue([]),
      orderBy: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      values: jest.fn().mockResolvedValue(undefined),
      update: jest.fn().mockReturnThis(),
      set: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FeatureToggleService,
        {
          provide: DRIZZLE_TOKEN,
          useValue: mockDb,
        },
      ],
    }).compile();

    service = module.get<FeatureToggleService>(FeatureToggleService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAllFlags', () => {
    it('should return all flags for an app', async () => {
      // Mock the final resolved value of the chain
      mockDb.where.mockResolvedValueOnce([mockFlag]);

      const result = await service.getAllFlags('com.test.app');

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        key: 'new_feature',
        description: 'A new feature',
        isEnabled: true,
      });
    });

    it('should return empty array when no flags exist', async () => {
      mockDb.where.mockResolvedValueOnce([]);

      const result = await service.getAllFlags('com.test.app');

      expect(result).toEqual([]);
    });
  });

  describe('evaluateFeature', () => {
    it('should throw BadRequestException when no identity provided', async () => {
      await expect(
        service.evaluateFeature('com.test.app', 'new_feature', {}),
      ).rejects.toThrow(BadRequestException);
    });

    it('should return disabled when flag not found', async () => {
      mockDb.limit.mockResolvedValueOnce([]);

      const result = await service.evaluateFeature(
        'com.test.app',
        'unknown_feature',
        {
          userId: 'user-123',
        },
      );

      expect(result.enabled).toBe(false);
      expect(result.reason).toContain('not found');
    });

    it('should return disabled when flag is globally disabled', async () => {
      mockDb.limit.mockResolvedValueOnce([{ ...mockFlag, isEnabled: false }]);

      const result = await service.evaluateFeature(
        'com.test.app',
        'new_feature',
        {
          userId: 'user-123',
        },
      );

      expect(result.enabled).toBe(false);
      expect(result.reason).toContain('disabled');
    });

    it('should return flag default when no active experiment', async () => {
      mockDb.limit.mockResolvedValueOnce([mockFlag]).mockResolvedValueOnce([]);

      const result = await service.evaluateFeature(
        'com.test.app',
        'new_feature',
        {
          userId: 'user-123',
        },
      );

      expect(result.enabled).toBe(true);
      expect(result.reason).toContain('No active experiment');
    });

    it('should use existing assignment when available', async () => {
      const mockAssignment = {
        id: 1,
        subjectId: 'user-123',
        experimentId: 1,
        cohortId: 1,
      };

      mockDb.limit
        .mockResolvedValueOnce([mockFlag])
        .mockResolvedValueOnce([mockExperiment])
        .mockResolvedValueOnce([mockAssignment])
        .mockResolvedValueOnce([mockCohort]);

      const result = await service.evaluateFeature(
        'com.test.app',
        'new_feature',
        {
          userId: 'user-123',
        },
      );

      expect(result.enabled).toBe(true);
      expect(result.variant).toBe('control');
      expect(result.experimentId).toBe(1);
    });

    it('should use firebaseInstallationId as priority identity', async () => {
      mockDb.limit.mockResolvedValueOnce([]);

      const result = await service.evaluateFeature('com.test.app', 'unknown', {
        firebaseInstallationId: 'firebase-123',
        deviceId: 'device-123',
        userId: 'user-123',
      });

      expect(result.identity?.type).toBe('firebaseInstallationId');
      expect(result.identity?.value).toBe('firebase-123');
    });

    it('should fallback to deviceId when firebaseInstallationId not available', async () => {
      mockDb.limit.mockResolvedValueOnce([]);

      const result = await service.evaluateFeature('com.test.app', 'unknown', {
        deviceId: 'device-123',
        userId: 'user-123',
      });

      expect(result.identity?.type).toBe('deviceId');
      expect(result.identity?.value).toBe('device-123');
    });

    it('should fallback to userId when other identities not available', async () => {
      mockDb.limit.mockResolvedValueOnce([]);

      const result = await service.evaluateFeature('com.test.app', 'unknown', {
        userId: 'user-123',
      });

      expect(result.identity?.type).toBe('userId');
      expect(result.identity?.value).toBe('user-123');
    });
  });

  describe('evaluateFromRequest', () => {
    it('should throw BadRequestException when appId is missing', async () => {
      await expect(
        service.evaluateFromRequest(
          { appId: '', identity: { userId: 'user-123' } },
          { featureKey: 'test' },
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when featureKey is empty', async () => {
      await expect(
        service.evaluateFromRequest(
          { appId: 'com.test.app', identity: { userId: 'user-123' } },
          { featureKey: '' },
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when identity is missing', async () => {
      await expect(
        service.evaluateFromRequest(
          { appId: 'com.test.app', identity: undefined as any },
          { featureKey: 'test' },
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should evaluate feature successfully', async () => {
      mockDb.limit.mockResolvedValueOnce([]);

      const result = await service.evaluateFromRequest(
        { appId: 'com.test.app', identity: { userId: 'user-123' } },
        { featureKey: 'test', context: { foo: 'bar' } },
      );

      expect(result.success).toBe(true);
      expect(result.featureKey).toBe('test');
    });
  });
});
