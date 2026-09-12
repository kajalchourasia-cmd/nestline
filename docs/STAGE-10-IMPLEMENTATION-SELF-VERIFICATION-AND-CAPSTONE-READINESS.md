# Stage 10 implementation, self-verification, and capstone readiness

**Current evidence status:** local implementation complete; final verdict remains NO-GO until one legacy permission regression is aligned with the stricter Stage 10 contract and rerun.

## Verdict

`STAGE 10 NO-GO — CAPSTONE MUST NOT BE RELEASED`

This verdict is intentionally conservative. Stage 10's implementation, focused tests, clean migration, exact Stage 9 upgrade, authenticated APIs, UI integration and repeated fictional capstone stories pass. The complete pgTAP run still has one failing legacy file because its Stage 2 assertions require authenticated clients to write directly to four tables that Stage 10 now protects behind the single State Committer. The implementation keeps the stronger Stage 10 security rule. The legacy assertion has not been rewritten without explicit approval.

## Entry gate and repository state

- Accepted Stage 9 remote SHA used as the base: `8cba505ef6b9f1a9d1d608bb38f9451fd438a79b`.
- Stage 10 branch: `feat/stage-10-state-review-lifecycle`.
- Accepted Stage 8 ancestor: `2444f1c15b9b8a37b38a76b0257b76d2180f4b17`.
- `git merge-base --is-ancestor 2444f1c15b9b8a37b38a76b0257b76d2180f4b17 8cba505ef6b9f1a9d1d608bb38f9451fd438a79b` returned success.
- Accepted Stage 9 GitHub run: `34671124041`; `validate` job `103492544145` and `supabase-integration` job `103492544054` both passed on the exact base SHA.
- Starting worktree was clean. Current worktree contains the Stage 10 implementation and this evidence; it is intentionally uncommitted and unpushed while the final database regression is unresolved.
- No PR, merge, deployment, remote migration, external message, notification, paid-provider request or real patient-data operation occurred.

## Plain-language implementation

Stage 10 adds one guarded door for durable changes. A chat answer, uploaded-document extraction or agent proposal cannot write facts or plans by itself. The authenticated user must explicitly confirm an action, and the State Committer checks ownership, expected version, provenance, validation, constraints and consent inside one transaction. A repeated click returns the same logical result. A stale concurrent action is rejected without overwriting newer truth.

Confirmed document facts preserve their original candidate and exact page/span. Corrections create a new fact and supersede the old fact instead of erasing history. Plans follow an explicit lifecycle. Relevant changes follow stored dependencies and mark only affected plans stale. Simulated review is consented, minimal, truthful and separate from immediate urgent safety handling. External reminder delivery remains unavailable.

## Requirement-to-implementation map

| Requirement | Implementation | Executable evidence |
|---|---|---|
| Single authorized write boundary | `app/services/state_committer.py`; `public.stage10_commit(uuid,jsonb)` | `tests/test_state_lifecycle.py`; Stage 10 pgTAP; two-principal API check |
| Strict commands/results and trusted scope | `app/schemas/state_lifecycle.py`; authenticated snapshot/RPC | exported schema; forged scope/caller tests; RLS/API checks |
| Fact confirm/correct/reject and supersession | in-memory and SQL committers; decision ledger | exact-provenance, conflict, correction and supersession tests |
| Saved-plan lifecycle | strict payloads, plan transition map and lifecycle-event ledger | lifecycle unit matrix and pgTAP transition history |
| User-edit revalidation | `ValidatedPlanEdit`; item/field/value/trace cross-validation | schema mutation test and SQL transactional check |
| Dependency-driven staleness | normalized dependencies plus graph nodes/edges and selective triggers | positive/negative selectivity tests and causal-chain capstone story |
| Follow-up/reminder consent | typed reminder contract and durable task table | missing-fields rejection and truthful unavailable-delivery tests |
| Simulated review | minimal packet, explicit transition graph and consent record | consent, invalid transition, idempotency, timeout/unavailable and urgent independence tests |
| Stage 9 UI wiring | Stage Committer actions in plans, records and simulated review; authenticated durable reload | `scripts.check_stage10_ui`; recovered offline Stage 4 UI smoke |
| Clean and upgrade migration | forward-only `20260912000100` migration and exact Stage 9 fixture | clean reset, exact upgrade fixture/check, lint |
| Deterministic evidence and CI | schema/eval/check scripts and workflow additions | 33/33 dev cases; 9/9 stories; checker and CI commands |

## State Committer contract

`StateCommitCommand` contains:

- schema version, command UUID and stable idempotency key;
- expected database-derived state version;
- submitted timestamp and the only permitted caller, `authenticated_ui`;
- typed proposed payload;
- exact provenance;
- explicit actor confirmation/consent evidence.

