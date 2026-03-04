import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { AnalyticsService } from './analytics.service';
import { DeviceSessionService } from '../device-session/device-session.service';

jest.mock('mixpanel', () => ({
  init: jest.fn().mockReturnValue({
    track: jest.fn(),
    people: { set: jest.fn() },
  }),
}));

describe('AnalyticsService', () => {
  let service: AnalyticsService;

  const mockConfig: Record<string, string | undefined> = {
    FACEBOOK_PIXEL_ID_COM_PAYMENTALERT_APP: 'fb-pixel-1',
    FACEBOOK_ACCESS_TOKEN_COM_PAYMENTALERT_APP: 'fb-token-1',
    MIXPANEL_TOKEN_COM_PAYMENTALERT_APP: 'mp-token',
    FIREBASE_MEASUREMENT_ID_COM_PAYMENTALERT_APP: 'G-TEST1',
    FIREBASE_API_SECRET_COM_PAYMENTALERT_APP: 'fb-secret-1',
    FACEBOOK_PIXEL_ID_COM_SHAREKARO_KIRANA: 'fb-pixel-2',
    FACEBOOK_ACCESS_TOKEN_COM_SHAREKARO_KIRANA: 'fb-token-2',
    MIXPANEL_TOKEN_COM_SHAREKARO_KIRANA: 'mp-token-2',
    FIREBASE_MEASUREMENT_ID_COM_SHAREKARO_KIRANA: 'G-TEST2',
    FIREBASE_API_SECRET_COM_SHAREKARO_KIRANA: 'fb-secret-2',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnalyticsService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => mockConfig[key]),
          },
        },
        {
          provide: DeviceSessionService,
          useValue: {
            create: jest.fn(),
            getLatestForUser: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AnalyticsService>(AnalyticsService);
    await service.onModuleInit();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendEvent', () => {
    const userData = {
      userId: 'user-123',
      email: 'test@example.com',
      phone: '+919876543210',
    };

    it('should send events to all providers', async () => {
      global.fetch = jest.fn().mockImplementation(() =>
        Promise.resolve({
          ok: true,
          status: 204,
          json: () => Promise.resolve({ success: true }),
        }),
      );

      const result = await service.sendEvent({
        eventName: 'test_event',
        userData,
        eventProperties: { prop: 'val' },
        appId: 'com.paymentalert.app',
      });

      expect(result.overallSuccess).toBe(true);
    });
  });
});
