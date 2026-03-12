import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { SendOtpDto } from './send-otp.dto';
import { VerifyOtpDto } from './verify-otp.dto';
import { LoginOtpDto, LoginTruecallerDto, LoginGoogleDto } from './login.dto';
import { GoogleSigninDto } from './google-signin.dto';
import { TruecallerSigninDto } from './truecaller-signin.dto';

describe('Auth DTOs - Snapshot Tests', () => {
  describe('SendOtpDto', () => {
    it('should match snapshot for valid data with appHash', async () => {
      const dto = plainToInstance(SendOtpDto, {
        phoneNumber: '+919876543210',
        appHash: 'abc123',
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
      expect(dto).toMatchSnapshot();
    });

    it('should match snapshot for valid data without appHash', async () => {
      const dto = plainToInstance(SendOtpDto, {
        phoneNumber: '+15551234567',
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
      expect(dto).toMatchSnapshot();
    });

    it('should fail validation for invalid phone format', async () => {
      const dto = plainToInstance(SendOtpDto, {
        phoneNumber: '9876543210',
      });

      const errors = await validate(dto);
      expect(errors).toMatchSnapshot();
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should fail validation for empty phone', async () => {
      const dto = plainToInstance(SendOtpDto, {
        phoneNumber: '',
      });

      const errors = await validate(dto);
      expect(errors).toMatchSnapshot();
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should fail validation for missing phone', async () => {
      const dto = plainToInstance(SendOtpDto, {});

      const errors = await validate(dto);
      expect(errors).toMatchSnapshot();
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should accept various valid phone formats', async () => {
      const validPhones = [
        '+919876543210',
        '+15551234567',
        '+442071838750',
        '+8613812345678',
        '+818012345678',
      ];

      for (const phoneNumber of validPhones) {
        const dto = plainToInstance(SendOtpDto, { phoneNumber });
        const errors = await validate(dto);
        expect(errors).toHaveLength(0);
      }
    });

    it('should reject invalid phone formats', async () => {
      const invalidPhones = [
        '9876543210', // missing +
        '+abcdefghij', // non-numeric
        '+1-555-123-4567', // dashes
        '+91 98765 43210', // spaces
        '+', // just +
        '', // empty
      ];

      for (const phoneNumber of invalidPhones) {
        const dto = plainToInstance(SendOtpDto, { phoneNumber });
        const errors = await validate(dto);
        expect(errors.length).toBeGreaterThan(0);
      }
    });
  });

  describe('VerifyOtpDto', () => {
    it('should match snapshot for valid data', async () => {
      const dto = plainToInstance(VerifyOtpDto, {
        phoneNumber: '+919876543210',
        code: '123456',
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
      expect(dto).toMatchSnapshot();
    });

    it('should fail validation for short OTP code', async () => {
      const dto = plainToInstance(VerifyOtpDto, {
        phoneNumber: '+919876543210',
        code: '123',
      });

      const errors = await validate(dto);
      expect(errors).toMatchSnapshot();
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should fail validation for non-numeric code', async () => {
      const dto = plainToInstance(VerifyOtpDto, {
        phoneNumber: '+919876543210',
        code: 'abc123',
      });

      const errors = await validate(dto);
      expect(errors).toMatchSnapshot();
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should fail validation for missing fields', async () => {
      const dto = plainToInstance(VerifyOtpDto, {});

      const errors = await validate(dto);
      expect(errors).toMatchSnapshot();
      expect(errors.length).toBe(2);
    });
  });

  describe('LoginOtpDto', () => {
    it('should match snapshot for valid data', async () => {
      const dto = plainToInstance(LoginOtpDto, {
        phoneNumber: '+919876543210',
        code: '123456',
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
      expect(dto).toMatchSnapshot();
    });

    it('should fail validation for invalid OTP code', async () => {
      const dto = plainToInstance(LoginOtpDto, {
        phoneNumber: '+919876543210',
        code: '12',
      });

      const errors = await validate(dto);
      expect(errors).toMatchSnapshot();
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should fail validation for missing phone', async () => {
      const dto = plainToInstance(LoginOtpDto, {
        code: '123456',
      });

      const errors = await validate(dto);
      expect(errors).toMatchSnapshot();
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  describe('LoginTruecallerDto', () => {
    it('should match snapshot for valid data', async () => {
      const dto = plainToInstance(LoginTruecallerDto, {
        phoneNumber: '+919876543210',
        code: 'auth_code_123',
        code_verifier: 'verifier_123',
        client_id: 'client_123',
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
      expect(dto).toMatchSnapshot();
    });

    it('should fail validation for missing fields', async () => {
      const dto = plainToInstance(LoginTruecallerDto, {
        phoneNumber: '+919876543210',
      });

      const errors = await validate(dto);
      expect(errors).toMatchSnapshot();
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  describe('LoginGoogleDto', () => {
    it('should match snapshot for valid data', async () => {
      const dto = plainToInstance(LoginGoogleDto, {
        phoneNumber: '+919876543210',
        idToken: 'google.id.token.jwt',
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
      expect(dto).toMatchSnapshot();
    });

    it('should fail validation for missing idToken', async () => {
      const dto = plainToInstance(LoginGoogleDto, {
        phoneNumber: '+919876543210',
      });

      const errors = await validate(dto);
      expect(errors).toMatchSnapshot();
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  describe('GoogleSigninDto', () => {
    it('should match snapshot for valid data', async () => {
      const dto = plainToInstance(GoogleSigninDto, {
        idToken: 'google.id.token.jwt',
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
      expect(dto).toMatchSnapshot();
    });

    it('should fail validation for empty idToken', async () => {
      const dto = plainToInstance(GoogleSigninDto, {
        idToken: '',
      });

      const errors = await validate(dto);
      expect(errors).toMatchSnapshot();
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  describe('TruecallerSigninDto', () => {
    it('should match snapshot for valid data', async () => {
      const dto = plainToInstance(TruecallerSigninDto, {
        code: 'auth_code_123',
        code_verifier: 'verifier_123',
        client_id: 'client_123',
        grant_type: 'authorization_code',
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
      expect(dto).toMatchSnapshot();
    });

    it('should fail validation for missing fields', async () => {
      const dto = plainToInstance(TruecallerSigninDto, {
        code: 'auth_code_123',
      });

      const errors = await validate(dto);
      expect(errors).toMatchSnapshot();
      expect(errors.length).toBeGreaterThan(0);
    });
  });
});
