# Nestline

Nestline is a safety-focused maternal continuity AI capstone covering pregnancy through 12 weeks postpartum. Its assistant, Compass, organizes user-provided records, retrieves governed public guidance, coordinates bounded specialist agents, and stops or escalates when evidence is missing, conflicting, or urgent.

> Nestline is a capstone prototype, not a medical device, doctor, diagnostic service, treatment system, or emergency service. Do not upload real personal or medical information to the public prototype.

## Start here

The canonical product, architecture, data, safety, delivery, and evaluation specification is:

- [Nestline Updated Architecture](<docs/Nestline updated architecture.md>)
- [Execution plan, stage estimates, and release gates](docs/NESTLINE-EXECUTION-PLAN.md)

It covers the Streamlit application, one explicit profile for every pregnancy and postpartum week, reusable sourced guidance fragments, onboarding, home and chat UX, governed sources, Supabase data architecture, RAG and GraphRAG, specialist-agent contracts, plans, safety, human review, error handling, n8n workflows, evaluation, implementation sequence, pre-mortem, and old-versus-current decision reconciliation. The earlier source-of-truth document is retained as decision history only.

## Development status

PR #4 is merged into `main` in `kajalchourasia-cmd/nestline`; the consolidated pass starts from exact main commit `796c05cd29a055188e86685990078709fca0bfbc`. Stages 5–10 are present on main. This branch improves Stages 0–8 and 10 services and evidence without modifying Stage 9 UI files or deploying anything.

The verified product path is the deterministic, fictional Demo Mode. Personal Mode storage and permission boundaries have local Supabase tests, but Personal Mode is not a complete live maternal-health assistant: 0/63 profiles are published, 0/42 comparisons are display-eligible, the safety specification is draft, real document uploads remain disabled, and no live generation or document-extraction provider is selected.

The content inventory contains 63 authoring profiles, 31 registered sources, 55 exact source spans and 56 guidance fragments. PC00, P10 and PP01 have governed Kajal content/product decisions; clinical, India-localisation, licence/currency and final publication decisions remain pending. No draft content was promoted for these tests.

A provider-neutral bounded transport is implemented. The frozen fictional xAI `grok-4.6` benchmark completed 6/8 cases and did not pass selection; OpenAI `gpt-5.4-mini` model-list access succeeded but inference failed closed with HTTP 429/no-credit. Human tone review is pending for 8/8 cases. No provider is selected and Personal Mode cannot fall back to the deterministic fixture provider.

- [Current status](docs/NESTLINE-CURRENT-STATUS.md)
- [Capability matrix](docs/NESTLINE-CAPABILITY-MATRIX.md)
- [Canonical evaluation manifest](docs/NESTLINE-EVALUATION-MANIFEST.md)
- [Publication-readiness ledger](docs/STAGE-0-PUBLICATION-READINESS-SUMMARY.md)
- [Historical report index](docs/HISTORICAL-REPORT-INDEX.md)
- [Execution plan](docs/NESTLINE-EXECUTION-PLAN.md)
- [Updated architecture](<docs/Nestline updated architecture.md>)
- [Merged Stage 5–10 integration evidence](docs/NESTLINE-STAGES-5-TO-10-FINAL-INTEGRATED-VERIFICATION.md)
- [Stage 0 demonstration-slice review packet](docs/STAGE-0-DEMONSTRATION-SLICE-REVIEW-PACKET.md)
- [Stage 6 reduced-movement review packet](docs/STAGE-6-REDUCED-MOVEMENT-QUALIFIED-REVIEW-PACKET.md)
- [Stage 7 live-provider gate](docs/STAGE-7-LIVE-PROVIDER-BENCHMARK-AND-SELECTION-GATE.md)
- [Stage 8 human-review packets](docs/STAGE-8-HUMAN-REVIEW-PACKETS.md)
- [Stage 10 draft/review/commit boundary](docs/STAGE-10-DRAFT-REVIEW-COMMIT-BOUNDARY.md)

Passing fixture or local integration tests is software-contract evidence. It does not establish clinical validation, public-release approval, production security, live-provider quality or permission to process real patient data. Remote migrations, hosting and deployment remain pending explicit authorization.
Run the current Streamlit application with:

```powershell
.venv\Scripts\python.exe -m streamlit run streamlit_app.py
```
