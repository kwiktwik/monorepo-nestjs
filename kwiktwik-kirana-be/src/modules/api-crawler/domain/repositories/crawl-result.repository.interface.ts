import {
  CrawlResult,
  CreateCrawlResultInput,
  StorageLocation,
} from '../entities/crawl-result.entity';

export interface ICrawlResultRepository {
  create(input: CreateCrawlResultInput): Promise<CrawlResult>;
  findById(id: string): Promise<CrawlResult | null>;
  findByJobId(jobId: string): Promise<CrawlResult | null>;
  findByContentHash(hash: string): Promise<CrawlResult | null>;
  findByEndpointId(endpointId: number, limit?: number): Promise<CrawlResult[]>;
  incrementRefCount(id: string): Promise<void>;
  delete(id: string): Promise<void>;
  getStorageLocation(id: string): Promise<StorageLocation | null>;
}
