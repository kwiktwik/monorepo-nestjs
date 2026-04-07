import { CrawlJobStatus, CrawlPriority } from '../../constants';

export interface CrawlJob {
  id: string;
  endpointId: number;
  url: string;
  method: string;
  headers?: Record<string, string>;
  queryParams?: Record<string, any>;
  body?: Record<string, any>;
  dedupKey?: string;
  dedupTtlExpiresAt?: Date;
  status: CrawlJobStatus;
  priority: CrawlPriority;
  scheduledAt?: Date;
  startedAt?: Date;
  completedAt?: Date;
  attemptCount: number;
  lastError?: string;
  lastErrorAt?: Date;
  resultId?: string;
  pageNumber?: number;
  paginationCursor?: string;
  metadata?: Record<string, any>;
  extractedFields?: Record<string, any>;
  storageLocation?: Record<string, any>;
  rawContent?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCrawlJobInput {
  id?: string;
  endpointId: number;
  url: string;
  method: string;
  headers?: Record<string, string>;
  queryParams?: Record<string, any>;
  body?: Record<string, any>;
  dedupKey?: string;
  dedupTtlExpiresAt?: Date;
  status?: CrawlJobStatus;
  priority?: CrawlPriority;
  scheduledAt?: Date;
  pageNumber?: number;
  paginationCursor?: string;
  metadata?: Record<string, any>;
}

export interface UpdateCrawlJobInput {
  status?: CrawlJobStatus;
  startedAt?: Date;
  completedAt?: Date;
  attemptCount?: number;
  lastError?: string;
  lastErrorAt?: Date;
  resultId?: string;
  extractedFields?: Record<string, any>;
  storageLocation?: Record<string, any>;
  rawContent?: string;
  updatedAt?: Date;
}

export interface CrawlRequest {
  url: string;
  method: string;
  headers?: Record<string, string>;
  queryParams?: Record<string, any>;
  body?: any;
}
