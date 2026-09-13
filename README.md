# Maya AI

Maya AI is a safety-focused maternal continuity AI capstone covering pregnancy through 12 weeks postpartum. It organises user-provided context, retrieves governed evidence, coordinates bounded specialist workers, and stops or escalates when evidence is missing, conflicting, ambiguous, or urgent.

> Maya AI is an educational and organisational prototype. It is not a doctor, diagnostic tool, prescriber, medical device, or emergency service. The current React Product Preview accepts sample information only; do not enter real personal or medical information.

## Primary product experience

The React/Next.js application in [`frontend/`](frontend/README.md) is the primary Maya AI user experience. It connects through the thin [`api/`](api/README.md) adapter to the accepted Stage 3–8 journey, safety, orchestration, retrieval, and validation services.

The Product Preview includes:

- the complete five-step pregnancy and postpartum onboarding flow;
- exact-week, due-date, approximate-month, and postpartum journey handling;
- a 41-week editorial baby-comparison library with medical measurements hidden;
- pregnancy and postpartum dashboards with governed unavailable states;
- nutrition, movement, symptoms, wellbeing, FAQs, and care-record surfaces;
- connected, validated proposed weekly plans;
- Ask Maya with provenance, constraint, clarification, abstention, and fixed urgent routes;
- browser-session recovery after the in-memory backend restarts;
- explicit loading, empty, error, retry, blocked, and unavailable states.

Streamlit remains an internal engineering, evidence, and legacy verification surface. React does not yet expose durable Personal Mode state commits.

## Run locally

Requirements: Python 3.12 and Node.js 22.13 or later. Node 24 is used in GitHub validation.

From the repository root:

```powershell
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
.\.venv\Scripts\python.exe -m uvicorn api.main:app --host 127.0.0.1 --port 8000
```

In a second terminal:

```powershell
Set-Location frontend
Copy-Item .env.example .env.local
npm ci
npm run dev
```

Open `http://127.0.0.1:5173`. Use **Explore a sample week** for the deterministic fictional Product Preview.

The internal Streamlit verifier remains available with:

```powershell
.\.venv\Scripts\python.exe -m streamlit run streamlit_app.py
```

## Architecture and evidence

- [Maya AI updated architecture](<docs/Nestline updated architecture.md>)
- [Execution plan and release gates](docs/NESTLINE-EXECUTION-PLAN.md)
- [Current status](docs/NESTLINE-CURRENT-STATUS.md)
- [Maya UI integration](docs/MAYA-AI-UI-INTEGRATION.md)
- [Product UI restoration verification](docs/MAYA-AI-PRODUCT-UI-RESTORATION-AND-PRE-MERGE-VERIFICATION.md)
- [Capability matrix](docs/NESTLINE-CAPABILITY-MATRIX.md)
- [Canonical evaluation manifest](docs/NESTLINE-EVALUATION-MANIFEST.md)
- [Publication-readiness ledger](docs/STAGE-0-PUBLICATION-READINESS-SUMMARY.md)
- [Historical report index](docs/HISTORICAL-REPORT-INDEX.md)

The consolidated Stage 0–10 ancestry is already merged into `main` in `kajalchourasia-cmd/nestline`. This restoration branch starts from the reviewed correction commit and changes only its feature branch; it does not merge or deploy anything.

## Current boundaries

The repository has 63 authored profiles and **0 published profiles**. It has 42 comparison review records and **0 display-eligible clinical comparisons**. Kajal’s product/content approval for the rounded editorial sequence is preserved with its recorded identity, date, catalogue version, and content hash. Measurements, clinical review, India localisation, image licensing, and final publication remain pending.

Real uploads, authenticated React Personal Mode, durable React state, production extraction, selected live generation, remote migrations, external review operations, and deployment remain unavailable. The deterministic provider is test/demo only and cannot silently serve Personal Mode. No passing fixture or integration test establishes clinical validation, public-release approval, production security, or permission to process real patient data.
