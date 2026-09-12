# Historical report index

Reports in this repository preserve the truth at the commit and branch named inside each file. Statements such as “not pushed,” “not merged,” “Stage 6 is next,” or lower migration/test counts are historical pre-merge snapshots; they are not current-state claims and are not rewritten after the fact.

Current status is defined by `NESTLINE-CURRENT-STATUS.md`, the generated capability/evaluation manifests and the consolidated final report. The Stage 5–10 handoff files remain useful implementation evidence, while `NESTLINE-STAGES-5-TO-10-FINAL-INTEGRATED-VERIFICATION.md` records the integration preceding merged PR #4. Stage 0–4 reports likewise remain stage-specific historical evidence.

When counts differ, use the canonical generated manifest for the current denominator and retain the old count as evidence from its original run. When code behaviour differs, rerun the current checker against the current commit rather than assuming an older GO still applies.
