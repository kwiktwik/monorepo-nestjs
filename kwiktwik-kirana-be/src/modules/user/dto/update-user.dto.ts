import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsOptional,
  Matches,
  IsArray,
  MinLength,
  MaxLength,
  IsObject,
} from 'class-validator';

export class UpdateUserDto {
  @ApiProperty({
    example: 'John Doe',
    description: 'User full name',
    minLength: 1,
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty({ message: 'Name is required' })
  @MinLength(1, { message: 'Name must be at least 1 character' })
  @MaxLength(255, { message: 'Name must be at most 255 characters' })
  name: string;

  @ApiPropertyOptional({
    example: 'john@example.com',
    description: 'User email address',
  })
  @IsEmail({}, { message: 'Invalid email format' })
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({
    example: 'user@paytm',
    description: 'UPI Virtual Payment Address (VPA) in format user@bank',
  })
  @IsString()
  @IsOptional()
  @Matches(/^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/, {
    message:
      'Invalid UPI VPA format. Expected format: user@bank (e.g., user@paytm)',
  })
  upiVpa?: string;

  @ApiPropertyOptional({
    description:
      'Profile image URLs. Replaces all existing images for the user.',
    type: [String],
    example: [
      'https://example.com/image1.jpg',
      'https://example.com/image2.jpg',
    ],
  })
  @IsOptional()
  @IsArray({ message: 'Images must be an array' })
  @IsString({ each: true, message: 'Each image must be a string URL' })
  images?: string[];

  @ApiPropertyOptional({
    example: 'en-US',
    description: 'Audio language preference (e.g., "en-US", "hi-IN")',
  })
  @IsString()
  @IsOptional()
  audioLanguage?: string;

  @ApiPropertyOptional({
    example: '+919876543210',
    description: 'User phone number in E.164 format',
  })
  @IsString()
  @IsOptional()
  @Matches(/^[+][1-9]\d{1,14}$/, {
    message: 'Phone number must be in E.164 format (e.g., +919876543210)',
  })
  phoneNumber?: string;

  @ApiPropertyOptional({
    example: {
      theme: 'dark',
      notifications: true,
      preferences: { language: 'en' },
    },
    description:
      'Arbitrary JSON data stored by the client application. Can contain any key-value pairs.',
  })
  @IsObject()
  @IsOptional()
  clientData?: Record<string, any>;
}
