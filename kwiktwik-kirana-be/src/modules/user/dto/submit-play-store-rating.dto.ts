import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class SubmitPlayStoreRatingDto {
  @ApiProperty({
    example: 5,
    description: 'Rating value from 1 to 5',
    minimum: 1,
    maximum: 5,
  })
  @IsInt({ message: 'Rating must be an integer' })
  @Min(1, { message: 'Rating must be at least 1' })
  @Max(5, { message: 'Rating must be at most 5' })
  rating: number;

  @ApiPropertyOptional({
    example: 'Great app!',
    description: 'Review title',
  })
  @IsString()
  @IsOptional()
  reviewTitle?: string;

  @ApiPropertyOptional({
    example: 'This app is amazing!',
    description: 'Review text',
  })
  @IsString()
  @IsOptional()
  review?: string;

  @ApiPropertyOptional({
    example: '2.1.2',
    description: 'App version',
  })
  @IsString()
  @IsOptional()
  appVersion?: string;

  @ApiPropertyOptional({
    example: 'SM-M336BU',
    description: 'Device model',
  })
  @IsString()
  @IsOptional()
  deviceModel?: string;

  @ApiPropertyOptional({
    example: '15',
    description: 'OS version',
  })
  @IsString()
  @IsOptional()
  osVersion?: string;

  @ApiPropertyOptional({
    example: 'en',
    description: 'Language code',
  })
  @IsString()
  @IsOptional()
  language?: string;

  @ApiPropertyOptional({
    example: 'com.kiranaapps.app',
    description: 'Package name',
  })
  @IsString()
  @IsOptional()
  packageName?: string;

  @ApiPropertyOptional({
    example: false,
    description: 'Whether the review was submitted to Play Store',
  })
  @IsOptional()
  submittedToPlayStore?: boolean;
}
