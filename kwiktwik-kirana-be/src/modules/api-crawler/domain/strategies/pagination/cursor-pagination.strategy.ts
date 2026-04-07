import { PaginationStrategy, PaginationContext } from './pagination-strategy.interface';
import { CursorPaginationConfig } from '../../entities/crawl-endpoint.entity';

export class CursorPaginationStrategy implements PaginationStrategy {
  getInitialContext(): PaginationContext {
    return {
      currentPage: 0,
      currentOffset: 0,
      hasMore: true,
      itemsFetched: 0,
    };
  }

  buildNextRequest(
    context: PaginationContext,
    baseParams: Record<string, any>,
    config?: CursorPaginationConfig
  ): Record<string, any> {
    if (!config) return baseParams;
    
    const params: Record<string, any> = {
      ...baseParams,
      [config.limitParam]: config.limitValue,
    };
    
    if (context.currentCursor) {
      params[config.cursorParam] = context.currentCursor;
    }
    
    return params;
  }

  updateContext(
    context: PaginationContext,
    response: any,
    config?: CursorPaginationConfig
  ): PaginationContext {
    const items = this.extractItems(response) || [];
    const nextCursor = config ? this.extractCursor(response, config.cursorPath) : null;
    
    return {
      ...context,
      currentPage: context.currentPage + 1,
      currentCursor: nextCursor,
      itemsFetched: context.itemsFetched + items.length,
      hasMore: !!nextCursor && items.length > 0,
      lastResponse: response,
    };
  }

  private extractCursor(response: any, path: string): string | null {
    const parts = path.split('.');
    let value = response;
    for (const part of parts) {
      value = value?.[part];
      if (value === undefined) break;
    }
    return typeof value === 'string' ? value : null;
  }

  extractItems(response: any): any[] {
    if (Array.isArray(response)) return response;
    if (Array.isArray(response.data)) return response.data;
    if (Array.isArray(response.results)) return response.results;
    return [];
  }
}
