# ATSmind AI

ATSmind is a dual-role, evidence-based resume and recruitment evaluation platform.
Job seekers analyse and improve resumes against selected job descriptions, while
recruiters evaluate, compare, and shortlist candidates using deterministic
scoring and requirement-level resume evidence.

The platform is not a job board, job marketplace, scraping tool, or automated
hiring system.

## Workflows

### ATSmind Career

- Upload an individual resume PDF.
- Paste a job description and target role.
- Review deterministic match scoring, skill gaps, keyword coverage, resume
  quality, suggestions, saved analyses, and context-aware resume chat.
- Build and export a resume through the existing builder.

### ATSmind Recruit

- Create a job requirement.
- Define mandatory and preferred skills.
- Upload multiple candidate PDF resumes with consent confirmation.
- Process each candidate independently through BullMQ.
- Review rankings based on deterministic overall ATS score.
- Inspect requirement-level evidence, mandatory gaps, notes, status, shortlists,
  and candidate comparison.

Recruiter language is intentionally decision-support oriented. The system does
not claim that a candidate should be hired.

## Architecture

```text
React/Vite frontend
  -> Express API with HttpOnly JWT cookies and CSRF
  -> MongoDB for users, analyses, recruiter jobs, candidates, evaluations
  -> Redis and BullMQ for seeker and recruiter analysis jobs
  -> Local all-MiniLM-L6-v2 embeddings
  -> PostgreSQL pgvector for seeker embedding similarity
  -> S3 or local uploads for PDF handling
  -> Groq for grounded suggestions and summaries only
```

The ATS score remains deterministic. LLM output does not calculate, override, or
modify the score.

## Local Setup

```bash
docker compose up mongo redis postgres
cd backend
npm install
cp .env.example .env
npm run dev
```

In another shell:

```bash
cd backend
npm run worker
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

Default frontend URL: `http://localhost:5173`.
Default backend URL: `http://localhost:5000`.

## Environment Variables

Important backend variables:

- `MONGO_URI`
- `REDIS_URL`
- `POSTGRES_URL`
- `JWT_SECRET`
- `GROQ_API_KEY`
- `RUN_WORKERS_IN_API`
- `CANDIDATE_BATCH_MAX_FILES`
- `CANDIDATE_RESUME_MAX_BYTES`
- `EVIDENCE_STRONG_THRESHOLD`
- `EVIDENCE_PARTIAL_THRESHOLD`
- `RESUME_FILE_RETENTION_DAYS`

See [backend/.env.example](backend/.env.example) for the full list.

## API Documentation

OpenAPI documentation for the core auth, seeker, and recruiter endpoints is in
[docs/openapi.yaml](docs/openapi.yaml).

## Testing

Backend:

```bash
cd backend
npm test
```

Frontend build verification:

```bash
cd frontend
npm run build
```

The frontend currently has no dedicated test runner. Backend tests cover role
authorization, scoring stability, skill matching, requirement extraction,
resume evidence segmentation, and evidence classification.

## AI and ML Evaluation

The evaluation scaffold is in [backend/evaluation](backend/evaluation). It is
designed for labelled datasets that measure:

- Requirement evidence precision at 1
- Strong, partial, and missing evidence classification agreement
- Error analysis categories such as skill alias failures and false semantic
  matches

Do not claim recruitment accuracy without running labelled evaluation data.

## Data and Security Notes

- Recruiter resources are always queried with `recruiterId`.
- Job seekers cannot access recruiter routes.
- Recruiters cannot access seeker resume builder, seeker analyses, or seeker
  chat routes.
- Candidate uploads require consent confirmation.
- Sensitive raw resume text, candidate emails, phone numbers, tokens, and S3 keys
  should not be logged.
- Uploaded files follow configured retention and deletion behavior.

## Removed Scope

The former job recommendation and Adzuna integration has been removed from the
active product. See [docs/job-recommendation-removal.md](docs/job-recommendation-removal.md).

