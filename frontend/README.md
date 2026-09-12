# Maya AI frontend

This directory contains the existing Maya interface originally developed at
`localhost:5173`. It is now kept with the backend so one branch contains the
complete demo.

The design has been preserved. Its functional flows call the thin API in
`../api`:

- onboarding resolves pregnancy week/month/due date or postpartum birth date;
- preferences, allergies, and symptoms become trusted fictional-demo context;
- dashboard KPIs display only recorded/resolved values rather than invented data;
- “Build my connected week” calls the existing agents and Stage 8 validator;
- Ask Maya calls the existing safety, routing, evidence, and validation path;
- real medical-file upload remains disabled; a clearly marked fictional sample
  record is available for the demo.

## Local run

Terminal 1, from the repository root:

```powershell
.venv\Scripts\python.exe -m uvicorn api.main:app --reload --port 8000
```

Terminal 2:

```powershell
cd frontend
Copy-Item .env.example .env.local
npm ci
npm run dev
```

Open `http://localhost:5173`.

## Deployment

Deploy `frontend/` to Vercel and the repository root API to Render. Configure
`NEXT_PUBLIC_MAYA_API_URL` in Vercel and `MAYA_ALLOWED_ORIGINS` in Render with
the final HTTPS origins. This demo is fictional-data-only.
