import { Worker } from "bullmq";

import { connection, retentionQueue } from "../queues/resumeAnalysis.queue.js";
import { logger } from "../utils/logger.js";
import { captureException } from "../instrumentation.js";
import { closeVectorStore } from "../services/vectorStore.service.js";
import { shutdownAnalytics } from "../services/analytics.service.js";
import { enforceResumeRetention } from "./processors/retention.processor.js";
import { processResumeAnalysis } from "./processors/resumeAnalysis.processor.js";
import { processCandidateEvaluation } from "./processors/candidateEvaluation.processor.js";

let workers = null;

export const startWorkers = async () => {
  if (workers) {
    return workers;
  }

  const concurrency = Number(process.env.RESUME_ANALYSIS_CONCURRENCY || 2);

  const resumeWorker = new Worker("resume-analysis", processResumeAnalysis, {
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

  resumeWorker.on("completed", (job) => {
    logger.info({ jobId: job.id }, "Resume analysis job completed");
  });

  resumeWorker.on("failed", (job, error) => {
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

  workers = [resumeWorker, candidateWorker, retentionWorker];
  logger.info({ concurrency }, "Background workers started");

  return workers;
};

export const stopWorkers = async () => {
  if (!workers) {
    return;
  }

  await Promise.all(workers.map((worker) => worker.close()));
  workers = null;
  await shutdownAnalytics();
  await closeVectorStore();
};
