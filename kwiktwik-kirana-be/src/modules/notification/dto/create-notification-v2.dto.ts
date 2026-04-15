import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsBoolean, IsOptional, IsNumber, IsObject } from 'class-validator';

export class CreateNotificationV2Dto {
  // Required fields - Android sends these pre-parsed
  @ApiProperty({
    description: 'Unique identifier for the notification',
    example: 'com.phonepe.app_1709876543210_abc123',
  })
  @IsString()
  notificationId: string;

  @ApiProperty({
    description: 'Package name of the app that generated the notification',
    example: 'com.phonepe.app',
  })
  @IsString()
  packageName: string;

  @ApiProperty({
    description: 'Title of the notification',
    example: 'Payment Received',
  })
  @IsString()
  title: string;

  @ApiProperty({
    description: 'Content/body of the notification',
    example: 'You received ₹500 from John Doe',
  })
  @IsString()
  content: string;

  @ApiProperty({
    description: 'Timestamp when the notification was received (ISO 8601)',
    example: '2024-01-15T10:30:00.000Z',
  })
  @IsString()
  timestamp: string;

  // Optional fields
  @ApiPropertyOptional({
    description: 'Expanded text for big text notifications',
    example:
      'You received ₹500 from John Doe via UPI. Transaction ID: 1234567890',
  })
  @IsOptional()
  @IsString()
  bigText?: string;

  @ApiPropertyOptional({
    description: 'Display name of the app',
    example: 'PhonePe',
  })
  @IsOptional()
  @IsString()
  appName?: string;

  // Pre-parsed transaction fields (Android does the parsing)
  @ApiProperty({
    description: 'Whether this notification contains a transaction',
    example: true,
  })
  @IsBoolean()
  hasTransaction: boolean;

  @ApiPropertyOptional({
    description: 'Transaction amount (if hasTransaction is true)',
    example: '500',
  })
  @IsOptional()
  @IsString()
  amount?: string;

  @ApiPropertyOptional({
    description: 'Name of the payer/payee (if hasTransaction is true)',
    example: 'John Doe',
  })
  @IsOptional()
  @IsString()
  payerName?: string;

  @ApiProperty({
    description: 'Type of transaction',
    enum: ['RECEIVED', 'SENT', 'UNKNOWN'],
    example: 'RECEIVED',
  })
  @IsString()
  transactionType: 'RECEIVED' | 'SENT' | 'UNKNOWN';

  // Metadata
  @ApiPropertyOptional({
    description: 'Time taken to process the notification (in milliseconds)',
    example: 150,
  })
  @IsOptional()
  @IsNumber()
  processingTimeMs?: number;

  @ApiPropertyOptional({
    description: 'Whether TTS announcement was made',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  ttsAnnounced?: boolean;

  @ApiPropertyOptional({
    description: 'Whether team notification was sent',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  teamNotificationSent?: boolean;

  @ApiPropertyOptional({
    description: 'Additional metadata from Android parsing',
    type: 'object',
    additionalProperties: true,
    example: { parsedBy: 'android-v2', parseTimeMs: 50 },
  })
  @IsOptional()
  processingMetadata?: Record<string, unknown>;
}
