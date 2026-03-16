import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { PhonePeService } from './phonepe.service';
import { InternalServerErrorException } from '@nestjs/common';
import { DRIZZLE_TOKEN } from '../../database/drizzle.module';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type MockDb = Record<string, jest.Mock>;

interface PhonePeCredentials {
  clientId: string;
  clientSecret: string;
  merchantId: string;
  saltKey: string;
  saltIndex: number;
  clientVersion: number;
  env: string;
}

describe('PhonePeService', () => {
  let service: PhonePeService;

  const mockConfigService = {
    get: jest.fn(),
  };

  const mockDb: MockDb = {
    insert: jest.fn().mockReturnThis(),
    values: jest.fn().mockReturnThis(),
    returning: jest.fn().mockResolvedValue([{ id: 'test-order-id' }]),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PhonePeService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: DRIZZLE_TOKEN,
          useValue: mockDb,
        },
      ],
    }).compile();

    service = module.get<PhonePeService>(PhonePeService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('normalizeAppId', () => {
    it('should normalize app ID by replacing dots with underscores and uppercasing', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const svc = service as any;
      expect(svc.normalizeAppId('com.sharestatus.app')).toBe(
        'COM_SHARESTATUS_APP',
      );
      expect(svc.normalizeAppId('com.kwiktwik.kirana')).toBe(
        'COM_KWIKTWIK_KIRANA',
      );
      expect(svc.normalizeAppId('my.app')).toBe('MY_APP');
    });
  });

  describe('getCredentials', () => {
    it('should throw error when appId is not provided', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const svc = service as any;
      expect(() => svc.getCredentials('')).toThrow(
        InternalServerErrorException,
      );
      expect(() => svc.getCredentials('')).toThrow('App ID is required');
    });

    it('should throw error when credentials are not found for app', () => {
      mockConfigService.get.mockReturnValue(undefined);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const svc = service as any;
      expect(() => svc.getCredentials('com.test.app')).toThrow(
        InternalServerErrorException,
      );
      expect(() => svc.getCredentials('com.test.app')).toThrow(
        'PhonePe credentials not found for app: com.test.app',
      );
    });

    it('should get credentials for app with app-specific env', () => {
      mockConfigService.get.mockImplementation((key: string) => {
        const creds: Record<string, string> = {
          PHONEPE_ENV_COM_TEST_APP: 'PRODUCTION',
          PHONEPE_CLIENT_ID_COM_TEST_APP: 'prod-client-id',
          PHONEPE_CLIENT_SECRET_COM_TEST_APP: 'prod-client-secret',
          PHONEPE_MERCHANT_ID_COM_TEST_APP: 'prod-merchant-id',
          PHONEPE_SALT_KEY_COM_TEST_APP: 'prod-salt-key',
          PHONEPE_SALT_INDEX_COM_TEST_APP: '2',
          PHONEPE_CLIENT_VERSION_COM_TEST_APP: '2',
        };
        return creds[key];
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const credentials = (service as any).getCredentials(
        'com.test.app',
      ) as PhonePeCredentials;

      expect(credentials.clientId).toBe('prod-client-id');
      expect(credentials.clientSecret).toBe('prod-client-secret');
      expect(credentials.merchantId).toBe('prod-merchant-id');
      expect(credentials.saltKey).toBe('prod-salt-key');
      expect(credentials.saltIndex).toBe(2);
      expect(credentials.clientVersion).toBe(2);
      expect(credentials.env).toBe('PRODUCTION');
    });

    it('should fallback to global env when app-specific env is not set', () => {
      mockConfigService.get.mockImplementation((key: string) => {
        const creds: Record<string, string | undefined> = {
          PHONEPE_ENV: 'SANDBOX',
          PHONEPE_CLIENT_ID_COM_TEST_APP: 'sandbox-client-id',
          PHONEPE_CLIENT_SECRET_COM_TEST_APP: 'sandbox-client-secret',
        };
        return creds[key];
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const credentials = (service as any).getCredentials(
        'com.test.app',
      ) as PhonePeCredentials;

      expect(credentials.env).toBe('SANDBOX');
      expect(credentials.merchantId).toBe('PGTESTPAYUAT');
    });

    it('should fallback to global client version when app-specific is not set', () => {
      mockConfigService.get.mockImplementation((key: string) => {
        const creds: Record<string, string | undefined> = {
          PHONEPE_ENV: 'SANDBOX',
          PHONEPE_CLIENT_VERSION: '3',
          PHONEPE_CLIENT_ID_COM_TEST_APP: 'client-id',
          PHONEPE_CLIENT_SECRET_COM_TEST_APP: 'client-secret',
        };
        return creds[key];
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const credentials = (service as any).getCredentials(
        'com.test.app',
      ) as PhonePeCredentials;

      expect(credentials.clientVersion).toBe(3);
    });

    it('should default to SANDBOX when no env is set', () => {
      mockConfigService.get.mockImplementation((key: string) => {
        const creds: Record<string, string | undefined> = {
          PHONEPE_CLIENT_ID_COM_TEST_APP: 'client-id',
          PHONEPE_CLIENT_SECRET_COM_TEST_APP: 'client-secret',
        };
        return creds[key];
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const credentials = (service as any).getCredentials(
        'com.test.app',
      ) as PhonePeCredentials;

      expect(credentials.env).toBe('SANDBOX');
    });
  });

  describe('rupeesToPaise', () => {
    it('should convert rupees to paise correctly', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const svc = service as any;
      expect(svc.rupeesToPaise(100)).toBe(10000);
      expect(svc.rupeesToPaise(1.5)).toBe(150);
      expect(svc.rupeesToPaise(0.99)).toBe(99);
      expect(svc.rupeesToPaise(1000)).toBe(100000);
    });
  });

  describe('getSdkConfig', () => {
    it('should return SDK config with correct values', () => {
      mockConfigService.get.mockImplementation((key: string) => {
        const creds: Record<string, string | undefined> = {
          PHONEPE_ENV: 'SANDBOX',
          PHONEPE_CLIENT_ID_COM_TEST_APP: 'client-id',
          PHONEPE_CLIENT_SECRET_COM_TEST_APP: 'client-secret',
          PHONEPE_MERCHANT_ID_COM_TEST_APP: 'TEST_MERCHANT',
        };
        return creds[key];
      });

      const config = service.getSdkConfig('user-123', 'com.test.app');

      expect(config.environment).toBe('SANDBOX');
      expect(config.merchantId).toBe('TEST_MERCHANT');
      expect(config.flowId).toBe('user-123');
      expect(config.enableLogging).toBe(true);
    });

    it('should disable logging in production', () => {
      mockConfigService.get.mockImplementation((key: string) => {
        const creds: Record<string, string | undefined> = {
          PHONEPE_ENV_COM_TEST_APP: 'PRODUCTION',
          PHONEPE_CLIENT_ID_COM_TEST_APP: 'client-id',
          PHONEPE_CLIENT_SECRET_COM_TEST_APP: 'client-secret',
          PHONEPE_MERCHANT_ID_COM_TEST_APP: 'PROD_MERCHANT',
        };
        return creds[key];
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      jest.spyOn(service as any, 'getPhonePeClient').mockReturnValue({
        client: {},
        credentials: {
          env: 'PRODUCTION',
          merchantId: 'PROD_MERCHANT',
        },
      });

      const config = service.getSdkConfig('user-123', 'com.test.app');

      expect(config.environment).toBe('PRODUCTION');
      expect(config.merchantId).toBe('PROD_MERCHANT');
      expect(config.enableLogging).toBe(false);
    });
  });

  describe('getCacheKey', () => {
    it('should generate unique cache key per app and env', () => {
      mockConfigService.get.mockImplementation((key: string) => {
        const creds: Record<string, string | undefined> = {
          PHONEPE_ENV_COM_APP1: 'SANDBOX',
          PHONEPE_CLIENT_ID_COM_APP1: 'client-id-1',
          PHONEPE_CLIENT_SECRET_COM_APP1: 'client-secret-1',
          PHONEPE_ENV_COM_APP2: 'PRODUCTION',
          PHONEPE_CLIENT_ID_COM_APP2: 'client-id-2',
          PHONEPE_CLIENT_SECRET_COM_APP2: 'client-secret-2',
        };
        return creds[key];
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const svc = service as any;
      const key1 = svc.getCacheKey('com.app1') as string;
      const key2 = svc.getCacheKey('com.app2') as string;

      expect(key1).toBe('com.app1_SANDBOX');
      expect(key2).toBe('com.app2_PRODUCTION');
      expect(key1).not.toBe(key2);
    });
  });
});
