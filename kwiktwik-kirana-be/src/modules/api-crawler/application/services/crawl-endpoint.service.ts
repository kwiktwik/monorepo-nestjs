import { Injectable, Inject } from '@nestjs/common';
import { CRAWL_ENDPOINT_REPOSITORY } from '../../constants';
import type { ICrawlEndpointRepository } from '../../domain/repositories/crawl-endpoint.repository.interface';
import type {
  CrawlEndpoint,
  CreateCrawlEndpointInput,
  UpdateCrawlEndpointInput,
} from '../../domain/entities/crawl-endpoint.entity';
import type { CreateCrawlEndpointDto } from '../../presentation/dto/create-endpoint.dto';

@Injectable()
export class CrawlEndpointService {
  constructor(
    @Inject(CRAWL_ENDPOINT_REPOSITORY)
    private repository: ICrawlEndpointRepository,
  ) {}

  async create(input: CreateCrawlEndpointDto | CreateCrawlEndpointInput): Promise<CrawlEndpoint> {
    // Validate name uniqueness
    const existing = await this.repository.findByName(input.name);
    if (existing) {
      throw new Error(`Endpoint with name "${input.name}" already exists`);
    }

    // Convert DTO to Input format if needed
    const entityInput: CreateCrawlEndpointInput = {
      name: input.name,
      description: input.description,
      tags: input.tags,
      baseUrl: input.baseUrl,
      method: input.method,
      headers: input.headers,
      timeoutMs: input.timeoutMs,
      auth: input.auth as any,
      pagination: input.pagination as any,
      request: input.request,
      response: input.response as any,
      schedule: input.schedule as any,
      rateLimit: input.rateLimit as any,
      retry: input.retry as any,
      deduplication: input.deduplication as any,
    };

    return this.repository.create(entityInput);
  }

  async findById(id: number): Promise<CrawlEndpoint | null> {
    return this.repository.findById(id);
  }

  async findByName(name: string): Promise<CrawlEndpoint | null> {
    return this.repository.findByName(name);
  }

  async findAll(filters?: { active?: boolean; tag?: string }): Promise<CrawlEndpoint[]> {
    return this.repository.findAll(filters);
  }

  async update(id: number, input: UpdateCrawlEndpointInput): Promise<CrawlEndpoint> {
    return this.repository.update(id, input);
  }

  async delete(id: number): Promise<void> {
    return this.repository.delete(id);
  }

  async updateLastCrawlTime(id: number): Promise<void> {
    return this.repository.updateLastCrawlTime(id);
  }

  async updateNextCrawlTime(id: number, nextRun: Date): Promise<void> {
    return this.repository.updateNextCrawlTime(id, nextRun);
  }
}
