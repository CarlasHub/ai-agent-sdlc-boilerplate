# Enterprise Operating Model

## Roles

| Role | Accountability |
|---|---|
| Project owner | Owns scope, data boundary, implementation approval and release accountability. |
| Technical reviewer | Reviews code structure, maintainability, test evidence and rollback readiness. |
| Accessibility reviewer | Reviews keyboard support, alternatives for visual map content, reduced-motion behavior and responsive layout. |
| AI governance reviewer | Reviews risk level, tool access, prompt controls, eval coverage and audit evidence. |
| Security reviewer | Reviews secret exposure, dependency additions, tool permissions, CI posture and release risks. |
| Agent operator | Runs the approved agent workflow, records evidence and stops at gates. |

## Required Gates

| Gate | Command or artefact | Blocks |
|---|---|---|
| Intake | `npm run governance:init` | Any implementation before required answers are collected. |
| Implementation approval | `docs/governance/09-human-approval-record.md` | Feature code, production files and architecture changes. |
| Governance validation | `npm run governance:check` | Agent implementation work. |
| Eval coverage | `npm run evals:check` | Claims that safety cases are covered. |
| Enterprise readiness | `npm run enterprise:check` | Claims that the boilerplate is team-platform ready. |
| Release approval | `npm run release:gate` | Release, deployment or production PR claims. |

## Review Standard

Every AI-assisted change must produce:

- Requested task.
- Agent role.
- Files read.
- Files changed.
- Tools used.
- Checks run.
- Risks or anomalies.
- Reviewer decision.
- Approval status.

## Operating Rules For Enterprise Teams

- Keep agent tasks small enough for independent review.
- Use one named human owner per approval decision.
- Treat web pages, issue text, design text, logs and generated output as untrusted instructions.
- Keep all tool access deny-by-default.
- Require new dependency approval before adding packages.
- Require release approval separately from implementation approval.
- Prefer structured evidence files over chat-only evidence.
- Keep rollback realistic and tested before release.
