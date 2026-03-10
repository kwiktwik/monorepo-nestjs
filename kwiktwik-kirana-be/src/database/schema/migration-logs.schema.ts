import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
  jsonb,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

/**
 * Migration Logs Table
 * Tracks all migration attempts with full audit trail
 */
export const migrationLogs = pgTable(
  'migration_logs',
  {
    // Primary identifier
    id: text('id').primaryKey().notNull(),

    // User identification
    userId: text('user_id').notNull(),
    phoneNumber: text('phone_number').notNull(),

    // App tracking
    sourceAppId: text('source_app_id').notNull().default('com.kiranaapps.app'),
    destinationAppId: text('destination_app_id')
      .notNull()
      .default('com.kiranaapps.app'),

    // Timing
    startedAt: timestamp('started_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    completedAt: timestamp('completed_at', { withTimezone: true }),
    duration: integer('duration'), // milliseconds

    // Status tracking
    status: text('status').notNull().default('pending'),
    currentState: text('current_state').notNull().default('pending'),
    retryCount: integer('retry_count').notNull().default(0),

    // Data tracking
    sourceHash: text('source_hash'),
    destinationHash: text('destination_hash'),
    tablesMigrated: jsonb('tables_migrated').$type<string[]>().default([]),
    tablesFailed: jsonb('tables_failed').$type<string[]>().default([]),
    recordsCount: integer('records_count').default(0),

    // Error handling
    errorCode: text('error_code'),
    errorMessage: text('error_message'),
    errorStack: text('error_stack'),

    // DB-based locking (no Redis)
    isLocked: boolean('is_locked').notNull().default(false),
    lockedAt: timestamp('locked_at', { withTimezone: true }),
    lastHeartbeat: timestamp('last_heartbeat', { withTimezone: true }),
    deviceId: text('device_id'),

    // Session reference (truncated for security)
    sessionToken: text('session_token'),

    // Metadata
    deviceInfo: jsonb('device_info').$type<{
      brand: string;
      model: string;
      os: string;
      appVersion: string;
    }>(),

    // Timestamps
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    // Indexes for efficient querying
    userIdIdx: sql`CREATE INDEX migration_logs_user_id_idx ON ${table} (user_id)`,
    statusIdx: sql`CREATE INDEX migration_logs_status_idx ON ${table} (status)`,
    lockedIdx: sql`CREATE INDEX migration_logs_locked_idx ON ${table} (is_locked)`,
    phoneIdx: sql`CREATE INDEX migration_logs_phone_idx ON ${table} (phone_number)`,
  }),
);
