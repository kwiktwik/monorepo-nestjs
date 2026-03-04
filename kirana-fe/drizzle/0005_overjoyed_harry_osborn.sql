ALTER TABLE "jwks" RENAME COLUMN "key" TO "publicKey";--> statement-breakpoint
ALTER TABLE "jwks" RENAME COLUMN "updatedAt" TO "privateKey";--> statement-breakpoint
ALTER TABLE "jwks" ADD COLUMN "expiresAt" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "phoneNumber" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "phoneNumberVerified" boolean;