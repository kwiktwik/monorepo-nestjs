import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';

describe('HealthController', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('GET /health', () => {
    it('should return health status', () => {
      return request(app.getHttpServer())
        .get('/health')
        .expect(200)
        .expect((res) => {
          expect(res.body.status).toBe('ok');
          expect(res.body.service).toBe('kwiktwik-kirana-be');
          expect(res.body.version).toBe('1.0.0');
          expect(res.body.timestamp).toBeDefined();
        });
    });
  });
});
