import * as schema from '../../src/database/schema';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Seeds an in-memory or actual Drizzle database instance using the extracted JSON data.
 * This is designed to be imported and used within test setup files (e.g. jest-e2e.json global setup or beforeEach).
 *
 * @param db The initialized drizzle instance
 */
export async function seedDatabase(db: any) {
    try {
        const seedFilePath = path.join(__dirname, '../drizzle/seed.json');
        console.log(`Reading seed data from ${seedFilePath}...`);

        if (!fs.existsSync(seedFilePath)) {
            throw new Error(`Seed file not found at ${seedFilePath}`);
        }

        const seedData = JSON.parse(fs.readFileSync(seedFilePath, 'utf8'));

        // Define table insertion order to be safe (parents first)
        const tablesToSeed = [
            { name: 'user', schema: schema.user },
            { name: 'account', schema: schema.account },
            { name: 'session', schema: schema.session },
            { name: 'user_metadata', schema: schema.userMetadata },
            { name: 'user_images', schema: schema.userImages },
            { name: 'device_sessions', schema: schema.deviceSessions },
            { name: 'subscriptions', schema: schema.subscriptions },
            { name: 'orders', schema: schema.orders },
            { name: 'play_store_ratings', schema: schema.playStoreRatings },
            { name: 'push_tokens', schema: schema.pushTokens },
            { name: 'notification_logs', schema: schema.notificationLogs },
            { name: 'enhanced_notifications', schema: schema.enhancedNotifications },
            { name: 'subscription_logs', schema: schema.subscriptionLogs },
        ];

        for (const { name, schema: tableSchema } of tablesToSeed) {
            if (seedData[name] && Array.isArray(seedData[name])) {
                const records = seedData[name];
                console.log(`Seeding ${records.length} records into '${name}' table...`);

                // We handle insertion in chunks to avoid query getting too large.
                const chunkSize = 100;
                let inserted = 0;

                for (let i = 0; i < records.length; i += chunkSize) {
                    const chunk = records.slice(i, i + chunkSize);

                    try {
                        await db.insert(tableSchema).values(chunk).onConflictDoNothing();
                        inserted += chunk.length;
                    } catch (err) {
                        console.warn(`Error inserting chunk in ${name}:`, err.message);
                    }
                }

                console.log(`Finished seeding '${name}' (attempted: ${records.length}, successful/ignored: ${inserted})`);
            } else {
                console.log(`No data found for table '${name}' in seed.json`);
            }
        }

        console.log('Seed completed successfully!');

    } catch (err) {
        console.error('Error during seeding:', err);
        throw err;
    }
}
