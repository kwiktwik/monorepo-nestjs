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
CREATE INDEX "idx_crafto_quotes_created_at" ON "crafto_quotes" USING btree ("created_at");