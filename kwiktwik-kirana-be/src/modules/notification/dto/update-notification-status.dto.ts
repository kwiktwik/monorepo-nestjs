import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsOptional } from 'class-validator';

export class UpdateNotificationStatusDto {
  @ApiProperty({
    description: 'ID from POST /notifications/v1 or /notifications/v2 response',
    example: 123,
  })
  @IsInt()
  notificationLogId: number;

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
