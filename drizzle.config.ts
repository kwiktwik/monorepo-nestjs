import { config } from 'dotenv';
import type { Config } from 'drizzle-kit';

config({ path: ['.env.local', '.env'] });

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL must be a full connection string.');
}

// RDS requires SSL. NODE_TLS_REJECT_UNAUTHORIZED=0 is set in npm scripts
// to skip cert hostname verification when tunnelling through localhost.
const sslConnectionString = `${connectionString}?sslmode=require`;

export default {
  schema: './src/database/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: sslConnectionString,
  },
} satisfies Config;
