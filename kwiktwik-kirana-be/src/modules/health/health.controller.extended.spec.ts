import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';

describe('HealthController - Extended', () => {
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
    it('should return health status matching snapshot', async () => {
      const response = await request(app.getHttpServer())
        .get('/health')
        .expect(200);

      expect(response.body).toMatchSnapshot({
        timestamp: expect.any(String),
      });
    });

    it('should have correct structure', async () => {
      const response = await request(app.getHttpServer())
        .get('/health')
        .expect(200);

      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('service');
      expect(response.body).toHaveProperty('version');
      expect(response.body).toHaveProperty('timestamp');
    });

    it('should return consistent service name', async () => {
      const response = await request(app.getHttpServer())
        .get('/health')
        .expect(200);

      expect(response.body.service).toBe('kwiktwik-kirana-be');
    });

    it('should return consistent version', async () => {
      const response = await request(app.getHttpServer())
        .get('/health')
        .expect(200);

      expect(response.body.version).toBe('1.0.0');
    });

    it('should return ok status', async () => {
      const response = await request(app.getHttpServer())
        .get('/health')
        .expect(200);

      expect(response.body.status).toBe('ok');
    });

    it('should return valid ISO timestamp', async () => {
      const response = await request(app.getHttpServer())
        .get('/health')
        .expect(200);

      const timestamp = new Date(response.body.timestamp);
      expect(timestamp.toISOString()).toBe(response.body.timestamp);
      expect(timestamp.getTime()).not.toBeNaN();
    });

    it('should return timestamp close to current time', async () => {
      const beforeRequest = Date.now();
      const response = await request(app.getHttpServer())
        .get('/health')
        .expect(200);
      const afterRequest = Date.now();

      const responseTime = new Date(response.body.timestamp).getTime();

      expect(responseTime).toBeGreaterThanOrEqual(beforeRequest - 1000);
      expect(responseTime).toBeLessThanOrEqual(afterRequest + 1000);
    });

    it('should have content-type application/json', async () => {
      const response = await request(app.getHttpServer())
        .get('/health')
        .expect(200);

      expect(response.headers['content-type']).toContain('application/json');
    });
  });
});
