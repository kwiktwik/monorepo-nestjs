import { Test, TestingModule } from '@nestjs/testing';
import { DeviceSessionController } from './device-session.controller';
import { DeviceSessionService } from './device-session.service';

describe('DeviceSessionController', () => {
  let controller: DeviceSessionController;
  let service: DeviceSessionService;

  const mockDeviceSessionService = {
    create: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DeviceSessionController],
      providers: [
        {
          provide: DeviceSessionService,
          useValue: mockDeviceSessionService,
        },
      ],
    }).compile();

    controller = module.get<DeviceSessionController>(DeviceSessionController);
    service = module.get<DeviceSessionService>(DeviceSessionService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    const mockUser = { userId: 'user-123' };
    const createDto = {
      appId: 'com.test.app',
      deviceModel: 'iPhone14,2',
      osVersion: '16.0',
      appVersion: '1.2.3',
      buildNumber: '123',
      platform: 'ios' as const,
      manufacturer: 'Apple',
      brand: 'iPhone',
      locale: 'en-US',
      timezone: 'America/New_York',
    };

    it('should create device session successfully', async () => {
      mockDeviceSessionService.create.mockResolvedValue({
        created: true,
        message: 'Device session recorded',
      });

      const result = await controller.create(mockUser, createDto);

      expect(result).toEqual({
        success: true,
        message: 'Device session recorded',
      });
      expect(service.create).toHaveBeenCalledWith('user-123', createDto);
    });

    it('should return success when no change detected', async () => {
      mockDeviceSessionService.create.mockResolvedValue({
        created: false,
        message: 'No change detected',
      });

      const result = await controller.create(mockUser, createDto);

      expect(result).toEqual({
        success: true,
        message: 'No change detected',
      });
    });

    it('should return success false on error without throwing', async () => {
      mockDeviceSessionService.create.mockRejectedValue(new Error('DB Error'));

      const result = await controller.create(mockUser, createDto);

      expect(result).toEqual({
        success: false,
        message: 'Failed to record device session',
      });
    });
  });
});
