import { Injectable, Inject, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { Pool } from 'pg';
import { PG_POOL_TOKEN } from '../../database/drizzle.module';
import { HealthMetricsService } from './health-metrics.service';

/**
 * Service that periodically updates database pool metrics
 */
@Injectable()
export class DatabaseMetricsService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DatabaseMetricsService.name);
  private interval: NodeJS.Timeout;

  constructor(
    @Inject(PG_POOL_TOKEN) private readonly pool: Pool,
    private readonly metricsService: HealthMetricsService,
  ) {}

  onModuleInit() {
    this.logger.log('📊 Database metrics service initialized');
    
    // Update metrics every 15 seconds
    this.interval = setInterval(() => {
      this.updateMetrics();
    }, 15000);
    
    // Initial update
    this.updateMetrics();
  }

  onModuleDestroy() {
    if (this.interval) {
      clearInterval(this.interval);
    }
  }

  private updateMetrics() {
    try {
      this.metricsService.updateDbPoolMetrics({
        total: this.pool.totalCount,
        idle: this.pool.idleCount,
        waiting: this.pool.waitingCount,
      });
    } catch (error) {
      this.logger.warn(`Failed to update pool metrics: ${error.message}`);
    }
  }
}
