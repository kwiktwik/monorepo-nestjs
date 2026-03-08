import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client: Redis;
  private pubClient: Redis;
  private subClient: Redis;

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    const redisConfig = {
      host: this.configService.get('REDIS_HOST', 'localhost'),
      port: this.configService.get('REDIS_PORT', 6379),
      password: this.configService.get('REDIS_PASSWORD') || undefined,
    };

    this.client = new Redis(redisConfig);
    this.pubClient = new Redis(redisConfig);
    this.subClient = new Redis(redisConfig);

    this.client.on('connect', () => console.log('✅ Redis connected'));
    this.client.on('error', (err) => console.error('Redis error:', err));
  }

  async onModuleDestroy() {
    await this.client.quit();
    await this.pubClient.quit();
    await this.subClient.quit();
  }

  getClient(): Redis {
    return this.client;
  }

  getPubClient(): Redis {
    return this.pubClient;
  }

  getSubClient(): Redis {
    return this.subClient;
  }

  // Cache user online status
  async setUserOnline(
    userId: string,
    appId: string,
    ttl: number = 300,
  ): Promise<void> {
    const key = `user:online:${appId}:${userId}`;
    await this.client.setex(key, ttl, '1');
  }

  async setUserOffline(userId: string, appId: string): Promise<void> {
    const key = `user:online:${appId}:${userId}`;
    await this.client.del(key);
  }

  async isUserOnline(userId: string, appId: string): Promise<boolean> {
    const key = `user:online:${appId}:${userId}`;
    return (await this.client.exists(key)) === 1;
  }

  // Cache conversation participants
  async cacheConversationParticipants(
    conversationId: string,
    participants: string[],
    ttl: number = 3600,
  ): Promise<void> {
    const key = `conversation:participants:${conversationId}`;
    await this.client.del(key);
    if (participants.length > 0) {
      await this.client.sadd(key, ...participants);
      await this.client.expire(key, ttl);
    }
  }

  async getConversationParticipants(conversationId: string): Promise<string[]> {
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
    const key = `typing:${conversationId}:${userId}`;
    await this.client.setex(key, ttl, '1');
    await this.pubClient.publish(
      `typing:${conversationId}`,
      JSON.stringify({ userId, isTyping: true }),
    );
  }

  async removeTyping(conversationId: string, userId: string): Promise<void> {
    const key = `typing:${conversationId}:${userId}`;
    await this.client.del(key);
    await this.pubClient.publish(
      `typing:${conversationId}`,
      JSON.stringify({ userId, isTyping: false }),
    );
  }

  async getTypingUsers(conversationId: string): Promise<string[]> {
    const pattern = `typing:${conversationId}:*`;
    const keys = await this.client.keys(pattern);
    return keys.map((k) => k.split(':').pop() as string);
  }

  // Message queue for offline users
  async queueMessage(userId: string, message: any): Promise<void> {
    const key = `message:queue:${userId}`;
    await this.client.rpush(key, JSON.stringify(message));
  }

  async getQueuedMessages(userId: string): Promise<any[]> {
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
    const key = `app:${apiKey}`;
    await this.client.setex(key, ttl, JSON.stringify(appData));
  }

  async getCachedApp(apiKey: string): Promise<any | null> {
    const key = `app:${apiKey}`;
    const data = await this.client.get(key);
    return data ? JSON.parse(data) : null;
  }

  async invalidateAppCache(apiKey: string): Promise<void> {
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
    const key = `session:${userId}:${sessionId}`;
    await this.client.setex(key, ttl, JSON.stringify(data));
  }

  async getUserSession(userId: string, sessionId: string): Promise<any | null> {
    const key = `session:${userId}:${sessionId}`;
    const data = await this.client.get(key);
    return data ? JSON.parse(data) : null;
  }

  async deleteUserSession(userId: string, sessionId: string): Promise<void> {
    const key = `session:${userId}:${sessionId}`;
    await this.client.del(key);
  }

  // Rate limiting
  async checkRateLimit(
    key: string,
    limit: number,
    windowSeconds: number,
  ): Promise<{ allowed: boolean; remaining: number; resetIn: number }> {
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
