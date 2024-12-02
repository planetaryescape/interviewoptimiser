import * as Sentry from "@sentry/aws-serverless";
// import { nodeProfilingIntegration } from "@sentry/profiling-node";

export function initSentry() {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    // integrations: [nodeProfilingIntegration()],

    // Set sampling rate for profiling - this is relative to tracesSampleRate
    profilesSampleRate: 1.0,

    // Tracing
    tracesSampleRate: 1.0, //  Capture 100% of the transactions
  });
}
