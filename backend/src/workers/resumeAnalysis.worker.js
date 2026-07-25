import dotenv from "dotenv";
dotenv.config({ path: "./.env" });

import { initInstrumentation } from "../instrumentation.js";
initInstrumentation({ serviceName: "resume-analyzer-worker" });

import connectDB from "../config/db.js";
import { connection } from "../queues/resumeAnalysis.queue.js";
import { logger } from "../utils/logger.js";
import { startWorkers, stopWorkers } from "./startWorkers.js";

await connectDB();
await startWorkers();

const shutdown = async () => {
  await stopWorkers().catch((error) => {
    logger.error({ error: error.message }, "Worker shutdown failed");
  });
  await connection.quit();
  process.exit(0);
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
