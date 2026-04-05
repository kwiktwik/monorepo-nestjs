import { Test, TestingModule } from '@nestjs/testing';
import { FeatureToggleController } from './feature-toggle.controller';
import { FeatureToggleService } from './feature-toggle.service';

describe('FeatureToggleController', () => {
  let controller: FeatureToggleController;
  let service: FeatureToggleService;

  const mockFeatureToggleService = {
    getAllFlags: jest.fn(),
    evaluateFeature: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FeatureToggleController],
      providers: [
        {
          provide: FeatureToggleService,
          useValue: mockFeatureToggleService,
        },
      ],
    }).compile();

    controller = module.get<FeatureToggleController>(FeatureToggleController);
    service = module.get<FeatureToggleService>(FeatureToggleService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('evaluate', () => {
    it('should evaluate feature successfully', async () => {
      const mockResult = {
        success: true,
        appId: 'com.test.app',
        featureKey: 'test_feature',
        enabled: true,
      };

      mockFeatureToggleService.evaluateFeature.mockResolvedValue(mockResult);

      const mockReq = {
        appId: 'com.test.app',
        identity: { userId: 'user-123' },
      };

      const result = await controller.evaluate(
        { featureKey: 'test_feature' },
        mockReq as any,
      );

      expect(result).toEqual(mockResult);
    });

    it('should handle error response when featureKey is missing', async () => {
      const mockReq = {
        appId: 'com.test.app',
        identity: { userId: 'user-123' },
      };

      const result = await controller.evaluate(null as any, mockReq as any);

      expect(result).toMatchObject({
        success: false,
        code: 'INVALID_FEATURE_KEY',
      });
    });

    it('should re-throw BadRequestException', async () => {
      const error = new Error('BadRequestException');
      error.name = 'BadRequestException';
      mockFeatureToggleService.evaluateFeature.mockRejectedValue(error);

      const mockReq = {
        appId: 'com.test.app',
        identity: { userId: 'user-123' },
      };

      await expect(
        controller.evaluate({ featureKey: 'test' }, mockReq as any),
      ).rejects.toThrow(error);
    });

    it('should handle service errors', async () => {
      mockFeatureToggleService.evaluateFeature.mockRejectedValue(
        new Error('Service error'),
      );

      const mockReq = {
        appId: 'com.test.app',
        identity: { userId: 'user-123' },
      };

      const result = await controller.evaluate(
        { featureKey: 'test' },
        mockReq as any,
      );

      expect(result).toMatchObject({
        success: false,
        code: 'INTERNAL_ERROR',
      });
    });
  });

  describe('getFlags', () => {
    it('should return all flags for app', async () => {
      const mockFlags = [
        {
          key: 'feature_1',
          description: 'Feature 1',
          isEnabled: true,
          defaultValue: { enabled: true },
        },
      ];

      mockFeatureToggleService.getAllFlags.mockResolvedValue(mockFlags);

      const result = await controller.getFlags('com.test.app');

      expect(result).toMatchObject({
        success: true,
        appId: 'com.test.app',
        flags: mockFlags,
      });
    });
  });
});
