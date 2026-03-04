import { Test, TestingModule } from '@nestjs/testing';
import { FeedController } from './feed.controller';
import { FeedService } from './feed.service';
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

describe('FeedController', () => {
  let app: INestApplication;
  let feedService: jest.Mocked<FeedService>;

  const mockFeedService = {
    getHomeFeed: jest.fn(),
    getCategories: jest.fn(),
  };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [FeedController],
      providers: [
        {
          provide: FeedService,
          useValue: mockFeedService,
        },
      ],
    })
      .overrideGuard(AppIdGuard)
      .useValue(new MockUserGuard())
      .overrideGuard(JwtAuthGuard)
      .useValue(new MockUserGuard())
      .compile();

    app = moduleFixture.createNestApplication();
    feedService = moduleFixture.get(FeedService);
    await app.init();
  });

  afterEach(async () => {
    await app.close();
    jest.clearAllMocks();
  });

  describe('GET /feed/categories', () => {
    it('should return categories', async () => {
      const mockCategories = {
        categories: ['motivation', 'love', 'friendship'],
        count: 3,
      };
      mockFeedService.getCategories.mockResolvedValue(mockCategories);

      const response = await request(app.getHttpServer())
        .get('/feed/categories')
        .set('X-App-ID', 'com.test.app');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockCategories);
    });
  });

  describe('GET /feed/home/v1.7', () => {
    it('should return home feed', async () => {
      const mockFeed = {
        data: [{ type: 'QUOTE', data: { text: 'Hello World' } }],
        cursor: null,
        hasMore: false,
        limit: 20,
      };
      mockFeedService.getHomeFeed.mockResolvedValue(mockFeed);

      const response = await request(app.getHttpServer())
        .get('/feed/home/v1.7')
        .set('X-App-ID', 'com.test.app');

      expect(response.status).toBe(200);
      expect(response.body.data).toEqual(mockFeed.data);
      expect(response.body.limit).toBe(20);
    });

    it('should handle pagination with cursor', async () => {
      const mockFeed = {
        data: [],
        cursor: 'abc123',
        hasMore: true,
        limit: 20,
      };
      mockFeedService.getHomeFeed.mockResolvedValue(mockFeed);

      const response = await request(app.getHttpServer())
        .get('/feed/home/v1.7?cursor=abc123&limit=10')
        .set('X-App-ID', 'com.test.app');

      expect(response.status).toBe(200);
      expect(response.body.hasMore).toBe(true);
    });

    it('should handle category filter', async () => {
      const mockFeed = {
        data: [],
        cursor: null,
        hasMore: false,
        limit: 20,
      };
      mockFeedService.getHomeFeed.mockResolvedValue(mockFeed);

      const response = await request(app.getHttpServer())
        .get('/feed/home/v1.7?category=motivation')
        .set('X-App-ID', 'com.test.app');

      expect(response.status).toBe(200);
      expect(mockFeedService.getHomeFeed).toHaveBeenCalledWith(
        20,
        'motivation',
        undefined,
      );
    });
  });
});
