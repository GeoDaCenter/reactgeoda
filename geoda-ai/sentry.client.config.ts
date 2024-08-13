import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: 'https://a2f3a0fb7afcb544f2d58e5a79caa61b@o4505318856654848.ingest.us.sentry.io/4505840295477248',
  // Check if it is an exception, and if so, show the report dialog
  beforeSend(event, hint) {
    if (event.exception && event.event_id) {
      Sentry.showReportDialog({eventId: event.event_id});
    }
    return event;
  },
  // Replay may only be enabled for the client-side
  integrations: [Sentry.replayIntegration()],

  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for tracing.
  // We recommend adjusting this value in production
  tracesSampleRate: 1.0,

  // Capture Replay for 10% of all sessions,
  // plus for 100% of sessions with an error
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0

  // ...

  // Note: if you want to override the automatic release value, do not set a
  // `release` value here - use the environment variable `SENTRY_RELEASE`, so
  // that it will also get attached to your source maps
});
