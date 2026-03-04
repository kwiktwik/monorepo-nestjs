import { Test, TestingModule } from '@nestjs/testing';
import { ConfigController } from './config.controller';
import { ConfigService } from './config.service';
import { INestApplication, NotFoundException } from '@nestjs/common';
import request from 'supertest';
import { AppIdGuard } from '../../common/guards/app-id.guard';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

describe('ConfigController', () => {
  let app: INestApplication;
  let configService: jest.Mocked<ConfigService>;

  const mockConfigService = {
    getConfig: jest.fn(),
  };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [ConfigController],
      providers: [
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    })
      .overrideGuard(AppIdGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    app = moduleFixture.createNestApplication();
    configService = moduleFixture.get(ConfigService);
    await app.init();
  });

  afterEach(async () => {
    await app.close();
    jest.clearAllMocks();
  });

  describe('GET /config/v2', () => {
    it('should return app configuration', async () => {
      const mockConfig = {
        appName: 'Test App',
        features: { subscription: { enabled: true } },
      };
      mockConfigService.getConfig.mockReturnValue(mockConfig);

      const response = await request(app.getHttpServer())
        .get('/config/v2')
        .set('X-App-ID', 'com.test.app');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.config).toEqual(mockConfig);
    });

    it('should handle config not found', async () => {
      mockConfigService.getConfig.mockImplementation(() => {
        throw new NotFoundException('Configuration not found for app ID');
      });

      const response = await request(app.getHttpServer())
        .get('/config/v2')
        .set('X-App-ID', 'com.unknown.app');

      expect(response.status).toBe(404);
    });
  });
});
