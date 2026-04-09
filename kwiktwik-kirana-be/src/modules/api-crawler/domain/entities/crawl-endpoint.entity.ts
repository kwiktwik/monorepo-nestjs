import {
  PaginationType,
  AuthType,
  ContentHandling,
  StorageType,
} from '../../constants';

// Auth Configurations
export interface ApiKeyAuth {
  keyName: string;
  keyValue: string;
  placement: 'header' | 'query';
}

export interface BearerTokenAuth {
  token: string;
}

export interface CustomHeaderAuth {
  headers: Record<string, string>;
}

export type AuthConfig = ApiKeyAuth | BearerTokenAuth | CustomHeaderAuth;

// Pagination Configurations
export interface OffsetPaginationConfig {
  offsetParam: string;
  limitParam: string;
  limitValue: number;
  offsetStart: number;
}

export interface CursorPaginationConfig {
  cursorParam: string;
  limitParam: string;
  limitValue: number;
  cursorPath: string;
}

export interface PageNumberConfig {
  pageParam: string;
  perPageParam: string;
  perPageValue: number;
  startPage: number;
}

export type PaginationConfig =
  | OffsetPaginationConfig
  | CursorPaginationConfig
  | PageNumberConfig
  | null;

// Deduplication Config
export interface DedupConfig {
  enabled: boolean;
  keyFields: ('url' | 'method' | 'query_params' | 'body' | 'headers')[];
  ttlMinutes: number;
}

// Retry Config
export interface RetryConfig {
  maxAttempts: number;
  backoffMultiplier: number;
  initialDelayMs: number;
  retryOnStatusCodes: number[];
}

// Rate Limit Config
export interface RateLimitConfig {
  requestsPerMinute: number;
  maxConcurrent: number;
  delayBetweenRequestsMs: number;
}

// Schedule Config
export interface ScheduleConfig {
  enabled: boolean;
  cron?: string;
  intervalMinutes?: number;
  runOnStart: boolean;
}

// Response Config
export interface ResponseConfig {
  contentHandling: ContentHandling;
  extractFields?: string[];
  maxDbSizeBytes: number;
  storage: StorageType;
}

// Request Config
export interface RequestConfig {
  bodyTemplate?: Record<string, any>;
  dynamicParams?: string[];
  staticQueryParams?: Record<string, string>;
}

// Main Endpoint Entity
export interface CrawlEndpoint {
  id: number;
  name: string;
  description?: string;
  tags?: string[];
  baseUrl: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  timeoutMs: number;
  auth: {
    type: AuthType;
    config: AuthConfig;
  };
  pagination: {
    type: PaginationType;
    config: PaginationConfig;
    maxPages?: number;
    stopOnEmpty: boolean;
  };
  request: RequestConfig;
  response: ResponseConfig;
  schedule: ScheduleConfig;
  rateLimit: RateLimitConfig;
  retry: RetryConfig;
  deduplication: DedupConfig;
  isActive: boolean;
  lastCrawlAt?: Date;
  nextCrawlAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Create Input
export interface CreateCrawlEndpointInput {
  name: string;
  description?: string;
  tags?: string[];
  baseUrl: string;
  method?: string;
  headers?: Record<string, string>;
  timeoutMs?: number;
  auth: {
    type: AuthType;
    config: AuthConfig;
  };
  pagination: {
    type: PaginationType;
    config?: PaginationConfig;
    maxPages?: number;
    stopOnEmpty?: boolean;
  };
  request?: RequestConfig;
  response: {
    contentHandling?: ContentHandling;
    extractFields?: string[];
    maxDbSizeBytes?: number;
    storage?: StorageType;
  };
  schedule: {
    enabled?: boolean;
    cron?: string;
    intervalMinutes?: number;
    runOnStart?: boolean;
  };
  rateLimit: {
    requestsPerMinute: number;
    maxConcurrent?: number;
    delayBetweenRequestsMs?: number;
  };
  retry?: {
    maxAttempts?: number;
    backoffMultiplier?: number;
    initialDelayMs?: number;
    retryOnStatusCodes?: number[];
  };
  deduplication?: {
    enabled?: boolean;
    keyFields?: ('url' | 'method' | 'query_params' | 'body' | 'headers')[];
    ttlMinutes?: number;
  };
}

// Update Input
export interface UpdateCrawlEndpointInput extends Partial<CreateCrawlEndpointInput> {
  isActive?: boolean;
}
