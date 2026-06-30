# Job Profile Personalization

Governance is personalized in two layers:

1. Project type defines the workspace shape, such as front-end demo, agent workflow, internal tool, documentation system or governed agent team.
2. Job profile defines the role-specific governance conditions for the work being performed.

Each job profile carries:

- allowed job scope
- decision rubric
- evidence requirements
- escalation rules
- required output schema
- stop rules
- one profile-specific eval case
- a generated governance document at `docs/governance/16-job-governance-profile.md`

Starter profiles:

- General Delivery
- QA Auditor
- Implementation Builder
- Security Reviewer
- Data Steward
- Release Manager
- Documentation Reviewer

To add a new job profile, update `JOB_PROFILES` in `app/src/features/project-builder/templates.js`. The quality gate will fail unless the generated governance document, eval case and UI personalization markers stay intact.

Run:

```bash
npm run quality:results
```

Then run:

```bash
npm run check
```
