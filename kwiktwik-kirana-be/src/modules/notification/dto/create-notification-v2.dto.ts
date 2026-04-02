import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateNotificationV2Dto {
  // Required fields - Android sends these pre-parsed
  @ApiProperty({
    description: 'Unique identifier for the notification',
    example: 'com.phonepe.app_1709876543210_abc123',
  })
  notificationId: string;

  @ApiProperty({
    description: 'Package name of the app that generated the notification',
    example: 'com.phonepe.app',
  })
  packageName: string;

  @ApiProperty({
    description: 'Title of the notification',
    example: 'Payment Received',
  })
  title: string;

  @ApiProperty({
    description: 'Content/body of the notification',
    example: 'You received ₹500 from John Doe',
  })
  content: string;

  @ApiProperty({
    description: 'Timestamp when the notification was received (ISO 8601)',
    example: '2024-01-15T10:30:00.000Z',
  })
  timestamp: string;

  // Optional fields
  @ApiPropertyOptional({
    description: 'Expanded text for big text notifications',
    example: 'You received ₹500 from John Doe via UPI. Transaction ID: 1234567890',
  })
  bigText?: string;

  @ApiPropertyOptional({
    description: 'Display name of the app',
    example: 'PhonePe',
  })
  appName?: string;

  // Pre-parsed transaction fields (Android does the parsing)
  @ApiProperty({
    description: 'Whether this notification contains a transaction',
    example: true,
  })
  hasTransaction: boolean;

  @ApiPropertyOptional({
    description: 'Transaction amount (if hasTransaction is true)',
    example: '500',
  })
  amount?: string;

  @ApiPropertyOptional({
    description: 'Name of the payer/payee (if hasTransaction is true)',
    example: 'John Doe',
  })
  payerName?: string;

  @ApiProperty({
    description: 'Type of transaction',
    enum: ['RECEIVED', 'SENT', 'UNKNOWN'],
    example: 'RECEIVED',
  })
  transactionType: 'RECEIVED' | 'SENT' | 'UNKNOWN';

  // Metadata
  @ApiPropertyOptional({
    description: 'Time taken to process the notification (in milliseconds)',
    example: 150,
  })
  processingTimeMs?: number;

  @ApiPropertyOptional({
    description: 'Whether TTS announcement was made',
    example: false,
  })
  ttsAnnounced?: boolean;

  @ApiPropertyOptional({
    description: 'Whether team notification was sent',
    example: false,
  })
  teamNotificationSent?: boolean;

  @ApiPropertyOptional({
    description: 'Additional metadata from Android parsing',
    type: 'object',
    additionalProperties: true,
    example: { parsedBy: 'android-v2', parseTimeMs: 50 },
  })
  processingMetadata?: Record<string, unknown>;
}
