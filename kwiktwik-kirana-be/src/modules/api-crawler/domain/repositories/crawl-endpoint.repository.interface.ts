import {
  CrawlEndpoint,
  CreateCrawlEndpointInput,
  UpdateCrawlEndpointInput,
} from '../entities/crawl-endpoint.entity';

export interface ICrawlEndpointRepository {
  create(input: CreateCrawlEndpointInput): Promise<CrawlEndpoint>;
  findById(id: number): Promise<CrawlEndpoint | null>;
  findByName(name: string): Promise<CrawlEndpoint | null>;
  findAll(filters?: {
    active?: boolean;
    tag?: string;
  }): Promise<CrawlEndpoint[]>;
  update(id: number, input: UpdateCrawlEndpointInput): Promise<CrawlEndpoint>;
  delete(id: number): Promise<void>;
  updateLastCrawlTime(id: number): Promise<void>;
  updateNextCrawlTime(id: number, nextRun: Date): Promise<void>;
}
