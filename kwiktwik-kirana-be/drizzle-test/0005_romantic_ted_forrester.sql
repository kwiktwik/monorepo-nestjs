ALTER TYPE "public"."order_status" ADD VALUE 'refunded';--> statement-breakpoint
ALTER TYPE "public"."subscription_status" ADD VALUE 'paused' BEFORE 'cancelled';--> statement-breakpoint
CREATE TABLE "migration_logs" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"phone_number" text NOT NULL,
	"source_app_id" text DEFAULT 'com.kiranaapps.app' NOT NULL,
	"destination_app_id" text DEFAULT 'com.kiranaapps.app' NOT NULL,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"completed_at" timestamp with time zone,
	"duration" integer,
	"status" text DEFAULT 'pending' NOT NULL,
	"current_state" text DEFAULT 'pending' NOT NULL,
	"retry_count" integer DEFAULT 0 NOT NULL,
	"source_hash" text,
	"destination_hash" text,
	"tables_migrated" jsonb DEFAULT '[]'::jsonb,
	"tables_failed" jsonb DEFAULT '[]'::jsonb,
	"records_count" integer DEFAULT 0,
	"error_code" text,
	"error_message" text,
	"error_stack" text,
	"is_locked" boolean DEFAULT false NOT NULL,
	"locked_at" timestamp with time zone,
	"last_heartbeat" timestamp with time zone,
	"device_id" text,
	"session_token" text,
	"device_info" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user_metadata" DROP COLUMN "has_cancelled_subscription";