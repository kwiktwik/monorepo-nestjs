import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { UpdateUserDto } from './update-user.dto';
import { DeleteUserImageDto } from './delete-user-image.dto';

describe('User DTOs - Snapshot Tests', () => {
  describe('UpdateUserDto', () => {
    it('should match snapshot for valid complete data', async () => {
      const dto = plainToInstance(UpdateUserDto, {
        name: 'John Doe',
        phoneNumber: '+919876543210',
        email: 'john@example.com',
        upiVpa: 'john@paytm',
        images: [
          'https://example.com/image1.jpg',
          'https://example.com/image2.jpg',
        ],
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
      expect(dto).toMatchSnapshot();
    });

    it('should match snapshot for minimal valid data', async () => {
      const dto = plainToInstance(UpdateUserDto, {
        name: 'Jane Doe',
        phoneNumber: '+15551234567',
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
      expect(dto).toMatchSnapshot();
    });

    it('should fail validation for invalid email', async () => {
      const dto = plainToInstance(UpdateUserDto, {
        name: 'Test User',
        phoneNumber: '+919876543210',
        email: 'invalid-email',
      });

      const errors = await validate(dto);
      expect(errors).toMatchSnapshot();
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should fail validation for invalid phone format', async () => {
      const dto = plainToInstance(UpdateUserDto, {
        name: 'Test User',
        phoneNumber: '9876543210',
      });

      const errors = await validate(dto);
      expect(errors).toMatchSnapshot();
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should fail validation for missing required fields', async () => {
      const dto = plainToInstance(UpdateUserDto, {});

      const errors = await validate(dto);
      expect(errors).toMatchSnapshot();
      expect(errors.length).toBe(1); // name is required
    });

    it('should fail validation for empty name', async () => {
      const dto = plainToInstance(UpdateUserDto, {
        name: '',
        phoneNumber: '+919876543210',
      });

      const errors = await validate(dto);
      expect(errors).toMatchSnapshot();
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should fail validation for invalid UPI VPA format', async () => {
      const dto = plainToInstance(UpdateUserDto, {
        name: 'Test User',
        phoneNumber: '+919876543210',
        upiVpa: 'invalid-upi',
      });

      const errors = await validate(dto);
      expect(errors).toMatchSnapshot();
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should pass validation for valid UPI VPA formats', async () => {
      const validVpAs = [
        'user@paytm',
        'user.name@okaxis',
        'user_name@upi',
        'user123@ybl',
      ];

      for (const upiVpa of validVpAs) {
        const dto = plainToInstance(UpdateUserDto, {
          name: 'Test User',
          phoneNumber: '+919876543210',
          upiVpa,
        });

        const errors = await validate(dto);
        expect(errors).toHaveLength(0);
      }
    });

    it('should match snapshot with empty images array', async () => {
      const dto = plainToInstance(UpdateUserDto, {
        name: 'Test User',
        phoneNumber: '+919876543210',
        images: [],
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
      expect(dto).toMatchSnapshot();
    });
  });

  describe('DeleteUserImageDto', () => {
    it('should match snapshot for valid data', async () => {
      const dto = plainToInstance(DeleteUserImageDto, {
        imageId: 123,
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
      expect(dto).toMatchSnapshot();
    });

    it('should fail validation for missing imageId', async () => {
      const dto = plainToInstance(DeleteUserImageDto, {});

      const errors = await validate(dto);
      expect(errors).toMatchSnapshot();
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should fail validation for invalid imageId type', async () => {
      const dto = plainToInstance(DeleteUserImageDto, {
        imageId: 'not-a-number',
      });

      const errors = await validate(dto);
      expect(errors).toMatchSnapshot();
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should pass validation for negative imageId (dto allows it)', async () => {
      const dto = plainToInstance(DeleteUserImageDto, {
        imageId: -1,
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });
  });
});
