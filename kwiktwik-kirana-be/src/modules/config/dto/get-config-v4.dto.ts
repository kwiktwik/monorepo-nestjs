import { IsOptional, IsIn, IsString } from 'class-validator';
import { UNIFIED_PLANS, SUPPORTED_LANGUAGES } from '../config.data';

/**
 * DTO for config v4 query parameters
 * Validates plan_id against known valid plans
 */
export class GetConfigV4Dto {
  @IsOptional()
  @IsString()
  plan_id?: string;

  @IsOptional()
  @IsString()
  lang?: string;

  @IsOptional()
  @IsIn(Object.values(SUPPORTED_LANGUAGES), {
    message: (args) =>
      `Invalid language "${args.value}". Supported languages: ${Object.values(SUPPORTED_LANGUAGES).join(', ')}`,
  })
  language?: string;
}
