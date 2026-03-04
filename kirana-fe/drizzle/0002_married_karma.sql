ALTER TABLE "orders" DROP CONSTRAINT "orders_order_id_unique";--> statement-breakpoint
ALTER TABLE "orders" ALTER COLUMN "id" SET DATA TYPE varchar(10);--> statement-breakpoint
ALTER TABLE "orders" DROP COLUMN "order_id";--> statement-breakpoint
ALTER TABLE "orders" DROP COLUMN "receipt";