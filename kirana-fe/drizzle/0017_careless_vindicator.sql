CREATE TABLE "play_store_ratings" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"app_id" text DEFAULT 'alertpay-default' NOT NULL,
	"rating" integer NOT NULL,
	"review" text,
	"package_name" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "play_store_ratings" ADD CONSTRAINT "play_store_ratings_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "play_store_ratings_userId_idx" ON "play_store_ratings" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "play_store_ratings_appId_idx" ON "play_store_ratings" USING btree ("app_id");--> statement-breakpoint
CREATE INDEX "play_store_ratings_userId_appId_idx" ON "play_store_ratings" USING btree ("user_id","app_id");