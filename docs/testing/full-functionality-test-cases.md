# Full Functionality Test Cases

These cases verify the boilerplate as a governed product, not only as a visual UI.

## TC-01 Governance Gate

Purpose: verify implementation stays blocked until required governance and approval evidence exist.

Steps:

1. Run `npm run governance:check`.
2. Confirm all required governance docs exist.
3. Confirm `APPROVED_FOR_IMPLEMENTATION: yes` is present only after human approval.
4. Confirm `.agent-sdlc/policy-status.json` exists and has `status: passed`.

Expected result: governance passes only when documents, human approval and policy status are complete.

## TC-02 Policy Engine

Purpose: verify risk, data, secrets and approval conditions are enforced.

Steps:

1. Run `npm run test:functionality`.
2. Review the regulated-data scenario.
3. Review the secrets-required scenario.
4. Review the approval-with-policy-blockers scenario.

Expected result: regulated low-risk data and secrets block implementation readiness even when approval fields are filled.

## TC-03 QA Auditor

Purpose: verify the project can audit itself and generated packages with structured findings.

Steps:

1. Run `npm run qa:audit`.
2. Open `.agent-sdlc/qa-audit-report.json`.
3. Confirm findings include severity, title, evidence, reproduction, impact, recommendation, owner, status and reviewer decision.

Expected result: the QA audit passes for the current repo and writes a machine-readable report.

## TC-04 Profile Packs

Purpose: verify governance can be personalized by job.

Steps:

1. Open `profile-packs/index.json`.
2. Confirm every starter job profile has a matching JSON pack.
3. Open `profile-packs/qa-auditor.json`.
4. Confirm QA Auditor scope, rubric, evidence, escalation, output schema and stop rules are present.

Expected result: profile packs are reusable, machine-readable and aligned with the builder job profile list.

## TC-05 Provenance

Purpose: verify structured audit and provenance records exist.

Steps:

1. Open `.agent-sdlc/package-manifest.json`.
2. Open `.agent-sdlc/provenance.json`.
3. Open `.agent-sdlc/audit-events.jsonl`.
4. Confirm generated packages include their own `.agent-sdlc/package-manifest.json`, `.agent-sdlc/provenance.json` and `.agent-sdlc/audit-events.jsonl`.

Expected result: repo and generated packages have structured provenance and audit records.

## TC-06 Builder Journey

Purpose: verify the UI exposes the complete guided workflow without adding unrelated dashboard clutter.

Steps:

1. Run `npm run app:serve`.
2. Open the local URL.
3. Confirm the scan path is Builder steps, Package status, Agent SDLC boilerplate, Configure package, Package summary.
4. Select QA Auditor as the job profile.
5. Confirm the preview updates agent roles, eval coverage, policy checks and approval state.
6. Enter approval fields.
7. Confirm approval remains blocked if a policy blocker exists.

Expected result: the user can understand next action, policy status and export readiness without reading unrelated placeholder sections.

## TC-07 Generated ZIP

Purpose: verify exported packages contain the full governed functionality.

Steps:

1. Run `npm run app:verify-zip`.
2. Confirm the generated ZIP extracts successfully.
3. Confirm the ZIP contains governance docs, profile packs, policy status, QA audit script, full functionality tests, provenance and audit stream.
4. Confirm `package.json` in the generated ZIP includes `qa:audit` and `test:functionality`.

Expected result: every generated package can be audited, tested, reviewed and traced.
