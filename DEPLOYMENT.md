# Deployment Guide

This guide deploys ATSmind AI for free using Vercel for the frontend and Render for the backend. The backend runs the API and background workers in the same free Render web service, so S3 is not required for the free setup.

## Architecture

```text
User -> Vercel frontend -> Render API + worker -> MongoDB Atlas
                                             -> Redis Cloud
                                             -> Neon Postgres
```

Free-tier limits are fine for demos and learning. Do not treat this as production hosting.

---

## Step 1: Push to GitHub

Create a new repository on GitHub, then run:

```bash
git add .
git commit -m "Initial deployment"
git branch -M main
git remote add origin https://github.com/Kunal06-tech-pixel/atsmind-ai.git
git push -u origin main
```

Do not commit real `.env` files or API keys.

---

## Step 2: Create Free Services

### MongoDB Atlas

1. Go to https://cloud.mongodb.com.
2. Create a free M0 cluster.
3. Create a database user.
4. Allow network access from `0.0.0.0/0` for Render.
5. Copy your connection string.

Use it as:

```text
MONGO_URI=mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/resume_analyzer?retryWrites=true&w=majority
```

### Redis Cloud

1. Go to https://redis.com/try-free/.
2. Create a free 30 MB database.
3. Copy the host, port, and password.

Use this format:

```text
REDIS_URL=redis://default:PASSWORD@HOST:PORT
```

### Neon Postgres

1. Go to https://neon.tech.
2. Create a free project.
3. Copy the connection string.

Use it as:

```text
POSTGRES_URL=postgres://USER:PASSWORD@HOST/resume_analyzer?sslmode=require
```

### Groq

1. Go to https://console.groq.com.
2. Create an API key.

Use it as:

```text
GROQ_API_KEY=your_groq_api_key
```

---

## Step 3: Deploy Backend To Render

1. Go to https://dashboard.render.com.
2. Click **New +** -> **Web Service**.
3. Connect your GitHub repository.
4. Configure:
   - **Name**: `atsmind-ai-api`
   - **Root Directory**: leave blank
   - **Build Command**: `cd backend && npm ci`
   - **Start Command**: `cd backend && node src/server.js`
   - **Plan**: Free
   - **Health Check Path**: `/healthz`

Add these environment variables:

| Key | Value |
| --- | --- |
| `NODE_VERSION` | `20` |
| `PORT` | `5000` |
| `FRONTEND_ORIGIN` | Temporary value: `http://localhost:5173`; update after Vercel deploy |
| `MONGO_URI` | Your MongoDB Atlas URI |
| `REDIS_URL` | Your Redis Cloud URL |
| `POSTGRES_URL` | Your Neon URL |
| `JWT_SECRET` | Any long random secret |
| `GROQ_API_KEY` | Your Groq API key |
| `LOG_LEVEL` | `info` |
| `RESUME_ANALYSIS_CONCURRENCY` | `1` |
| `RUN_WORKERS_IN_API` | `true` |
| `RESUME_FILE_RETENTION_DAYS` | `90` |
| `AI_PROVIDER_TIMEOUT_MS` | `8000` |

Optional variables can stay empty unless you use those features:

```text
SENTRY_DSN=
POSTHOG_API_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRO_PRICE_ID=
STRIPE_TEAM_PRICE_ID=
```

After deployment, Render gives you a backend URL like:

```text
https://atsmind-ai-api.onrender.com
```

Check:

```text
https://atsmind-ai-api.onrender.com/healthz
```

---

## Step 4: Deploy Frontend To Vercel

1. Go to https://vercel.com.
2. Click **Add New** -> **Project**.
3. Import your GitHub repository.
4. Configure:
   - **Root Directory**: `frontend`
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm ci`

Add this environment variable:

```text
VITE_API_BASE_URL=https://atsmind-ai-api.onrender.com
```

Use your real Render backend URL.

---

## Step 5: Update CORS

After Vercel deploys, copy your Vercel URL and update this Render backend variable:

```text
FRONTEND_ORIGIN=https://your-vercel-project.vercel.app
```

Then restart or redeploy the Render service.

---

## Step 6: Verify

1. Open your Vercel frontend URL.
2. Sign up or log in.
3. Upload a PDF resume.
4. Wait for analysis to finish.
5. Check the Render logs if the status stays pending or fails.

---

## Free Storage Note

For the free deployment, uploaded PDFs are saved temporarily on the same Render web service that runs the worker. After analysis completes, the file is deleted. This avoids S3 costs.

Render free files are not permanent. This is acceptable here because completed analysis results are stored in MongoDB/Postgres and the original PDF is only needed while the background job runs.

---

## Troubleshooting

| Issue | Fix |
| --- | --- |
| CORS error | Set `FRONTEND_ORIGIN` on Render to your exact Vercel URL |
| Backend sleeps | Normal on free Render; wait for it to wake |
| Analysis stuck pending | Check `REDIS_URL` and Render logs |
| MongoDB connection fails | Check Atlas username, password, and network access |
| Postgres/vector write fails | Check Neon `POSTGRES_URL` includes `sslmode=require` |
| AI analysis fails | Check `GROQ_API_KEY` |

