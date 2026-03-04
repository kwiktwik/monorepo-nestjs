/**
 * E2E Test Setup
 * Sets up mock mode environment before tests run
 */

// Ensure mock mode is enabled for all e2e tests
process.env.USE_MOCK_DB = 'true';

// Set a default JWT secret for tests
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret-key-for-e2e-tests';

// Suppress console logs during tests (optional - comment out for debugging)
// console.log = jest.fn();
