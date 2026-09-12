# Maya AI UI integration status

## Outcome

The existing React interface from `localhost:5173` is preserved in `frontend/`
and is now the intended main user-facing interface. It was not redesigned. A
thin FastAPI adapter in `api/` connects it to accepted backend services while
keeping the public demo fictional-data-only.

## What is connected

| Existing UI surface | Backend path | Current behaviour |
|---|---|---|
| Begin my journey | `POST /v1/demo/session` | Creates an isolated in-memory demo session. |
| Pregnancy week | Stage 3 `JourneyResolver` | Resolves and validates weeks 1–42. |
| Pregnancy month | Stage 3 `JourneyResolver` | Preserves an approximate week range rather than inventing an exact week. |
| Due date | Stage 3 `JourneyResolver` | Calculates current week from the supplied date. |
| Postpartum birth date | Stage 3 `JourneyResolver` | Calculates the supported postpartum week. |
| Diet, allergies, symptoms | Server-built Stage 7 context | Becomes scoped fictional context; onboarding symptoms also pass through Stage 6 safety evaluation. |
| Optional care record | Controlled demo fixture | Adds one visibly fictional record, appointment, and record-only supplement. No real file leaves the browser. |
| Dashboard KPIs | `GET /v1/demo/home/{session}` | Shows resolved/recorded values or “not logged”; it does not invent personal status. |
| Build my connected week | Stages 6 → 7 → 8 | Runs safety, bounded agents, Plan Composer, and validation; displays the proposed schedule only when permitted. |
| Ask Maya | Stages 6 → 7 → 8 | Runs the existing safety, route, evidence, specialist, and display-validation path. |

## Intentional demo limits

- Real medical uploads are disabled. Enabling them requires authentication,
  private storage, malware scanning, extraction, explicit fact confirmation,
  and deletion controls.
- Evidence used by the connected UI is the repository's controlled fictional
  fixture, not a published clinical content release.
- Plan output is proposal-only and is not durably saved from this frontend.
- Personal Mode and a live selected model provider remain gated.
- The editorial dashboard cards remain a labelled interface preview; the
  connected agent result appears in its own controlled-demo panel.

## Run locally

```powershell
.venv\Scripts\python.exe -m uvicorn api.main:app --reload --port 8000
Set-Location frontend
Copy-Item .env.example .env.local
npm ci
npm run dev
```

Open `http://localhost:5173`.

## Deployment shape

- Render: deploy the repository root using `render.yaml`.
- Vercel: import the same repository, set Root Directory to `frontend`, and set
  `NEXT_PUBLIC_MAYA_API_URL` to the Render HTTPS URL.
- Render: set `MAYA_ALLOWED_ORIGINS` to the final Vercel HTTPS URL (plus any
  approved custom domain).
- Run `/healthz`, onboarding, connected plan, chat, and urgent/clarification
  smoke tests after deployment.

## Naming

Evaluator-facing branding is “Maya AI” and the assistant is “Ask Maya.” Legacy
filenames, environment variables, schema identifiers, and historical evidence
retain their existing names where changing them would break compatibility or
invalidate signed verification evidence.
