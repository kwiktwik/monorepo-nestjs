import * as Sentry from '@sentry/nestjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.SENTRY_ENVIRONMENT ?? 'production',
  release: process.env.SENTRY_RELEASE,
  sendDefaultPii: true,

  // Tracing - lower to 0.1-0.2 in high-traffic production
  tracesSampleRate: 1.0,

  // Structured logs (SDK >= 9.41.0)
  enableLogs: true,
});
