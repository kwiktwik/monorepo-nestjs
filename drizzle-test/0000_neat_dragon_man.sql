CREATE TYPE "public"."notification_event_status" AS ENUM('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');--> statement-breakpoint
CREATE TYPE "public"."order_status" AS ENUM('created', 'authorized', 'captured', 'failed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."payment_provider" AS ENUM('razorpay', 'phonepe');--> statement-breakpoint
CREATE TYPE "public"."phonepe_subscription_state" AS ENUM('CREATED', 'AUTHENTICATED', 'ACTIVE', 'PAUSED', 'CANCELLED', 'COMPLETED', 'FAILED');--> statement-breakpoint
CREATE TYPE "public"."subscription_status" AS ENUM('created', 'authenticated', 'active', 'pending', 'halted', 'cancelled', 'completed', 'expired');--> statement-breakpoint
CREATE TYPE "public"."transaction_type" AS ENUM('RECEIVED', 'SENT', 'UNKNOWN');--> statement-breakpoint
CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"accountId" text NOT NULL,
	"providerId" text NOT NULL,
	"userId" text NOT NULL,
	"accessToken" text,
	"refreshToken" text,
	"idToken" text,
	"accessTokenExpiresAt" timestamp with time zone,
	"refreshTokenExpiresAt" timestamp with time zone,
	"scope" text,
	"password" text,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone NOT NULL
);
--> statement-breakpoint
ALTER TABLE "account" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "device_sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"app_id" text NOT NULL,
	"device_model" text,
	"os_version" text,
	"app_version" text,
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
CREATE TABLE "phonepe_subscriptions" (
	"id" varchar(10) PRIMARY KEY NOT NULL,
	"merchant_subscription_id" text NOT NULL,
	"phonepe_subscription_id" text,
	"user_id" text NOT NULL,
	"app_id" text DEFAULT 'alertpay-default' NOT NULL,
	"amount" integer,
	"amount_type" varchar(20),
	"frequency" varchar(20),
	"state" "phonepe_subscription_state",
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
CREATE TABLE "subscription_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text,
	"app_id" text DEFAULT 'alertpay-default' NOT NULL,
	"subscription_id" text,
	"provider" "payment_provider",
	"action" text NOT NULL,
	"status" text,
	"metadata" jsonb,
	"error_message" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "subscription_logs" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
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
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"emailVerified" boolean NOT NULL,
	"phoneNumber" text,
	"phoneNumberVerified" boolean,
	"image" text,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "user" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
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
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_metadata_userId_appId_unique" UNIQUE("userId","app_id")
);
--> statement-breakpoint
ALTER TABLE "user_metadata" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
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
ALTER TABLE "account" ADD CONSTRAINT "account_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "device_sessions" ADD CONSTRAINT "device_sessions_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "enhanced_notifications" ADD CONSTRAINT "enhanced_notifications_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "enhanced_notifications" ADD CONSTRAINT "enhanced_notifications_notification_log_id_notification_logs_id_fk" FOREIGN KEY ("notification_log_id") REFERENCES "public"."notification_logs"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification_events" ADD CONSTRAINT "notification_events_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification_logs" ADD CONSTRAINT "notification_logs_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "phonepe_orders" ADD CONSTRAINT "phonepe_orders_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "phonepe_subscriptions" ADD CONSTRAINT "phonepe_subscriptions_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "play_store_ratings" ADD CONSTRAINT "play_store_ratings_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "push_tokens" ADD CONSTRAINT "push_tokens_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscription_logs" ADD CONSTRAINT "subscription_logs_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "temp_test_notifications" ADD CONSTRAINT "temp_test_notifications_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_images" ADD CONSTRAINT "user_images_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_metadata" ADD CONSTRAINT "user_metadata_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "account_userId_idx" ON "account" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "device_sessions_user_id_idx" ON "device_sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "device_sessions_app_id_idx" ON "device_sessions" USING btree ("app_id");--> statement-breakpoint
CREATE INDEX "device_sessions_created_at_idx" ON "device_sessions" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "enhanced_notifications_userId_idx" ON "enhanced_notifications" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "enhanced_notifications_notificationId_idx" ON "enhanced_notifications" USING btree ("notification_id");--> statement-breakpoint
CREATE INDEX "enhanced_notifications_timestamp_idx" ON "enhanced_notifications" USING btree ("timestamp");--> statement-breakpoint
CREATE INDEX "enhanced_notifications_transactionType_idx" ON "enhanced_notifications" USING btree ("transaction_type");--> statement-breakpoint
CREATE INDEX "enhanced_notifications_logId_idx" ON "enhanced_notifications" USING btree ("notification_log_id");--> statement-breakpoint
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
CREATE INDEX "phonepe_subscriptions_userId_idx" ON "phonepe_subscriptions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "phonepe_subscriptions_phonepe_id_idx" ON "phonepe_subscriptions" USING btree ("phonepe_subscription_id");--> statement-breakpoint
CREATE INDEX "phonepe_subscriptions_merchant_id_idx" ON "phonepe_subscriptions" USING btree ("merchant_subscription_id");--> statement-breakpoint
CREATE INDEX "play_store_ratings_userId_idx" ON "play_store_ratings" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "play_store_ratings_appId_idx" ON "play_store_ratings" USING btree ("app_id");--> statement-breakpoint
CREATE INDEX "play_store_ratings_userId_appId_idx" ON "play_store_ratings" USING btree ("user_id","app_id");--> statement-breakpoint
CREATE INDEX "play_store_ratings_submittedAt_idx" ON "play_store_ratings" USING btree ("submitted_to_play_store_at");--> statement-breakpoint
CREATE INDEX "push_tokens_userId_idx" ON "push_tokens" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "push_tokens_appId_idx" ON "push_tokens" USING btree ("app_id");--> statement-breakpoint
CREATE INDEX "idx_quotes_created_at" ON "quotes" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "session_userId_idx" ON "session" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "session_appId_idx" ON "session" USING btree ("appId");--> statement-breakpoint
CREATE INDEX "subscription_logs_userId_idx" ON "subscription_logs" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "subscription_logs_appId_idx" ON "subscription_logs" USING btree ("app_id");--> statement-breakpoint
CREATE INDEX "subscription_logs_sub_id_idx" ON "subscription_logs" USING btree ("subscription_id");--> statement-breakpoint
CREATE INDEX "subscription_logs_action_idx" ON "subscription_logs" USING btree ("action");--> statement-breakpoint
CREATE INDEX "subscriptions_userId_idx" ON "subscriptions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "subscriptions_appId_idx" ON "subscriptions" USING btree ("app_id");--> statement-breakpoint
CREATE INDEX "subscriptions_userId_appId_idx" ON "subscriptions" USING btree ("user_id","app_id");--> statement-breakpoint
CREATE INDEX "subscriptions_razorpay_id_idx" ON "subscriptions" USING btree ("razorpay_subscription_id");--> statement-breakpoint
CREATE INDEX "subscriptions_customer_date_idx" ON "subscriptions" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "temp_test_notifications_userId_idx" ON "temp_test_notifications" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "temp_test_notifications_isProcessed_idx" ON "temp_test_notifications" USING btree ("is_processed");--> statement-breakpoint
CREATE INDEX "user_images_userId_idx" ON "user_images" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_images_userId_appId_idx" ON "user_images" USING btree ("user_id","app_id");--> statement-breakpoint
CREATE INDEX "user_metadata_userId_idx" ON "user_metadata" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "user_metadata_appId_idx" ON "user_metadata" USING btree ("app_id");--> statement-breakpoint
CREATE INDEX "user_metadata_userId_appId_idx" ON "user_metadata" USING btree ("userId","app_id");--> statement-breakpoint
CREATE INDEX "verification_identifier_idx" ON "verification" USING btree ("identifier");