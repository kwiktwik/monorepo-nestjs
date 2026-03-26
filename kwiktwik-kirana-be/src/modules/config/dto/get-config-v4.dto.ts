import { IsOptional, IsIn } from 'class-validator';
import { UNIFIED_PLANS, SUPPORTED_LANGUAGES } from '../config.data';

/**
 * DTO for config v4 query parameters
 * Validates plan_id against known valid plans
 */
export class GetConfigV4Dto {
  @IsOptional()
  @IsIn(Object.keys(UNIFIED_PLANS), {
    message: (args) =>
      `Invalid plan_id "${args.value}". Must be one of: ${Object.keys(UNIFIED_PLANS).join(', ')}`,
  })
  plan_id?: string;

  @IsOptional()
  @IsIn(Object.values(SUPPORTED_LANGUAGES), {
    message: (args) =>
      `Invalid language "${args.value}". Supported languages: ${Object.values(SUPPORTED_LANGUAGES).join(', ')}`,
  })
  language?: string;
}
