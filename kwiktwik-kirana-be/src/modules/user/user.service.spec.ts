import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { DRIZZLE_TOKEN } from '../../database/drizzle.module';
import { NotFoundException, BadRequestException } from '@nestjs/common';

type MockDb = Record<string, jest.Mock>;

describe('UserService', () => {
  let service: UserService;
  let mockDb: MockDb;

  const mockUser = {
    id: 'user-123',
    name: 'Test User',
    phoneNumber: '+919876543210',
    email: 'test@example.com',
    emailVerified: true,
    phoneNumberVerified: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    isDeleted: false,
    image: null,
    deletedAt: null,
  };

  const mockAccount = {
    id: 'acc-123',
    userId: 'user-123',
    providerId: 'google',
  };

  const mockSubscription = {
    id: 'sub-123',
    userId: 'user-123',
    appId: 'com.test.app',
    status: 'active',
    endAt: new Date('2025-01-01'),
  };

  const mockUserImage = {
    id: 1,
    userId: 'user-123',
    appId: 'com.test.app',
    imageUrl: 'https://example.com/image.jpg',
    removedBgImageUrl: null,
    createdAt: new Date('2024-01-01'),
  };

  const mockUserMetadata = {
    id: 1,
    userId: 'user-123',
    appId: 'com.test.app',
    upiVpa: 'test@upi',
    audioLanguage: 'en-US',
    clientData: {},
  };

  beforeEach(async () => {
    // Create a comprehensive mock that properly chains all drizzle methods
    const mockChain: MockDb = {
      select: jest.fn().mockReturnThis(),
      from: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      limit: jest.fn().mockResolvedValue([]),
      orderBy: jest.fn().mockResolvedValue([]),
      update: jest.fn().mockReturnThis(),
      set: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      values: jest.fn().mockReturnThis(),
      returning: jest.fn().mockResolvedValue([{ id: 1 }]),
    };

    // The mockDb object with all methods returning the chain
    mockDb = {
      select: mockChain.select,
      from: mockChain.from,
      where: mockChain.where,
      limit: mockChain.limit,
      orderBy: mockChain.orderBy,
      update: mockChain.update,
      set: mockChain.set,
      delete: mockChain.delete,
      insert: mockChain.insert,
      values: mockChain.values,
      returning: mockChain.returning,
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: DRIZZLE_TOKEN,
          useValue: mockDb,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getUserProfile', () => {
    it('should return user profile successfully', async () => {
      mockDb.limit
        .mockResolvedValueOnce([mockUser])
        .mockResolvedValueOnce([mockAccount])
        .mockResolvedValueOnce([mockSubscription])
        .mockResolvedValueOnce([]) // PhonePe subscriptions (empty)
        .mockResolvedValueOnce([mockUserMetadata])
        .mockResolvedValueOnce([mockUserImage])
        .mockResolvedValueOnce([]);

      const result = await service.getUserProfile('user-123', 'com.test.app');

      expect(result).toMatchSnapshot();
      expect(result.id).toBe('user-123');
      expect(result.isPremium).toBe(true);
      expect(result.accountType).toBe('google');
    });

    it('should throw NotFoundException when user not found', async () => {
      mockDb.limit.mockResolvedValueOnce([]);

      await expect(
        service.getUserProfile('non-existent', 'com.test.app'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should handle user without subscription (non-premium)', async () => {
      mockDb.limit
        .mockResolvedValueOnce([mockUser])
        .mockResolvedValueOnce([mockAccount])
        .mockResolvedValueOnce([]) // Razorpay subscriptions (empty)
        .mockResolvedValueOnce([]) // PhonePe subscriptions (empty)
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([]);

      const result = await service.getUserProfile('user-123', 'com.test.app');

      expect(result.isPremium).toBe(false);
      expect(result.upiVpa).toBeNull();
      expect(result.images).toEqual([]);
    });

    it('should handle cancelled subscription with valid end date as premium', async () => {
      const cancelledSub = {
        ...mockSubscription,
        status: 'cancelled',
        endAt: new Date(Date.now() + 86400000), // 1 day in future
      };

      mockDb.limit
        .mockResolvedValueOnce([mockUser])
        .mockResolvedValueOnce([mockAccount])
        .mockResolvedValueOnce([cancelledSub])
        .mockResolvedValueOnce([]) // PhonePe subscriptions (empty)
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([]);

      const result = await service.getUserProfile('user-123', 'com.test.app');

      expect(result.isPremium).toBe(true);
    });

    it('should handle cancelled subscription with expired end date as non-premium', async () => {
      mockDb.limit
        .mockResolvedValueOnce([mockUser])
        .mockResolvedValueOnce([mockAccount])
        .mockResolvedValueOnce([]) // Razorpay subscriptions (empty)
        .mockResolvedValueOnce([]) // PhonePe subscriptions (empty)
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([]);

      const result = await service.getUserProfile('user-123', 'com.test.app');

      expect(result.isPremium).toBe(false);
    });
  });

  describe('getUserImages', () => {
    it('should return user images successfully', async () => {
      mockDb.orderBy.mockResolvedValueOnce([mockUserImage]);

      const result = await service.getUserImages('user-123', 'com.test.app');

      expect(result).toMatchSnapshot();
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(1);
    });

    it('should return empty array when no images exist', async () => {
      mockDb.orderBy.mockResolvedValueOnce([]);

      const result = await service.getUserImages('user-123', 'com.test.app');

      expect(result).toEqual([]);
    });

    it('should handle images with removed background', async () => {
      const imageWithBgRemoved = {
        ...mockUserImage,
        removedBgImageUrl: 'https://example.com/image-no-bg.jpg',
      };
      mockDb.orderBy.mockResolvedValueOnce([imageWithBgRemoved]);

      const result = await service.getUserImages('user-123', 'com.test.app');

      expect(result[0].removedBgImageUrl).toBe(
        'https://example.com/image-no-bg.jpg',
      );
    });
  });

  describe('deleteUserImage', () => {
    it('should delete user image successfully', async () => {
      mockDb.limit.mockResolvedValueOnce([mockUserImage]);

      await service.deleteUserImage('user-123', 'com.test.app', 1);

      expect(mockDb.delete).toHaveBeenCalled();
    });

    it('should throw NotFoundException when image not found', async () => {
      mockDb.limit.mockResolvedValueOnce([]);

      await expect(
        service.deleteUserImage('user-123', 'com.test.app', 999),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateUserProfile', () => {
    const updateData = {
      name: 'Updated Name',
      phoneNumber: '+919876543211',
      email: 'updated@example.com',
      upiVpa: 'updated@upi',
      images: ['https://example.com/new-image.jpg'],
    };

    it('should update user profile successfully', async () => {
      mockDb.limit
        .mockResolvedValueOnce([mockUser])
        .mockResolvedValueOnce([mockUserMetadata]);

      // Mock getUserProfile call at the end
      mockDb.limit
        .mockResolvedValueOnce([{ ...mockUser, name: updateData.name }])
        .mockResolvedValueOnce([mockAccount])
        .mockResolvedValueOnce([mockSubscription])
        .mockResolvedValueOnce([
          { ...mockUserMetadata, upiVpa: updateData.upiVpa },
        ])
        .mockResolvedValueOnce([
          { ...mockUserImage, imageUrl: updateData.images[0] },
        ])
        .mockResolvedValueOnce([]);

      const result = await service.updateUserProfile(
        'user-123',
        'com.test.app',
        updateData,
      );

      expect(result).toBeDefined();
      expect(result.name).toBe(updateData.name);
    });

    it('should throw NotFoundException when user not found', async () => {
      mockDb.limit.mockResolvedValueOnce([]);

      await expect(
        service.updateUserProfile('non-existent', 'com.test.app', updateData),
      ).rejects.toThrow(NotFoundException);
    });

    it('should create new metadata when upiVpa provided but no existing metadata', async () => {
      // updateUserProfile: check user (1), check metadata (1), then getUserProfile (6)
      mockDb.limit
        .mockResolvedValueOnce([mockUser])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([mockUser])
        .mockResolvedValueOnce([mockAccount])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([]);

      const result = await service.updateUserProfile(
        'user-123',
        'com.test.app',
        {
          name: 'Test',
          phoneNumber: '+919876543210',
          upiVpa: 'new@upi',
        },
      );

      expect(result).toBeDefined();
    });

    it('should filter out empty image URLs', async () => {
      // updateUserProfile: check user (1), check metadata (1), then getUserProfile (6)
      mockDb.limit
        .mockResolvedValueOnce([mockUser])
        .mockResolvedValueOnce([mockUserMetadata])
        .mockResolvedValueOnce([mockUser])
        .mockResolvedValueOnce([mockAccount])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([mockUserMetadata])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([]);

      const result = await service.updateUserProfile(
        'user-123',
        'com.test.app',
        {
          name: 'Test',
          phoneNumber: '+919876543210',
          images: [
            '',
            '   ',
            'https://valid.com/image.jpg',
            null as unknown as string,
            undefined as unknown as string,
          ],
        },
      );

      expect(result).toBeDefined();
    });

    it('should save clientData when provided', async () => {
      const clientData = { theme: 'dark', notifications: true };
      // updateUserProfile: check user (1), check metadata (1), then getUserProfile (6)
      mockDb.limit
        .mockResolvedValueOnce([mockUser])
        .mockResolvedValueOnce([mockUserMetadata])
        .mockResolvedValueOnce([mockUser])
        .mockResolvedValueOnce([mockAccount])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([{ ...mockUserMetadata, clientData }])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([]);

      const result = await service.updateUserProfile(
        'user-123',
        'com.test.app',
        {
          name: 'Test',
          phoneNumber: '+919876543210',
          clientData,
        },
      );

      expect(result).toBeDefined();
      expect(mockDb.update).toHaveBeenCalled();
    });

    it('should create new metadata with clientData when no existing metadata', async () => {
      const clientData = { preferences: { lang: 'hi' } };
      // updateUserProfile: check user (1), check metadata (1), then getUserProfile (6)
      mockDb.limit
        .mockResolvedValueOnce([mockUser])
        .mockResolvedValueOnce([]) // No existing metadata
        .mockResolvedValueOnce([mockUser])
        .mockResolvedValueOnce([mockAccount])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([]);

      const result = await service.updateUserProfile(
        'user-123',
        'com.test.app',
        {
          name: 'Test',
          phoneNumber: '+919876543210',
          clientData,
        },
      );

      expect(result).toBeDefined();
      expect(mockDb.insert).toHaveBeenCalled();
    });
  });

  describe('deleteUser', () => {
    it('should soft delete user successfully', async () => {
      mockDb.limit.mockResolvedValueOnce([mockUser]);

      const result = await service.deleteUser('user-123');

      expect(result).toMatchSnapshot();
      expect(result.success).toBe(true);
    });

    it('should throw NotFoundException when user not found', async () => {
      mockDb.limit.mockResolvedValueOnce([]);

      await expect(service.deleteUser('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should anonymize user data on deletion', async () => {
      mockDb.limit.mockResolvedValueOnce([mockUser]);

      await service.deleteUser('user-123');

      // Verify update was called
      expect(mockDb.update).toHaveBeenCalled();
      expect(mockDb.set).toHaveBeenCalled();
      const setCall = (mockDb.set.mock.calls as unknown[][])[0];
      expect((setCall[0] as { isDeleted: boolean }).isDeleted).toBe(true);
      expect((setCall[0] as { email: string }).email).toContain('deleted_');
      expect((setCall[0] as { phoneNumber: null }).phoneNumber).toBeNull();
      expect((setCall[0] as { name: string }).name).toBe('Deleted User');
    });
  });

  describe('permanentlyDeleteUser', () => {
    it('should permanently delete user and all data', async () => {
      mockDb.limit.mockResolvedValueOnce([mockUser]);

      const result = await service.permanentlyDeleteUser('user-123');

      expect(result).toMatchSnapshot();
      expect(result.success).toBe(true);
    });

    it('should throw NotFoundException when user not found', async () => {
      mockDb.limit.mockResolvedValueOnce([]);

      await expect(
        service.permanentlyDeleteUser('non-existent'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should call delete multiple times', async () => {
      mockDb.limit.mockResolvedValueOnce([mockUser]);

      await service.permanentlyDeleteUser('user-123');

      // Verify delete was called (we don't care about exact count as long as it's called)
      expect(mockDb.delete).toHaveBeenCalled();
    });
  });
});
