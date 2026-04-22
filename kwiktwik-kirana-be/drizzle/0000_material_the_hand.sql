CREATE TYPE "public"."crawl_job_status" AS ENUM('pending', 'queued', 'running', 'completed', 'failed', 'cancelled', 'deduplicated');--> statement-breakpoint
CREATE TYPE "public"."crawl_priority" AS ENUM('critical', 'high', 'normal', 'low');--> statement-breakpoint
CREATE TYPE "public"."experiment_event_type" AS ENUM('exposure', 'conversion', 'custom');--> statement-breakpoint
CREATE TYPE "public"."experiment_status" AS ENUM('draft', 'running', 'paused', 'concluded');--> statement-breakpoint
CREATE TYPE "public"."identity_type" AS ENUM('firebaseInstallationId', 'deviceId', 'userId');--> statement-breakpoint
CREATE TYPE "public"."notification_event_status" AS ENUM('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');--> statement-breakpoint
CREATE TYPE "public"."order_status" AS ENUM('created', 'authorized', 'captured', 'failed', 'cancelled', 'refunded');--> statement-breakpoint
CREATE TYPE "public"."payment_provider" AS ENUM('razorpay', 'phonepe');--> statement-breakpoint
CREATE TYPE "public"."phonepe_redemption_state" AS ENUM('NOTIFICATION_IN_PROGRESS', 'NOTIFIED', 'PENDING', 'COMPLETED', 'FAILED');--> statement-breakpoint
CREATE TYPE "public"."phonepe_subscription_state" AS ENUM('CREATED', 'ACTIVATION_IN_PROGRESS', 'ACTIVE', 'PAUSED', 'CANCEL_IN_PROGRESS', 'CANCELLED', 'REVOKED', 'EXPIRED', 'FAILED');--> statement-breakpoint
CREATE TYPE "public"."subscription_status" AS ENUM('created', 'authenticated', 'active', 'pending', 'halted', 'paused', 'cancelled', 'completed', 'expired');--> statement-breakpoint
CREATE TYPE "public"."team_notification_status" AS ENUM('SUCCESS', 'FAILED');--> statement-breakpoint
CREATE TYPE "public"."transaction_type" AS ENUM('RECEIVED', 'SENT', 'UNKNOWN');--> statement-breakpoint
CREATE TABLE "abandoned_checkouts" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"app_id" text NOT NULL,
	"checkout_started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"offer_expires_at" timestamp with time zone,
	"discount_notification_sent" boolean DEFAULT false NOT NULL,
	"discount_notification_sent_at" timestamp with time zone,
	"notifications_sent" integer DEFAULT 0 NOT NULL,
	"last_notification_sent_at" timestamp with time zone,
	"next_notification_scheduled_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "abandoned_checkouts" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"accountId" text NOT NULL,
	"providerId" text NOT NULL,
	"userId" text NOT NULL,
	"appId" text,
	"accessToken" text,
	"refreshToken" text,
	"idToken" text,
	"accessTokenExpiresAt" timestamp with time zone,
	"refreshTokenExpiresAt" timestamp with time zone,
	"scope" text,
	"password" text,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone NOT NULL,
	CONSTRAINT "account_userId_providerId_appId_unique" UNIQUE("userId","providerId","appId")
);
--> statement-breakpoint
ALTER TABLE "account" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "apps" (
	"id" text PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(100) NOT NULL,
	"description" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"settings" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "apps_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "apps" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "conversation_participants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"conversation_id" uuid NOT NULL,
	"app_id" text NOT NULL,
	"user_id" text NOT NULL,
	"role" varchar(50) DEFAULT 'member' NOT NULL,
	"joined_at" timestamp DEFAULT now() NOT NULL,
	"last_read_at" timestamp,
	"muted_until" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "conversation_participants" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "conversations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"app_id" text NOT NULL,
	"type" varchar(50) DEFAULT 'direct' NOT NULL,
	"name" varchar(255),
	"description" text,
	"avatar_url" varchar(500),
	"created_by" text NOT NULL,
	"last_message_at" timestamp,
	"last_message_preview" text,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "conversations" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "crawl_endpoints" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"tags" text[],
	"base_url" text NOT NULL,
	"method" varchar(10) DEFAULT 'GET' NOT NULL,
	"headers" jsonb DEFAULT '{}'::jsonb,
	"timeout_ms" integer DEFAULT 30000 NOT NULL,
	"auth_type" varchar(50) DEFAULT 'none' NOT NULL,
	"auth_config" jsonb DEFAULT '{}'::jsonb,
	"pagination_type" varchar(50) DEFAULT 'none' NOT NULL,
	"pagination_config" jsonb,
	"pagination_max_pages" integer DEFAULT 1000,
	"pagination_stop_on_empty" boolean DEFAULT true NOT NULL,
	"request_body_template" jsonb,
	"request_dynamic_params" text[],
	"request_static_query_params" jsonb DEFAULT '{}'::jsonb,
	"response_content_handling" varchar(50) DEFAULT 'auto' NOT NULL,
	"response_extract_fields" text[],
	"response_max_db_size_bytes" integer DEFAULT 102400 NOT NULL,
	"response_storage" varchar(50) DEFAULT 'hybrid' NOT NULL,
	"schedule_enabled" boolean DEFAULT true NOT NULL,
	"schedule_cron" text,
	"schedule_interval_minutes" integer,
	"schedule_run_on_start" boolean DEFAULT false NOT NULL,
	"rate_limit_requests_per_minute" integer DEFAULT 60 NOT NULL,
	"rate_limit_max_concurrent" integer DEFAULT 1 NOT NULL,
	"rate_limit_delay_between_requests_ms" integer DEFAULT 1000 NOT NULL,
	"retry_max_attempts" integer DEFAULT 3 NOT NULL,
	"retry_backoff_multiplier" integer DEFAULT 2 NOT NULL,
	"retry_initial_delay_ms" integer DEFAULT 1000 NOT NULL,
	"retry_on_status_codes" integer[] DEFAULT '{429,500,502,503,504}',
	"dedup_enabled" boolean DEFAULT true NOT NULL,
	"dedup_key_fields" text[] DEFAULT '{"url","method","query_params"}',
	"dedup_ttl_minutes" integer DEFAULT 60 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"last_crawl_at" timestamp,
	"next_crawl_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "crawl_endpoints_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "crawl_job_history" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"job_id" varchar(26) NOT NULL,
	"endpoint_id" integer NOT NULL,
	"status" "crawl_job_status" NOT NULL,
	"duration_ms" integer,
	"attempt_count" integer NOT NULL,
	"error_type" varchar(50),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "crawl_jobs" (
	"id" varchar(26) PRIMARY KEY NOT NULL,
	"endpoint_id" integer NOT NULL,
	"url" text NOT NULL,
	"method" varchar(10) NOT NULL,
	"headers" jsonb DEFAULT '{}'::jsonb,
	"query_params" jsonb DEFAULT '{}'::jsonb,
	"body" jsonb,
	"page_number" integer,
	"pagination_cursor" text,
	"dedup_key" varchar(64),
	"dedup_ttl_expires_at" timestamp,
	"status" "crawl_job_status" DEFAULT 'pending' NOT NULL,
	"priority" "crawl_priority" DEFAULT 'normal' NOT NULL,
	"scheduled_at" timestamp,
	"started_at" timestamp,
	"completed_at" timestamp,
	"attempt_count" integer DEFAULT 0 NOT NULL,
	"last_error" text,
	"last_error_at" timestamp,
	"result_id" varchar(26),
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "crawl_results" (
	"id" varchar(26) PRIMARY KEY NOT NULL,
	"job_id" varchar(26) NOT NULL,
	"endpoint_id" integer NOT NULL,
	"status_code" integer NOT NULL,
	"response_headers" jsonb DEFAULT '{}'::jsonb,
	"response_size_bytes" integer NOT NULL,
	"content_type" varchar(255) NOT NULL,
	"content_hash" varchar(64) NOT NULL,
	"content_ref_count" integer DEFAULT 1 NOT NULL,
	"extracted_fields" jsonb,
	"storage_provider" varchar(50) DEFAULT 'database' NOT NULL,
	"storage_bucket" varchar(255),
	"storage_key" varchar(1024) NOT NULL,
	"storage_region" varchar(50),
	"raw_content" text,
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "device_sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"app_id" text NOT NULL,
	"device_model" text NOT NULL,
	"os_version" text,
	"app_version" text NOT NULL,
	"build_number" text NOT NULL,
	"platform" text,
	"manufacturer" text,
	"brand" text,
	"locale" text,
	"timezone" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "device_sessions" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "enhanced_notifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"notification_id" text NOT NULL,
	"original_notification_id" integer,
	"package_name" text NOT NULL,
	"app_name" text,
	"title" text,
	"content" text,
	"big_text" text,
	"timestamp" timestamp with time zone NOT NULL,
	"has_transaction" boolean DEFAULT false NOT NULL,
	"amount" text,
	"payer_name" text,
	"transaction_type" "transaction_type",
	"processing_time_ms" integer,
	"processing_metadata" jsonb,
	"notification_log_id" integer,
	"tts_announced" boolean DEFAULT false,
	"team_notification_sent" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "enhanced_notifications_notification_id_unique" UNIQUE("notification_id")
);
--> statement-breakpoint
ALTER TABLE "enhanced_notifications" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "experiment_cohorts" (
	"id" serial PRIMARY KEY NOT NULL,
	"experiment_id" integer NOT NULL,
	"name" varchar(100) NOT NULL,
	"weight" integer DEFAULT 50 NOT NULL,
	"config" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "experiment_cohorts" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "experiment_events" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"experiment_id" integer NOT NULL,
	"subject_id" text NOT NULL,
	"app_id" text NOT NULL,
	"cohort_id" integer NOT NULL,
	"event_type" "experiment_event_type" NOT NULL,
	"event_name" varchar(100),
	"properties" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "experiment_events" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "experiments" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"app_id" text NOT NULL,
	"feature_flag_id" integer,
	"status" "experiment_status" DEFAULT 'draft' NOT NULL,
	"traffic_allocation" integer DEFAULT 100 NOT NULL,
	"start_date" timestamp,
	"end_date" timestamp,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "experiments" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "feature_flags" (
	"id" serial PRIMARY KEY NOT NULL,
	"key" varchar(100) NOT NULL,
	"app_id" text NOT NULL,
	"description" text,
	"default_value" jsonb DEFAULT '{"enabled":false}'::jsonb NOT NULL,
	"is_enabled" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "feature_flags_key_app_unique" UNIQUE("key","app_id")
);
--> statement-breakpoint
ALTER TABLE "feature_flags" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "media_attachments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"message_id" uuid,
	"conversation_id" uuid NOT NULL,
	"app_id" text NOT NULL,
	"uploaded_by" text NOT NULL,
	"type" varchar(50) NOT NULL,
	"url" varchar(1000) NOT NULL,
	"thumbnail_url" varchar(1000),
	"file_name" varchar(255),
	"file_size" integer,
	"mime_type" varchar(100),
	"width" integer,
	"height" integer,
	"duration" integer,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "media_attachments" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "message_reactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"message_id" uuid NOT NULL,
	"app_id" text NOT NULL,
	"user_id" text NOT NULL,
	"reaction" varchar(50) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "message_reactions_unique" UNIQUE("message_id","user_id")
);
--> statement-breakpoint
ALTER TABLE "message_reactions" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "message_reads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"message_id" uuid NOT NULL,
	"app_id" text NOT NULL,
	"user_id" text NOT NULL,
	"read_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "message_reads" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"conversation_id" uuid NOT NULL,
	"app_id" text NOT NULL,
	"sender_id" text NOT NULL,
	"content" text NOT NULL,
	"type" varchar(50) DEFAULT 'text' NOT NULL,
	"reply_to_id" uuid,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"is_edited" boolean DEFAULT false NOT NULL,
	"edited_at" timestamp,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "messages" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
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
CREATE TABLE "notification_events" (
	"id" text PRIMARY KEY NOT NULL,
	"app_id" text NOT NULL,
	"event_name" text NOT NULL,
	"user_id" text NOT NULL,
	"payload" jsonb NOT NULL,
	"status" "notification_event_status" DEFAULT 'PENDING' NOT NULL,
	"retry_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"processed_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "notification_events" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "notification_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"notification_id" text NOT NULL,
	"package_name" text NOT NULL,
	"app_name" text,
	"timestamp" timestamp with time zone NOT NULL,
	"title" text,
	"text" text,
	"big_text" text,
	"has_transaction" boolean DEFAULT false NOT NULL,
	"amount" text,
	"payer_name" text,
	"transaction_type" "transaction_type",
	"processing_time_ms" integer,
	"tts_announced" boolean DEFAULT false,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "notification_logs" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "orders" (
	"id" varchar(10) PRIMARY KEY NOT NULL,
	"razorpay_order_id" text,
	"user_id" text NOT NULL,
	"app_id" text DEFAULT 'alertpay-default' NOT NULL,
	"customer_id" text NOT NULL,
	"razorpay_customer_id" text,
	"amount" integer NOT NULL,
	"currency" varchar(3) DEFAULT 'INR' NOT NULL,
	"max_amount" integer,
	"frequency" varchar(20),
	"status" "order_status" DEFAULT 'created' NOT NULL,
	"razorpay_payment_id" text,
	"token_id" text,
	"payment_metadata" jsonb,
	"notes" text,
	"expire_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "orders" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "otp_codes" (
	"id" serial PRIMARY KEY NOT NULL,
	"phone_number" text NOT NULL,
	"code_hash" text NOT NULL,
	"ip_address" text,
	"expires_at" timestamp with time zone NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"verified" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "otp_codes" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "phonepe_orders" (
	"id" varchar(10) PRIMARY KEY NOT NULL,
	"order_id" text NOT NULL,
	"phonepe_order_id" text NOT NULL,
	"user_id" text NOT NULL,
	"app_id" text DEFAULT 'alertpay-default' NOT NULL,
	"state" text,
	"amount" integer NOT NULL,
	"currency" varchar(3) DEFAULT 'INR' NOT NULL,
	"expire_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "phonepe_orders_phonepe_order_id_unique" UNIQUE("phonepe_order_id")
);
--> statement-breakpoint
ALTER TABLE "phonepe_orders" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "phonepe_redemptions" (
	"id" varchar(10) PRIMARY KEY NOT NULL,
	"merchant_order_id" text NOT NULL,
	"merchant_subscription_id" text NOT NULL,
	"phonepe_order_id" text,
	"user_id" text NOT NULL,
	"app_id" text DEFAULT 'alertpay-default' NOT NULL,
	"amount" integer NOT NULL,
	"state" "phonepe_redemption_state" NOT NULL,
	"auto_debit" boolean DEFAULT true NOT NULL,
	"transaction_id" text,
	"notified_at" timestamp,
	"valid_after" timestamp,
	"valid_upto" timestamp,
	"error_code" text,
	"detailed_error_code" text,
	"attempt_count" integer DEFAULT 1,
	"processed_at" timestamp,
	"correlation_id" varchar(50),
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "phonepe_redemptions_merchant_order_id_unique" UNIQUE("merchant_order_id")
);
--> statement-breakpoint
ALTER TABLE "phonepe_redemptions" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "phonepe_subscriptions" (
	"id" varchar(10) PRIMARY KEY NOT NULL,
	"merchant_subscription_id" text NOT NULL,
	"phonepe_subscription_id" text,
	"user_id" text NOT NULL,
	"app_id" text DEFAULT 'alertpay-default' NOT NULL,
	"amount" integer,
	"max_amount" integer,
	"amount_type" varchar(20),
	"frequency" varchar(20),
	"auth_workflow_type" varchar(20),
	"product_type" varchar(20),
	"state" "phonepe_subscription_state",
	"expire_at" timestamp,
	"activated_at" timestamp,
	"cancelled_at" timestamp,
	"next_billing_date" timestamp,
	"billing_cycle_count" integer DEFAULT 0,
	"consecutive_failures" integer DEFAULT 0,
	"last_failure_at" timestamp,
	"last_failure_reason" varchar(100),
	"grace_period_end_at" timestamp,
	"is_premium" boolean DEFAULT false,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "phonepe_subscriptions_merchant_subscription_id_unique" UNIQUE("merchant_subscription_id"),
	CONSTRAINT "phonepe_subscriptions_phonepe_subscription_id_unique" UNIQUE("phonepe_subscription_id")
);
--> statement-breakpoint
ALTER TABLE "phonepe_subscriptions" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "play_store_ratings" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"app_id" text DEFAULT 'alertpay-default' NOT NULL,
	"rating" integer NOT NULL,
	"review" text,
	"review_title" text,
	"package_name" text,
	"app_version" text,
	"device_model" text,
	"os_version" text,
	"language" text,
	"submitted_to_play_store_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "play_store_ratings" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "push_tokens" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"app_id" text NOT NULL,
	"token" text NOT NULL,
	"device_model" text,
	"os_version" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "push_tokens_token_unique" UNIQUE("token")
);
--> statement-breakpoint
ALTER TABLE "push_tokens" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "quotes" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"text" text,
	"content_type" text,
	"category_type" text,
	"slot" text,
	"url" text,
	"video_url" text,
	"preview_image_url" text,
	"sticker_url" text,
	"name_color" text,
	"name_outline_color" text,
	"variant_type" text,
	"frame" integer,
	"slot_raw" text,
	"source_category" text,
	"created_by" text,
	"quote_creator_id" text,
	"quote_creator_type" text,
	"raw_json" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "quotes" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "scheduled_messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"conversation_id" uuid NOT NULL,
	"app_id" text NOT NULL,
	"sender_id" text NOT NULL,
	"content" text NOT NULL,
	"type" varchar(50) DEFAULT 'text' NOT NULL,
	"reply_to_id" uuid,
	"send_at" timestamp NOT NULL,
	"status" varchar(50) DEFAULT 'pending' NOT NULL,
	"sent_at" timestamp,
	"error_message" text,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "scheduled_messages" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expiresAt" timestamp with time zone NOT NULL,
	"token" text NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone NOT NULL,
	"ipAddress" text,
	"userAgent" text,
	"userId" text NOT NULL,
	"appId" text,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
ALTER TABLE "session" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "subscriptions" (
	"id" varchar(10) PRIMARY KEY NOT NULL,
	"razorpay_subscription_id" text,
	"razorpay_plan_id" text NOT NULL,
	"user_id" text NOT NULL,
	"app_id" text DEFAULT 'alertpay-default' NOT NULL,
	"customer_id" text NOT NULL,
	"razorpay_customer_id" text,
	"status" "subscription_status" DEFAULT 'created' NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"total_count" integer,
	"paid_count" integer DEFAULT 0 NOT NULL,
	"remaining_count" integer,
	"start_at" timestamp,
	"end_at" timestamp,
	"charge_at" timestamp,
	"current_start" timestamp,
	"current_end" timestamp,
	"notes" jsonb,
	"razorpay_payment_id" text,
	"four_hour_event_sent" boolean DEFAULT false NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "subscriptions_razorpay_subscription_id_unique" UNIQUE("razorpay_subscription_id")
);
--> statement-breakpoint
ALTER TABLE "subscriptions" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "team_notifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"notification_log_id" integer NOT NULL,
	"transaction_key" text NOT NULL,
	"sent_at" timestamp with time zone DEFAULT now() NOT NULL,
	"recipient_count" integer DEFAULT 0 NOT NULL,
	"status" "team_notification_status" DEFAULT 'SUCCESS' NOT NULL,
	"error_message" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "team_notifications_transactionKey_unique" UNIQUE("transaction_key")
);
--> statement-breakpoint
ALTER TABLE "team_notifications" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "temp_test_notifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"payload" jsonb,
	"is_processed" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "temp_test_notifications" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "typing_indicators" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"conversation_id" uuid NOT NULL,
	"app_id" text NOT NULL,
	"user_id" text NOT NULL,
	"is_typing" boolean DEFAULT true NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "typing_indicators" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"emailVerified" boolean NOT NULL,
	"phoneNumber" text,
	"phoneNumberVerified" boolean,
	"image" text,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp with time zone,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "user" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "user_experiment_assignments" (
	"id" serial PRIMARY KEY NOT NULL,
	"subject_id" text NOT NULL,
	"subject_type" "identity_type" NOT NULL,
	"app_id" text NOT NULL,
	"experiment_id" integer NOT NULL,
	"cohort_id" integer NOT NULL,
	"assigned_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "uea_subject_experiment_unique" UNIQUE("subject_id","experiment_id")
);
--> statement-breakpoint
ALTER TABLE "user_experiment_assignments" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "user_images" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"app_id" text DEFAULT 'alertpay-default' NOT NULL,
	"image_url" text NOT NULL,
	"removed_bg_image_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user_images" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "user_metadata" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"app_id" text DEFAULT 'alertpay-default' NOT NULL,
	"upi_vpa" text,
	"audio_language" text,
	"client_data" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_metadata_userId_appId_unique" UNIQUE("userId","app_id")
);
--> statement-breakpoint
ALTER TABLE "user_metadata" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "user_notifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"app_id" text NOT NULL,
	"notification_id" text NOT NULL,
	"event_type" text NOT NULL,
	"title" text NOT NULL,
	"body" text NOT NULL,
	"data" jsonb DEFAULT '{}'::jsonb,
	"is_read" boolean DEFAULT false NOT NULL,
	"read_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_notifications_notification_id_unique" UNIQUE("notification_id")
);
--> statement-breakpoint
ALTER TABLE "user_notifications" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expiresAt" timestamp with time zone NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "verification" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "webhook_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"event_id" text NOT NULL,
	"provider" varchar(50) DEFAULT 'razorpay' NOT NULL,
	"event_type" text NOT NULL,
	"app_id" text NOT NULL,
	"processed_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "webhook_events_event_id_unique" UNIQUE("event_id")
);
--> statement-breakpoint
ALTER TABLE "webhook_events" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "webhook_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text,
	"app_id" text DEFAULT 'alertpay-default' NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" text,
	"subscription_id" text,
	"order_id" text,
	"provider" "payment_provider",
	"action" text NOT NULL,
	"status" text,
	"metadata" jsonb,
	"error_message" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "webhook_logs" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "abandoned_checkouts" ADD CONSTRAINT "abandoned_checkouts_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversation_participants" ADD CONSTRAINT "conversation_participants_conversation_id_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversation_participants" ADD CONSTRAINT "conversation_participants_app_id_apps_id_fk" FOREIGN KEY ("app_id") REFERENCES "public"."apps"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversation_participants" ADD CONSTRAINT "conversation_participants_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crawl_jobs" ADD CONSTRAINT "crawl_jobs_endpoint_id_crawl_endpoints_id_fk" FOREIGN KEY ("endpoint_id") REFERENCES "public"."crawl_endpoints"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crawl_results" ADD CONSTRAINT "crawl_results_job_id_crawl_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."crawl_jobs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crawl_results" ADD CONSTRAINT "crawl_results_endpoint_id_crawl_endpoints_id_fk" FOREIGN KEY ("endpoint_id") REFERENCES "public"."crawl_endpoints"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "device_sessions" ADD CONSTRAINT "device_sessions_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "enhanced_notifications" ADD CONSTRAINT "enhanced_notifications_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "enhanced_notifications" ADD CONSTRAINT "enhanced_notifications_notification_log_id_notification_logs_id_fk" FOREIGN KEY ("notification_log_id") REFERENCES "public"."notification_logs"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "experiment_cohorts" ADD CONSTRAINT "experiment_cohorts_experiment_id_experiments_id_fk" FOREIGN KEY ("experiment_id") REFERENCES "public"."experiments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "experiment_events" ADD CONSTRAINT "experiment_events_experiment_id_experiments_id_fk" FOREIGN KEY ("experiment_id") REFERENCES "public"."experiments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "experiment_events" ADD CONSTRAINT "experiment_events_cohort_id_experiment_cohorts_id_fk" FOREIGN KEY ("cohort_id") REFERENCES "public"."experiment_cohorts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "experiments" ADD CONSTRAINT "experiments_app_id_apps_id_fk" FOREIGN KEY ("app_id") REFERENCES "public"."apps"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "experiments" ADD CONSTRAINT "experiments_feature_flag_id_feature_flags_id_fk" FOREIGN KEY ("feature_flag_id") REFERENCES "public"."feature_flags"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feature_flags" ADD CONSTRAINT "feature_flags_app_id_apps_id_fk" FOREIGN KEY ("app_id") REFERENCES "public"."apps"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "media_attachments" ADD CONSTRAINT "media_attachments_message_id_messages_id_fk" FOREIGN KEY ("message_id") REFERENCES "public"."messages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "media_attachments" ADD CONSTRAINT "media_attachments_conversation_id_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "media_attachments" ADD CONSTRAINT "media_attachments_app_id_apps_id_fk" FOREIGN KEY ("app_id") REFERENCES "public"."apps"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "media_attachments" ADD CONSTRAINT "media_attachments_uploaded_by_user_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "message_reactions" ADD CONSTRAINT "message_reactions_message_id_messages_id_fk" FOREIGN KEY ("message_id") REFERENCES "public"."messages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "message_reactions" ADD CONSTRAINT "message_reactions_app_id_apps_id_fk" FOREIGN KEY ("app_id") REFERENCES "public"."apps"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "message_reactions" ADD CONSTRAINT "message_reactions_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "message_reads" ADD CONSTRAINT "message_reads_message_id_messages_id_fk" FOREIGN KEY ("message_id") REFERENCES "public"."messages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "message_reads" ADD CONSTRAINT "message_reads_app_id_apps_id_fk" FOREIGN KEY ("app_id") REFERENCES "public"."apps"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "message_reads" ADD CONSTRAINT "message_reads_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_conversation_id_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_app_id_apps_id_fk" FOREIGN KEY ("app_id") REFERENCES "public"."apps"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_sender_id_user_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification_events" ADD CONSTRAINT "notification_events_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification_logs" ADD CONSTRAINT "notification_logs_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "phonepe_orders" ADD CONSTRAINT "phonepe_orders_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "phonepe_redemptions" ADD CONSTRAINT "phonepe_redemptions_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "phonepe_subscriptions" ADD CONSTRAINT "phonepe_subscriptions_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "play_store_ratings" ADD CONSTRAINT "play_store_ratings_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "push_tokens" ADD CONSTRAINT "push_tokens_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scheduled_messages" ADD CONSTRAINT "scheduled_messages_conversation_id_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scheduled_messages" ADD CONSTRAINT "scheduled_messages_app_id_apps_id_fk" FOREIGN KEY ("app_id") REFERENCES "public"."apps"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scheduled_messages" ADD CONSTRAINT "scheduled_messages_sender_id_user_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scheduled_messages" ADD CONSTRAINT "scheduled_messages_reply_to_id_messages_id_fk" FOREIGN KEY ("reply_to_id") REFERENCES "public"."messages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_notifications" ADD CONSTRAINT "team_notifications_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_notifications" ADD CONSTRAINT "team_notifications_notification_log_id_notification_logs_id_fk" FOREIGN KEY ("notification_log_id") REFERENCES "public"."notification_logs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "temp_test_notifications" ADD CONSTRAINT "temp_test_notifications_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "typing_indicators" ADD CONSTRAINT "typing_indicators_conversation_id_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "typing_indicators" ADD CONSTRAINT "typing_indicators_app_id_apps_id_fk" FOREIGN KEY ("app_id") REFERENCES "public"."apps"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "typing_indicators" ADD CONSTRAINT "typing_indicators_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_experiment_assignments" ADD CONSTRAINT "user_experiment_assignments_experiment_id_experiments_id_fk" FOREIGN KEY ("experiment_id") REFERENCES "public"."experiments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_experiment_assignments" ADD CONSTRAINT "user_experiment_assignments_cohort_id_experiment_cohorts_id_fk" FOREIGN KEY ("cohort_id") REFERENCES "public"."experiment_cohorts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_images" ADD CONSTRAINT "user_images_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_metadata" ADD CONSTRAINT "user_metadata_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_notifications" ADD CONSTRAINT "user_notifications_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "webhook_logs" ADD CONSTRAINT "webhook_logs_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "abandoned_checkouts_userId_idx" ON "abandoned_checkouts" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "abandoned_checkouts_appId_idx" ON "abandoned_checkouts" USING btree ("app_id");--> statement-breakpoint
