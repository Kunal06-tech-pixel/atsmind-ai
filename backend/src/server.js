import dotenv from "dotenv";
dotenv.config({ path: "./.env" });

import { initInstrumentation } from "./instrumentation.js";
initInstrumentation({ serviceName: "resume-analyzer-api" });

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";

import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import resumeRoutes from "./routes/resume.routes.js";
import aiRoutes from "./routes/ai.routes.js";
import recruiterRoutes from "./routes/recruiter.routes.js";
import { connection as redisConnection } from "./queues/resumeAnalysis.queue.js";
import { startWorkers, stopWorkers } from "./workers/startWorkers.js";
import { logger } from "./utils/logger.js";
import { handleStripeWebhook } from "./controllers/stripeWebhook.controller.js";
import chatRoutes from "./routes/chat.routes.js";

const app = express();

/* DATABASE */
connectDB();

/* MIDDLEWARE */
app.use(
  cors({
    origin: process.env.FRONTEND_ORIGIN || "http://localhost:5173",
    credentials: true,
  })
);

app.post(
  "/api/webhooks/stripe",
  express.raw({ type: "application/json" }),
  handleStripeWebhook
);

app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());

/* ROUTES */
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/resume", resumeRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/recruiter", recruiterRoutes);
app.use("/api/chat", chatRoutes);

app.get("/", (req, res) => {
  res.send("API is running...");
});

app.get("/healthz", (req, res) => {
  res.sendStatus(200);
});

app.get("/readyz", async (req, res) => {
  const dbOk = mongoose.connection.readyState === 1;
  const redisOk = await redisConnection
    .ping()
    .then(() => true)
    .catch(() => false);

  return res.status(dbOk && redisOk ? 200 : 503).json({ dbOk, redisOk });
});

/* SERVER */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

if (process.env.RUN_WORKERS_IN_API !== "false") {
  startWorkers().catch((error) => {
    logger.error({ error: error.message }, "Could not start background workers");
    process.exit(1);
  });
}

const shutdown = async () => {
  await stopWorkers().catch((error) => {
    logger.error({ error: error.message }, "Worker shutdown failed");
  });
  await redisConnection.quit();
  process.exit(0);
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
