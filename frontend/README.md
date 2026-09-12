# Maya AI frontend

This directory contains the React/Next.js Maya interface. It is a complementary local controlled-demo surface over the accepted Nestline services. The accepted Streamlit entry point remains the complete Stage 3–10 evaluator and durable-state surface.

The React demo currently provides:

- journey onboarding for pregnancy and postpartum;
- server-derived fictional context for preferences and allergies;
- immediate Stage 6 safety handling for onboarding symptoms and chat;
- a dashboard that hides unreleased weekly measurements and editorial health claims;
- a connected Stage 7 plan draft that must pass Stage 8 validation;
- Ask Maya over the Stage 6–8 safety, routing, evidence, and validation path;
- one clearly marked fictional sample record.

It does not provide Personal Mode, real medical-file upload, published weekly guidance, or the Stage 10 durable commit/save/review lifecycle. Do not enter real personal or medical information.

## Local requirements

- Python 3.12
- Node.js 22.13 or later (Node 24 is used in CI)
- npm

## Local run

From a clean checkout, create the Python environment once:

```powershell
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
```

Terminal 1, from the repository root:

```powershell
.\.venv\Scripts\python.exe -m uvicorn api.main:app --host 127.0.0.1 --port 8000
```

Terminal 2:

```powershell
Set-Location frontend
Copy-Item .env.example .env.local
npm ci
npm run dev
```

Open `http://127.0.0.1:5173`.

## Reset and troubleshooting

Delete `frontend/.env.local` to restore the default local API address. Browser demo sessions are temporary; clear the site's local storage or open a private window to reset the client. Restart both local processes after dependency or environment changes.

If the UI reports that the API is unavailable, confirm `http://127.0.0.1:8000/healthz` returns `status: ok` and that `NEXT_PUBLIC_MAYA_API_URL` points to that API. If `npm` reports an engine mismatch, use Node 22.13 or later.

Deployment, remote secrets, public URLs, and production database configuration are intentionally outside this local integration.