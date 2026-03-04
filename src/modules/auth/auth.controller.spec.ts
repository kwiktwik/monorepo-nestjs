import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import {
  INestApplication,
  HttpException,
  HttpStatus,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import request from 'supertest';
import { AppIdGuard } from '../../common/guards/app-id.guard';

describe('AuthController', () => {
  let app: INestApplication;
  let authService: jest.Mocked<AuthService>;

  const mockAuthService = {
    sendOtp: jest.fn(),
    verifyOtp: jest.fn(),
    truecallerSignin: jest.fn(),
    googleSignin: jest.fn(),
  };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    })
      .overrideGuard(AppIdGuard)
      .useValue({ canActivate: () => true })
      .compile();

    app = moduleFixture.createNestApplication();
    authService = moduleFixture.get(AuthService);
    await app.init();
  });

  afterEach(async () => {
    await app.close();
    jest.clearAllMocks();
  });

  describe('POST /phone-number/send-otp', () => {
    it('should send OTP successfully', async () => {
      mockAuthService.sendOtp.mockResolvedValue({
        message: 'OTP sent successfully',
      });

      const response = await request(app.getHttpServer())
        .post('/phone-number/send-otp')
        .set('X-App-ID', 'com.test.app')
        .send({ phoneNumber: '9876543210' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('OTP sent successfully');
    });

    it('should handle rate limiting', async () => {
      mockAuthService.sendOtp.mockRejectedValue(
        new HttpException(
          'Please wait before requesting another OTP',
          HttpStatus.TOO_MANY_REQUESTS,
        ),
      );

      const response = await request(app.getHttpServer())
        .post('/phone-number/send-otp')
        .set('X-App-ID', 'com.test.app')
        .send({ phoneNumber: '9876543210' });

      expect(response.status).toBe(429);
    });
  });

  describe('POST /phone-number/verify', () => {
    it('should verify OTP and return token', async () => {
      const mockResult = {
        token: 'jwt-token',
        user: { id: 'user-123', name: 'Test User' },
      };
      mockAuthService.verifyOtp.mockResolvedValue(mockResult);

      const response = await request(app.getHttpServer())
        .post('/phone-number/verify')
        .set('X-App-ID', 'com.test.app')
        .send({ phoneNumber: '9876543210', code: '123456' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.token).toBe('jwt-token');
    });

    it('should handle invalid OTP', async () => {
      mockAuthService.verifyOtp.mockRejectedValue(
        new BadRequestException('Invalid OTP'),
      );

      const response = await request(app.getHttpServer())
        .post('/phone-number/verify')
        .set('X-App-ID', 'com.test.app')
        .send({ phoneNumber: '9876543210', code: '000000' });

      expect(response.status).toBe(400);
    });
  });

  describe('POST /auth/google-signin', () => {
    it('should sign in with Google', async () => {
      const mockResult = {
        token: 'google-jwt-token',
        user: { id: 'user-123', email: 'test@gmail.com' },
      };
      mockAuthService.googleSignin.mockResolvedValue(mockResult);

      const response = await request(app.getHttpServer())
        .post('/auth/google-signin')
        .set('X-App-ID', 'com.test.app')
        .send({ idToken: 'valid-google-id-token' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.token).toBe('google-jwt-token');
    });

    it('should handle invalid Google token', async () => {
      mockAuthService.googleSignin.mockRejectedValue(
        new UnauthorizedException('Invalid Google token'),
      );

      const response = await request(app.getHttpServer())
        .post('/auth/google-signin')
        .set('X-App-ID', 'com.test.app')
        .send({ idToken: 'invalid-token' });

      expect(response.status).toBe(401);
    });
  });

  describe('POST /truecaller/token', () => {
    it('should sign in with Truecaller', async () => {
      const mockResult = {
        token: 'truecaller-jwt-token',
        user: { id: 'user-123', phoneNumber: '+919876543210' },
        userProfile: { sub: 'sub-123', phone_number: '918888888888' },
      };
      mockAuthService.truecallerSignin.mockResolvedValue(mockResult);

      const response = await request(app.getHttpServer())
        .post('/truecaller/token')
        .set('X-App-ID', 'com.test.app')
        .send({
          code: 'auth-code',
          code_verifier: 'code-verifier',
          client_id: 'client-id',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.token).toBe('truecaller-jwt-token');
      expect(response.body.user.id).toBe('user-123');
    });

    it('should handle invalid Truecaller authorization', async () => {
      mockAuthService.truecallerSignin.mockRejectedValue(
        new UnauthorizedException('Invalid Truecaller authorization'),
      );

      const response = await request(app.getHttpServer())
        .post('/truecaller/token')
        .set('X-App-ID', 'com.test.app')
        .send({
          code: 'invalid-code',
          code_verifier: 'code-verifier',
          client_id: 'client-id',
        });

      expect(response.status).toBe(401);
    });
  });
});
