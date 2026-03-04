import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDeviceSessionDto {
  @ApiProperty({ description: 'App package identifier' })
  @IsString()
  appId: string;

  @ApiProperty({ description: 'Device model', required: false })
  @IsOptional()
  @IsString()
  deviceModel?: string;

  @ApiProperty({ description: 'OS version', required: false })
  @IsOptional()
  @IsString()
  osVersion?: string;

  @ApiProperty({ description: 'App version', required: false })
  @IsOptional()
  @IsString()
  appVersion?: string;

  @ApiProperty({ description: 'Platform (android/ios)', required: false })
  @IsOptional()
  @IsString()
  platform?: string;

  @ApiProperty({ description: 'Device manufacturer', required: false })
  @IsOptional()
  @IsString()
  manufacturer?: string;

  @ApiProperty({ description: 'Device brand', required: false })
  @IsOptional()
  @IsString()
  brand?: string;

  @ApiProperty({ description: 'Locale', required: false })
  @IsOptional()
  @IsString()
  locale?: string;

  @ApiProperty({ description: 'Timezone', required: false })
  @IsOptional()
  @IsString()
  timezone?: string;
}
