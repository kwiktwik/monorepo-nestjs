import { Injectable, Inject } from '@nestjs/common';
import { DRIZZLE_TOKEN } from '../../database/drizzle.module';
import * as schema from '../../database/schema';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { and, asc, desc, eq, lte, sql } from 'drizzle-orm';

export interface HomeFeedItem {
  type: string;
  data: Record<string, unknown>;
}

export interface HomeFeedResponse {
  data: HomeFeedItem[];
  cursor: string | null;
  hasMore: boolean;
  limit: number;
}

function encodeCursor(timestamp: string, id: number): string {
  return Buffer.from(JSON.stringify({ timestamp, id })).toString('base64');
}

function decodeCursor(
  cursor: string,
): { timestamp: string; id: number } | null {
  try {
    const decoded = Buffer.from(cursor, 'base64').toString('utf-8');
    const parsed = JSON.parse(decoded) as { timestamp?: string; id?: number };
    if (parsed?.timestamp && typeof parsed.id === 'number') {
      return { timestamp: parsed.timestamp, id: parsed.id };
    }
    return null;
  } catch {
    return null;
  }
}

@Injectable()
export class FeedService {
  constructor(
    @Inject(DRIZZLE_TOKEN)
    private db: NodePgDatabase<typeof schema>,
  ) {}

  async getHomeFeed(
    limit: number,
    category?: string,
    cursor?: string,
  ): Promise<HomeFeedResponse> {
    const cappedLimit = Math.min(Math.max(limit || 20, 1), 100);
    const conditions: ReturnType<typeof lte>[] = [];

    let offsetDate: Date;
    let lastId: bigint | null = null;

    if (cursor) {
      const cursorData = decodeCursor(cursor);
      if (!cursorData) {
        return { data: [], cursor: null, hasMore: false, limit: cappedLimit };
      }
      offsetDate = new Date(cursorData.timestamp);
      lastId = BigInt(cursorData.id);
    } else {
      offsetDate = new Date();
    }

    conditions.push(lte(schema.quotes.createdAt, offsetDate.toISOString()));
    if (lastId !== null) {
      conditions.push(lte(schema.quotes.id, lastId));
    }
    if (category) {
      conditions.push(eq(schema.quotes.categoryType, category));
    }

    const rows = await this.db
      .select({
        id: schema.quotes.id,
        rawJson: schema.quotes.rawJson,
        createdAt: schema.quotes.createdAt,
      })
      .from(schema.quotes)
      .where(and(...conditions))
      .orderBy(desc(schema.quotes.createdAt), desc(schema.quotes.id))
      .limit(cappedLimit + 1);

    const hasMore = rows.length > cappedLimit;
    const items = (hasMore ? rows.slice(0, cappedLimit) : rows)
      .filter((r) => r.rawJson != null)
      .map((r) => ({
        type: 'QUOTE',
        data: r.rawJson as Record<string, unknown>,
      }));

    let nextCursor: string | null = null;
    if (hasMore && items.length > 0) {
      const last = rows[cappedLimit - 1];
      if (last?.createdAt && last?.id != null) {
        nextCursor = encodeCursor(last.createdAt, Number(last.id));
      }
    }

    return {
      data: items,
      cursor: nextCursor,
      hasMore,
      limit: cappedLimit,
    };
  }

  async getCategories(
    _appId: string,
  ): Promise<{ categories: string[]; count: number }> {
    const rows = await this.db
      .selectDistinct({ categoryType: schema.quotes.categoryType })
      .from(schema.quotes)
      .where(sql`${schema.quotes.categoryType} IS NOT NULL`)
      .orderBy(asc(schema.quotes.categoryType));

    const categories = rows
      .map((r) => r.categoryType)
      .filter((c): c is string => c != null && c !== '');

    return { categories, count: categories.length };
  }
}
