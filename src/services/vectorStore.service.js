import pg from "pg";

import { logger } from "../utils/logger.js";

const { Pool } = pg;

let pool;
let initPromise;

const getPool = () => {
  if (!process.env.POSTGRES_URL) {
    return null;
  }

  if (!pool) {
    pool = new Pool({
      connectionString: process.env.POSTGRES_URL,
    });
  }

  return pool;
};

const toVectorLiteral = (embedding) => `[${embedding.map(Number).join(",")}]`;

export const initVectorStore = async () => {
  const db = getPool();

  if (!db) {
    return false;
  }

  if (!initPromise) {
    initPromise = db.query(`
      CREATE EXTENSION IF NOT EXISTS vector;
      CREATE EXTENSION IF NOT EXISTS pgcrypto;

      CREATE TABLE IF NOT EXISTS resume_embeddings (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        analysis_id TEXT NOT NULL UNIQUE,
        user_id TEXT NOT NULL,
        embedding vector(384) NOT NULL,
        created_at TIMESTAMPTZ DEFAULT now(),
        updated_at TIMESTAMPTZ DEFAULT now()
      );

      CREATE INDEX IF NOT EXISTS resume_embeddings_embedding_ivfflat_idx
        ON resume_embeddings
        USING ivfflat (embedding vector_cosine_ops)
        WITH (lists = 100);
    `);
  }

  await initPromise;
  return true;
};

export const upsertResumeEmbedding = async ({ analysisId, userId, embedding }) => {
  const db = getPool();

  if (!db || !Array.isArray(embedding) || embedding.length !== 384) {
    return false;
  }

  await initVectorStore();

  await db.query(
    `
      INSERT INTO resume_embeddings (analysis_id, user_id, embedding, updated_at)
      VALUES ($1, $2, $3::vector, now())
      ON CONFLICT (analysis_id)
      DO UPDATE SET
        user_id = EXCLUDED.user_id,
        embedding = EXCLUDED.embedding,
        updated_at = now()
    `,
    [String(analysisId), String(userId), toVectorLiteral(embedding)]
  );

  logger.info({ analysisId }, "Resume embedding written to pgvector");
  return true;
};

export const deleteUserEmbeddings = async (userId) => {
  const db = getPool();

  if (!db) {
    return 0;
  }

  await initVectorStore();

  const result = await db.query(
    "DELETE FROM resume_embeddings WHERE user_id = $1",
    [String(userId)]
  );

  return result.rowCount || 0;
};

export const findSimilarEmbeddings = async ({ userId, embedding, limit = 10 }) => {
  const db = getPool();

  if (!db || !Array.isArray(embedding) || embedding.length !== 384) {
    return [];
  }

  await initVectorStore();

  const result = await db.query(
    `
      SELECT analysis_id, 1 - (embedding <=> $1::vector) AS similarity
      FROM resume_embeddings
      WHERE user_id = $2
      ORDER BY embedding <=> $1::vector
      LIMIT $3
    `,
    [toVectorLiteral(embedding), String(userId), Number(limit)]
  );

  return result.rows;
};

export const closeVectorStore = async () => {
  if (pool) {
    await pool.end();
    pool = null;
    initPromise = null;
  }
};
