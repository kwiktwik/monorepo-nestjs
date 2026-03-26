import * as Sentry from '@sentry/nestjs';

// Load env vars before Sentry init
import { config } from 'dotenv';
config({ path: ['.env.local', '.env'] });

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.SENTRY_ENVIRONMENT,
  release: process.env.SENTRY_RELEASE,
  sendDefaultPii: true,

  // Tracing sample rate from env (0.0-1.0) - undefined = disabled
  tracesSampleRate: process.env.SENTRY_TRACES_SAMPLE_RATE
    ? parseFloat(process.env.SENTRY_TRACES_SAMPLE_RATE)
    : undefined,

  // Structured logs (SDK >= 9.41.0)
  enableLogs: true,
});
