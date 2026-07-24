import { captureException } from "../instrumentation.js";
import { logger } from "../utils/logger.js";
import { generateSuggestionsWithGroq } from "./groq.service.js";

const withTimeout = (promise, ms) =>
  Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`AI provider timed out after ${ms}ms`)), ms)
    ),
  ]);

const providers = [
  {
    name: "groq",
    generateSuggestions: generateSuggestionsWithGroq,
  },
];

export const aiGateway = {
  async generateSuggestions(input) {
    const timeoutMs = Number(process.env.AI_PROVIDER_TIMEOUT_MS || 8000);

    for (const provider of providers) {
      try {
        const suggestions = await withTimeout(
          provider.generateSuggestions(input),
          timeoutMs
        );

        logger.info({ provider: provider.name }, "AI suggestions generated");
        return {
          suggestions,
          source: provider.name,
        };
      } catch (error) {
        logger.warn(
          { provider: provider.name, error: error.message },
          "AI provider failed"
        );
        captureException(error, {
          provider: provider.name,
          operation: "generateSuggestions",
        });
      }
    }

    return null;
  },
};

