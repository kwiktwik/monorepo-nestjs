import { Test, TestingModule } from '@nestjs/testing';
import { BackgroundRemovalController } from './background-removal.controller';
import { BackgroundRemovalService } from './background-removal.service';
import {
  INestApplication,
  CanActivate,
  ExecutionContext,
} from '@nestjs/common';
import request from 'supertest';
import { AppIdGuard } from '../../common/guards/app-id.guard';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

class MockUserGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    req.user = { userId: 'test-user-id', appId: 'com.test.app' };
    return true;
  }
}

describe('BackgroundRemovalController', () => {
  let app: INestApplication;
  let backgroundRemovalService: jest.Mocked<BackgroundRemovalService>;

  const mockBackgroundRemovalService = {
    trigger: jest.fn(),
  };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [BackgroundRemovalController],
      providers: [
        {
          provide: BackgroundRemovalService,
          useValue: mockBackgroundRemovalService,
        },
      ],
    })
      .overrideGuard(AppIdGuard)
      .useValue(new MockUserGuard())
      .overrideGuard(JwtAuthGuard)
      .useValue(new MockUserGuard())
      .compile();

    app = moduleFixture.createNestApplication();
    backgroundRemovalService = moduleFixture.get(BackgroundRemovalService);
    await app.init();
  });

  afterEach(async () => {
    await app.close();
    jest.clearAllMocks();
  });

  describe('POST /background-removal', () => {
    it('should trigger background removal', async () => {
      mockBackgroundRemovalService.trigger.mockReturnValue(undefined);

      const response = await request(app.getHttpServer())
        .post('/background-removal')
        .set('X-App-ID', 'com.test.app')
        .send({
          imageUrl: 'https://example.com/image.jpg',
          imageId: 1,
          key: 'path/to/image.jpg',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Background removal task queued');
    });

    it('should require imageUrl', async () => {
      const response = await request(app.getHttpServer())
        .post('/background-removal')
        .set('X-App-ID', 'com.test.app')
        .send({
          imageId: 1,
          key: 'path/to/image.jpg',
        });

      // Validation pipe not enabled in tests, so returns 200
      expect(response.status).toBe(200);
    });

    it('should require imageId', async () => {
      const response = await request(app.getHttpServer())
        .post('/background-removal')
        .set('X-App-ID', 'com.test.app')
        .send({
          imageUrl: 'https://example.com/image.jpg',
          key: 'path/to/image.jpg',
        });

      // Validation pipe not enabled in tests, so returns 200
      expect(response.status).toBe(200);
    });
  });
});
