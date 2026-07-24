# Deployment Guide

This guide walks you through deploying the Resume Analyzer application using **Vercel** (frontend) and **Render** (backend) with **MongoDB Atlas**, **Redis Cloud**, and **Neon** (PostgreSQL).

## Architecture

```
User → Vercel (Frontend) → Render (Backend API) → MongoDB Atlas
                                                   → Redis Cloud
                                                   → Neon (PostgreSQL)
```

---

## Step 1: Push to GitHub

```bash
# Create a new repository on GitHub first, then:
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/resume-analyzer.git
git push -u origin main
```

---

## Step 2: Set Up Databases

### MongoDB Atlas (Free Tier)
1. Go to https://cloud.mongodb.com and create a free cluster
2. Create a database user (username/password)
3. Whitelist IP: `0.0.0.0/0` (allow all for Render)
4. Get your connection string: `mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/resume_analyzer?retryWrites=true&w=majority`

### Redis Cloud (Free 30MB)
1. Go to https://redis.com/try-free/ and create a free account
2. Create a free subscription → create a database
3. Note the **Public endpoint** (e.g., `redis-12345.c123.us-east-1-4.ec2.cloud.redislabs.com:12345`)
4. Note the **Default user password**

### Neon (Free PostgreSQL with pgvector)
1. Go to https://neon.tech and sign up
2. Create a project → copy the connection string
3. It looks like: `postgres://user:password@ep-xxxx.us-east-2.aws.neon.tech/resume_analyzer?sslmode=require`

---

## Step 3: Deploy Backend to Render

1. Go to https://dashboard.render.com
2. Click **New +** → **Web Service**
3. Connect your GitHub repository
4. Configure:
   - **Name**: `resume-analyzer-api`
   - **Root Directory**: (leave blank — we use `cd backend` in commands)
   - **Build Command**: `cd backend && npm ci`
   - **Start Command**: `cd backend && node src/server.js`
   - **Plan**: Starter ($7/month) or Free
5. Add environment variables (click **Advanced** → **Add Environment Variable**):

| Key | Value |
|-----|-------|
| `NODE_VERSION` | `20` |
| `PORT` | `5000` |
| `FRONTEND_ORIGIN` | `https://resume-analyzer.vercel.app` |
| `MONGO_URI` | Your MongoDB Atlas connection string |
| `REDIS_URL` | `redis://default:<password>@<endpoint>` |
| `POSTGRES_URL` | Your Neon connection string |
| `JWT_SECRET` | Click **Generate** |
| `GROQ_API_KEY` | Your Groq API key |
| `LOG_LEVEL` | `info` |
| `RESUME_ANALYSIS_CONCURRENCY` | `2` |
| `RESUME_FILE_RETENTION_DAYS` | `90` |
| `AI_PROVIDER_TIMEOUT_MS` | `8000` |

6. Click **Create Web Service**
7. Wait for deployment to finish. Note your backend URL (e.g., `https://resume-analyzer-api.onrender.com`)

---

## Step 4: Deploy Frontend to Vercel

1. Go to https://vercel.com and sign up with GitHub
2. Click **Add New** → **Project**
3. Import your GitHub repository
4. Configure:
   - **Root Directory**: `frontend`
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Add environment variable:
   - `VITE_API_BASE_URL` = `https://resume-analyzer-api.onrender.com` (your Render URL)
6. Click **Deploy**
7. Wait for deployment. Your frontend URL will be `https://resume-analyzer.vercel.app`

---

## Step 5: Update Backend CORS

After Vercel deployment, update the `FRONTEND_ORIGIN` environment variable on Render to your actual Vercel URL:

```
FRONTEND_ORIGIN=https://resume-analyzer.vercel.app
```

Then go to Render dashboard → **Manual Deploy** → **Deploy latest commit** to restart.

---

## Step 6: Verify

1. Visit your Vercel URL
2. Sign up / log in
3. Upload a resume and test the analysis
4. Check that the backend health endpoint works: `https://resume-analyzer-api.onrender.com/healthz`

---

## Optional: Custom Domain

### Vercel
- Go to project → **Settings** → **Domains**
- Add your custom domain (e.g., `resume.yourdomain.com`)

### Render
- Go to Web Service → **Settings** → **Custom Domain**
- Add your custom domain

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| CORS errors | Ensure `FRONTEND_ORIGIN` on Render matches your Vercel URL exactly |
| MongoDB connection fails | Check IP whitelist in Atlas (set to `0.0.0.0/0`) |
| Redis connection fails | Ensure password is correct in `redis://default:<password>@host:port` format |
| PostgreSQL connection fails | Add `?sslmode=require` to Neon connection string |
| 404 on page refresh | Vercel rewrites are configured in `vercel.json` — should work |
| Build fails on Render | Check Node version is set to 20 |

---

## Cost Summary (Free Tier Options)

| Service | Free Tier | Paid Option |
|---------|-----------|-------------|
| Vercel | ✅ Free (100GB bandwidth) | $20/mo Pro |
| Render | ✅ Free (limited hours) | $7/mo Starter |
| MongoDB Atlas | ✅ Free (512MB) | $57/mo M10 |
| Redis Cloud | ✅ Free (30MB) | $15/mo |
| Neon | ✅ Free (0.5GB) | $19/mo |
| **Total** | **$0/mo** | **~$12-20/mo** |

> **Note**: Render free tier spins down after inactivity (takes ~30s to wake up). For production, use the $7/mo Starter plan.