Owner and workspace identity are not command fields. `AuthenticatedCommitScope` is constructed from the authenticated session. The SQL RPC checks `auth.uid()` against the workspace owner. Ordinary service-role calls and direct authenticated writes are denied.

`StateCommitResult` reports committed, replayed or rejected state; old/new versions; affected entities and plans; a typed rejection; the current state for stale-write review; and a redacted audit trace. Traces record no raw personal text, no service-role use, no direct-agent write and zero generation calls.

The in-memory repository exists only for deterministic fictional tests. The Supabase adapter uses the user's access token and publishable key. Fixture setup in the local API checker uses the local service key only to create and remove isolated test principals and fixtures; all product calls use authenticated user JWTs.

## Fact decisions

| Action | Durable behavior | Personalization eligibility |
|---|---|---|
| Confirm | Preserve candidate, create confirmed health fact, record decision/provenance | Eligible only after commit |
| Correct | Preserve candidate, create corrected fact, supersede prior fact and record linkage | New confirmed version eligible after commit |
| Reject | Preserve candidate and decision; create no active fact | Never eligible |
| Conflict | Commit is rejected until clarified | Never eligible |

Exact document ID, document-fact ID, page, span and SHA-256 must agree with the stored candidate. Missing or altered provenance rejects atomically.

## Plan lifecycle

| From | Allowed next states | Guard |
|---|---|---|
| creation | `draft` | accepted Stage 8 validation, current confirmed journey, full active-constraint dependencies |
| `draft` | `user_reviewed`, `archived` | explicit action |
| `user_reviewed` | `saved`, `archived` | explicit save confirmation and current versions |
| `saved` | `active`, `replaced`, `archived` | explicit action; replacement must already be saved |
| `active` | `replaced`, `archived` | explicit action |
| `stale` | `replaced`, `archived` | cannot be reactivated or silently resaved |
| `replaced` | `archived` | history remains visible |
| `archived` | none | terminal |

Every plan stores owner/workspace, version, current journey and journey-state version, week, creation/review/save timestamps, preferences, confirmed constraints, component outputs, evidence IDs, validated user edits, status, replacement link and stale reasons. A plan item carries evidence, confirmed-fact links and its validation state.

A Streamlit view, rerun or retry is not review or save confirmation. Stable command keys prevent duplicate mutations. The UI displays the committed version returned by the State Committer.

## Dependency and invalidation behavior

Normalized dependencies cover journey state, allergy, restriction, condition, symptom, medication, supplement, clinician instruction and evidence. Plan creation fails if an active confirmed allergy, restriction or clinician instruction is missing from its dependencies. Validated edits must match the persisted plan item.

Relevant fact/journey/symptom/medication/evidence changes mark matching plans and items stale in the same authorized flow. Corrections invalidate dependencies on superseded truth as well as the new fact. Unrelated material keys do not stale unaffected plans. Missing required dependency data rejects the plan visibly. Invalidation never regenerates, replaces, saves or activates a plan.

The stored graph preserves causal continuity. The fictional continuity story records document candidate to confirmed restriction, affected plan item, stale plan and follow-up question. The user-visible result includes the causal chain and stale reason.

## Follow-up and reminder behavior

In-app follow-up tasks require provenance and explicit confirmation. A reminder requires opt-in, exact timestamp, timezone and channel. `in_app` may be stored as an organizational reminder. Email, SMS and push return `external_delivery_unavailable`; `external_delivery_scheduled` remains false. No n8n, background worker or notification transmission was added. Urgent guidance never depends on a task or reminder.

## Simulated review behavior

Review packets contain only the question, current journey reference, minimum relevant confirmed fact IDs, user-reported context IDs, exact span IDs, trace reference, unresolved conflict IDs, requested action and consent record. The schema caps each personal-data list, rejects the unrelated-data flag and requires immediate safety completion for urgent cases.

Valid states are `not_required`, `offered`, `consented`, `queued`, `reviewed`, `resumed`, `declined`, `unavailable` and `timed_out`. Only the documented transitions are permitted. A case cannot queue before consent. Every surface says `Simulated review` or `Simulated response`; no clinician identity or response-time guarantee is created. The urgent fictional story completes fixed safety behavior first, records zero ordinary-generation calls, and only then offers the simulated packet.

## Stage 9 UI integration

