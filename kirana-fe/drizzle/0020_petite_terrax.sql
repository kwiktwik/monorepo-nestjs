CREATE TYPE "public"."team_notification_status" AS ENUM('SUCCESS', 'FAILED');--> statement-breakpoint
CREATE TYPE "public"."transaction_type" AS ENUM('RECEIVED', 'SENT', 'UNKNOWN');--> statement-breakpoint
CREATE TABLE "enhanced_notifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"notification_id" text NOT NULL,
	"original_notification_id" integer,
	"package_name" text NOT NULL,
	"app_name" text NOT NULL,
	"title" text NOT NULL,
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
	"tts_announced" boolean DEFAULT false NOT NULL,
	"team_notification_sent" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "enhanced_notifications_notification_id_unique" UNIQUE("notification_id")
);
--> statement-breakpoint
CREATE TABLE "notification_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"notification_id" text NOT NULL,
	"package_name" text NOT NULL,
	"app_name" text NOT NULL,
	"timestamp" timestamp with time zone NOT NULL,
	"title" text NOT NULL,
	"text" text,
	"big_text" text,
	"has_transaction" boolean DEFAULT false NOT NULL,
	"amount" text,
	"payer_name" text,
	"transaction_type" "transaction_type",
	"processing_time_ms" integer,
	"tts_announced" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
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
ALTER TABLE "enhanced_notifications" ADD CONSTRAINT "enhanced_notifications_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "enhanced_notifications" ADD CONSTRAINT "enhanced_notifications_original_notification_id_notifications_id_fk" FOREIGN KEY ("original_notification_id") REFERENCES "public"."notifications"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification_logs" ADD CONSTRAINT "notification_logs_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_notifications" ADD CONSTRAINT "team_notifications_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_notifications" ADD CONSTRAINT "team_notifications_notification_log_id_notification_logs_id_fk" FOREIGN KEY ("notification_log_id") REFERENCES "public"."notification_logs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "enhanced_notifications_userId_idx" ON "enhanced_notifications" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "enhanced_notifications_notificationId_idx" ON "enhanced_notifications" USING btree ("notification_id");--> statement-breakpoint
CREATE INDEX "enhanced_notifications_timestamp_idx" ON "enhanced_notifications" USING btree ("timestamp");--> statement-breakpoint
CREATE INDEX "enhanced_notifications_transactionType_idx" ON "enhanced_notifications" USING btree ("transaction_type");--> statement-breakpoint
CREATE INDEX "enhanced_notifications_logId_idx" ON "enhanced_notifications" USING btree ("notification_log_id");--> statement-breakpoint
CREATE INDEX "notification_logs_userId_idx" ON "notification_logs" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "notification_logs_notificationId_idx" ON "notification_logs" USING btree ("notification_id");--> statement-breakpoint
CREATE INDEX "notification_logs_timestamp_idx" ON "notification_logs" USING btree ("timestamp");--> statement-breakpoint
CREATE INDEX "notification_logs_transactionType_idx" ON "notification_logs" USING btree ("transaction_type");--> statement-breakpoint
CREATE INDEX "team_notifications_userId_idx" ON "team_notifications" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "team_notifications_logId_idx" ON "team_notifications" USING btree ("notification_log_id");--> statement-breakpoint
CREATE INDEX "team_notifications_transactionKey_idx" ON "team_notifications" USING btree ("transaction_key");