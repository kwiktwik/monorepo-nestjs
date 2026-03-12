import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { PresignedUrlDto } from './presigned-url.dto';

describe('Upload DTOs - Snapshot Tests', () => {
  describe('PresignedUrlDto', () => {
    it('should match snapshot for valid complete data', async () => {
      const dto = plainToInstance(PresignedUrlDto, {
        fileName: 'profile-image.jpg',
        contentType: 'image/jpeg',
        expiresIn: 3600,
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
      expect(dto).toMatchSnapshot();
    });

    it('should match snapshot for minimal data (fileName only)', async () => {
      const dto = plainToInstance(PresignedUrlDto, {
        fileName: 'document.pdf',
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
      expect(dto).toMatchSnapshot();
      expect(dto.contentType).toBe('image/jpeg'); // default value
      expect(dto.expiresIn).toBe(3600); // default value
    });

    it('should accept various content types', async () => {
      const validContentTypes = [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        'application/pdf',
        'text/plain',
      ];

      for (const contentType of validContentTypes) {
        const dto = plainToInstance(PresignedUrlDto, {
          fileName: 'test.file',
          contentType,
        });

        const errors = await validate(dto);
        expect(errors).toHaveLength(0);
      }
    });

    it('should fail validation when fileName is missing', async () => {
      const dto = plainToInstance(PresignedUrlDto, {});

      const errors = await validate(dto);
      expect(errors).toMatchSnapshot();
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should fail validation for expiresIn below minimum', async () => {
      const dto = plainToInstance(PresignedUrlDto, {
        fileName: 'test.jpg',
        expiresIn: 0,
      });

      const errors = await validate(dto);
      expect(errors).toMatchSnapshot();
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should fail validation for expiresIn above maximum', async () => {
      const dto = plainToInstance(PresignedUrlDto, {
        fileName: 'test.jpg',
        expiresIn: 604801, // 1 second more than max (7 days = 604800 seconds)
      });

      const errors = await validate(dto);
      expect(errors).toMatchSnapshot();
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should pass validation for expiresIn at boundaries', async () => {
      const minDto = plainToInstance(PresignedUrlDto, {
        fileName: 'test.jpg',
        expiresIn: 1,
      });

      const maxDto = plainToInstance(PresignedUrlDto, {
        fileName: 'test.jpg',
        expiresIn: 604800,
      });

      const minErrors = await validate(minDto);
      const maxErrors = await validate(maxDto);

      expect(minErrors).toHaveLength(0);
      expect(maxErrors).toHaveLength(0);
    });

    it('should accept long file names', async () => {
      const dto = plainToInstance(PresignedUrlDto, {
        fileName: 'a'.repeat(255) + '.jpg',
        contentType: 'image/jpeg',
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should accept file names with special characters', async () => {
      const dto = plainToInstance(PresignedUrlDto, {
        fileName: 'test-file_name.v2.jpg',
        contentType: 'image/jpeg',
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should handle various expiresIn values', async () => {
      const expiresInValues = [60, 300, 3600, 7200, 86400, 604800];

      for (const expiresIn of expiresInValues) {
        const dto = plainToInstance(PresignedUrlDto, {
          fileName: 'test.jpg',
          expiresIn,
        });

        const errors = await validate(dto);
        expect(errors).toHaveLength(0);
      }
    });
  });
});
