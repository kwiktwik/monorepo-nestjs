import { Injectable, Inject } from '@nestjs/common';
import { eq, and, sql, desc } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import type { ICrawlJobRepository, JobStats } from '../../domain/repositories/crawl-job.repository.interface';
import type {
  CrawlJob,
  CreateCrawlJobInput,
  UpdateCrawlJobInput,
} from '../../domain/entities/crawl-job.entity';
import { CrawlJobStatus } from '../../constants';
import { crawlJobs, crawlResults } from './crawler.schema';

@Injectable()
export class DrizzleCrawlJobRepository implements ICrawlJobRepository {
  constructor(
    @Inject('DRIZZLE_DB') private db: NodePgDatabase,
  ) {}

  async create(input: CreateCrawlJobInput): Promise<CrawlJob> {
    // Generate ULID if not provided
    const id = input.id || this.generateUlid();
    const now = new Date();
    
    const result = await this.db.insert(crawlJobs).values({
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
      metadata: input.metadata || {},
      createdAt: now,
      updatedAt: now,
    }).returning();

    return this.mapToEntity(result[0]);
  }

  private generateUlid(): string {
    const timestamp = Date.now().toString(36).toUpperCase().padStart(10, '0');
    const random = Array.from({ length: 16 }, () => 
      Math.floor(Math.random() * 36).toString(36).toUpperCase()
    ).join('');
    return timestamp + random;
  }

  async findById(id: string): Promise<CrawlJob | null> {
    const result = await this.db.select().from(crawlJobs).where(eq(crawlJobs.id, id)).limit(1);
    return result.length > 0 ? this.mapToEntity(result[0]) : null;
  }

  async findByDedupKey(endpointId: number, dedupKey: string): Promise<CrawlJob | null> {
    const result = await this.db
      .select()
      .from(crawlJobs)
      .where(
        and(
          eq(crawlJobs.endpointId, endpointId),
          eq(crawlJobs.dedupKey, dedupKey),
          sql`${crawlJobs.status} IN ('completed', 'running')`
        )
      )
      .limit(1);
    return result.length > 0 ? this.mapToEntity(result[0]) : null;
  }

  async findByEndpointId(endpointId: number, limit?: number): Promise<CrawlJob[]> {
    const query = this.db
      .select()
      .from(crawlJobs)
      .where(eq(crawlJobs.endpointId, endpointId))
      .orderBy(desc(crawlJobs.createdAt));
    
    const results = limit ? await query.limit(limit) : await query;
    return results.map(r => this.mapToEntity(r));
  }

  async findByStatus(status: CrawlJobStatus, limit?: number): Promise<CrawlJob[]> {
    const query = this.db
      .select()
      .from(crawlJobs)
      .where(eq(crawlJobs.status, status))
      .orderBy(desc(crawlJobs.createdAt));
    
    const results = limit ? await query.limit(limit) : await query;
    return results.map(r => this.mapToEntity(r));
  }

  async updateStatus(id: string, status: CrawlJobStatus, metadata?: UpdateCrawlJobInput): Promise<void> {
    const updates: any = { 
      status,
      updatedAt: new Date(),
    };

    if (metadata?.startedAt) updates.startedAt = metadata.startedAt;
    if (metadata?.completedAt) updates.completedAt = metadata.completedAt;
    if (metadata?.resultId) updates.resultId = metadata.resultId;
    if (metadata?.lastError) updates.lastError = metadata.lastError;
    if (metadata?.lastErrorAt) updates.lastErrorAt = metadata.lastErrorAt;
    if (metadata?.attemptCount) updates.attemptCount = metadata.attemptCount;
    if (metadata?.extractedFields) updates.extractedFields = metadata.extractedFields;
    if (metadata?.storageLocation) updates.storageLocation = metadata.storageLocation;
    if (metadata?.rawContent) updates.rawContent = metadata.rawContent;

    await this.db.update(crawlJobs)
      .set(updates)
      .where(eq(crawlJobs.id, id));
  }

  async claimNextPending(): Promise<CrawlJob | null> {
    // This would typically use a transaction with row locking
    // For simplicity, we'll just fetch and update in sequence
    const result = await this.db
      .select()
      .from(crawlJobs)
      .where(eq(crawlJobs.status, 'pending'))
      .orderBy(desc(crawlJobs.priority), crawlJobs.createdAt)
      .limit(1);

    if (result.length === 0) return null;

    const job = result[0];
    await this.updateStatus(job.id, 'running', { 
      startedAt: new Date(),
      attemptCount: (job.attemptCount || 0) + 1,
    });

    return this.mapToEntity({ ...job, status: 'running' });
  }

  async getPendingCount(): Promise<number> {
    const result = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(crawlJobs)
      .where(eq(crawlJobs.status, 'pending'));
    return result[0]?.count || 0;
  }

  async getStats(endpointId?: number): Promise<JobStats> {
    let query = this.db.select({
      status: crawlJobs.status,
      count: sql<number>`count(*)`,
    }).from(crawlJobs).groupBy(crawlJobs.status);

    if (endpointId) {
      query = query.where(eq(crawlJobs.endpointId, endpointId)) as any;
    }

    const results = await query;

    const stats: JobStats = {
      total: 0,
      pending: 0,
      running: 0,
      completed: 0,
      failed: 0,
      deduplicated: 0,
    };

    for (const row of results) {
      const count = Number(row.count);
      stats.total += count;
      if (row.status === 'pending') stats.pending = count;
      if (row.status === 'running') stats.running = count;
      if (row.status === 'completed') stats.completed = count;
      if (row.status === 'failed') stats.failed = count;
      if (row.status === 'deduplicated') stats.deduplicated = count;
    }

    return stats;
  }

  private mapToEntity(raw: any): CrawlJob {
    return {
      id: raw.id,
      endpointId: raw.endpointId,
      url: raw.url,
      method: raw.method,
      headers: raw.headers,
      queryParams: raw.queryParams,
      body: raw.body,
      dedupKey: raw.dedupKey,
      status: raw.status,
      priority: raw.priority,
      scheduledAt: raw.scheduledAt,
      startedAt: raw.startedAt,
      completedAt: raw.completedAt,
      attemptCount: raw.attemptCount,
      lastError: raw.lastError,
      lastErrorAt: raw.lastErrorAt,
      resultId: raw.resultId,
      extractedFields: raw.extractedFields,
      metadata: raw.metadata,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    };
  }
}
