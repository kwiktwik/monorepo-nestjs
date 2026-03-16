ALTER TABLE "device_sessions" ALTER COLUMN "device_model" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "device_sessions" ALTER COLUMN "app_version" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "device_sessions" ADD COLUMN "build_number" text NOT NULL;