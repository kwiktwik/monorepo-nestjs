import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsIn } from 'class-validator';

const SUPPORTED_LANGUAGES = [
  'en', 'hi', 'bn', 'mr', 'te', 'ta', 'gu', 'ur', 'kn', 'or', 'ml'
] as const;

export class GetConfigDto {
  @ApiPropertyOptional({
    description: 'Optional plan ID to override backend selection (e.g., plan_S3FaBrk7sjPQEU)',
    example: 'plan_S3FaBrk7sjPQEU',
  })
  @IsOptional()
  @IsString()
  plan_id?: string;

  @ApiPropertyOptional({
    description: 'Language for localized content',
    enum: SUPPORTED_LANGUAGES,
    example: 'en',
  })
  @IsOptional()
  @IsString()
  @IsIn(SUPPORTED_LANGUAGES)
  language?: string;

  @ApiPropertyOptional({
    description: 'Language for localized content (fallback alias)',
    enum: SUPPORTED_LANGUAGES,
    example: 'en',
  })
  @IsOptional()
  @IsString()
  @IsIn(SUPPORTED_LANGUAGES)
  lang?: string;
}
