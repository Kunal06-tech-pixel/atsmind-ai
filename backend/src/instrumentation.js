import * as Sentry from "@sentry/node";

export const initInstrumentation = ({ serviceName } = {}) => {
  if (!process.env.SENTRY_DSN) {
    return;
  }

  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE || 0.1),
    environment: process.env.NODE_ENV || "development",
    serverName: serviceName,
  });
};

export const captureException = (error, context = {}) => {
  if (!process.env.SENTRY_DSN) {
    return;
  }

  Sentry.withScope((scope) => {
    Object.entries(context).forEach(([key, value]) => {
      scope.setExtra(key, value);
    });
    Sentry.captureException(error);
  });
};

