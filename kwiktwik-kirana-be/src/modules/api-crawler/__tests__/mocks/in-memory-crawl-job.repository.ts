import { ICrawlJobRepository, JobStats } from '../../domain/repositories/crawl-job.repository.interface';
import {
  CrawlJob,
  CreateCrawlJobInput,
  UpdateCrawlJobInput,
} from '../../domain/entities/crawl-job.entity';
import { CrawlJobStatus } from '../../constants';

/**
 * In-memory mock repository for testing
 * Does NOT require any database - stores data in memory
 */
export class InMemoryCrawlJobRepository implements ICrawlJobRepository {
  private jobs: Map<string, CrawlJob> = new Map();

  async create(input: CreateCrawlJobInput): Promise<CrawlJob> {
    const id = input.id || this.generateUlid();
    const job: CrawlJob = {
      id,
      endpointId: input.endpointId,
      url: input.url,
      method: input.method,
      headers: input.headers || {},
      queryParams: input.queryParams || {},
      body: input.body,
      dedupKey: input.dedupKey,
      status: input.status || 'pending',
      priority: input.priority || 'normal',
      scheduledAt: input.scheduledAt,
      attemptCount: 0,
      metadata: input.metadata || {},
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.jobs.set(id, job);
    return job;
  }

  async findById(id: string): Promise<CrawlJob | null> {
    return this.jobs.get(id) || null;
  }

  async findByDedupKey(endpointId: number, dedupKey: string): Promise<CrawlJob | null> {
    for (const job of this.jobs.values()) {
      if (job.endpointId === endpointId && 
          job.dedupKey === dedupKey && 
          (job.status === 'completed' || job.status === 'running')) {
        return job;
      }
    }
    return null;
  }

  async findByEndpointId(endpointId: number, limit?: number): Promise<CrawlJob[]> {
    const results = Array.from(this.jobs.values())
      .filter(j => j.endpointId === endpointId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    return limit ? results.slice(0, limit) : results;
  }

  async findByStatus(status: CrawlJobStatus, limit?: number): Promise<CrawlJob[]> {
    const results = Array.from(this.jobs.values())
      .filter(j => j.status === status)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    return limit ? results.slice(0, limit) : results;
  }

  async updateStatus(id: string, status: CrawlJobStatus, metadata?: UpdateCrawlJobInput): Promise<void> {
    const job = this.jobs.get(id);
    if (job) {
      job.status = status;
      job.updatedAt = new Date();
      if (metadata?.startedAt) job.startedAt = metadata.startedAt;
      if (metadata?.completedAt) job.completedAt = metadata.completedAt;
      if (metadata?.resultId) job.resultId = metadata.resultId;
      if (metadata?.lastError) job.lastError = metadata.lastError;
      if (metadata?.lastErrorAt) job.lastErrorAt = metadata.lastErrorAt;
      if (metadata?.attemptCount) job.attemptCount = metadata.attemptCount;
      if (metadata?.extractedFields) job.extractedFields = metadata.extractedFields;
      if (metadata?.storageLocation) job.storageLocation = metadata.storageLocation;
      if (metadata?.rawContent) job.rawContent = metadata.rawContent;
    }
  }

  async claimNextPending(): Promise<CrawlJob | null> {
    const pending = Array.from(this.jobs.values())
      .filter(j => j.status === 'pending')
      .sort((a, b) => {
        const priorityOrder = { critical: 0, high: 1, normal: 2, low: 3 };
        const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
        if (priorityDiff !== 0) return priorityDiff;
        return a.createdAt.getTime() - b.createdAt.getTime();
      });
    
    if (pending.length === 0) return null;
    
    const job = pending[0];
    job.status = 'running';
    job.startedAt = new Date();
    job.attemptCount++;
    job.updatedAt = new Date();
    return job;
  }

  async getPendingCount(): Promise<number> {
    return Array.from(this.jobs.values()).filter(j => j.status === 'pending').length;
  }

  async getStats(endpointId?: number): Promise<JobStats> {
    const jobs = endpointId 
      ? Array.from(this.jobs.values()).filter(j => j.endpointId === endpointId)
      : Array.from(this.jobs.values());

    const stats: JobStats = {
      total: jobs.length,
      pending: jobs.filter(j => j.status === 'pending').length,
      running: jobs.filter(j => j.status === 'running').length,
      completed: jobs.filter(j => j.status === 'completed').length,
      failed: jobs.filter(j => j.status === 'failed').length,
      deduplicated: jobs.filter(j => j.status === 'deduplicated').length,
    };

    return stats;
  }

  clear(): void {
    this.jobs.clear();
  }

  private generateUlid(): string {
    const timestamp = Date.now().toString(36).toUpperCase().padStart(10, '0');
    const random = Array.from({ length: 16 }, () => 
      Math.floor(Math.random() * 36).toString(36).toUpperCase()
    ).join('');
    return timestamp + random;
  }
}
