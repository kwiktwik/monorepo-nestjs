import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { AnalyticsService } from './../src/modules/analytics/analytics.service';

// Set mock mode before importing AppModule
process.env.USE_MOCK_DB = 'true';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(AnalyticsService)
      .useValue({
        sendAnalyticsEvent: jest.fn().mockResolvedValue(true),
        sendMixpanelEvent: jest.fn().mockResolvedValue(true),
        sendFacebookConversionEvent: jest.fn().mockResolvedValue(true),
        sendFirebaseAnalyticsEvent: jest.fn().mockResolvedValue(true),
      })
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  it('/health (GET)', () => {
    return request(app.getHttpServer())
      .get('/health')
      .expect(200)
      .expect((res) => {
        expect(res.body.status).toBe('ok');
        expect(res.body.service).toBe('kwiktwik-kirana-be');
      });
  });
});
