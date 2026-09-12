# Maya AI UI integration status

## Outcome

The React interface in `frontend/` is integrated locally through the thin FastAPI adapter in `api/`. It complements the accepted Streamlit product/evaluator surface and preserves the existing backend contracts. It is not a replacement for Stage 10 durable state behavior.

## Connected behavior

| React surface | Backend path | Verified behavior |
|---|---|---|
| Begin my journey | `POST /v1/demo/session` | Creates an isolated in-memory fictional session. |
| Pregnancy week/month/due date and postpartum date | Stage 3 `JourneyResolver` | Preserves exact versus approximate timing and rejects invalid input. |
| Diet and allergies | Server-built Stage 7 context | Applies scoped fictional constraints. |
| Onboarding symptoms | Stage 6 Safety Gate | Urgent and clarification routes block dashboard navigation and ordinary generation. |
| Fictional sample record | Controlled fixture | Adds one fictional appointment and record-only supplement; real upload remains disabled. |
| Dashboard | `GET /v1/demo/home/{session}` | Shows resolved or recorded values; weekly measurements and unreleased editorial claims remain hidden. |
| Connected plan | Stages 6 → 7 → 8 | Returns a proposed schedule only when validation permits it. |
| Ask Maya | Stages 6 → 7 → 8 | Runs safety first; urgent output bypasses ordinary generation. Landing-page access creates a safe fictional preview context before opening chat. |

## Preserved boundaries

- The repository has 63 authored profiles and 0 published profiles. Draft weekly measurements, fetal comparisons, and health guidance are not rendered as released content.
- The React adapter is Demo Mode only. It does not silently become Personal Mode or use a deterministic provider for Personal Mode.
- Stage 10 durable fact confirmation, plan saving, state invalidation, and simulated-review writes remain on the accepted Streamlit/storage surface and are not claimed by this React UI.
- Real medical uploads, live-provider selection, production evidence, deployment, remote migrations, and public/clinical release remain blocked.
- Passing local fixture tests is software-contract evidence, not clinical validation.

## Local run

Follow `frontend/README.md`. The checked-in `frontend/.env.example` contains only the local public API placeholder. No `.env` or secret is committed.

## Source integration

The local integration branch was created from `integration/capstone-demo-final` at `40ee1ae56d96697aad5f450994cc9340e95e6a10` and merged `integration/maya-ai-ui-demo` at `7a5531635242c997bacf33b2cabe2acbf67fa751` with normal Git ancestry. Full evidence is in `docs/FINAL-CAPSTONE-MAYA-UI-INTEGRATION-VERIFICATION.md`.