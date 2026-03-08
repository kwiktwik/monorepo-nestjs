# Data Migration Guide - Payment Alert App

## Overview

This migration creates the `apps` table and migrates existing data from 'alertpay-default' to 'com.paymentalert.app'.

## Migration File

`drizzle/0002_data_migration_to_paymentalert.sql`

## What This Migration Does

1. Creates `apps` table
2. Seeds `com.paymentalert.app` app
3. Migrates data in these 7 tables:
   - `user_metadata`
   - `orders`
   - `phonepe_orders`
   - `phonepe_subscriptions`
   - `play_store_ratings`
   - `subscription_logs`
   - `abandoned_checkouts`

## Pre-Migration Checklist

- [ ] Backup your database
- [ ] Ensure no active transactions during migration

## Running the Migration

### Option 1: Using drizzle-kit (Recommended)

```bash
npm run db:migrate
```

### Option 2: Manual SQL Execution

```bash
psql -h <host> -U <user> -d <database> -f drizzle/0002_data_migration_to_paymentalert.sql
```

### Option 3: Using Supabase Dashboard

1. Go to Supabase Dashboard > SQL Editor
2. Copy contents of migration file
3. Run the SQL

## Post-Migration Verification

### 1. Verify apps table

```sql
SELECT * FROM apps WHERE id = 'com.paymentalert.app';
-- Should return 1 row
```

### 2. Verify data migration (check all 7 tables)

```sql
-- Example: Check orders
SELECT COUNT(*) FROM orders WHERE app_id = 'com.paymentalert.app';
SELECT COUNT(*) FROM orders WHERE app_id = 'alertpay-default'; -- Should be 0

-- Check other tables similarly
SELECT COUNT(*) FROM user_metadata WHERE app_id = 'alertpay-default';
SELECT COUNT(*) FROM phonepe_orders WHERE app_id = 'alertpay-default';
-- etc.
```

## Rollback (if needed)

```sql
-- Revert data migration
UPDATE "orders" SET "app_id" = 'alertpay-default' WHERE "app_id" = 'com.paymentalert.app';
UPDATE "user_metadata" SET "app_id" = 'alertpay-default' WHERE "app_id" = 'com.paymentalert.app';
UPDATE "phonepe_orders" SET "app_id" = 'alertpay-default' WHERE "app_id" = 'com.paymentalert.app';
UPDATE "phonepe_subscriptions" SET "app_id" = 'alertpay-default' WHERE "app_id" = 'com.paymentalert.app';
UPDATE "play_store_ratings" SET "app_id" = 'alertpay-default' WHERE "app_id" = 'com.paymentalert.app';
UPDATE "subscription_logs" SET "app_id" = 'alertpay-default' WHERE "app_id" = 'com.paymentalert.app';
UPDATE "abandoned_checkouts" SET "app_id" = 'alertpay-default' WHERE "app_id" = 'com.paymentalert.app';

-- Drop apps table
DROP TABLE apps CASCADE;
```

## Troubleshooting

### Error: "apps table already exists"

**Solution**: Skip table creation, just run data migration:

```sql
-- Only run the UPDATE statements (skip CREATE TABLE)
UPDATE "orders" SET "app_id" = 'com.paymentalert.app' WHERE "app_id" = 'alertpay-default';
-- etc.
```

### Error: "app_id column doesn't exist"

**Solution**: Your tables don't have app_id column yet. This migration assumes app_id already exists on those tables. If not, add it first:

```sql
ALTER TABLE orders ADD COLUMN app_id text DEFAULT 'alertpay-default';
-- Repeat for all 7 tables
```
