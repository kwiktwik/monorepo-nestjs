/** Known client diagnostic event types */
export const CLIENT_EVENT_TYPES = {
  API_CALL_FAILED: 'API_CALL_FAILED',
  NETWORK_TIMEOUT: 'NETWORK_TIMEOUT',
  NETWORK_ERROR: 'NETWORK_ERROR',
  APP_CRASH: 'APP_CRASH',
  APP_ANR: 'APP_ANR',
  SLOW_API_CALL: 'SLOW_API_CALL',
  AUTH_TOKEN_EXPIRED: 'AUTH_TOKEN_EXPIRED',
  WEBSOCKET_DISCONNECT: 'WEBSOCKET_DISCONNECT',
} as const;

export type ClientEventType =
  (typeof CLIENT_EVENT_TYPES)[keyof typeof CLIENT_EVENT_TYPES];

/** Single event from the Android client */
export interface ClientEvent {
  eventType: string;
  userId?: string;
  deviceModel?: string;
  osVersion?: string;
  appVersion?: string;
  payload?: Record<string, unknown>;
  timestamp?: string;
}

/** POST /events request body */
export interface IngestRequest {
  appId: string;
  events: ClientEvent[];
}

/** Worker environment bindings */
export interface Env {
  DB: D1Database;
  CLIENT_API_KEY: string;
  ADMIN_API_KEY: string;
  MAX_BATCH_SIZE: string;
  RETENTION_DAYS: string;
}