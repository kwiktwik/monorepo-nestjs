-- Migration: Add enhanced notification processing support
-- This migration creates NEW tables without modifying existing notifications table
-- All changes are backward compatible - existing functionality will continue to work

-- Step 1: Create transaction type enum
CREATE TYPE transaction_type AS ENUM ('RECEIVED', 'SENT', 'UNKNOWN');

-- Step 2: Create team notification status enum
CREATE TYPE team_notification_status AS ENUM ('SUCCESS', 'FAILED');

-- Step 3: Create enhanced_notifications table (NEW - does not modify existing table)
CREATE TABLE IF NOT EXISTS enhanced_notifications (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  notification_id TEXT NOT NULL UNIQUE,
  original_notification_id INTEGER REFERENCES notifications(id),
  package_name TEXT NOT NULL,
  app_name TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  big_text TEXT,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  has_transaction BOOLEAN NOT NULL DEFAULT false,
  amount TEXT,
  payer_name TEXT,
  transaction_type transaction_type,
  processing_time_ms INTEGER,
  processing_metadata JSONB,
  notification_log_id INTEGER,
  tts_announced BOOLEAN NOT NULL DEFAULT false,
  team_notification_sent BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Step 4: Create indexes for enhanced_notifications
CREATE INDEX IF NOT EXISTS enhanced_notifications_userId_idx ON enhanced_notifications(user_id);
CREATE INDEX IF NOT EXISTS enhanced_notifications_notificationId_idx ON enhanced_notifications(notification_id);
CREATE INDEX IF NOT EXISTS enhanced_notifications_timestamp_idx ON enhanced_notifications(timestamp);
CREATE INDEX IF NOT EXISTS enhanced_notifications_transactionType_idx ON enhanced_notifications(transaction_type);
CREATE INDEX IF NOT EXISTS enhanced_notifications_logId_idx ON enhanced_notifications(notification_log_id);

-- Step 5: Create notification_logs table
CREATE TABLE IF NOT EXISTS notification_logs (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  notification_id TEXT NOT NULL,
  package_name TEXT NOT NULL,
  app_name TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  title TEXT NOT NULL,
  text TEXT,
  big_text TEXT,
  has_transaction BOOLEAN NOT NULL DEFAULT false,
  amount TEXT,
  payer_name TEXT,
  transaction_type transaction_type,
  processing_time_ms INTEGER,
  tts_announced BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Step 6: Create indexes for notification_logs
CREATE INDEX IF NOT EXISTS notification_logs_userId_idx ON notification_logs(user_id);
CREATE INDEX IF NOT EXISTS notification_logs_notificationId_idx ON notification_logs(notification_id);
CREATE INDEX IF NOT EXISTS notification_logs_timestamp_idx ON notification_logs(timestamp);
CREATE INDEX IF NOT EXISTS notification_logs_transactionType_idx ON notification_logs(transaction_type);

-- Step 7: Create team_notifications table
CREATE TABLE IF NOT EXISTS team_notifications (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  notification_log_id INTEGER NOT NULL REFERENCES notification_logs(id) ON DELETE CASCADE,
  transaction_key TEXT NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  recipient_count INTEGER NOT NULL DEFAULT 0,
  status team_notification_status NOT NULL DEFAULT 'SUCCESS',
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Step 8: Create indexes for team_notifications
CREATE INDEX IF NOT EXISTS team_notifications_userId_idx ON team_notifications(user_id);
CREATE INDEX IF NOT EXISTS team_notifications_logId_idx ON team_notifications(notification_log_id);
CREATE INDEX IF NOT EXISTS team_notifications_transactionKey_idx ON team_notifications(transaction_key);

-- Step 9: Create unique constraint for transaction_key
ALTER TABLE team_notifications 
  ADD CONSTRAINT team_notifications_transactionKey_unique UNIQUE (transaction_key);

-- Migration complete
-- Existing notifications table is UNCHANGED
-- New enhanced_notifications table is available for enhanced processing
-- Old system continues to work exactly as before
