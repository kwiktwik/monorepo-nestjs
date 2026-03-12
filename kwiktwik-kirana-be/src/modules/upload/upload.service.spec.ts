import { Test, TestingModule } from '@nestjs/testing';
import { UploadService } from './upload.service';
import { ConfigService } from '@nestjs/config';
import { DRIZZLE_TOKEN } from '../../database/drizzle.module';
import {
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

jest.mock('@aws-sdk/client-s3');
jest.mock('@aws-sdk/s3-request-presigner');

describe('UploadService', () => {
  let service: UploadService;
  let mockConfigService: any;
  let mockDb: any;
  let mockDate: number;

  beforeEach(async () => {
    // Mock Date.now for consistent timestamps in snapshots
    mockDate = 1704067200000; // Fixed timestamp: 2024-01-01T00:00:00.000Z
    jest.spyOn(Date, 'now').mockReturnValue(mockDate);

    mockConfigService = {
      get: jest.fn((key: string) => {
        const config: Record<string, string> = {
          R2_ACCOUNT_ID: 'test-account',
          R2_ACCESS_KEY_ID: 'test-key',
          R2_SECRET_ACCESS_KEY: 'test-secret',
          R2_BUCKET_NAME: 'test-bucket',
          R2_PROJECT_FOLDER: 'test-project',
          R2_PUBLIC_DOMAIN: 'https://cdn.example.com',
        };
        return config[key];
      }),
    };

    mockDb = {
      insert: jest.fn().mockReturnThis(),
      values: jest.fn().mockReturnThis(),
      returning: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UploadService,
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

    service = module.get<UploadService>(UploadService);

    // Mock getSignedUrl
    (getSignedUrl as jest.Mock).mockResolvedValue(
      'https://presigned-url.example.com',
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getPresignedUrl', () => {
    const mockDto = {
      fileName: 'test-image.jpg',
      contentType: 'image/jpeg',
      expiresIn: 3600,
    };

    it('should generate presigned URL successfully', async () => {
      mockDb.returning.mockResolvedValueOnce([{ id: 123 }]);

      const result = await service.getPresignedUrl(
        'user-123',
        'com.test.app',
        mockDto,
      );

      expect(result).toMatchSnapshot();
      expect(result.success).toBe(true);
      expect(result.uploadUrl).toBe('https://presigned-url.example.com');
      expect(result.imageId).toBe(123);
    });

    it('should throw InternalServerErrorException when R2 is not configured', async () => {
      // Create service without R2 config
      mockConfigService.get.mockReturnValue(undefined);

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          UploadService,
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

      const serviceWithoutR2 = module.get<UploadService>(UploadService);

      await expect(
        serviceWithoutR2.getPresignedUrl('user-123', 'com.test.app', mockDto),
      ).rejects.toThrow(InternalServerErrorException);
    });

    it('should throw BadRequestException for invalid content type', async () => {
      const invalidDto = {
        fileName: 'test.txt',
        contentType: 'text/plain',
        expiresIn: 3600,
      };

      await expect(
        service.getPresignedUrl('user-123', 'com.test.app', invalidDto),
      ).rejects.toThrow(BadRequestException);
    });

    it('should sanitize filename with special characters', async () => {
      mockDb.returning.mockResolvedValueOnce([{ id: 1 }]);

      const dtoWithSpecialChars = {
        fileName: 'test file@#$%^&*.jpg',
        contentType: 'image/jpeg',
      };

      const result = await service.getPresignedUrl(
        'user-123',
        'com.test.app',
        dtoWithSpecialChars,
      );

      expect(result.key).toMatchSnapshot();
      expect(result.key).not.toContain('@');
      expect(result.key).not.toContain('#');
      expect(result.key).not.toContain('$');
    });

    it('should handle image insertion failure gracefully', async () => {
      mockDb.returning.mockRejectedValueOnce(new Error('DB Error'));

      const result = await service.getPresignedUrl(
        'user-123',
        'com.test.app',
        mockDto,
      );

      expect(result.success).toBe(true);
      expect(result.imageId).toBeUndefined();
    });

    it('should use default content type when not provided', async () => {
      mockDb.returning.mockResolvedValueOnce([{ id: 1 }]);

      const dtoWithoutContentType = {
        fileName: 'test.jpg',
      };

      const result = await service.getPresignedUrl(
        'user-123',
        'com.test.app',
        dtoWithoutContentType as any,
      );

      expect(result.success).toBe(true);
    });

    it('should use default expiresIn when not provided', async () => {
      mockDb.returning.mockResolvedValueOnce([{ id: 1 }]);

      const dtoWithoutExpires = {
        fileName: 'test.jpg',
        contentType: 'image/jpeg',
      };

      const result = await service.getPresignedUrl(
        'user-123',
        'com.test.app',
        dtoWithoutExpires,
      );

      expect(result.expiresIn).toBe(3600);
    });

    it('should handle all allowed image content types', async () => {
      const allowedTypes = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/gif',
        'image/webp',
      ];

      mockDb.returning.mockResolvedValue([{ id: 1 }]);

      for (const contentType of allowedTypes) {
        const result = await service.getPresignedUrl(
          'user-123',
          'com.test.app',
          {
            fileName: 'test.jpg',
            contentType,
          },
        );

        expect(result.success).toBe(true);
      }
    });
  });

  describe('getChatMediaPresignedUrl', () => {
    const mockDto = {
      fileName: 'chat-video.mp4',
      contentType: 'video/mp4',
      expiresIn: 3600,
      conversationId: 'conv-123',
    };

    it('should generate presigned URL for chat media', async () => {
      const result = await service.getChatMediaPresignedUrl(
        'user-123',
        'com.test.app',
        mockDto,
      );

      expect(result).toMatchSnapshot();
      expect(result.success).toBe(true);
      expect(result.key).toContain('chat/videos/');
      expect(result.key).toContain('conv-123');
    });

    it('should throw InternalServerErrorException when R2 is not configured', async () => {
      mockConfigService.get.mockReturnValue(undefined);

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          UploadService,
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

      const serviceWithoutR2 = module.get<UploadService>(UploadService);

      await expect(
        serviceWithoutR2.getChatMediaPresignedUrl(
          'user-123',
          'com.test.app',
          mockDto,
        ),
      ).rejects.toThrow(InternalServerErrorException);
    });

    it('should throw BadRequestException for invalid content type', async () => {
      const invalidDto = {
        fileName: 'test.exe',
        contentType: 'application/x-msdownload',
      };

      await expect(
        service.getChatMediaPresignedUrl(
          'user-123',
          'com.test.app',
          invalidDto,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should categorize files into correct folders', async () => {
      const testCases = [
        { contentType: 'image/jpeg', expectedFolder: 'images' },
        { contentType: 'video/mp4', expectedFolder: 'videos' },
        { contentType: 'audio/mpeg', expectedFolder: 'audio' },
        { contentType: 'application/pdf', expectedFolder: 'files' },
      ];

      for (const testCase of testCases) {
        const result = await service.getChatMediaPresignedUrl(
          'user-123',
          'com.test.app',
          {
            fileName: 'test.file',
            contentType: testCase.contentType,
          },
        );

        expect(result.key).toContain(`chat/${testCase.expectedFolder}/`);
      }
    });

    it('should handle chat media without conversationId', async () => {
      const dtoWithoutConv = {
        fileName: 'test.jpg',
        contentType: 'image/jpeg',
      };

      const result = await service.getChatMediaPresignedUrl(
        'user-123',
        'com.test.app',
        dtoWithoutConv,
      );

      expect(result.key).toContain('chat/images/');
      expect(result.key).not.toContain('undefined');
    });

    it('should sanitize filename in chat media', async () => {
      const dtoWithSpecialChars = {
        fileName: 'my file name@#$%.jpg',
        contentType: 'image/jpeg',
      };

      const result = await service.getChatMediaPresignedUrl(
        'user-123',
        'com.test.app',
        dtoWithSpecialChars,
      );

      expect(result.key).not.toContain('@');
      expect(result.key).not.toContain('#');
      expect(result.key).not.toContain('$');
      expect(result.key).toContain('my_file_name___');
    });

    it('should handle all allowed chat media content types', async () => {
      const allowedTypes = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/gif',
        'image/webp',
        'video/mp4',
        'video/webm',
        'video/quicktime',
        'audio/mpeg',
        'audio/wav',
        'audio/ogg',
        'audio/webm',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/plain',
        'text/csv',
      ];

      for (const contentType of allowedTypes) {
        const result = await service.getChatMediaPresignedUrl(
          'user-123',
          'com.test.app',
          {
            fileName: 'test.file',
            contentType,
          },
        );

        expect(result.success).toBe(true);
      }
    });

    it('should calculate correct expiration date', async () => {
      const customExpiresIn = 7200;
      const beforeCall = Date.now();

      const result = await service.getChatMediaPresignedUrl(
        'user-123',
        'com.test.app',
        {
          fileName: 'test.jpg',
          contentType: 'image/jpeg',
          expiresIn: customExpiresIn,
        },
      );

      const expiresAt = new Date(result.expiresAt).getTime();
      const expectedExpiresAt = beforeCall + customExpiresIn * 1000;

      expect(expiresAt).toBeGreaterThanOrEqual(expectedExpiresAt - 1000);
      expect(expiresAt).toBeLessThanOrEqual(expectedExpiresAt + 1000);
    });
  });
});
