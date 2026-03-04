export enum NotificationChannelType {
  Sms = 'sms',
  Push = 'push',
  InApp = 'in_app',
}

export type EventEnvelope = {
  eventId: string;
  appId?: string;
  userId: string;
  eventType: string;
  payload: Record<string, unknown>;
  channels: NotificationChannelType[];
  createdAt: Date;
  metadata?: Record<string, unknown>;
};

export type NotificationChannel = {
  type: NotificationChannelType;
  send(event: EventEnvelope): Promise<NotificationChannelResult>;
};

export type NotificationChannelResult = {
  channel: NotificationChannelType;
  delivered: boolean;
  detail?: string;
  deliveredAt: Date;
};
