import { Test, TestingModule } from '@nestjs/testing';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';
import {
  INestApplication,
  CanActivate,
  ExecutionContext,
  BadRequestException,
  ServiceUnavailableException,
  NotAcceptableException,
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

describe('UploadController', () => {
  let app: INestApplication;
  let uploadService: jest.Mocked<UploadService>;

  const mockUploadService = {
    getPresignedUrl: jest.fn(),
  };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [UploadController],
      providers: [
        {
          provide: UploadService,
          useValue: mockUploadService,
        },
      ],
    })
      .overrideGuard(AppIdGuard)
      .useValue(new MockUserGuard())
      .overrideGuard(JwtAuthGuard)
      .useValue(new MockUserGuard())
      .compile();

    app = moduleFixture.createNestApplication();
    uploadService = moduleFixture.get(UploadService);
    await app.init();
  });

  afterEach(async () => {
    await app.close();
    jest.clearAllMocks();
  });

  describe('POST /upload/presigned-url', () => {
    it('should generate presigned URL', async () => {
      const mockResult = {
        success: true,
        uploadUrl: 'https://r2.example.com/presigned-url',
        publicUrl: 'https://pub.example.com/image.jpg',
        key: 'com.test.app/user-123/user-images/123456_image.jpg',
        imageId: 1,
        expiresIn: 3600,
        expiresAt: '2024-01-01T00:00:00.000Z',
      };
      mockUploadService.getPresignedUrl.mockResolvedValue(mockResult);

      const response = await request(app.getHttpServer())
        .post('/upload/presigned-url')
        .set('X-App-ID', 'com.test.app')
        .send({
          fileName: 'image.jpg',
          contentType: 'image/jpeg',
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.uploadUrl).toBeDefined();
      expect(response.body.publicUrl).toBeDefined();
    });

    it('should handle invalid content type', async () => {
      mockUploadService.getPresignedUrl.mockRejectedValue(
        new NotAcceptableException('Invalid content type'),
      );

      const response = await request(app.getHttpServer())
        .post('/upload/presigned-url')
        .set('X-App-ID', 'com.test.app')
        .send({
          fileName: 'document.pdf',
          contentType: 'application/pdf',
        });

      expect(response.status).toBe(406);
    });

    it('should handle storage not configured', async () => {
      mockUploadService.getPresignedUrl.mockRejectedValue(
        new ServiceUnavailableException('R2 storage not configured'),
      );

      const response = await request(app.getHttpServer())
        .post('/upload/presigned-url')
        .set('X-App-ID', 'com.test.app')
        .send({
          fileName: 'image.jpg',
          contentType: 'image/jpeg',
        });

      expect(response.status).toBe(503);
    });
  });
});
