import { Test, TestingModule } from '@nestjs/testing';
import { AuthService, normalizePhoneNumber } from './auth.service';
import { DRIZZLE_TOKEN } from '../../database/drizzle.module';
import { JwtService } from '@nestjs/jwt';
import { KiranaFeInternalService } from './services/kirana-fe-internal.service';
import { UnauthorizedException, BadRequestException } from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;
  let mockDb: any;
  let mockJwtService: any;
  let mockKiranaFeService: any;

  beforeEach(async () => {
    mockDb = {
      insert: jest.fn().mockReturnThis(),
      values: jest.fn().mockReturnThis(),
      returning: jest.fn().mockResolvedValue([{ id: 'user-123' }]),
      select: jest.fn().mockReturnThis(),
      from: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      limit: jest.fn().mockResolvedValue([]),
      orderBy: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      set: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      query: {
        user: {
          findFirst: jest.fn(),
        },
        session: {
          findFirst: jest.fn(),
        },
      },
    };

    mockJwtService = {
      sign: jest.fn().mockReturnValue('mock-jwt-token'),
      verify: jest.fn(),
    };

    mockKiranaFeService = {
      checkUserExists: jest.fn().mockResolvedValue(false),
      sendOtp: jest.fn(),
      verifyOtp: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: DRIZZLE_TOKEN, useValue: mockDb },
        { provide: JwtService, useValue: mockJwtService },
        { provide: KiranaFeInternalService, useValue: mockKiranaFeService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('normalizePhoneNumber', () => {
    it('should normalize 10 digit Indian number', () => {
      expect(normalizePhoneNumber('9876543210')).toBe('+919876543210');
    });

    it('should normalize 12 digit number with 91 prefix', () => {
      expect(normalizePhoneNumber('919876543210')).toBe('+919876543210');
    });

    it('should keep number with + prefix as is', () => {
      expect(normalizePhoneNumber('+919876543210')).toBe('+919876543210');
    });

    it('should handle number with spaces and dashes', () => {
      expect(normalizePhoneNumber('987-654-3210')).toBe('+919876543210');
    });
  });

  describe('checkKiranaFeUser', () => {
    it('should return true if user exists in kirana-fe', async () => {
      mockKiranaFeService.checkUserExists.mockResolvedValue(true);

      const result = await service.checkKiranaFeUser('+919876543210');

      expect(result).toBe(true);
      expect(mockKiranaFeService.checkUserExists).toHaveBeenCalledWith('+919876543210');
    });

    it('should return false if user does not exist', async () => {
      mockKiranaFeService.checkUserExists.mockResolvedValue(false);

      const result = await service.checkKiranaFeUser('+919876543210');

      expect(result).toBe(false);
    });

    it('should fallback to digits-only format if normalized fails', async () => {
      mockKiranaFeService.checkUserExists
        .mockResolvedValueOnce(false)
        .mockResolvedValueOnce(true);

      const result = await service.checkKiranaFeUser('9876543210');

      expect(result).toBe(true);
      expect(mockKiranaFeService.checkUserExists).toHaveBeenCalledTimes(2);
    });
  });

});
