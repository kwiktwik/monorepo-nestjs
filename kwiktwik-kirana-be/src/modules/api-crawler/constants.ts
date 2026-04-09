// Injection Tokens
export const CRAWL_ENDPOINT_REPOSITORY = Symbol('CRAWL_ENDPOINT_REPOSITORY');
export const CRAWL_JOB_REPOSITORY = Symbol('CRAWL_JOB_REPOSITORY');
export const CRAWL_RESULT_REPOSITORY = Symbol('CRAWL_RESULT_REPOSITORY');
export const HTTP_CLIENT = Symbol('HTTP_CLIENT');
export const RESPONSE_STORAGE = Symbol('RESPONSE_STORAGE');
export const DEDUPLICATION_SERVICE = Symbol('DEDUPLICATION_SERVICE');
export const RATE_LIMITER = Symbol('RATE_LIMITER');

// Pagination Types
export type PaginationType = 'none' | 'offset' | 'cursor' | 'page_number';

// Auth Types
export type AuthType = 'none' | 'api_key' | 'bearer_token' | 'custom_header';

// Content Handling Types
export type ContentHandling = 'auto' | 'json' | 'text' | 'binary' | 'image';

// Storage Types
export type StorageType = 'database' | 's3' | 'hybrid';

// Job Status
export type CrawlJobStatus =
  | 'pending'
  | 'queued'
  | 'running'
  | 'completed'
  | 'failed'
  | 'cancelled'
  | 'deduplicated';

// Priority
export type CrawlPriority = 'critical' | 'high' | 'normal' | 'low';
