CREATE TABLE "jwks" (
	"id" text PRIMARY KEY NOT NULL,
	"key" text NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
