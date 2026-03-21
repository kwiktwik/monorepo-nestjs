import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { AnalyticsService } from '../src/modules/analytics/analytics.service';

describe('Module Compilation', () => {
  let app: INestApplication;

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

  afterEach(async () => {
    if (app) {
      await app.close();
    }
  });

  it('should compile AppModule and initialize without dependency errors', () => {
    expect(app).toBeDefined();
  });
});
