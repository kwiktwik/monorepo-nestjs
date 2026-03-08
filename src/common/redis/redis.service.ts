import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client: Redis | null = null;
  private pubClient: Redis | null = null;
  private subClient: Redis | null = null;
  private isEnabled = false;

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    const redisUrl = this.configService.get<string>('REDIS_URL');
    const redisHost = this.configService.get<string>('REDIS_HOST');

    // Skip Redis initialization if not configured
    if (!redisUrl && !redisHost) {
      console.log(
        '[RedisService] Redis not configured. Redis features disabled.',
      );
      this.isEnabled = false;
      return;
    }

    const redisConfig = redisUrl
      ? { url: redisUrl }
      : {
          host: this.configService.get('REDIS_HOST', 'localhost'),
          port: this.configService.get('REDIS_PORT', 6379),
          password: this.configService.get('REDIS_PASSWORD') || undefined,
        };

    // Create clients with error handling
    this.client = this.createRedisClient(redisConfig, 'main');
    this.pubClient = this.createRedisClient(redisConfig, 'pub');
    this.subClient = this.createRedisClient(redisConfig, 'sub');

    this.isEnabled = true;
  }

  private createRedisClient(config: any, name: string): Redis {
    const client = config.url ? new Redis(config.url) : new Redis(config);

    client.on('connect', () => {
      console.log(`✅ Redis ${name} connected`);
    });

    client.on('error', (err) => {
      // Only log first error to avoid spam
      if (err.message?.includes('ECONNREFUSED')) {
        console.log(
          `[RedisService] ${name} client connection refused (Redis not available)`,
        );
      } else {
        console.error(`[RedisService] ${name} client error:`, err.message);
      }
    });

    return client;
  }

  async onModuleDestroy() {
    if (this.client) await this.client.quit();
    if (this.pubClient) await this.pubClient.quit();
    if (this.subClient) await this.subClient.quit();
  }

  isRedisEnabled(): boolean {
    return this.isEnabled;
  }

  getClient(): Redis | null {
    return this.client;
  }

  getPubClient(): Redis | null {
    return this.pubClient;
  }

  getSubClient(): Redis | null {
    return this.subClient;
  }

  // Cache user online status
  async setUserOnline(
    userId: string,
    appId: string,
    ttl: number = 300,
  ): Promise<void> {
    if (!this.client) return;
    const key = `user:online:${appId}:${userId}`;
    await this.client.setex(key, ttl, '1');
  }

  async setUserOffline(userId: string, appId: string): Promise<void> {
    if (!this.client) return;
    const key = `user:online:${appId}:${userId}`;
    await this.client.del(key);
  }

  async isUserOnline(userId: string, appId: string): Promise<boolean> {
    if (!this.client) return false;
    const key = `user:online:${appId}:${userId}`;
    return (await this.client.exists(key)) === 1;
  }

  // Cache conversation participants
  async cacheConversationParticipants(
    conversationId: string,
    participants: string[],
    ttl: number = 3600,
  ): Promise<void> {
    if (!this.client) return;
    const key = `conversation:participants:${conversationId}`;
    await this.client.del(key);
    if (participants.length > 0) {
      await this.client.sadd(key, ...participants);
      await this.client.expire(key, ttl);
    }
  }

  async getConversationParticipants(conversationId: string): Promise<string[]> {
    if (!this.client) return [];
    const key = `conversation:participants:${conversationId}`;
    return this.client.smembers(key);
  }

  // Typing indicators with debouncing
  async setTypingWithDebounce(
    conversationId: string,
    userId: string,
    debounceMs: number = 3000,
    ttl: number = 5,
  ): Promise<boolean> {
    if (!this.client || !this.pubClient) return false;
    const key = `typing:${conversationId}:${userId}`;
    const debounceKey = `typing_debounce:${conversationId}:${userId}`;

    // Check if we're still within the debounce window
    const exists = await this.client.exists(debounceKey);
    if (exists) {
      // Still within debounce window, just extend TTL
      await this.client.setex(key, ttl, '1');
      return false; // No need to broadcast
    }

    // Set both keys
    await this.client.setex(key, ttl, '1');
    await this.client.setex(debounceKey, Math.ceil(debounceMs / 1000), '1');

    // Broadcast typing event
    await this.pubClient.publish(
      `typing:${conversationId}`,
      JSON.stringify({ userId, isTyping: true }),
    );

    return true; // Broadcasted
  }

  async setTyping(
    conversationId: string,
    userId: string,
    ttl: number = 5,
  ): Promise<void> {
    if (!this.client || !this.pubClient) return;
    const key = `typing:${conversationId}:${userId}`;
    await this.client.setex(key, ttl, '1');
    await this.pubClient.publish(
      `typing:${conversationId}`,
      JSON.stringify({ userId, isTyping: true }),
    );
  }

  async removeTyping(conversationId: string, userId: string): Promise<void> {
    if (!this.client || !this.pubClient) return;
    const key = `typing:${conversationId}:${userId}`;
    await this.client.del(key);
    await this.pubClient.publish(
      `typing:${conversationId}`,
      JSON.stringify({ userId, isTyping: false }),
    );
  }

  async getTypingUsers(conversationId: string): Promise<string[]> {
    if (!this.client) return [];
    const pattern = `typing:${conversationId}:*`;
    const keys = await this.client.keys(pattern);
    return keys.map((k) => k.split(':').pop() as string);
  }

  // Message queue for offline users
  async queueMessage(userId: string, message: any): Promise<void> {
    if (!this.client) return;
    const key = `message:queue:${userId}`;
    await this.client.rpush(key, JSON.stringify(message));
  }

  async getQueuedMessages(userId: string): Promise<any[]> {
    if (!this.client) return [];
    const key = `message:queue:${userId}`;
    const messages = await this.client.lrange(key, 0, -1);
    await this.client.del(key);
    return messages.map((m) => JSON.parse(m));
  }

  // App cache
  async cacheApp(
    apiKey: string,
    appData: any,
    ttl: number = 3600,
  ): Promise<void> {
    if (!this.client) return;
    const key = `app:${apiKey}`;
    await this.client.setex(key, ttl, JSON.stringify(appData));
  }

  async getCachedApp(apiKey: string): Promise<any | null> {
    if (!this.client) return null;
    const key = `app:${apiKey}`;
    const data = await this.client.get(key);
    return data ? JSON.parse(data) : null;
  }

  async invalidateAppCache(apiKey: string): Promise<void> {
    if (!this.client) return;
    const key = `app:${apiKey}`;
    await this.client.del(key);
  }

  // User session cache
  async cacheUserSession(
    userId: string,
    sessionId: string,
    data: any,
    ttl: number = 86400,
  ): Promise<void> {
    if (!this.client) return;
    const key = `session:${userId}:${sessionId}`;
    await this.client.setex(key, ttl, JSON.stringify(data));
  }

  async getUserSession(userId: string, sessionId: string): Promise<any | null> {
    if (!this.client) return null;
    const key = `session:${userId}:${sessionId}`;
    const data = await this.client.get(key);
    return data ? JSON.parse(data) : null;
  }

  async deleteUserSession(userId: string, sessionId: string): Promise<void> {
    if (!this.client) return;
    const key = `session:${userId}:${sessionId}`;
    await this.client.del(key);
  }

  // Rate limiting
  async checkRateLimit(
    key: string,
    limit: number,
    windowSeconds: number,
  ): Promise<{ allowed: boolean; remaining: number; resetIn: number }> {
    if (!this.client) {
      // Allow all requests if Redis is not available
      return { allowed: true, remaining: limit, resetIn: windowSeconds };
    }
    const current = await this.client.incr(key);

    if (current === 1) {
      await this.client.expire(key, windowSeconds);
    }

    const ttl = await this.client.ttl(key);
    const remaining = Math.max(0, limit - current);
    const allowed = current <= limit;

    return { allowed, remaining, resetIn: ttl > 0 ? ttl : windowSeconds };
  }
}
