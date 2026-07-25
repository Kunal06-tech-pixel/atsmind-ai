# Job Recommendation Removal

ATSmind no longer exposes live job recommendations or job-marketplace behavior.
The active product flow is now manual job-description based job fit analysis.

Removed or deactivated files from the previous job recommendation feature:

- `backend/src/controllers/jobs.controller.js`
- `backend/src/routes/jobs.routes.js`
- `backend/src/services/adzuna.service.js`
- `backend/src/services/jobRecommendation.service.js`
- `backend/src/services/localJobMarket.service.js`
- `backend/test/jobRecommendation.test.js`
- `frontend/src/pages/Jobs.jsx`

Changed active imports and routes:

- `backend/src/server.js` no longer imports or mounts `/api/jobs`.
- `frontend/src/App.jsx` no longer imports or routes `/jobs`.
- `frontend/src/components/AppNav.jsx` no longer links to Jobs.
- `frontend/src/components/ui/AppShell.jsx` no longer links to Jobs.
- `backend/.env.example` and `docker-compose.yml` no longer define Adzuna variables.

The current replacement is `Job Fit Analysis`, where users manually paste a job
description and analyze their resume against that description.