CREATE INDEX "abandoned_checkouts_user_app_idx" ON "abandoned_checkouts" USING btree ("user_id","app_id");--> statement-breakpoint
CREATE INDEX "abandoned_checkouts_time_idx" ON "abandoned_checkouts" USING btree ("checkout_started_at");--> statement-breakpoint
CREATE INDEX "abandoned_checkouts_expiry_idx" ON "abandoned_checkouts" USING btree ("offer_expires_at");--> statement-breakpoint
CREATE INDEX "abandoned_checkouts_next_notif_idx" ON "abandoned_checkouts" USING btree ("next_notification_scheduled_at");--> statement-breakpoint
CREATE INDEX "account_userId_idx" ON "account" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "apps_slug_idx" ON "apps" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "apps_is_active_idx" ON "apps" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "conversation_participants_conversation_idx" ON "conversation_participants" USING btree ("conversation_id");--> statement-breakpoint
CREATE INDEX "conversation_participants_user_idx" ON "conversation_participants" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "cp_app_conversation_idx" ON "conversation_participants" USING btree ("app_id","conversation_id");--> statement-breakpoint
CREATE INDEX "cp_app_user_idx" ON "conversation_participants" USING btree ("app_id","user_id");--> statement-breakpoint
CREATE INDEX "conversations_app_id_idx" ON "conversations" USING btree ("app_id");--> statement-breakpoint
CREATE INDEX "conversations_type_idx" ON "conversations" USING btree ("type");--> statement-breakpoint
CREATE INDEX "crawl_endpoints_name_idx" ON "crawl_endpoints" USING btree ("name");--> statement-breakpoint
CREATE INDEX "crawl_endpoints_is_active_idx" ON "crawl_endpoints" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "crawl_endpoints_tags_idx" ON "crawl_endpoints" USING btree ("tags");--> statement-breakpoint
CREATE INDEX "crawl_history_job_id_idx" ON "crawl_job_history" USING btree ("job_id");--> statement-breakpoint
CREATE INDEX "crawl_history_endpoint_id_idx" ON "crawl_job_history" USING btree ("endpoint_id");--> statement-breakpoint
CREATE INDEX "crawl_history_created_at_idx" ON "crawl_job_history" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "crawl_jobs_endpoint_id_idx" ON "crawl_jobs" USING btree ("endpoint_id");--> statement-breakpoint
CREATE INDEX "crawl_jobs_status_idx" ON "crawl_jobs" USING btree ("status");--> statement-breakpoint
CREATE INDEX "crawl_jobs_priority_idx" ON "crawl_jobs" USING btree ("priority");--> statement-breakpoint
CREATE UNIQUE INDEX "crawl_jobs_dedup_key_idx" ON "crawl_jobs" USING btree ("dedup_key","endpoint_id");--> statement-breakpoint
CREATE INDEX "crawl_jobs_scheduled_at_idx" ON "crawl_jobs" USING btree ("scheduled_at");--> statement-breakpoint
CREATE INDEX "crawl_jobs_status_priority_created_idx" ON "crawl_jobs" USING btree ("status","priority","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "crawl_results_job_id_idx" ON "crawl_results" USING btree ("job_id");--> statement-breakpoint
CREATE INDEX "crawl_results_content_hash_idx" ON "crawl_results" USING btree ("content_hash");--> statement-breakpoint
CREATE INDEX "crawl_results_endpoint_id_idx" ON "crawl_results" USING btree ("endpoint_id");--> statement-breakpoint
CREATE INDEX "crawl_results_expires_at_idx" ON "crawl_results" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "device_sessions_user_id_idx" ON "device_sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "device_sessions_app_id_idx" ON "device_sessions" USING btree ("app_id");--> statement-breakpoint
CREATE INDEX "device_sessions_created_at_idx" ON "device_sessions" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "enhanced_notifications_userId_idx" ON "enhanced_notifications" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "enhanced_notifications_notificationId_idx" ON "enhanced_notifications" USING btree ("notification_id");--> statement-breakpoint
CREATE INDEX "enhanced_notifications_timestamp_idx" ON "enhanced_notifications" USING btree ("timestamp");--> statement-breakpoint
CREATE INDEX "enhanced_notifications_transactionType_idx" ON "enhanced_notifications" USING btree ("transaction_type");--> statement-breakpoint
CREATE INDEX "enhanced_notifications_logId_idx" ON "enhanced_notifications" USING btree ("notification_log_id");--> statement-breakpoint
CREATE INDEX "experiment_cohorts_experiment_idx" ON "experiment_cohorts" USING btree ("experiment_id");--> statement-breakpoint
CREATE INDEX "exp_events_experiment_idx" ON "experiment_events" USING btree ("experiment_id");--> statement-breakpoint
CREATE INDEX "exp_events_subject_idx" ON "experiment_events" USING btree ("subject_id");--> statement-breakpoint
CREATE INDEX "exp_events_created_idx" ON "experiment_events" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "exp_events_experiment_type_idx" ON "experiment_events" USING btree ("experiment_id","event_type");--> statement-breakpoint
CREATE INDEX "experiments_app_idx" ON "experiments" USING btree ("app_id");--> statement-breakpoint
CREATE INDEX "experiments_status_idx" ON "experiments" USING btree ("status");--> statement-breakpoint
CREATE INDEX "experiments_app_status_idx" ON "experiments" USING btree ("app_id","status");--> statement-breakpoint
CREATE INDEX "feature_flags_app_idx" ON "feature_flags" USING btree ("app_id");--> statement-breakpoint
CREATE INDEX "media_attachments_message_idx" ON "media_attachments" USING btree ("message_id");--> statement-breakpoint
CREATE INDEX "media_attachments_conversation_idx" ON "media_attachments" USING btree ("conversation_id");--> statement-breakpoint
CREATE INDEX "media_attachments_app_conversation_idx" ON "media_attachments" USING btree ("app_id","conversation_id");--> statement-breakpoint
CREATE INDEX "message_reactions_message_idx" ON "message_reactions" USING btree ("message_id");--> statement-breakpoint
CREATE INDEX "message_reactions_user_idx" ON "message_reactions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "reactions_app_message_idx" ON "message_reactions" USING btree ("app_id","message_id");--> statement-breakpoint
CREATE INDEX "message_reads_message_idx" ON "message_reads" USING btree ("message_id");--> statement-breakpoint
CREATE INDEX "message_reads_user_idx" ON "message_reads" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "message_reads_app_message_idx" ON "message_reads" USING btree ("app_id","message_id");--> statement-breakpoint
CREATE INDEX "message_reads_app_user_idx" ON "message_reads" USING btree ("app_id","user_id");--> statement-breakpoint
CREATE INDEX "messages_conversation_idx" ON "messages" USING btree ("conversation_id");--> statement-breakpoint
CREATE INDEX "messages_sender_idx" ON "messages" USING btree ("sender_id");--> statement-breakpoint
CREATE INDEX "messages_created_at_idx" ON "messages" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "messages_conversation_created_at_idx" ON "messages" USING btree ("conversation_id","created_at");--> statement-breakpoint
CREATE INDEX "messages_app_conversation_idx" ON "messages" USING btree ("app_id","conversation_id");--> statement-breakpoint
CREATE INDEX "messages_app_sender_idx" ON "messages" USING btree ("app_id","sender_id");--> statement-breakpoint
CREATE INDEX "notification_events_userId_idx" ON "notification_events" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "notification_events_appId_idx" ON "notification_events" USING btree ("app_id");--> statement-breakpoint
CREATE INDEX "notification_events_status_idx" ON "notification_events" USING btree ("status");--> statement-breakpoint
CREATE INDEX "notification_events_createdAt_idx" ON "notification_events" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "notification_logs_userId_idx" ON "notification_logs" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "notification_logs_notificationId_idx" ON "notification_logs" USING btree ("notification_id");--> statement-breakpoint
CREATE INDEX "notification_logs_timestamp_idx" ON "notification_logs" USING btree ("timestamp");--> statement-breakpoint
CREATE INDEX "notification_logs_transactionType_idx" ON "notification_logs" USING btree ("transaction_type");--> statement-breakpoint
CREATE INDEX "orders_userId_idx" ON "orders" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "orders_appId_idx" ON "orders" USING btree ("app_id");--> statement-breakpoint
CREATE INDEX "orders_userId_appId_idx" ON "orders" USING btree ("user_id","app_id");--> statement-breakpoint
CREATE INDEX "otp_codes_phone_created_idx" ON "otp_codes" USING btree ("phone_number","created_at");--> statement-breakpoint
CREATE INDEX "otp_codes_ip_created_idx" ON "otp_codes" USING btree ("ip_address","created_at");--> statement-breakpoint
CREATE INDEX "phonepe_orders_order_id_idx" ON "phonepe_orders" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "phonepe_orders_phonepe_order_id_idx" ON "phonepe_orders" USING btree ("phonepe_order_id");--> statement-breakpoint
CREATE INDEX "phonepe_redemptions_order_id_idx" ON "phonepe_redemptions" USING btree ("merchant_order_id");--> statement-breakpoint
CREATE INDEX "phonepe_redemptions_subscription_id_idx" ON "phonepe_redemptions" USING btree ("merchant_subscription_id");--> statement-breakpoint
CREATE INDEX "phonepe_redemptions_userId_idx" ON "phonepe_redemptions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "phonepe_subscriptions_userId_idx" ON "phonepe_subscriptions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "phonepe_subscriptions_phonepe_id_idx" ON "phonepe_subscriptions" USING btree ("phonepe_subscription_id");--> statement-breakpoint
CREATE INDEX "phonepe_subscriptions_merchant_id_idx" ON "phonepe_subscriptions" USING btree ("merchant_subscription_id");--> statement-breakpoint
CREATE INDEX "phonepe_subscriptions_next_billing_date_idx" ON "phonepe_subscriptions" USING btree ("next_billing_date");--> statement-breakpoint
CREATE INDEX "phonepe_subscriptions_retry_idx" ON "phonepe_subscriptions" USING btree ("next_billing_date","state","is_premium");--> statement-breakpoint
CREATE INDEX "phonepe_subscriptions_premium_idx" ON "phonepe_subscriptions" USING btree ("user_id","is_premium");--> statement-breakpoint
CREATE INDEX "play_store_ratings_userId_idx" ON "play_store_ratings" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "play_store_ratings_appId_idx" ON "play_store_ratings" USING btree ("app_id");--> statement-breakpoint
CREATE INDEX "play_store_ratings_userId_appId_idx" ON "play_store_ratings" USING btree ("user_id","app_id");--> statement-breakpoint
CREATE INDEX "play_store_ratings_submittedAt_idx" ON "play_store_ratings" USING btree ("submitted_to_play_store_at");--> statement-breakpoint
CREATE INDEX "push_tokens_userId_idx" ON "push_tokens" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "push_tokens_appId_idx" ON "push_tokens" USING btree ("app_id");--> statement-breakpoint
CREATE INDEX "idx_quotes_created_at" ON "quotes" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "scheduled_messages_conversation_idx" ON "scheduled_messages" USING btree ("conversation_id");--> statement-breakpoint
CREATE INDEX "scheduled_messages_status_idx" ON "scheduled_messages" USING btree ("status");--> statement-breakpoint
CREATE INDEX "scheduled_messages_send_at_idx" ON "scheduled_messages" USING btree ("send_at");--> statement-breakpoint
CREATE INDEX "scheduled_messages_app_conversation_idx" ON "scheduled_messages" USING btree ("app_id","conversation_id");--> statement-breakpoint
CREATE INDEX "scheduled_messages_app_sender_idx" ON "scheduled_messages" USING btree ("app_id","sender_id");--> statement-breakpoint
CREATE INDEX "session_userId_idx" ON "session" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "session_appId_idx" ON "session" USING btree ("appId");--> statement-breakpoint
CREATE INDEX "subscriptions_userId_idx" ON "subscriptions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "subscriptions_appId_idx" ON "subscriptions" USING btree ("app_id");--> statement-breakpoint
CREATE INDEX "subscriptions_userId_appId_idx" ON "subscriptions" USING btree ("user_id","app_id");--> statement-breakpoint
CREATE INDEX "subscriptions_razorpay_id_idx" ON "subscriptions" USING btree ("razorpay_subscription_id");--> statement-breakpoint
CREATE INDEX "subscriptions_customer_date_idx" ON "subscriptions" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "team_notifications_userId_idx" ON "team_notifications" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "team_notifications_logId_idx" ON "team_notifications" USING btree ("notification_log_id");--> statement-breakpoint
CREATE INDEX "team_notifications_transactionKey_idx" ON "team_notifications" USING btree ("transaction_key");--> statement-breakpoint
CREATE INDEX "temp_test_notifications_userId_idx" ON "temp_test_notifications" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "temp_test_notifications_isProcessed_idx" ON "temp_test_notifications" USING btree ("is_processed");--> statement-breakpoint
CREATE INDEX "typing_indicators_conversation_idx" ON "typing_indicators" USING btree ("conversation_id");--> statement-breakpoint
CREATE INDEX "typing_app_conversation_idx" ON "typing_indicators" USING btree ("app_id","conversation_id");--> statement-breakpoint
CREATE INDEX "uea_subject_idx" ON "user_experiment_assignments" USING btree ("subject_id");--> statement-breakpoint
CREATE INDEX "uea_subject_app_idx" ON "user_experiment_assignments" USING btree ("subject_id","app_id");--> statement-breakpoint
CREATE INDEX "uea_experiment_idx" ON "user_experiment_assignments" USING btree ("experiment_id");--> statement-breakpoint
CREATE INDEX "user_images_userId_idx" ON "user_images" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_images_userId_appId_idx" ON "user_images" USING btree ("user_id","app_id");--> statement-breakpoint
CREATE INDEX "user_metadata_userId_idx" ON "user_metadata" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "user_metadata_appId_idx" ON "user_metadata" USING btree ("app_id");--> statement-breakpoint
CREATE INDEX "user_metadata_userId_appId_idx" ON "user_metadata" USING btree ("userId","app_id");--> statement-breakpoint
CREATE INDEX "user_notifications_userId_idx" ON "user_notifications" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_notifications_appId_idx" ON "user_notifications" USING btree ("app_id");--> statement-breakpoint
CREATE INDEX "user_notifications_eventType_idx" ON "user_notifications" USING btree ("event_type");--> statement-breakpoint
CREATE INDEX "user_notifications_isRead_idx" ON "user_notifications" USING btree ("is_read");--> statement-breakpoint
CREATE INDEX "user_notifications_createdAt_idx" ON "user_notifications" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "verification_identifier_idx" ON "verification" USING btree ("identifier");--> statement-breakpoint
CREATE INDEX "webhook_events_provider_idx" ON "webhook_events" USING btree ("provider");--> statement-breakpoint
CREATE INDEX "webhook_events_app_id_idx" ON "webhook_events" USING btree ("app_id");--> statement-breakpoint
CREATE INDEX "webhook_events_processed_at_idx" ON "webhook_events" USING btree ("processed_at");--> statement-breakpoint
CREATE INDEX "webhook_logs_userId_idx" ON "webhook_logs" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "webhook_logs_appId_idx" ON "webhook_logs" USING btree ("app_id");--> statement-breakpoint
CREATE INDEX "webhook_logs_entity_type_idx" ON "webhook_logs" USING btree ("entity_type");--> statement-breakpoint
CREATE INDEX "webhook_logs_entity_id_idx" ON "webhook_logs" USING btree ("entity_id");--> statement-breakpoint
CREATE INDEX "webhook_logs_sub_id_idx" ON "webhook_logs" USING btree ("subscription_id");--> statement-breakpoint
CREATE INDEX "webhook_logs_order_id_idx" ON "webhook_logs" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "webhook_logs_action_idx" ON "webhook_logs" USING btree ("action");