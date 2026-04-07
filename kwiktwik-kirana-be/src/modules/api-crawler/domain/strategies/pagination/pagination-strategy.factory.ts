import { PaginationType } from '../../../constants';
import { PaginationStrategy } from './pagination-strategy.interface';
import { OffsetPaginationStrategy } from './offset-pagination.strategy';
import { CursorPaginationStrategy } from './cursor-pagination.strategy';
import { PageNumberPaginationStrategy } from './page-number-pagination.strategy';
import { NoPaginationStrategy } from './no-pagination.strategy';

export class PaginationStrategyFactory {
  private static strategies = new Map<PaginationType, PaginationStrategy>([
    ['none', new NoPaginationStrategy()],
    ['offset', new OffsetPaginationStrategy()],
    ['cursor', new CursorPaginationStrategy()],
    ['page_number', new PageNumberPaginationStrategy()],
  ]);

  static create(type: PaginationType): PaginationStrategy {
    const strategy = this.strategies.get(type);
    if (!strategy) {
      throw new Error(`Unknown pagination type: ${type}`);
    }
    return strategy;
  }
}
