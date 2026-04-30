/**
 * In-Memory Order Repository
 * 
 * Simple in-memory implementation for testing and development.
 */

import { Injectable } from '@nestjs/common';
import type { IOrderRepository, OrderFilter } from './order.repository.interface';
import type { Order } from '../../domain/entities/order.entity';

/**
 * In-memory order repository
 */
@Injectable()
export class InMemoryOrderRepository implements IOrderRepository {
  private readonly orders: Map<string, Order> = new Map();
  private readonly merchantIdIndex: Map<string, string> = new Map();
  private readonly providerIdIndex: Map<string, string> = new Map();

  async findById(id: string): Promise<Order | null> {
    return this.orders.get(id) ?? null;
  }

  async findByMerchantId(merchantOrderId: string): Promise<Order | null> {
    const id = this.merchantIdIndex.get(merchantOrderId);
    if (!id) return null;
    return this.orders.get(id) ?? null;
  }

  async findByProviderOrderId(
    provider: string,
    providerOrderId: string,
  ): Promise<Order | null> {
    const key = `${provider}:${providerOrderId}`;
    const id = this.providerIdIndex.get(key);
    if (!id) return null;
    return this.orders.get(id) ?? null;
  }

  async findByUserId(userId: string): Promise<readonly Order[]> {
    return Array.from(this.orders.values()).filter(o => o.userId === userId);
  }

  async findBySubscriptionId(subscriptionId: string): Promise<readonly Order[]> {
    return Array.from(this.orders.values()).filter(o => o.subscriptionId === subscriptionId);
  }

  async findByAppId(appId: string): Promise<readonly Order[]> {
    return Array.from(this.orders.values()).filter(o => o.appId === appId);
  }

  async findPending(): Promise<readonly Order[]> {
    return Array.from(this.orders.values()).filter(o => 
      o.status === 'CREATED' || o.status === 'PENDING',
    );
  }

  async findNeedingCapture(): Promise<readonly Order[]> {
    return Array.from(this.orders.values()).filter(o => o.status === 'AUTHORIZED');
  }

  async save(order: Order): Promise<Order> {
    this.orders.set(order.id, order);
    this.merchantIdIndex.set(order.merchantOrderId, order.id);
    
    if (order.providerData.orderId) {
      const key = `${order.provider}:${order.providerData.orderId}`;
      this.providerIdIndex.set(key, order.id);
    }
    
    return order;
  }

  async delete(id: string): Promise<boolean> {
    const order = this.orders.get(id);
    if (!order) return false;
    
    this.orders.delete(id);
    this.merchantIdIndex.delete(order.merchantOrderId);
    
    if (order.providerData.orderId) {
      const key = `${order.provider}:${order.providerData.orderId}`;
      this.providerIdIndex.delete(key);
    }
    
    return true;
  }

  async exists(id: string): Promise<boolean> {
    return this.orders.has(id);
  }

  /**
   * Clear all orders (for testing)
   */
  clear(): void {
    this.orders.clear();
    this.merchantIdIndex.clear();
    this.providerIdIndex.clear();
  }

  /**
   * Get count of orders (for testing)
   */
  count(): number {
    return this.orders.size;
  }
}
