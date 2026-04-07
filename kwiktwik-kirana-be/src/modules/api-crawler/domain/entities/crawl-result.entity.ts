// Import ContentMetadata from content strategies
import type { ContentMetadata } from '../strategies/content/content-handler.interface';

export interface CrawlResult {
  id: string;
  jobId: string;
  endpointId: number;
  statusCode: number;
  responseHeaders?: Record<string, string>;
  responseSizeBytes: number;
  contentType: string;
  contentHash: string;
  contentRefCount: number;
  extractedFields?: Record<string, any>;
  storageProvider: string;
  storageBucket?: string;
  storageKey: string;
  storageRegion?: string;
  rawContent?: string; // For database storage
  expiresAt?: Date;
  createdAt: Date;
}

// Re-export ContentMetadata from content strategies to avoid duplication
export type { ContentMetadata } from '../strategies/content/content-handler.interface';

export interface StorageLocation {
  type: 'database' | 's3';
  tableName?: string;
  recordId?: string;
  bucket?: string;
  key?: string;
  region?: string;
}

export interface StorageResult {
  location: StorageLocation;
  sizeBytes: number;
  storedAt: Date;
}

export interface CreateCrawlResultInput {
  jobId: string;
  endpointId: number;
  statusCode: number;
  responseHeaders?: Record<string, string>;
  responseSizeBytes: number;
  contentType: string;
  contentHash: string;
  extractedFields?: Record<string, any>;
  storageProvider: string;
  storageBucket?: string;
  storageKey: string;
  storageRegion?: string;
  rawContent?: string;
  expiresAt?: Date;
}

export interface JobExecutionResult {
  parsedContent: any;
  storageResult: StorageResult;
  extractedFields: Record<string, any>;
}

// Storage Strategy Interface (for infrastructure implementations)
export interface StorageStrategy {
  store(
    jobId: string,
    content: Buffer | string,
    metadata: ContentMetadata,
  ): Promise<StorageResult>;

  retrieve(location: StorageLocation): Promise<Buffer | string>;

  delete(location: StorageLocation): Promise<void>;
}
