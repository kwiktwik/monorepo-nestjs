import { Config } from 'drizzle-kit';

export default {
    schema: './src/database/schema.ts',
    out: './drizzle-test', // We use a separate folder for test migrations
    dialect: 'postgresql',
} satisfies Config;
