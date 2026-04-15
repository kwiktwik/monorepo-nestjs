import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsOptional, IsString } from 'class-validator';

export class UpdateNotificationStatusDto {
  @ApiPropertyOptional({
    description: 'Database notification log ID (preferred)',
    example: 123,
  })
  @IsOptional()
  @IsInt()
  notificationLogId?: number;

  @ApiPropertyOptional({
    description: 'Android device notification ID (alternative - will be resolved to notificationLogId)',
    example: 'com.phonepe.app_1709876543210_abc123',
  })
  @IsOptional()
  @IsString()
  notificationId?: string;

  @ApiPropertyOptional({
    description: 'Whether TTS was announced on device',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  ttsAnnounced?: boolean;

  @ApiPropertyOptional({
    description: 'Whether team notification was sent',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  teamNotificationSent?: boolean;
}
