CREATE TABLE "orders" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_id" varchar(10) NOT NULL,
	"razorpay_order_id" text,
	"customer_id" text NOT NULL,
	"razorpay_customer_id" text,
	"amount" integer NOT NULL,
	"currency" varchar(3) DEFAULT 'INR' NOT NULL,
	"max_amount" integer,
	"frequency" varchar(20),
	"status" varchar(20) DEFAULT 'created' NOT NULL,
	"token_id" text,
	"receipt" text,
	"notes" text,
	"expire_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "orders_order_id_unique" UNIQUE("order_id")
);
