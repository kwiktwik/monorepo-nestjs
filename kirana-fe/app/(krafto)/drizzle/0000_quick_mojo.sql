-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TABLE "waitlist" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"phone" text NOT NULL,
	"looking_for" text NOT NULL,
	"bio_data_file_url" text,
	"bio_data_file_name" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "waitlist" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "crafto_quotes" (
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
ALTER TABLE "crafto_quotes" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "sharechat_posts" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"post_id" text NOT NULL,
	"post_url" text,
	"author_name" text,
	"author_id" text,
	"text" text,
	"likes" integer,
	"views" integer,
	"comments" integer,
	"media_type" text,
	"media_urls" json,
	"r2_media_keys" json,
	"hashtags" json,
	"timestamp" timestamp,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
ALTER TABLE "sharechat_posts" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "biodata_standardized" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"raw_biodata_id" bigint,
	"name" text NOT NULL,
	"email" text,
	"age" integer,
	"date_of_birth" date,
	"birth_time" time,
	"height" text,
	"weight" text,
	"mobile_number" text,
	"profession" text,
	"education" text,
	"current_location" text,
	"native_place" text,
	"address" text,
	"birth_village" text,
	"birth_district" text,
	"birth_state" text,
	"birth_pincode" text,
	"complexion" text,
	"body_type" text,
	"blood_group" text,
	"hobbies" text,
	"interests" text,
	"languages" text,
	"father_name" text,
	"mother_name" text,
	"siblings" text,
	"is_verified" boolean DEFAULT false NOT NULL,
	"verified_at" timestamp,
	"verified_by" text,
	"notes" text,
	"source_file" text,
	"telegram_message_id" bigint,
	"telegram_chat_id" bigint,
	"telegram_group_label" text,
	"r2_media_key" text,
	"r2_parsed_key" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "biodata_standardized" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "biodata" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text,
	"age" integer,
	"date_of_birth" text,
	"height" text,
	"mobile_number" text,
	"profession" text,
	"education" text,
	"address" text,
	"birth_place" text,
	"birth_time" text,
	"complexion" text,
	"body_type" text,
	"hobbies" text,
	"blood_group" text,
	"source_file" text,
	"telegram_message_id" bigint,
	"telegram_chat_id" bigint,
	"telegram_group_label" text,
	"r2_media_key" text,
	"r2_parsed_key" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
ALTER TABLE "biodata" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE INDEX "idx_waitlist_created_at" ON "waitlist" USING btree ("created_at" timestamp_ops);--> statement-breakpoint
CREATE INDEX "idx_waitlist_looking_for" ON "waitlist" USING btree ("looking_for" text_ops);--> statement-breakpoint
CREATE INDEX "idx_waitlist_phone" ON "waitlist" USING btree ("phone" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "ix_waitlist_phone" ON "waitlist" USING btree ("phone" text_ops);--> statement-breakpoint
CREATE INDEX "idx_crafto_created_at" ON "crafto_quotes" USING btree ("created_at" timestamp_ops);--> statement-breakpoint
CREATE INDEX "idx_sharechat_author_timestamp" ON "sharechat_posts" USING btree ("author_id" text_ops,"timestamp" timestamp_ops);--> statement-breakpoint
CREATE INDEX "ix_sharechat_posts_author_id" ON "sharechat_posts" USING btree ("author_id" text_ops);--> statement-breakpoint
CREATE INDEX "ix_sharechat_posts_created_at" ON "sharechat_posts" USING btree ("created_at" timestamp_ops);--> statement-breakpoint
CREATE INDEX "ix_sharechat_posts_id" ON "sharechat_posts" USING btree ("id" int8_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "ix_sharechat_posts_post_id" ON "sharechat_posts" USING btree ("post_id" text_ops);--> statement-breakpoint
CREATE INDEX "ix_sharechat_posts_timestamp" ON "sharechat_posts" USING btree ("timestamp" timestamp_ops);--> statement-breakpoint
CREATE INDEX "idx_biodata_standardized_email" ON "biodata_standardized" USING btree ("email" text_ops);--> statement-breakpoint
CREATE INDEX "idx_biodata_standardized_name" ON "biodata_standardized" USING btree ("name" text_ops);--> statement-breakpoint
CREATE INDEX "idx_biodata_standardized_raw_id" ON "biodata_standardized" USING btree ("raw_biodata_id" int8_ops);--> statement-breakpoint
CREATE INDEX "idx_biodata_standardized_verified" ON "biodata_standardized" USING btree ("is_verified" bool_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "ix_biodata_standardized_email" ON "biodata_standardized" USING btree ("email" text_ops);--> statement-breakpoint
CREATE INDEX "idx_biodata_email" ON "biodata" USING btree ("email" text_ops);--> statement-breakpoint
CREATE INDEX "idx_biodata_telegram_message_id" ON "biodata" USING btree ("telegram_message_id" int8_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "ix_biodata_email" ON "biodata" USING btree ("email" text_ops);--> statement-breakpoint
CREATE INDEX "ix_biodata_id" ON "biodata" USING btree ("id" int8_ops);--> statement-breakpoint
CREATE INDEX "ix_biodata_name" ON "biodata" USING btree ("name" text_ops);--> statement-breakpoint
CREATE INDEX "ix_biodata_telegram_chat_id" ON "biodata" USING btree ("telegram_chat_id" int8_ops);--> statement-breakpoint
CREATE INDEX "ix_biodata_telegram_message_id" ON "biodata" USING btree ("telegram_message_id" int8_ops);
*/