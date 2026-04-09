import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CrawlEndpointService } from '../application/services/crawl-endpoint.service';
import { CrawlerOrchestratorService } from '../application/services/crawler-orchestrator.service';
import { CrawlSchedulerService } from '../application/services/crawl-scheduler.service';
import { CreateCrawlEndpointDto } from './dto/create-endpoint.dto';
import { UpdateCrawlEndpointDto } from './dto/update-endpoint.dto';
import { CrawlEndpoint } from '../domain/entities/crawl-endpoint.entity';

interface CrawlEndpointResponse {
  id: number;
  name: string;
  description?: string;
  baseUrl: string;
  method: string;
  status: string;
  pagination: any;
  schedule: any;
  lastCrawlAt?: Date;
  nextCrawlAt?: Date;
  createdAt: Date;
}

@Controller('api-crawler/endpoints')
export class ApiCrawlerController {
  constructor(
    private endpointService: CrawlEndpointService,
    private crawlerService: CrawlerOrchestratorService,
    private schedulerService: CrawlSchedulerService,
  ) {}

  @Post()
  async registerEndpoint(
    @Body() dto: CreateCrawlEndpointDto,
  ): Promise<CrawlEndpointResponse> {
    try {
      const endpoint = await this.endpointService.create(dto);

      // Schedule if enabled
      if (endpoint.schedule.enabled) {
        this.schedulerService.scheduleEndpoint(endpoint);
      }

      // Trigger immediate crawl if requested
      if (dto.schedule?.runOnStart) {
        this.crawlerService.triggerImmediateCrawl(endpoint.id).catch((err) => {
          console.error('Immediate crawl failed:', err);
        });
      }

      return this.mapToResponse(endpoint);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Get()
  async listEndpoints(
    @Query('active') active?: string,
    @Query('tag') tag?: string,
  ): Promise<CrawlEndpointResponse[]> {
    const filters: { active?: boolean; tag?: string } = {};
    if (active !== undefined) filters.active = active === 'true';
    if (tag) filters.tag = tag;

    const endpoints = await this.endpointService.findAll(filters);
    return endpoints.map((e) => this.mapToResponse(e));
  }

  @Get(':id')
  async getEndpoint(@Param('id') id: string): Promise<CrawlEndpointResponse> {
    const endpoint = await this.endpointService.findById(Number(id));
    if (!endpoint) throw new NotFoundException();
    return this.mapToResponse(endpoint);
  }

  @Patch(':id')
  async updateEndpoint(
    @Param('id') id: string,
    @Body() dto: UpdateCrawlEndpointDto,
  ): Promise<CrawlEndpointResponse> {
    const endpoint = await this.endpointService.update(Number(id), dto);
    return this.mapToResponse(endpoint);
  }

  @Delete(':id')
  async deleteEndpoint(@Param('id') id: string): Promise<{ message: string }> {
    await this.schedulerService.unscheduleEndpoint(Number(id));
    await this.endpointService.delete(Number(id));
    return { message: 'Endpoint deleted successfully' };
  }

  @Post(':id/trigger')
  async triggerCrawl(
    @Param('id') id: string,
  ): Promise<{ jobIds: string[]; message: string }> {
    const jobIds = await this.crawlerService.crawlEndpoint(Number(id));
    return {
      jobIds,
      message: `Crawl triggered successfully: ${jobIds.length} jobs`,
    };
  }

  @Post(':id/pause')
  async pauseEndpoint(@Param('id') id: string): Promise<{ message: string }> {
    await this.schedulerService.unscheduleEndpoint(Number(id));
    await this.endpointService.update(Number(id), { isActive: false });
    return { message: 'Endpoint paused' };
  }

  @Post(':id/resume')
  async resumeEndpoint(@Param('id') id: string): Promise<{ message: string }> {
    const endpoint = await this.endpointService.update(Number(id), {
      isActive: true,
    });
    this.schedulerService.scheduleEndpoint(endpoint);
    return { message: 'Endpoint resumed' };
  }

  private mapToResponse(endpoint: CrawlEndpoint): CrawlEndpointResponse {
    return {
      id: endpoint.id,
      name: endpoint.name,
      description: endpoint.description,
      baseUrl: endpoint.baseUrl,
      method: endpoint.method,
      status: endpoint.isActive ? 'active' : 'inactive',
      pagination: endpoint.pagination,
      schedule: endpoint.schedule,
      lastCrawlAt: endpoint.lastCrawlAt,
      nextCrawlAt: endpoint.nextCrawlAt,
      createdAt: endpoint.createdAt,
    };
  }
}
