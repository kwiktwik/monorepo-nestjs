import { Injectable, Logger } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import type { CrawlEndpoint } from '../../domain/entities/crawl-endpoint.entity';
import { CrawlEndpointService } from './crawl-endpoint.service';
import { CrawlerOrchestratorService } from './crawler-orchestrator.service';

@Injectable()
export class CrawlSchedulerService {
  private readonly logger = new Logger(CrawlSchedulerService.name);

  constructor(
    private schedulerRegistry: SchedulerRegistry,
    private endpointService: CrawlEndpointService,
    private crawlerService: CrawlerOrchestratorService,
  ) {}

  async initializeSchedules(): Promise<void> {
    const activeEndpoints = await this.endpointService.findAll({
      active: true,
    });

    for (const endpoint of activeEndpoints) {
      if (endpoint.schedule.enabled) {
        this.scheduleEndpoint(endpoint);
      }
    }

    this.logger.log(
      `Initialized ${activeEndpoints.length} scheduled endpoints`,
    );
  }

  scheduleEndpoint(endpoint: CrawlEndpoint): void {
    const jobName = `crawl-${endpoint.id}`;

    // Remove existing schedule if any
    this.unscheduleEndpoint(endpoint.id);

    if (!endpoint.schedule.enabled) return;

    const cronExpression =
      endpoint.schedule.cron ||
      this.intervalToCron(endpoint.schedule.intervalMinutes || 60);

    // Store the scheduled task
    const scheduledTask = setInterval(
      async () => {
        try {
          this.logger.log(
            `Running scheduled crawl for endpoint: ${endpoint.name}`,
          );
          await this.crawlerService.crawlEndpoint(endpoint.id);

          // Update next run time
          const nextRun = new Date(
            Date.now() + (endpoint.schedule.intervalMinutes || 60) * 60000,
          );
          this.endpointService.updateNextCrawlTime(endpoint.id, nextRun);
        } catch (error) {
          this.logger.error(
            `Scheduled crawl failed for endpoint ${endpoint.name}:`,
            error,
          );
        }
      },
      (endpoint.schedule.intervalMinutes || 60) * 60000,
    );

    // Store reference for cleanup
    (this as any).scheduledTasks = (this as any).scheduledTasks || new Map();
    (this as any).scheduledTasks.set(jobName, scheduledTask);

    // Set initial next run time
    const nextRun = new Date(
      Date.now() + (endpoint.schedule.intervalMinutes || 60) * 60000,
    );
    this.endpointService.updateNextCrawlTime(endpoint.id, nextRun);

    this.logger.log(
      `Scheduled endpoint ${endpoint.name} with interval: ${endpoint.schedule.intervalMinutes || 60} minutes`,
    );
  }

  unscheduleEndpoint(endpointId: number): void {
    const jobName = `crawl-${endpointId}`;
    const scheduledTasks = (this as any).scheduledTasks;
    if (scheduledTasks?.has(jobName)) {
      clearInterval(scheduledTasks.get(jobName));
      scheduledTasks.delete(jobName);
      this.logger.log(`Unscheduled endpoint ${endpointId}`);
    }
  }

  private intervalToCron(minutes: number): string {
    if (minutes < 60) {
      return `*/${minutes} * * * *`;
    }
    const hours = Math.floor(minutes / 60);
    if (hours < 24) {
      return `0 */${hours} * * *`;
    }
    const days = Math.floor(hours / 24);
    return `0 0 */${days} * *`;
  }
}
