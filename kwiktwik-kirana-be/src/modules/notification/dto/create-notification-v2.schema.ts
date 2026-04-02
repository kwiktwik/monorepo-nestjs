import { z } from 'zod';

export const TransactionTypeEnum = z.enum(['RECEIVED', 'SENT', 'UNKNOWN']);

export const CreateNotificationV2Schema = z.object({
  // Required fields
  notificationId: z.string().min(1, 'Notification ID is required'),
  packageName: z.string().min(1, 'Package name is required'),
  title: z.string().min(1, 'Title is required'),
  content: z.string().min(1, 'Content is required'),
  timestamp: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid timestamp format',
  }),

  // Optional fields
  bigText: z.string().optional(),
  appName: z.string().optional(),

  // Transaction fields
  hasTransaction: z.boolean(),
  amount: z.string().optional(),
  payerName: z.string().optional(),
  transactionType: TransactionTypeEnum.default('UNKNOWN'),

  // Metadata
  processingTimeMs: z.number().int().min(0).optional(),
  ttsAnnounced: z.boolean().optional(),
  teamNotificationSent: z.boolean().optional(),
  processingMetadata: z.record(z.string(), z.unknown()).optional(),
});

export type CreateNotificationV2Input = z.infer<
  typeof CreateNotificationV2Schema
>;
