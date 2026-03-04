import { Global, Module, InternalServerErrorException } from '@nestjs/common';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

export const DRIZZLE_TOKEN = 'DRIZZLE_DB';

@Global()
@Module({
  providers: [
    {
      provide: DRIZZLE_TOKEN,
      useFactory: () => {
        let connectionString = process.env.DATABASE_URL;

        // Build connection string from components if DATABASE_URL is just a hostname
        if (
          connectionString &&
          !connectionString.startsWith('postgresql://') &&
          !connectionString.startsWith('postgres://')
        ) {
          const host = connectionString;
          const port = process.env.DB_PORT || '5432';
          const user =
            process.env.DB_USER || process.env.RDS_USER || 'postgres';
          const password = process.env.RDS_PASSWORD;
          const dbName = process.env.DB_NAME || 'kiranaapps';

          if (!password) {
            throw new InternalServerErrorException(
              'RDS_PASSWORD is required when using host-only DATABASE_URL',
            );
          }

          const encodedPassword = encodeURIComponent(password);
          connectionString = `postgresql://${user}:${encodedPassword}@${host}:${port}/${dbName}`;
        }

        if (!connectionString) {
          throw new InternalServerErrorException(
            'DATABASE_URL environment variable is required',
          );
        }

        const pool = new Pool({
          connectionString,
          max: parseInt(process.env.DB_POOL_MAX || '10', 10),
          idleTimeoutMillis: parseInt(
            process.env.DB_IDLE_TIMEOUT || '30000',
            10,
          ),
          connectionTimeoutMillis: parseInt(
            process.env.DB_CONNECTION_TIMEOUT || '10000',
            10,
          ),
          keepAlive: true,
          ssl: { rejectUnauthorized: false },
        });

        return drizzle(pool, { schema });
      },
    },
  ],
  exports: [DRIZZLE_TOKEN],
})
export class DrizzleModule {}
