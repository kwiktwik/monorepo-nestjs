# Database Migration Instructions

## Overview

This migration adds enhanced notification processing capabilities to your AlertPay system. **All changes are backward compatible** - your existing system will continue to work without any modifications.

## Prerequisites

- PostgreSQL database access
- Admin/migration user credentials
- Backup of existing database (recommended)

## Migration Steps

### Step 1: Backup Your Database (Recommended)

```bash
# Create a backup before running migration
pg_dump -U your_user -d your_database > backup_before_notification_enhancement.sql
```

### Step 2: Review the Migration Script

The migration script is located at:
```
drizzle/migrations/add_enhanced_notification_processing.sql
```

### Step 3: Run the Migration

**Option A: Using psql**
```bash
psql -U your_user -d your_database -f drizzle/migrations/add_enhanced_notification_processing.sql
```

**Option B: Using Drizzle Kit**
```bash
# Generate migration
npx drizzle-kit generate:pg

# Push to database
npx drizzle-kit push:pg
```

**Option C: Manual execution**
Copy and paste the SQL from the migration file into your database client (pgAdmin, DBeaver, etc.)

### Step 4: Verify Migration

Run these queries to verify the migration was successful:

```sql
-- Check if new tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('notification_logs', 'team_notifications');

-- Check if new columns were added to notifications table
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'notifications'
  AND column_name IN ('transaction_type', 'processing_metadata', 'notification_log_id');

-- Check if enums were created
SELECT typname FROM pg_type 
WHERE typname IN ('transaction_type', 'team_notification_status');
```

Expected results:
- 2 new tables: `notification_logs`, `team_notifications`
- 3 new columns in `notifications` table (all nullable)
- 2 new enum types

## What Gets Added

### New Tables

1. **notification_logs** - Detailed tracking of all processed notifications
2. **team_notifications** - Tracking of team notification broadcasts

### Modified Tables

**notifications** table gets 3 new **optional** columns:
- `transaction_type` (enum, nullable)
- `processing_metadata` (jsonb, nullable)
- `notification_log_id` (integer, nullable)

### New Enums

- `transaction_type`: RECEIVED, SENT, UNKNOWN
- `team_notification_status`: SUCCESS, FAILED

## Backward Compatibility

✅ **Existing notifications**: All existing records remain unchanged  
✅ **Existing API calls**: Continue to work without modification  
✅ **New fields**: All nullable - no data migration required  
✅ **Rollback safe**: Can be rolled back without data loss

## Rollback (If Needed)

If you need to rollback the migration:

```sql
-- Drop new tables
DROP TABLE IF EXISTS team_notifications CASCADE;
DROP TABLE IF EXISTS notification_logs CASCADE;

-- Remove new columns from notifications
ALTER TABLE notifications 
  DROP COLUMN IF EXISTS transaction_type,
  DROP COLUMN IF EXISTS processing_metadata,
  DROP COLUMN IF EXISTS notification_log_id;

-- Drop enums
DROP TYPE IF EXISTS team_notification_status;
DROP TYPE IF EXISTS transaction_type;
```

## Testing After Migration

1. **Test existing functionality**:
   ```bash
   # Existing notification creation should still work
   curl -X POST http://localhost:3000/api/notifications \
     -H "Content-Type: application/json" \
     -d '{"packageName":"com.phonepe.app","title":"Test","content":"Test"}'
   ```

2. **Test new functionality**:
   ```bash
   # New enhanced processing should work
   curl -X POST http://localhost:3000/api/notifications \
     -H "Content-Type: application/json" \
     -d '{
       "packageName":"com.phonepe.app",
       "title":"Ved Prakash Yadav",
       "content":"Ved Prakash Yadav has sent ₹100 to your bank account"
     }'
   ```

3. **Verify database**:
   ```sql
   -- Check if notification logs are being created
   SELECT * FROM notification_logs ORDER BY created_at DESC LIMIT 5;
   
   -- Check if new fields are populated
   SELECT id, transaction_type, notification_log_id 
   FROM notifications 
   WHERE transaction_type IS NOT NULL 
   ORDER BY created_at DESC LIMIT 5;
   ```

## Troubleshooting

### Issue: "relation does not exist"
**Solution**: The migration hasn't been run yet. Run the migration script.

### Issue: "column already exists"
**Solution**: Migration was partially run. Check which parts completed and run only the missing parts.

### Issue: "type already exists"
**Solution**: Enums were created but tables weren't. Continue with table creation.

## Support

If you encounter any issues:
1. Check the application logs for detailed error messages
2. Verify database connection and permissions
3. Ensure PostgreSQL version compatibility (9.5+)
4. Review the migration script for any conflicts with existing schema

## Next Steps After Migration

1. ✅ Migration complete
2. 🔄 Restart your application server
3. 📊 Monitor logs for any errors
4. 🧪 Test with real UPI notifications
5. 📈 Review notification logs for insights