- Records: the fictional candidate can be confirmed through the State Committer; the UI then shows the committed fact, stale-plan consequence and causal chain.
- Plans: the fictional edited plan follows create, explicit review and explicit save commands; the direct-storage-write control remains disabled.
- Simulated review: consent and queue actions use State Committer transitions; external submission remains disabled.
- Personal Mode: authenticated renders call `stage10_durable_state` and display durable counts/plan status. Session state is only display state.
- Offline/error state: network, timeout and OS failures become a recoverable unavailable message. The older Stage 4 UI smoke now passes with zero network calls.
- Duplicate protection: stable idempotency keys make reruns/retries replay-safe.

## Development evaluation inventory

The visible deterministic Stage 10 set contains 33 typed lifecycle cases. It covers caller/scope forgery, cross-workspace denial, exact provenance, confirm/correct/reject/conflict behavior, atomic rollback, all lifecycle boundaries, plan-edit validation, active-constraint dependency completeness, relevant and unrelated invalidation, correction supersession, reminder consent, simulated-review minimization and transitions, medication boundaries, allergen rejection, audit minimization, idempotency and recoverable storage unavailability.

Results after rectification:

- Stage 10 typed cases: **33/33**.
- Critical Stage 10 cases: **13/13**.
- Connected fictional capstone stories: **9/9** (three stories, each run three times from isolated reset state).
- Focused Stage 10 pgTAP: **38/38**.
- Stage 10 authenticated API: **14/14**, two principals.
- Stage 10 UI integration: **7/7**.
- Full Python repository suite: **451/451**.

## Repeated connected capstone stories

| Story | Runs | Result | Durable state observed |
|---|---:|---|---|
| Resolve P10, confirm fictional sesame allergy, create sourced edited plan, review and save | 3 | 3/3 PASS | saved plan, state version 5 |
| Fictional document fact to confirmed restriction, graph dependency, follow-up question and stale plan | 3 | 3/3 PASS | stale affected plan only, state version 4 |
| Curated urgent red flag, immediate fixed safety, consented minimum simulated packet | 3 | 3/3 PASS | zero ordinary generation, queued simulated review, state version 4 |

These controlled fixtures demonstrate software state transitions. They are not clinical validation, a real upload study or authorization to release.

## Verification commands and observed results

| Command/gate | Result |
|---|---|
| `python -m unittest discover -s tests -q` | 451/451 PASS |
| `python -m scripts.validate_content` | 63 profiles, 0 published, 31 sources, 55 spans, 0 errors |
| `python -m scripts.validate_content --require-review-ready` | PASS with 0 errors |
| `python -m scripts.run_contract_evals` | 64/64 PASS |
| `python -m scripts.run_journey_evals` | 26/26 PASS |
| Stage 1–5 checkers | all PASS |
| Stage 6 safety eval/check | 45/45; critical 41/41; urgent zero-generation 25/25; PASS |
| Stage 7 eval/check | 76/76; critical 64/64; PASS |
| Stage 8 eval/check | 62/62; critical 50/50; PASS |
| Stage 9 eval/check | 38/38 and stories 9/9; PASS |
| Stage 3, 4, 9 and 10 Streamlit checks | PASS; Stage 10 7/7 |
| `supabase db reset --local --no-seed` | clean replay PASS through `20260912000100` |
| Exact `20260911001300` Stage 9 fixture, `migration up`, upgrade check | PASS |
| `supabase db lint --local --schema public --schema private` | 0 findings on clean and upgraded histories |
| Stage 2/3/4/5/10 authenticated API scripts | 13/13, 17/17, 15/15, 25/25, 14/14; total 84/84 PASS |
| Stage 10 pgTAP | 38/38 PASS |
| All pgTAP files | 6/7 files PASS; Stage 2 legacy file FAILS after 32/122 due permission-contract conflict |
| `git diff --check` | to be rerun after final documentation alignment |
| GitHub checks on Stage 10 commit | not run because the branch is uncommitted/unpushed pending the required regression decision |

## First self-review and consolidated rectification

The machine-readable review is `docs/STAGE-10-SELF-REVIEW-FINDINGS.json`. It records ten findings. Nine have been corrected and rerun:

1. replaced an invalid shared multi-table trigger with table-specific invalidation;
2. bound plan/review owner and journey fields from database truth;
3. added durable owner-only state reload;
4. typed and cross-validated plan edits;
5. required every active hard constraint dependency;
6. invalidated superseded fact dependencies during correction;
7. removed authenticated direct table mutation from Stage 10-owned state;
8. converted offline storage failure into a recoverable UI state;
9. fixed a PL/pgSQL alias collision exposed by clean pgTAP.

The tenth finding is the unresolved legacy Stage 2 permission assertion described below.

## Honest issue register

