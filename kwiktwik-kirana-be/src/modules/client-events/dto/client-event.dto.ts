import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsArray,
  ValidateNested,
  IsOptional,
  IsObject,
  ArrayMaxSize,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ClientEventItemDto {
  @ApiProperty({ example: 'API_CALL_FAILED' })
  @IsString()
  @IsNotEmpty()
  eventType!: string;

  @ApiPropertyOptional({ example: 'Pixel 8' })
  @IsOptional()
  @IsString()
  deviceModel?: string;

  @ApiPropertyOptional({ example: '15' })
  @IsOptional()
  @IsString()
  osVersion?: string;

  @ApiPropertyOptional({ example: '2.1.0' })
  @IsOptional()
  @IsString()
  appVersion?: string;

  @ApiPropertyOptional({
    example: { endpoint: '/api/user', statusCode: 500 },
  })
  @IsOptional()
  @IsObject()
  payload?: Record<string, unknown>;

  @ApiPropertyOptional({ example: '2025-06-01T12:00:00Z' })
  @IsOptional()
  @IsString()
  timestamp?: string;
}

export class IngestClientEventsDto {
  @ApiProperty({ type: [ClientEventItemDto], maxItems: 100 })
  @IsArray()
  @ArrayMaxSize(100)
  @ValidateNested({ each: true })
  @Type(() => ClientEventItemDto)
  events!: ClientEventItemDto[];
}