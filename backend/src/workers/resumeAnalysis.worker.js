import dotenv from "dotenv";
dotenv.config({ path: "./.env" });

import { initInstrumentation, captureException } from "../instrumentation.js";
initInstrumentation({ serviceName: "resume-analyzer-worker" });

import { Worker } from "bullmq";

import connectDB from "../config/db.js";
import { connection } from "../queues/resumeAnalysis.queue.js";
import { retentionQueue } from "../queues/resumeAnalysis.queue.js";
import { logger } from "../utils/logger.js";
import { closeVectorStore } from "../services/vectorStore.service.js";
import { shutdownAnalytics } from "../services/analytics.service.js";
import { enforceResumeRetention } from "./processors/retention.processor.js";
import { processResumeAnalysis } from "./processors/resumeAnalysis.processor.js";
import { processCandidateEvaluation } from "./processors/candidateEvaluation.processor.js";

await connectDB();

const concurrency = Number(process.env.RESUME_ANALYSIS_CONCURRENCY || 2);

const worker = new Worker("resume-analysis", processResumeAnalysis, {
  connection,
  concurrency,
});

const candidateWorker = new Worker(
  "candidate-evaluation",
  processCandidateEvaluation,
  {
    connection,
    concurrency,
  }
);

const retentionWorker = new Worker(
  "retention",
  async () => enforceResumeRetention(),
  {
    connection,
    concurrency: 1,
  }
);

await retentionQueue.add(
  "cleanup",
  {},
  {
    repeat: { pattern: "0 3 * * *" },
    jobId: "resume-file-retention",
  }
);

worker.on("completed", (job) => {
  logger.info({ jobId: job.id }, "Resume analysis job completed");
});

worker.on("failed", (job, error) => {
  logger.error(
    {
      jobId: job?.id || "unknown",
      attemptsMade: job?.attemptsMade || 0,
      error: error.message,
    },
    "Resume analysis job failed"
  );
  captureException(error, {
    jobId: job?.id || "unknown",
    attemptsMade: job?.attemptsMade || 0,
  });
});

candidateWorker.on("completed", (job) => {
  logger.info({ jobId: job.id }, "Candidate evaluation job completed");
});

candidateWorker.on("failed", (job, error) => {
  logger.error(
    {
      jobId: job?.id || "unknown",
      attemptsMade: job?.attemptsMade || 0,
      error: error.message,
    },
    "Candidate evaluation job failed"
  );
  captureException(error, {
    jobId: job?.id || "unknown",
    attemptsMade: job?.attemptsMade || 0,
  });
});

const shutdown = async () => {
  await worker.close();
  await candidateWorker.close();
  await retentionWorker.close();
  await shutdownAnalytics();
  await closeVectorStore();
  await connection.quit();
  process.exit(0);
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
