ALTER TYPE "public"."order_status" ADD VALUE 'refunded';--> statement-breakpoint
ALTER TABLE "user_metadata" ADD COLUMN "has_cancelled_subscription" boolean DEFAULT false NOT NULL;