/**
 * Migration State Machine States
 */
export enum MigrationState {
  // Initial state
  PENDING = 'pending',

  // Active states
  VALIDATING_SESSION = 'validating_session',
  FETCHING_SOURCE_DATA = 'fetching_source_data',
  CHECKING_PARTIAL_DATA = 'checking_partial_data',
  CALCULATING_HASH = 'calculating_hash',

  // Migration states (Level 1 - No dependencies)
  MIGRATING_METADATA = 'migrating_metadata',
  MIGRATING_ACCOUNTS = 'migrating_accounts',
  MIGRATING_PUSH_TOKENS = 'migrating_push_tokens',

  // Migration states (Level 2 - Independent)
  MIGRATING_DEVICE_SESSIONS = 'migrating_device_sessions',
  MIGRATING_USER_IMAGES = 'migrating_user_images',
  MIGRATING_PLAYSTORE_RATINGS = 'migrating_playstore_ratings',

  // Migration states (Level 3 - Business data)
  MIGRATING_SUBSCRIPTIONS = 'migrating_subscriptions',
  MIGRATING_ORDERS = 'migrating_orders',
  MIGRATING_ABANDONED_CHECKOUTS = 'migrating_abandoned_checkouts',

  // Migration states (Level 4 - Logs/History)
  // Note: webhookLogs are not migrated - old subscription_logs are not compatible with new schema
  MIGRATING_PHONEPE_ORDERS = 'migrating_phonepe_orders',
  MIGRATING_PHONEPE_SUBSCRIPTIONS = 'migrating_phonepe_subscriptions',
  MIGRATING_ENHANCED_NOTIFICATIONS = 'migrating_enhanced_notifications',

  // Verification
  VERIFYING_HASH = 'verifying_hash',

  // Final states
  COMPLETED = 'completed',
  FAILED = 'failed',
  PARTIAL_DATA_DETECTED = 'partial_data_detected',
  TIMEOUT = 'timeout',
  MAX_RETRIES_EXCEEDED = 'max_retries_exceeded',
}

/**
 * Migration Error Codes
 */
export enum MigrationErrorCode {
  PARTIAL_DATA_DETECTED = 'ERR_PARTIAL_001',
  SESSION_INVALID = 'ERR_SESSION_002',
  HASH_MISMATCH = 'ERR_HASH_003',
  TIMEOUT = 'ERR_TIMEOUT_004',
  MAX_RETRIES_EXCEEDED = 'ERR_MAX_RETRY_005',
  FK_CONSTRAINT_VIOLATION = 'ERR_FK_006',
  DATA_INTEGRITY_ERROR = 'ERR_INTEGRITY_007',
  UNKNOWN_ERROR = 'ERR_UNKNOWN_999',
}

/**
 * Table Dependency Level
 */
export interface TableDependencyLevel {
  level: number;
  tables: string[];
  description: string;
}

/**
 * ID Mapping Entry
 */
export interface IdMappingEntry {
  tableName: string;
  oldId: string;
  newId: string;
}

/**
 * User Data to Migrate
 */
export interface MigratableUserData {
  userId: string;
  phoneNumber: string;
  user: any;
  metadata: any[];
  accounts: any[];
  pushTokens: any[];
  deviceSessions: any[];
  userImages: any[];
  playStoreRatings: any[];
  subscriptions: any[];
  orders: any[];
  abandonedCheckouts: any[];
  webhookLogs: any[];
  phonepeOrders: any[];
  phonepeSubscriptions: any[];
  enhancedNotifications: any[];
}

/**
 * Migration Progress Update
 */
export interface MigrationProgress {
  migrationId: string;
  userId: string;
  state: MigrationState;
  progress: number; // 0-100
  currentTable: string | null;
  recordsProcessed: number;
  totalRecords: number;
  estimatedTimeRemaining: number; // seconds
  message: string;
  timestamp: Date;
}

/**
 * Device Information
 */
export interface DeviceInfo {
  brand: string;
  model: string;
  os: string;
  appVersion: string;
}

/**
 * Migration Result
 */
export interface MigrationResult {
  success: boolean;
  migrationId: string;
  userId: string;
  token?: string;
  error?: {
    code: MigrationErrorCode;
    message: string;
  };
  migratedTables: string[];
  recordsMigrated: number;
  duration: number; // milliseconds
}

/**
 * Partial Data Check Result
 */
export interface PartialDataCheckResult {
  hasPartialData: boolean;
  tablesWithData: string[];
}

/**
 * Hash Comparison Result
 */
export interface HashComparisonResult {
  match: boolean;
  sourceHash: string;
  destinationHash: string;
}

/**
 * Retry Configuration
 */
export interface RetryConfig {
  maxRetries: number;
  delays: number[]; // milliseconds
}

/**
 * Migration Configuration
 */
export interface MigrationConfig {
  timeout: number; // milliseconds
  maxRetries: number;
  heartbeatInterval: number; // milliseconds
  staleThreshold: number; // milliseconds
  lockTtl: number; // milliseconds
  batchSize: number;
}
