import { Redis } from 'ioredis';
import * as dotenv from 'dotenv';

// Load environment variables from .env.local or .env
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

async function checkRedis() {
  console.log('🔍 Checking Redis Connection...');

  const redisHost = process.env.REDIS_HOST || '127.0.0.1';
  const redisPort = process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT, 10) : 6379;
  const redisPassword = process.env.REDIS_PASSWORD || undefined;

  console.log(`Connecting to Redis at ${redisHost}:${redisPort}`);

  const redis = new Redis({
    host: redisHost,
    port: redisPort,
    password: redisPassword,
    maxRetriesPerRequest: 1,
    retryStrategy: (times) => {
      if (times > 2) return null; // stop retrying
      return Math.min(times * 50, 2000);
    },
  });

  try {
    // 1. Basic Ping Check
    const start = Date.now();
    const pingResponse = await redis.ping();
    const duration = Date.now() - start;

    if (pingResponse === 'PONG') {
      console.log(`✅ Redis is UP and running! (Ping latency: ${duration}ms)`);
    } else {
      console.log(`⚠️ Unexpected ping response: ${pingResponse}`);
    }

    // 2. Fetch some basic info
    const info = await redis.info('clients');
    const connectedClients = info.split('\n').find((line) => line.startsWith('connected_clients:'))?.split(':')[1]?.trim();
    const memoryInfo = await redis.info('memory');
    const usedMemory = memoryInfo.split('\n').find((line) => line.startsWith('used_memory_human:'))?.split(':')[1]?.trim();

    console.log(`\n📊 Redis Stats:`);
    console.log(`- Connected Clients: ${connectedClients || 'Unknown'}`);
    console.log(`- Used Memory: ${usedMemory || 'Unknown'}`);

    // 3. Check BullMQ Notification Log Queue
    console.log(`\n📬 Checking BullMQ Queue: "notification-logs"`);
    const waitingJobs = await redis.llen('bull:{notification-logs}:wait');
    const activeJobs = await redis.llen('bull:{notification-logs}:active');
    
    console.log(`- Waiting Jobs (backlog): ${waitingJobs}`);
    console.log(`- Active Jobs (processing): ${activeJobs}`);

    // Optional: Check if the processor has any stalled jobs or failures
    // (BullMQ uses Sets for failed/completed, so we use zcard or scard depending on Bull vs BullMQ)
    // BullMQ usually uses zsets for delayed/completed/failed
    try {
      const failedJobs = await redis.zcard('bull:{notification-logs}:failed');
      const completedJobs = await redis.zcard('bull:{notification-logs}:completed');
      console.log(`- Failed Jobs: ${failedJobs}`);
      console.log(`- Completed Jobs: ${completedJobs}`);
    } catch (e) {
      // Ignored if keys don't exist or wrong type
    }

    console.log('\n✅ All checks passed. Redis is working properly.');

  } catch (error) {
    console.error('\n❌ Redis connection or operation failed:');
    console.error((error as Error).message);
  } finally {
    redis.disconnect();
    process.exit(0);
  }
}

checkRedis();
