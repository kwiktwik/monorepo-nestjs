CREATE TABLE "user_metadata" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"upi_vpa" text,
	"audio_language" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_metadata_userId_unique" UNIQUE("userId")
);
--> statement-breakpoint
ALTER TABLE "user_metadata" ADD CONSTRAINT "user_metadata_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "user_metadata_userId_idx" ON "user_metadata" USING btree ("userId");