-- Migration: Create migration_logs table for tracking user migrations from kirana-fe
-- Created: 2026-03-09

CREATE TABLE "migration_logs" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"phone_number" text NOT NULL,
	"source_app_id" text NOT NULL DEFAULT 'com.kiranaapps.app',
	"destination_app_id" text NOT NULL DEFAULT 'com.kiranaapps.app',
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"completed_at" timestamp with time zone,
	"duration" integer,
	"status" text NOT NULL DEFAULT 'pending',
	"current_state" text NOT NULL DEFAULT 'pending',
	"retry_count" integer NOT NULL DEFAULT 0,
	"source_hash" text,
	"destination_hash" text,
	"tables_migrated" jsonb DEFAULT '[]'::jsonb,
	"tables_failed" jsonb DEFAULT '[]'::jsonb,
	"records_count" integer DEFAULT 0,
	"error_code" text,
	"error_message" text,
	"error_stack" text,
	"is_locked" boolean NOT NULL DEFAULT false,
	"locked_at" timestamp with time zone,
	"last_heartbeat" timestamp with time zone,
	"device_id" text,
	"session_token" text,
	"device_info" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "migration_logs" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint

-- Indexes for efficient querying
CREATE INDEX "migration_logs_user_id_idx" ON "migration_logs" ("user_id");--> statement-breakpoint
CREATE INDEX "migration_logs_status_idx" ON "migration_logs" ("status");--> statement-breakpoint
CREATE INDEX "migration_logs_is_locked_idx" ON "migration_logs" ("is_locked");--> statement-breakpoint
CREATE INDEX "migration_logs_phone_number_idx" ON "migration_logs" ("phone_number");--> statement-breakpoint
CREATE INDEX "migration_logs_started_at_idx" ON "migration_logs" ("started_at");--> statement-breakpoint
CREATE INDEX "migration_logs_status_started_at_idx" ON "migration_logs" ("status", "started_at");
