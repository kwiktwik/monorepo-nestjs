import {
  IsString,
  IsOptional,
  IsEnum,
  IsObject,
  IsNumber,
  IsBoolean,
  IsArray,
  IsUrl,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class AuthConfigDto {
  @IsEnum(['none', 'api_key', 'bearer_token', 'custom_header'])
  type: string;

  @IsObject()
  config: any;
}

class PaginationConfigDto {
  @IsEnum(['none', 'offset', 'cursor', 'page_number'])
  type: string;

  @IsObject()
  @IsOptional()
  config?: any;

  @IsNumber()
  @IsOptional()
  maxPages?: number;

  @IsBoolean()
  @IsOptional()
  stopOnEmpty?: boolean;
}

class ResponseConfigDto {
  @IsEnum(['auto', 'json', 'text', 'binary', 'image'])
  @IsOptional()
  contentHandling?: string = 'auto';

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  extractFields?: string[];

  @IsNumber()
  @IsOptional()
  maxDbSizeBytes?: number = 102400;

  @IsEnum(['database', 's3', 'hybrid'])
  @IsOptional()
  storage?: string = 'hybrid';
}

class ScheduleConfigDto {
  @IsBoolean()
  @IsOptional()
  enabled?: boolean = true;

  @IsString()
  @IsOptional()
  cron?: string;

  @IsNumber()
  @IsOptional()
  intervalMinutes?: number;

  @IsBoolean()
  @IsOptional()
  runOnStart?: boolean = false;
}

class RateLimitConfigDto {
  @IsNumber()
  requestsPerMinute: number;

  @IsNumber()
  @IsOptional()
  maxConcurrent?: number = 1;

  @IsNumber()
  @IsOptional()
  delayBetweenRequestsMs?: number = 1000;
}

class RetryConfigDto {
  @IsNumber()
  @IsOptional()
  maxAttempts?: number = 3;

  @IsNumber()
  @IsOptional()
  backoffMultiplier?: number = 2;

  @IsNumber()
  @IsOptional()
  initialDelayMs?: number = 1000;

  @IsArray()
  @IsNumber({}, { each: true })
  @IsOptional()
  retryOnStatusCodes?: number[] = [429, 500, 502, 503, 504];
}

class DedupConfigDto {
  @IsBoolean()
  @IsOptional()
  enabled?: boolean = true;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  keyFields?: string[] = ['url', 'method', 'query_params'];

  @IsNumber()
  @IsOptional()
  ttlMinutes?: number = 60;
}

export class CreateCrawlEndpointDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @IsUrl()
  baseUrl: string;

  @IsEnum(['GET', 'POST', 'PUT', 'DELETE', 'PATCH'])
  @IsOptional()
  method?: string = 'GET';

  @IsObject()
  @IsOptional()
  headers?: Record<string, string>;

  @IsNumber()
  @IsOptional()
  timeoutMs?: number = 30000;

  @ValidateNested()
  @Type(() => AuthConfigDto)
  auth: AuthConfigDto;

  @ValidateNested()
  @Type(() => PaginationConfigDto)
  pagination: PaginationConfigDto;

  @IsObject()
  @IsOptional()
  request?: {
    bodyTemplate?: Record<string, any>;
    dynamicParams?: string[];
    staticQueryParams?: Record<string, string>;
  };

  @ValidateNested()
  @Type(() => ResponseConfigDto)
  response: ResponseConfigDto;

  @ValidateNested()
  @Type(() => ScheduleConfigDto)
  schedule: ScheduleConfigDto;

  @ValidateNested()
  @Type(() => RateLimitConfigDto)
  rateLimit: RateLimitConfigDto;

  @ValidateNested()
  @Type(() => RetryConfigDto)
  @IsOptional()
  retry?: RetryConfigDto;

  @ValidateNested()
  @Type(() => DedupConfigDto)
  @IsOptional()
  deduplication?: DedupConfigDto;
}
