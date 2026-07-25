import { Queue } from "bullmq";
import IORedis from "ioredis";

export const redisUrl = process.env.REDIS_URL || "redis://127.0.0.1:6379";

export const connection = new IORedis(redisUrl, {
  maxRetriesPerRequest: null,
});

connection.on("error", (error) => {
  console.error("Redis connection error:", error.message);
});

export const resumeAnalysisQueue = new Queue("resume-analysis", {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 5000,
    },
    removeOnComplete: {
      age: 24 * 60 * 60,
      count: 1000,
    },
    removeOnFail: {
      age: 7 * 24 * 60 * 60,
    },
  },
});

export const retentionQueue = new Queue("retention", {
  connection,
  defaultJobOptions: {
    removeOnComplete: {
      age: 24 * 60 * 60,
      count: 100,
    },
    removeOnFail: {
      age: 7 * 24 * 60 * 60,
    },
  },
});

export const candidateEvaluationQueue = new Queue("candidate-evaluation", {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 5000,
    },
    removeOnComplete: {
      age: 24 * 60 * 60,
      count: 1000,
    },
    removeOnFail: {
      age: 7 * 24 * 60 * 60,
    },
  },
});
