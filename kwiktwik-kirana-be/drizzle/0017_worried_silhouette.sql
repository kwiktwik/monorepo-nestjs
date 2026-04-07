CREATE TYPE "public"."crawl_job_status" AS ENUM('pending', 'queued', 'running', 'completed', 'failed', 'cancelled', 'deduplicated');--> statement-breakpoint
CREATE TYPE "public"."crawl_priority" AS ENUM('critical', 'high', 'normal', 'low');--> statement-breakpoint
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
ALTER TABLE "crawl_jobs" ADD CONSTRAINT "crawl_jobs_endpoint_id_crawl_endpoints_id_fk" FOREIGN KEY ("endpoint_id") REFERENCES "public"."crawl_endpoints"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crawl_results" ADD CONSTRAINT "crawl_results_job_id_crawl_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."crawl_jobs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crawl_results" ADD CONSTRAINT "crawl_results_endpoint_id_crawl_endpoints_id_fk" FOREIGN KEY ("endpoint_id") REFERENCES "public"."crawl_endpoints"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
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
CREATE INDEX "crawl_results_expires_at_idx" ON "crawl_results" USING btree ("expires_at");