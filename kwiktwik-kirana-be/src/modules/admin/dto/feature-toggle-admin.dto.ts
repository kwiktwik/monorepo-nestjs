import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsString,
  IsOptional,
  IsBoolean,
  IsObject,
  IsNumber,
  IsArray,
  ValidateNested,
  IsEnum,
} from 'class-validator';

export class ListFeatureFlagsQueryDto {
  @ApiPropertyOptional({ description: 'Filter by app ID' })
  @IsOptional()
  @IsString()
  appId?: string;
}

export class ListExperimentsQueryDto {
  @ApiPropertyOptional({ description: 'Filter by app ID' })
  @IsOptional()
  @IsString()
  appId?: string;

  @ApiPropertyOptional({
    description: 'Filter by status',
    enum: ['draft', 'running', 'paused', 'concluded'],
  })
  @IsOptional()
  @IsEnum(['draft', 'running', 'paused', 'concluded'])
  status?: string;
}

export class CreateFeatureFlagDto {
  @ApiProperty({ description: 'Unique feature flag key' })
  @IsString()
  key: string;

  @ApiProperty({ description: 'App ID for the flag' })
  @IsString()
  appId: string;

  @ApiPropertyOptional({ description: 'Description of the feature flag' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Default evaluation result when no experiment is active',
  })
  @IsOptional()
  @IsObject()
  defaultValue?: { enabled: boolean; value?: unknown };

  @ApiPropertyOptional({ description: 'Is the feature flag globally enabled?' })
  @IsOptional()
  @IsBoolean()
  isEnabled?: boolean;
}

export class UpdateFeatureFlagDto {
  @ApiPropertyOptional({ description: 'Description of the feature flag' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Default evaluation result when no experiment is active',
  })
  @IsOptional()
  @IsObject()
  defaultValue?: { enabled: boolean; value?: unknown };

  @ApiPropertyOptional({ description: 'Is the feature flag globally enabled?' })
  @IsOptional()
  @IsBoolean()
  isEnabled?: boolean;
}

export class FeatureFlagResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  key: string;

  @ApiProperty()
  appId: string;

  @ApiPropertyOptional()
  description: string | null;

  @ApiProperty()
  isEnabled: boolean;

  @ApiPropertyOptional()
  defaultValue: any;

  @ApiProperty()
  createdAt: string;

  @ApiProperty()
  updatedAt: string;
}

export class CohortDto {
  @ApiProperty({ description: 'Name of the experiment cohort' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Weight allocated to the cohort' })
  @IsNumber()
  weight: number;

  @ApiPropertyOptional({
    description: 'Configuration payload returned for this cohort',
  })
  @IsOptional()
  @IsObject()
  config?: Record<string, unknown>;
}

export class CreateExperimentDto {
  @ApiProperty({ description: 'Experiment name' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'App ID for the experiment' })
  @IsString()
  appId: string;

  @ApiPropertyOptional({
    description: 'ID of the feature flag to connect with',
  })
  @IsOptional()
  @IsNumber()
  featureFlagId?: number;

  @ApiPropertyOptional({ description: 'Traffic allocation percentage' })
  @IsOptional()
  @IsNumber()
  trafficAllocation?: number;

  @ApiPropertyOptional({ description: 'Start Date' })
  @IsOptional()
  @IsString()
  startDate?: string;

  @ApiPropertyOptional({ description: 'End Date' })
  @IsOptional()
  @IsString()
  endDate?: string;

  @ApiPropertyOptional({ description: 'Metadata for experiment' })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;

  @ApiProperty({ type: [CohortDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CohortDto)
  cohorts: CohortDto[];
}

export class UpdateExperimentDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ enum: ['draft', 'running', 'paused', 'concluded'] })
  @IsOptional()
  @IsEnum(['draft', 'running', 'paused', 'concluded'])
  status?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  trafficAllocation?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  startDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  endDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}

export class ExperimentResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  appId: string;

  @ApiPropertyOptional()
  featureFlagId: number | null;

  @ApiProperty()
  status: string;

  @ApiProperty()
  trafficAllocation: number;

  @ApiPropertyOptional()
  startDate?: string;

  @ApiPropertyOptional()
  endDate?: string;

  @ApiPropertyOptional()
  metadata: any;

  @ApiProperty()
  createdAt: string;

  @ApiProperty()
  updatedAt: string;

  @ApiProperty({ type: [CohortDto] })
  cohorts: CohortDto[];
}

export class CohortStatsDto {
  @ApiProperty()
  name: string;

  @ApiProperty()
  usersExposed: number;

  @ApiProperty()
  conversions: number;

  @ApiProperty()
  conversionRate: number;
}

export class ExperimentResultsResponseDto {
  @ApiProperty()
  experimentId: number;

  @ApiProperty()
  experimentName: string;

  @ApiProperty()
  status: string;

  @ApiProperty({ type: [CohortStatsDto] })
  cohorts: CohortStatsDto[];

  @ApiPropertyOptional()
  winner?: string;

  @ApiProperty()
  generatedAt: string;
}
