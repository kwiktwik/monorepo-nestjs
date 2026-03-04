import { Test, TestingModule } from '@nestjs/testing';
import { VideoOverlayController } from './video-overlay.controller';
import { VideoOverlayService } from './video-overlay.service';
import {
  INestApplication,
  CanActivate,
  ExecutionContext,
  BadRequestException,
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

describe('VideoOverlayController', () => {
  let app: INestApplication;
  let videoOverlayService: jest.Mocked<VideoOverlayService>;

  const mockVideoOverlayService = {
    getHealth: jest.fn(),
    processByContentId: jest.fn(),
  };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [VideoOverlayController],
      providers: [
        {
          provide: VideoOverlayService,
          useValue: mockVideoOverlayService,
        },
      ],
    })
      .overrideGuard(AppIdGuard)
      .useValue(new MockUserGuard())
      .overrideGuard(JwtAuthGuard)
      .useValue(new MockUserGuard())
      .compile();

    app = moduleFixture.createNestApplication();
    videoOverlayService = moduleFixture.get(VideoOverlayService);
    await app.init();
  });

  afterEach(async () => {
    await app.close();
    jest.clearAllMocks();
  });

  describe('GET /video/overlay', () => {
    it('should return health status', async () => {
      const mockHealth = {
        status: 'ok',
        service: 'video-overlay',
        maxVideoSize: 104857600,
        maxOverlays: 10,
      };
      mockVideoOverlayService.getHealth.mockReturnValue(mockHealth);

      const response = await request(app.getHttpServer())
        .get('/video/overlay')
        .set('X-App-ID', 'com.test.app');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('ok');
      expect(response.body.service).toBe('video-overlay');
    });
  });

  describe('POST /video/overlay/by-content-id', () => {
    it('should process video with overlay successfully', async () => {
      const mockResult = {
        success: true,
        videoUrl: 'https://example.com/processed-video.mp4',
        processingTime: 5000,
      };
      mockVideoOverlayService.processByContentId.mockResolvedValue(mockResult);

      const response = await request(app.getHttpServer())
        .post('/video/overlay/by-content-id')
        .set('X-App-ID', 'com.test.app')
        .send({
          contentId: 1,
          imageUrl: 'https://example.com/image.png',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.videoUrl).toBeDefined();
    });

    it('should handle processing failure', async () => {
      const mockResult = {
        success: false,
        error: 'R2 storage not configured',
        processingTime: 100,
      };
      mockVideoOverlayService.processByContentId.mockResolvedValue(mockResult);

      const response = await request(app.getHttpServer())
        .post('/video/overlay/by-content-id')
        .set('X-App-ID', 'com.test.app')
        .send({
          contentId: 1,
          imageUrl: 'https://example.com/image.png',
        });

      expect(response.status).toBe(500);
    });

    it('should handle missing content ID', async () => {
      mockVideoOverlayService.processByContentId.mockRejectedValue(
        new BadRequestException(
          'Either imageUrl or imageData must be provided',
        ),
      );

      const response = await request(app.getHttpServer())
        .post('/video/overlay/by-content-id')
        .set('X-App-ID', 'com.test.app')
        .send({});

      expect(response.status).toBe(400);
    });
  });
});
