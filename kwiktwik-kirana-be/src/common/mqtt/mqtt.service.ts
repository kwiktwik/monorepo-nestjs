import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as mqtt from 'mqtt';

export interface MqttMessage {
  topic: string;
  payload: any;
  timestamp: Date;
}

@Injectable()
export class MqttService implements OnModuleInit, OnModuleDestroy {
  private client: mqtt.MqttClient;
  private readonly logger = new Logger(MqttService.name);
  private messageHandlers: Map<string, (message: MqttMessage) => void> = new Map();

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    const brokerUrl = this.configService.get('MQTT_BROKER_URL', 'mqtt://localhost:1883');
    const username = this.configService.get('MQTT_USERNAME');
    const password = this.configService.get('MQTT_PASSWORD');

    this.client = mqtt.connect(brokerUrl, {
      username: username || undefined,
      password: password || undefined,
      clientId: `nestjs-messaging-${Date.now()}`,
      clean: true,
      reconnectPeriod: 5000,
      connectTimeout: 30000,
    });

    this.client.on('connect', () => {
      this.logger.log('✅ MQTT connected to broker');
    });

    this.client.on('error', (err) => {
      this.logger.error('MQTT error:', err.message);
    });

    this.client.on('message', (topic: string, payload: Buffer) => {
      try {
        const message: MqttMessage = {
          topic,
          payload: JSON.parse(payload.toString()),
          timestamp: new Date(),
        };

        // Call specific handler if registered
        const handler = this.messageHandlers.get(topic);
        if (handler) {
          handler(message);
        }

        // Call wildcard handlers
        for (const [pattern, handler] of this.messageHandlers) {
          if (pattern.includes('#') || pattern.includes('+')) {
            if (this.matchTopic(pattern, topic)) {
              handler(message);
            }
          }
        }
      } catch (error) {
        this.logger.error('Error processing MQTT message:', error);
      }
    });

    this.client.on('offline', () => {
      this.logger.warn('MQTT client is offline');
    });

    this.client.on('reconnect', () => {
      this.logger.log('MQTT client reconnecting...');
    });
  }

  async onModuleDestroy() {
    if (this.client) {
      await new Promise<void>((resolve) => {
        this.client.end(false, () => {
          this.logger.log('MQTT client disconnected');
          resolve();
        });
      });
    }
  }

  // Subscribe to a topic
  async subscribe(topic: string, handler?: (message: MqttMessage) => void): Promise<void> {
    return new Promise((resolve, reject) => {
      this.client.subscribe(topic, { qos: 1 }, (err) => {
        if (err) {
          this.logger.error(`Failed to subscribe to ${topic}:`, err);
          reject(err);
        } else {
          this.logger.log(`Subscribed to topic: ${topic}`);
          if (handler) {
            this.messageHandlers.set(topic, handler);
          }
          resolve();
        }
      });
    });
  }

  // Unsubscribe from a topic
  async unsubscribe(topic: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.client.unsubscribe(topic, (err) => {
        if (err) {
          this.logger.error(`Failed to unsubscribe from ${topic}:`, err);
          reject(err);
        } else {
          this.logger.log(`Unsubscribed from topic: ${topic}`);
          this.messageHandlers.delete(topic);
          resolve();
        }
      });
    });
  }

  // Publish a message
  async publish(topic: string, payload: any, options: mqtt.IClientPublishOptions = {}): Promise<void> {
    return new Promise((resolve, reject) => {
      const message = JSON.stringify({
        ...payload,
        _timestamp: new Date().toISOString(),
      });

      this.client.publish(
        topic,
        message,
        { qos: 1, retain: false, ...options },
        (err) => {
          if (err) {
            this.logger.error(`Failed to publish to ${topic}:`, err);
            reject(err);
          } else {
            resolve();
          }
        },
      );
    });
  }

  // Publish to a user's personal topic
  async publishToUser(appId: string, userId: string, event: string, data: any): Promise<void> {
    const topic = `app/${appId}/user/${userId}/${event}`;
    await this.publish(topic, data);
  }

  // Publish to a conversation topic
  async publishToConversation(appId: string, conversationId: string, event: string, data: any): Promise<void> {
    const topic = `app/${appId}/conversation/${conversationId}/${event}`;
    await this.publish(topic, data);
  }

  // Publish to all users in an app
  async publishToApp(appId: string, event: string, data: any): Promise<void> {
    const topic = `app/${appId}/broadcast/${event}`;
    await this.publish(topic, data);
  }

  // Subscribe to user events
  async subscribeToUser(appId: string, userId: string, handler: (message: MqttMessage) => void): Promise<void> {
    const topic = `app/${appId}/user/${userId}/#`;
    await this.subscribe(topic, handler);
  }

  // Subscribe to conversation events
  async subscribeToConversation(
    appId: string,
    conversationId: string,
    handler: (message: MqttMessage) => void,
  ): Promise<void> {
    const topic = `app/${appId}/conversation/${conversationId}/#`;
    await this.subscribe(topic, handler);
  }

  // Match MQTT wildcard patterns
  private matchTopic(pattern: string, topic: string): boolean {
    const patternParts = pattern.split('/');
    const topicParts = topic.split('/');

    for (let i = 0; i < patternParts.length; i++) {
      if (patternParts[i] === '#') {
        return true;
      }
      if (patternParts[i] === '+') {
        continue;
      }
      if (patternParts[i] !== topicParts[i]) {
        return false;
      }
    }

    return patternParts.length === topicParts.length;
  }

  // Get connection status
  isConnected(): boolean {
    return this.client?.connected || false;
  }
}
