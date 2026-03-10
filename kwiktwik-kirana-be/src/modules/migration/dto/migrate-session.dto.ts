import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsObject, IsOptional } from 'class-validator';

/**
 * DTO for initiating migration session
 */
export class MigrateSessionDto {
  @ApiProperty({
    description: 'Better-Auth session token from kirana-fe',
    example: 'sess_abc123def456',
  })
  @IsString()
  @IsNotEmpty()
  betterAuthToken: string;

  @ApiProperty({
    description: 'Unique device identifier',
    example: 'device_abc123_android',
  })
  @IsString()
  @IsNotEmpty()
  deviceId: string;

  @ApiProperty({
    description: 'Device information',
    required: false,
    example: {
      brand: 'Samsung',
      model: 'Galaxy S21',
      os: 'Android 13',
      appVersion: '2.0.0',
    },
  })
  @IsObject()
  @IsOptional()
  deviceInfo?: {
    brand: string;
    model: string;
    os: string;
    appVersion: string;
  };
}

/**
 * DTO for migration status query
 */
export class MigrationStatusDto {
  @ApiProperty({
    description: 'Migration ID',
    example: 'mig_abc123def456',
  })
  @IsString()
  @IsNotEmpty()
  migrationId: string;
}