| ID | Severity | Evidence | User/safety impact | Disposition | Blocks release |
|---|---|---|---|---|---|
| S10-SR-010 | High | Stage 2 pgTAP expects authenticated direct CRUD on health facts, reviews, plan items and plans; Stage 10 revokes those writes. The file reports four policy failures and then permission denial at assertion 32/122. | Restoring the grants would let clients bypass the State Committer's version, consent, constraint, provenance and idempotency checks. | Kept fail-closed. Legacy test alignment requires explicit approval because changing an existing expectation was rejected by automatic approval review. | Yes |
| S10-LIM-001 | Medium | Only fictional in-memory and local Supabase fixtures were used. | Production load, reliability and real user behavior are unproven. | Open for later controlled validation. | No for engineering review; yes for release |
| S10-LIM-002 | High | Safety/content specification remains draft with incomplete qualified clinical, India-localisation and licence review. | Health content cannot be presented as clinically/publicly approved. | Existing fail-closed boundary preserved. | Yes for public release |
| S10-LIM-003 | Medium | External email/SMS/push and real human review are unavailable. | The prototype cannot deliver external reminders or clinician review. | UI and contracts state unavailable; no fake success. | No for local capstone |
| S10-LIM-004 | Medium | Sealed final holdout was not opened and no outside-user walkthrough was performed in this stage. | Final generalization and independent usability remain unmeasured. | Intentionally deferred to authorized evaluation. | Yes for final claims |

No required check was silently skipped. Live provider/model benchmarks, external transmissions, remote migration and deployment were deliberately not run because they are outside this task and prohibited.

## Migration, configuration and operator impact

- New forward-only local migration: `supabase/migrations/20260912000100_stage10_state_review_lifecycle.sql`.
- Adds plan lifecycle fields and constraints, private dependency/lifecycle/fact-decision/idempotency ledgers, public follow-up tasks, simulated-review state, owner-only durable snapshot and State Committer RPC.
- Replaces authenticated direct state mutations with owner-readable tables plus the single authenticated RPC.
- Adds table-specific dependency invalidation triggers and graph continuity.
- Verified clean replay and exact accepted Stage 9 schema upgrade.
- The migration was not applied remotely.
- No new secret, provider or paid credential is required. `.env.example` needs no Stage 10 secret.
- Existing local Supabase and Docker configuration are sufficient.

## Complete changed-file inventory

- `.github/workflows/data-contracts.yml`
- `app/pages_and_components/onboarding.py`
- `app/pages_and_components/stage9.py`
- `app/schemas/state_lifecycle.py`
- `app/services/capstone_flows.py`
- `app/services/state_committer.py`
- `data/schemas/state_lifecycle.schema.json`
- `docs/STAGE-10-CAPSTONE-STORY-RESULTS.json`
- `docs/STAGE-10-COVERAGE-MANIFEST.json`
- `docs/STAGE-10-EVAL-RESULTS.json`
- `docs/STAGE-10-SELF-REVIEW-FINDINGS.json`
- `docs/STAGE-10-IMPLEMENTATION-SELF-VERIFICATION-AND-CAPSTONE-READINESS.md`
- `evals/stage10_state_lifecycle.jsonl`
- `scripts/build_stage10_evals.py`
- `scripts/check_stage10.py`
- `scripts/check_stage10_state_api.py`
- `scripts/check_stage10_ui.py`
- `scripts/export_state_lifecycle_schema.py`
- `scripts/run_stage10_evals.py`
- `scripts/stage10_fixture_support.py`
- `supabase/fixtures/stage10_stage9_upgrade.sql`
- `supabase/fixtures/stage10_stage9_upgrade_check.sql`
- `supabase/migrations/20260912000100_stage10_state_review_lifecycle.sql`
- `supabase/tests/stage10_state_review_lifecycle.test.sql`
- `tests/test_capstone_flows.py`
- `tests/test_state_lifecycle.py`

## Privacy, release and scope confirmation

- Repository fixtures use fictional UUIDs, names and `example.invalid` addresses only.
- No raw personal text is written to Stage 10 audit traces.
- No agent/model receives database write authority or service-role credentials.
- The safety specification remains draft and public/live health behavior remains fail-closed.
- No external review packet, reminder or notification was sent.
- No remote migration, deployment, PR or merge was performed.
- The sealed holdout was not opened.

## Required action before a GO verdict

Approve updating the legacy `supabase/tests/stage2_security_and_lifecycle.test.sql` permission expectations so that, after the Stage 10 migration, it verifies owner-readable access plus denial of direct authenticated mutation for health facts, plans, plan items and simulated reviews. The total assertion coverage must be preserved or increased; no permission or safety rule will be weakened. After approval, rerun all 7 pgTAP files, all authenticated APIs, database lint, the full Python/checker suite and GitHub checks on the exact pushed commit. Only successful evidence permits changing this document to the controlled-engineering capstone GO verdict.
