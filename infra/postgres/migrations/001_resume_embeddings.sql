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

