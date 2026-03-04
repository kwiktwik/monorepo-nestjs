CREATE TABLE "notifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"can_reply" boolean DEFAULT false NOT NULL,
	"package_name" text NOT NULL,
	"title" text NOT NULL,
	"content" text,
	"has_removed" boolean DEFAULT false NOT NULL,
	"have_extra_picture" boolean DEFAULT false NOT NULL,
	"on_going" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
