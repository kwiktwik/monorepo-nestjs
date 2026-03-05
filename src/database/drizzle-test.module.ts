import { Global, Module } from '@nestjs/common';
import { DRIZZLE_TOKEN } from './drizzle.module';
import { newDb } from 'pg-mem';
import { applyIntegrationsToPool } from 'drizzle-pgmem';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from './schema';
import * as path from 'path';
import * as fs from 'fs';

function convertDates(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === 'string') {
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(obj)) {
      return new Date(obj);
    }
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map(convertDates);
  }
  if (typeof obj === 'object') {
    const result: any = {};
    for (const key of Object.keys(obj)) {
      result[key] = convertDates(obj[key]);
    }
    return result;
  }
  return obj;
}

async function seedDatabase(db: any) {
  const seedFilePath = path.join(process.cwd(), 'scripts/test-db/seed.json');
  console.log(`Reading seed data from ${seedFilePath}...`);

  const seedData = JSON.parse(fs.readFileSync(seedFilePath, 'utf8'));

  const tablesToSeed = [
    { name: 'user', schema: schema.user },
    { name: 'push_tokens', schema: schema.pushTokens },
    { name: 'user_images', schema: schema.userImages },
    { name: 'user_metadata', schema: schema.userMetadata },
    { name: 'device_sessions', schema: schema.deviceSessions },
    { name: 'play_store_ratings', schema: schema.playStoreRatings },
    { name: 'notification_logs', schema: schema.notificationLogs },
    { name: 'enhanced_notifications', schema: schema.enhancedNotifications },
    { name: 'subscription_logs', schema: schema.subscriptionLogs },
    { name: 'subscriptions', schema: schema.subscriptions },
    { name: 'orders', schema: schema.orders },
    { name: 'team_notifications', schema: schema.teamNotifications },
    { name: 'abandoned_checkouts', schema: schema.abandonedCheckouts },
  ];

  for (const { name, schema: tableSchema } of tablesToSeed) {
    if (seedData[name] && Array.isArray(seedData[name])) {
      const records = seedData[name];
      console.log(`Seeding ${records.length} records into '${name}' table...`);

      const chunkSize = 100;
      let inserted = 0;

      for (let i = 0; i < records.length; i += chunkSize) {
        const chunk = records.slice(i, i + chunkSize).map(convertDates);

        try {
          await db.insert(tableSchema).values(chunk).onConflictDoNothing();
          inserted += chunk.length;
        } catch (err: any) {
          console.warn(`Error inserting chunk in ${name}:`, err.message || err);
        }
      }

      console.log(`Finished seeding '${name}' (attempted: ${records.length}, successful/ignored: ${inserted})`);
    } else {
      console.log(`No data found for table '${name}' in seed.json`);
    }
  }

  console.log('Seed completed successfully!');
}


@Global()
@Module({
  providers: [
    {
      provide: DRIZZLE_TOKEN,
      useFactory: async () => {
        const db = newDb();
        const pg = db.adapters.createPg();
        const Pool = pg.Pool;
        const pool = new Pool();

        applyIntegrationsToPool(pool);

        const dDb = drizzle(pool, { schema });

        // Manually run migrations, stripping statements pg-mem doesn't support (e.g. RLS)
        const migrationsFolder = path.join(process.cwd(), 'drizzle-test');
        console.log(
          `[DrizzleTestModule] Applying migrations from: ${migrationsFolder}`,
        );

        try {
          const sqlFiles = fs
            .readdirSync(migrationsFolder)
            .filter((f) => f.endsWith('.sql'))
            .sort();

          const client = await pool.connect();
          try {
            for (const file of sqlFiles) {
              const rawSql = fs.readFileSync(
                path.join(migrationsFolder, file),
                'utf8',
              );

              // Strip statements unsupported by pg-mem
              const filteredSql = rawSql
                .split('--> statement-breakpoint')
                .map((s) => s.trim())
                .filter((s) => {
                  const upper = s.toUpperCase();
                  return (
                    s.length > 0 &&
                    !upper.includes('ENABLE ROW LEVEL SECURITY') &&
                    !upper.includes('DISABLE ROW LEVEL SECURITY') &&
                    !upper.includes('CREATE POLICY') &&
                    !upper.includes('DROP POLICY')
                  );
                });

              for (const statement of filteredSql) {
                await client.query(statement);
              }

              console.log(
                `[DrizzleTestModule] Applied: ${file} (${filteredSql.length} statements)`,
              );
            }
          } finally {
            client.release();
          }

          console.log(
            '[DrizzleTestModule] All migrations applied successfully ✓',
          );

          // Seed the in-memory database
          console.log('[DrizzleTestModule] Starting database seeding...');
          await seedDatabase(dDb);
          console.log('[DrizzleTestModule] Database seeding completed ✓');

        } catch (error) {
          console.error('[DrizzleTestModule] Migration failed:', error);
          throw error;
        }

        return dDb;
      },
    },
  ],
  exports: [DRIZZLE_TOKEN],
})
export class DrizzleTestModule { }
