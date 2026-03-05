import { Global, Module } from '@nestjs/common';
import { DRIZZLE_TOKEN } from './drizzle.module';
import { newDb } from 'pg-mem';
import { applyIntegrationsToPool } from 'drizzle-pgmem';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from './schema';
import * as path from 'path';
import * as fs from 'fs';


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
          const { seedDatabase } = require('../../../scripts/test-db/seed');
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
