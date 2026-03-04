import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import {
  INestApplication,
  CanActivate,
  ExecutionContext,
  NotFoundException,
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

describe('UserController', () => {
  let app: INestApplication;
  let userService: jest.Mocked<UserService>;

  const mockUserService = {
    getUserProfile: jest.fn(),
    getUserImages: jest.fn(),
    deleteUserImage: jest.fn(),
    updateUserProfile: jest.fn(),
    deleteUser: jest.fn(),
  };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    })
      .overrideGuard(AppIdGuard)
      .useValue(new MockUserGuard())
      .overrideGuard(JwtAuthGuard)
      .useValue(new MockUserGuard())
      .compile();

    app = moduleFixture.createNestApplication();
    userService = moduleFixture.get(UserService);
    await app.init();
  });

  afterEach(async () => {
    await app.close();
    jest.clearAllMocks();
  });

  describe('GET /user/v1', () => {
    it('should return user profile', async () => {
      const mockUser = {
        id: 'user-123',
        name: 'Test User',
        phoneNumber: '+919876543210',
        email: 'test@example.com',
        isPremium: false,
      };
      mockUserService.getUserProfile.mockResolvedValue(mockUser);

      const response = await request(app.getHttpServer())
        .get('/user/v1')
        .set('X-App-ID', 'com.test.app');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockUser);
    });

    it('should handle user not found', async () => {
      mockUserService.getUserProfile.mockRejectedValue(
        new NotFoundException('User not found'),
      );

      const response = await request(app.getHttpServer())
        .get('/user/v1')
        .set('X-App-ID', 'com.test.app');

      expect(response.status).toBe(404);
    });
  });

  describe('GET /user/image/v1', () => {
    it('should return user images', async () => {
      const mockImages = [
        { id: 1, imageUrl: 'https://example.com/image1.jpg' },
        { id: 2, imageUrl: 'https://example.com/image2.jpg' },
      ];
      mockUserService.getUserImages.mockResolvedValue(mockImages);

      const response = await request(app.getHttpServer())
        .get('/user/image/v1')
        .set('X-App-ID', 'com.test.app');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockImages);
    });
  });

  describe('DELETE /user/image/v1', () => {
    it('should delete user image', async () => {
      mockUserService.deleteUserImage.mockResolvedValue(undefined);

      const response = await request(app.getHttpServer())
        .delete('/user/image/v1')
        .set('X-App-ID', 'com.test.app')
        .send({ imageId: 1 });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should handle image not found', async () => {
      mockUserService.deleteUserImage.mockRejectedValue(
        new NotFoundException('Image not found'),
      );

      const response = await request(app.getHttpServer())
        .delete('/user/image/v1')
        .set('X-App-ID', 'com.test.app')
        .send({ imageId: 999 });

      expect(response.status).toBe(404);
    });
  });

  describe('POST /user/v1', () => {
    it('should update user profile', async () => {
      const updatedUser = {
        id: 'user-123',
        name: 'Updated Name',
        phoneNumber: '+919876543210',
      };
      mockUserService.updateUserProfile.mockResolvedValue(updatedUser);

      const response = await request(app.getHttpServer())
        .post('/user/v1')
        .set('X-App-ID', 'com.test.app')
        .send({ name: 'Updated Name' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Updated Name');
    });
  });

  describe('DELETE /user/v1', () => {
    it('should delete user account', async () => {
      mockUserService.deleteUser.mockResolvedValue({
        success: true,
        message: 'User deleted',
      });

      const response = await request(app.getHttpServer())
        .delete('/user/v1')
        .set('X-App-ID', 'com.test.app');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should handle user not found on delete', async () => {
      mockUserService.deleteUser.mockRejectedValue(
        new NotFoundException('User not found'),
      );

      const response = await request(app.getHttpServer())
        .delete('/user/v1')
        .set('X-App-ID', 'com.test.app');

      expect(response.status).toBe(404);
    });
  });
});
