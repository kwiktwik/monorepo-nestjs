/**
 * In-Memory Subscription Repository
 * 
 * Simple in-memory implementation for testing and development.
 * Replace with actual database implementation in production.
 */

import { Injectable } from '@nestjs/common';
import type { ISubscriptionRepository, SubscriptionFilter, SubscriptionQueryOptions } from './subscription.repository.interface';
import type { Subscription } from '../../domain/entities/subscription.entity';
import { isPremiumStatus } from '../../types/subscription-status.enum';

/**
 * In-memory subscription repository
 * 
 * Note: This is a simple implementation for testing.
 * Replace with actual database repository in production.
 */
@Injectable()
export class InMemorySubscriptionRepository implements ISubscriptionRepository {
  private readonly subscriptions: Map<string, Subscription> = new Map();
  private readonly merchantIdIndex: Map<string, string> = new Map();
  private readonly providerIdIndex: Map<string, string> = new Map();

  async findById(id: string): Promise<Subscription | null> {
    return this.subscriptions.get(id) ?? null;
  }

  async findByMerchantId(merchantSubscriptionId: string): Promise<Subscription | null> {
    const id = this.merchantIdIndex.get(merchantSubscriptionId);
    if (!id) return null;
    return this.subscriptions.get(id) ?? null;
  }

  async findByProviderSubscriptionId(
    provider: string,
    providerSubscriptionId: string,
  ): Promise<Subscription | null> {
    const key = `${provider}:${providerSubscriptionId}`;
    const id = this.providerIdIndex.get(key);
    if (!id) return null;
    return this.subscriptions.get(id) ?? null;
  }

  async findByUserId(userId: string): Promise<readonly Subscription[]> {
    return Array.from(this.subscriptions.values()).filter(s => s.userId === userId);
  }

  async findActiveByUserId(userId: string): Promise<readonly Subscription[]> {
    return Array.from(this.subscriptions.values()).filter(
      s => s.userId === userId && isPremiumStatus(s.status),
    );
  }

  async findByAppId(appId: string): Promise<readonly Subscription[]> {
    return Array.from(this.subscriptions.values()).filter(s => s.appId === appId);
  }

  async findNeedingBilling(): Promise<readonly Subscription[]> {
    const now = new Date();
    return Array.from(this.subscriptions.values()).filter(s => {
      if (s.subscriptionType !== 'USER_MANAGED') return false;
      if (s.status !== 'ACTIVE') return false;
      if (!s.nextBillingDate) return false;
      return s.nextBillingDate <= now;
    });
  }

  async findInRetry(): Promise<readonly Subscription[]> {
    return Array.from(this.subscriptions.values()).filter(s => s.status === 'RETRYING');
  }

  async findByUserAndApp(
    userId: string,
    appId: string,
    status?: string,
  ): Promise<readonly Subscription[]> {
    return Array.from(this.subscriptions.values()).filter(s => {
      if (s.userId !== userId || s.appId !== appId) return false;
      if (status && s.status !== status) return false;
      return true;
    });
  }

  async findByStatus(
    status: string | readonly string[],
    options?: SubscriptionQueryOptions,
  ): Promise<readonly Subscription[]> {
    const statuses = Array.isArray(status) ? status : [status];
    let results = Array.from(this.subscriptions.values()).filter(s => 
      statuses.includes(s.status),
    );
    
    // Apply ordering
    if (options?.orderBy) {
      const dir = options.orderDirection === 'desc' ? -1 : 1;
      results.sort((a, b) => {
        const aVal = a[options.orderBy!];
        const bVal = b[options.orderBy!];
        return dir * (aVal < bVal ? -1 : aVal > bVal ? 1 : 0);
      });
    }
    
    // Apply pagination
    if (options?.offset) {
      results = results.slice(options.offset);
    }
    if (options?.limit) {
      results = results.slice(0, options.limit);
    }
    
    return results;
  }

  async save(subscription: Subscription): Promise<Subscription> {
    this.subscriptions.set(subscription.id, subscription);
    this.merchantIdIndex.set(subscription.merchantSubscriptionId, subscription.id);
    
    if (subscription.providerData.subscriptionId) {
      const key = `${subscription.provider}:${subscription.providerData.subscriptionId}`;
      this.providerIdIndex.set(key, subscription.id);
    }
    
    return subscription;
  }

  async delete(id: string): Promise<boolean> {
    const subscription = this.subscriptions.get(id);
    if (!subscription) return false;
    
    this.subscriptions.delete(id);
    this.merchantIdIndex.delete(subscription.merchantSubscriptionId);
    
    if (subscription.providerData.subscriptionId) {
      const key = `${subscription.provider}:${subscription.providerData.subscriptionId}`;
      this.providerIdIndex.delete(key);
    }
    
    return true;
  }

  async exists(id: string): Promise<boolean> {
    return this.subscriptions.has(id);
  }

  /**
   * Clear all subscriptions (for testing)
   */
  clear(): void {
    this.subscriptions.clear();
    this.merchantIdIndex.clear();
    this.providerIdIndex.clear();
  }

  /**
   * Get count of subscriptions (for testing)
   */
  count(): number {
    return this.subscriptions.size;
  }
}
