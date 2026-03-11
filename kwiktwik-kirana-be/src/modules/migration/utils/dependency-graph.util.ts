import { TableDependencyLevel } from '../interfaces/migration.interfaces';

/**
 * Migration Dependency Graph
 * Defines the order in which tables must be migrated
 * Level 1: No dependencies (can be migrated first)
 * Level 2: Independent but reference user
 * Level 3: Business data with user references
 * Level 4: Logs/history with parent references
 */
export const MIGRATION_DEPENDENCY_GRAPH: TableDependencyLevel[] = [
  // Level 1: No dependencies (migrate first)
  {
    level: 1,
    tables: ['user_metadata', 'accounts', 'pushTokens'],
    description: 'Core user profile and OAuth accounts',
  },

  // Level 2: Independent but can reference user
  {
    level: 2,
    tables: ['deviceSessions', 'userImages', 'playStoreRatings'],
    description: 'Device info, images, ratings',
  },

  // Level 3: Business data (depends on user)
  {
    level: 3,
    tables: ['subscriptions', 'orders', 'abandonedCheckouts'],
    description: 'Active subscriptions and orders',
  },

  // Level 4: Logs/History (depends on parent records)
  {
    level: 4,
    tables: ['subscriptionLogs', 'phonepeOrders', 'phonepeSubscriptions'],
    description: 'Transaction logs and history',
  },
];

/**
 * Get all tables in migration order
 */
export function getMigrationOrder(): string[] {
  return MIGRATION_DEPENDENCY_GRAPH.flatMap((level) => level.tables);
}

/**
 * Get table weight for progress calculation
 */
export function getTableWeight(tableName: string): number {
  const weights: Record<string, number> = {
    user_metadata: 5,
    accounts: 5,
    pushTokens: 5,
    deviceSessions: 10,
    userImages: 10,
    playStoreRatings: 5,
    subscriptions: 20,
    orders: 20,
    abandonedCheckouts: 10,
    subscriptionLogs: 5,
    phonepeOrders: 5,
    phonepeSubscriptions: 5,
  };

  return weights[tableName] || 5;
}

/**
 * Calculate total weight for progress
 */
export function getTotalWeight(): number {
  return getMigrationOrder().reduce(
    (sum, table) => sum + getTableWeight(table),
    0,
  );
}

/**
 * Calculate progress for a given table
 */
export function calculateProgress(
  completedTables: string[],
  currentTable: string | null,
  currentTableProgress: number,
): number {
  const totalWeight = getTotalWeight();

  // Weight of completed tables
  const completedWeight = completedTables.reduce(
    (sum, table) => sum + getTableWeight(table),
    0,
  );

  // Weight of current table in progress
  const currentWeight = currentTable
    ? getTableWeight(currentTable) * currentTableProgress
    : 0;

  return Math.min(
    100,
    Math.round(((completedWeight + currentWeight) / totalWeight) * 100),
  );
}
