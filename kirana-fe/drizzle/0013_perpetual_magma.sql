CREATE TABLE "user_images" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"app_id" text DEFAULT 'alertpay-default' NOT NULL,
	"image_url" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user_metadata" DROP CONSTRAINT IF EXISTS "user_metadata_userId_unique";--> statement-breakpoint
DROP INDEX IF EXISTS "account_userId_idx";--> statement-breakpoint
DROP INDEX IF EXISTS "session_userId_idx";--> statement-breakpoint
DROP INDEX IF EXISTS "session_appId_idx";--> statement-breakpoint
DROP INDEX IF EXISTS "verification_identifier_idx";--> statement-breakpoint
ALTER TABLE "user_images" ADD CONSTRAINT "user_images_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "user_metadata_userId_appId_idx" ON "user_metadata" USING btree ("userId","app_id");--> statement-breakpoint
ALTER TABLE "user_metadata" ADD CONSTRAINT "user_metadata_userId_appId_unique" UNIQUE("userId","app_id");