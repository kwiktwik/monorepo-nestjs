import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBasicAuth,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { FeatureToggleAdminService } from './feature-toggle-admin.service';
import {
  CreateFeatureFlagDto,
  UpdateFeatureFlagDto,
  CreateExperimentDto,
  UpdateExperimentDto,
  FeatureFlagResponseDto,
  ExperimentResponseDto,
  ExperimentResultsResponseDto,
  ListFeatureFlagsQueryDto,
  ListExperimentsQueryDto,
} from './dto/feature-toggle-admin.dto';

@ApiTags('admin')
@ApiBasicAuth('admin-basic')
@Controller('admin/feature-toggle')
export class FeatureToggleAdminController {
  constructor(private readonly adminService: FeatureToggleAdminService) {}

  // ============================================================================
  // FEATURE FLAGS
  // ============================================================================

  @Get('flags')
  @ApiOperation({
    summary: 'List feature flags',
    description: 'Get all feature flags, optionally filtered by appId',
  })
  @ApiQuery({
    name: 'appId',
    required: false,
    description: 'Filter by app ID',
    example: 'com.paymentalert.app',
  })
  @ApiResponse({
    status: 200,
    description: 'List of feature flags',
    type: [FeatureFlagResponseDto],
  })
  async listFeatureFlags(
    @Query() query: ListFeatureFlagsQueryDto,
  ): Promise<FeatureFlagResponseDto[]> {
    return this.adminService.listFeatureFlags(query.appId);
  }

  @Get('flags/:id')
  @ApiOperation({ summary: 'Get a single feature flag by ID' })
  @ApiParam({ name: 'id', type: Number, description: 'Feature flag ID' })
  @ApiResponse({
    status: 200,
    description: 'Feature flag details',
    type: FeatureFlagResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Feature flag not found' })
  async getFeatureFlag(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<FeatureFlagResponseDto> {
    return this.adminService.getFeatureFlag(id);
  }

  @Post('flags')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new feature flag' })
  @ApiBody({ type: CreateFeatureFlagDto })
  @ApiResponse({
    status: 201,
    description: 'Feature flag created',
    type: FeatureFlagResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid input or duplicate key' })
  async createFeatureFlag(
    @Body() dto: CreateFeatureFlagDto,
  ): Promise<FeatureFlagResponseDto> {
    return this.adminService.createFeatureFlag(dto);
  }

  @Patch('flags/:id')
  @ApiOperation({ summary: 'Update a feature flag' })
  @ApiParam({ name: 'id', type: Number, description: 'Feature flag ID' })
  @ApiBody({ type: UpdateFeatureFlagDto })
  @ApiResponse({
    status: 200,
    description: 'Updated feature flag',
    type: FeatureFlagResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Feature flag not found' })
  async updateFeatureFlag(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateFeatureFlagDto,
  ): Promise<FeatureFlagResponseDto> {
    return this.adminService.updateFeatureFlag(id, dto);
  }

  @Delete('flags/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a feature flag' })
  @ApiParam({ name: 'id', type: Number, description: 'Feature flag ID' })
  @ApiResponse({ status: 200, description: 'Feature flag deleted' })
  @ApiResponse({ status: 404, description: 'Feature flag not found' })
  async deleteFeatureFlag(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ success: boolean; message: string }> {
    return this.adminService.deleteFeatureFlag(id);
  }

  // ============================================================================
  // EXPERIMENTS
  // ============================================================================

  @Get('experiments')
  @ApiOperation({
    summary: 'List experiments',
    description:
      'Get all experiments, optionally filtered by appId and/or status',
  })
  @ApiQuery({
    name: 'appId',
    required: false,
    description: 'Filter by app ID',
    example: 'com.paymentalert.app',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Filter by status',
    enum: ['draft', 'running', 'paused', 'concluded'],
  })
  @ApiResponse({
    status: 200,
    description: 'List of experiments with cohorts',
    type: [ExperimentResponseDto],
  })
  async listExperiments(
    @Query() query: ListExperimentsQueryDto,
  ): Promise<ExperimentResponseDto[]> {
    return this.adminService.listExperiments(query.appId, query.status);
  }

  @Get('experiments/:id')
  @ApiOperation({ summary: 'Get a single experiment by ID (includes cohorts)' })
  @ApiParam({ name: 'id', type: Number, description: 'Experiment ID' })
  @ApiResponse({
    status: 200,
    description: 'Experiment details with cohorts',
    type: ExperimentResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Experiment not found' })
  async getExperiment(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ExperimentResponseDto> {
    return this.adminService.getExperiment(id);
  }

  @Post('experiments')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new experiment with cohorts',
    description: 'Creates experiment and associated cohorts in one call',
  })
  @ApiBody({ type: CreateExperimentDto })
  @ApiResponse({
    status: 201,
    description: 'Experiment created',
    type: ExperimentResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  async createExperiment(
    @Body() dto: CreateExperimentDto,
  ): Promise<ExperimentResponseDto> {
    return this.adminService.createExperiment(dto);
  }

  @Patch('experiments/:id')
  @ApiOperation({
    summary: 'Update an experiment',
    description:
      'Can be used to change status (start/pause/conclude), traffic allocation, dates, etc.',
  })
  @ApiParam({ name: 'id', type: Number, description: 'Experiment ID' })
  @ApiBody({ type: UpdateExperimentDto })
  @ApiResponse({
    status: 200,
    description: 'Updated experiment',
    type: ExperimentResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Experiment not found' })
  async updateExperiment(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateExperimentDto,
  ): Promise<ExperimentResponseDto> {
    return this.adminService.updateExperiment(id, dto);
  }

  @Delete('experiments/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete an experiment and its cohorts' })
  @ApiParam({ name: 'id', type: Number, description: 'Experiment ID' })
  @ApiResponse({ status: 200, description: 'Experiment deleted' })
  @ApiResponse({ status: 404, description: 'Experiment not found' })
  async deleteExperiment(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ success: boolean; message: string }> {
    return this.adminService.deleteExperiment(id);
  }

  // ============================================================================
  // EXPERIMENT RESULTS / ANALYSIS
  // ============================================================================

  @Get('experiments/:id/results')
  @ApiOperation({
    summary: 'Get experiment results and analysis',
    description:
      'Returns per-cohort exposure/conversion stats and identifies winner',
  })
  @ApiParam({ name: 'id', type: Number, description: 'Experiment ID' })
  @ApiResponse({
    status: 200,
    description: 'Experiment results with cohort stats',
    type: ExperimentResultsResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Experiment not found' })
  async getExperimentResults(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ExperimentResultsResponseDto> {
    return this.adminService.getExperimentResults(id);
  }
}
