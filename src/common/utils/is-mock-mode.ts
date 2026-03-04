/**
 * Returns true when the application is running in mock/local-dev mode.
 * Activated by setting USE_MOCK_DB=true in the environment (e.g. via pnpm start:dev:mock).
 * When true, all external API calls (SMS, Razorpay, Firebase, PhonePe, S3, etc.)
 * are replaced with no-op mock implementations that log to the console.
 */
export const isMockMode = (): boolean => process.env.USE_MOCK_DB === 'true';
