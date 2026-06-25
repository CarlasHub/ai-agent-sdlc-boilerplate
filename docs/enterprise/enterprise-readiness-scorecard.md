# Enterprise Readiness Scorecard

Use this scorecard before presenting the boilerplate as an internal team platform.

| Domain | Level 1 | Level 2 | Level 3 |
|---|---|---|---|
| Governance | Intake exists | Approval gates are enforced locally | Gates are enforced in CI with named owners |
| Data control | Data class is documented | Blocked data is explicit | Data checks are automated and audited |
| Tool access | Tool map exists | Least privilege is enforced by agents | Tool grants are time-bound and centrally reviewed |
| Agent security | Basic agent prompts exist | Prompt injection and tool misuse evals exist | Red-team results feed back into prompts and controls |
| Evidence | Audit templates exist | Audit events are created for meaningful work | Evidence is queryable across teams and releases |
| Supply chain | npm audit exists | Dependencies require approval | SLSA-style provenance and artifact integrity are enforced |
| Code review | PR template exists | Independent reviewer is required | CODEOWNERS and branch protection enforce reviewer independence |
| Reliability | Monitoring plan exists | SLIs and SLOs are documented | SLO breaches trigger incident and rollback workflows |
| Accessibility | Checklist exists | Review evidence is collected | Accessibility is a release gate for user-facing work |
| Release | Release gate exists | Release owner approval is required | Release evidence, rollback and post-release monitoring are audited |

## Current Position

This repository is at Level 2 for a local controlled demo after governance approval. To be ready for an enterprise fleet of teams, the next upgrades are:

- Replace placeholder CODEOWNERS with real teams.
- Wire `npm run enterprise:check` into CI.
- Add a real eval harness behind the eval case files.
- Add dependency review and SBOM generation when dependencies are approved.
- Add structured audit storage if multiple repos will report into one governance view.
- Define SLIs/SLOs for the agent workflow and user-facing demo.
