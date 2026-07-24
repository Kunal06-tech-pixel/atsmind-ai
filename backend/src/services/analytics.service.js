import { PostHog } from "posthog-node";

import { logger } from "../utils/logger.js";

let client;

const getClient = () => {
  if (!process.env.POSTHOG_API_KEY) {
    return null;
  }

  if (!client) {
    client = new PostHog(process.env.POSTHOG_API_KEY, {
      host: process.env.POSTHOG_HOST || "https://app.posthog.com",
    });
  }

  return client;
};

export const captureEvent = (userId, event, properties = {}) => {
  const posthog = getClient();

  if (!posthog || !userId) {
    return;
  }

  posthog.capture({
    distinctId: String(userId),
    event,
    properties,
  });
};

export const shutdownAnalytics = async () => {
  if (client) {
    await client.shutdown().catch((error) => {
      logger.warn({ error: error.message }, "PostHog shutdown failed");
    });
    client = null;
  }
};

