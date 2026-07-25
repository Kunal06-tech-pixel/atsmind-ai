**Purpose**
- **Goal:** Help AI coding agents become productive quickly in this repository by giving focused, repo-specific context, commands, and examples.

**Big Picture**
- **Architecture:** Frontend (React/Vite) talks to an Express API. The API enforces roles (job seeker vs recruiter) and uses HttpOnly JWT cookies + CSRF as noted in the root README. Core services: MongoDB (primary app data), Redis + BullMQ (job queue), PostgreSQL with pgvector (embedding similarity), and optional S3/local file storage for PDFs. See the architecture summary in [README.md](README.md#L1-L200).
- **Primary code areas:** frontend UI in [frontend/src](frontend/src#L1-L200); backend API and workers in [backend/src](backend/src#L1-L200); evaluation scripts in [backend/evaluation](backend/evaluation#L1-L200).

**Where to Start (Dev workflows)**
- **Start backend dev server:** `cd backend && npm install && cp .env.example .env && npm run dev` — server entry at [backend/src/server.js](backend/src/server.js#L1-L200).
- **Start background worker:** `cd backend && npm run worker` (or `npm run worker:dev` for nodemon). Worker entry: [backend/src/workers/resumeAnalysis.worker.js](backend/src/workers/resumeAnalysis.worker.js#L1-L200).
- **Start frontend dev:** `cd frontend && npm install && npm run dev` — frontend entry is Vite; routes in [frontend/src/App.jsx](frontend/src/App.jsx#L1-L200).
- **Run backend tests:** `cd backend && npm test` (node --test runs tests under `test/**/*.test.js`).
- **Run evaluation harness:** `cd backend && npm run eval:evidence` — see [backend/evaluation/evaluateEvidence.js](backend/evaluation/evaluateEvidence.js#L1-L200).

**Project-Specific Patterns & Conventions**
- **Separation of concerns:** API routes map to `backend/src/routes/*`, controllers in `backend/src/controllers/*`, and services/utils under `backend/src/services` or `backend/src/utils` — prefer adding features following that structure.
- **Queue-based processing:** Resume analysis is enqueued via BullMQ; queue config and connection are used in [backend/src/queues/resumeAnalysis.queue.js](backend/src/queues/resumeAnalysis.queue.js#L1-L200). Background processing lives in `backend/src/workers`.
- **File uploads & retention:** PDF uploads use Multer / multer-s3 (see backend docs and `backend/.env.example` settings). Respect configured retention (`RESUME_FILE_RETENTION_DAYS`) and `CANDIDATE_RESUME_MAX_BYTES` when adding upload logic.
- **Deterministic scoring rule:** The ATS score is deterministic — LLM outputs are used for grounded suggestions only and must not change the core deterministic scoring. See architecture notes in [README.md](README.md#L1-L200).
- **Security & roles:** Recruiter and seeker boundaries are enforced; always include `recruiterId` for recruiter queries. Look at authorization tests in `backend/test` for examples.

**Integration Points & External Dependencies**
- **Env vars:** Primary config in `backend/.env.example` — do not hardcode secrets. Key vars: `MONGO_URI`, `REDIS_URL`, `POSTGRES_URL`, `JWT_SECRET`, `GROQ_API_KEY`.
- **Embeddings & LLM:** Local embeddings (all-MiniLM-L6-v2) and pgvector are used for similarity; Groq and OpenAI are used for grounded suggestions. See references in README and backend dependencies in [backend/package.json](backend/package.json#L1-L200).
- **Observability:** Instrumentation and logging are initialized in `backend/src/instrumentation.js` and `backend/src/utils/logger.js` (pino) — follow existing patterns for telemetry and error reporting.

**Concrete Examples / Quick References**
- **API entry:** [backend/src/server.js](backend/src/server.js#L1-L200)
- **Worker entry:** [backend/src/workers/resumeAnalysis.worker.js](backend/src/workers/resumeAnalysis.worker.js#L1-L200)
- **Queue config:** [backend/src/queues/resumeAnalysis.queue.js](backend/src/queues/resumeAnalysis.queue.js#L1-L200)
- **Evaluation harness:** [backend/evaluation/evaluateEvidence.js](backend/evaluation/evaluateEvidence.js#L1-L200)
- **OpenAPI:** [docs/openapi.yaml](docs/openapi.yaml#L1-L200)

**What not to change without review**
- Deterministic scoring logic and evidence classification code paths. These affect recruiter decisions and must keep existing behavior.
- Data retention & upload quotas. Changes require ops review and tests.

**If you need more context**
- Ask for sample env values, dataset sizes for embeddings, or access patterns for recruiter flows. Point to failing tests if behavior appears broken; tests cover authorization and scoring stability in `backend/test`.

---
If anything here is unclear or you want more examples (specific controller patterns or a walking tour of queue + worker message shapes), tell me which area to expand and I'll iterate.
