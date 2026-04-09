import { PaginationConfig } from '../../entities/crawl-endpoint.entity';

export interface PaginationContext {
  currentPage: number;
  currentOffset: number;
  currentCursor?: string | null;
  hasMore: boolean;
  itemsFetched: number;
  totalItems?: number;
  lastResponse?: any;
}

export interface PaginationStrategy {
  getInitialContext(): PaginationContext;

  buildNextRequest(
    context: PaginationContext,
    baseParams: Record<string, any>,
    config?: PaginationConfig,
  ): Record<string, any>;

  updateContext(
    context: PaginationContext,
    response: any,
    config?: PaginationConfig,
  ): PaginationContext;

  extractItems?(response: any): any[];
}
