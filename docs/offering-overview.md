# Offering Overview

## What this project is

AI-Agent SDLC Boilerplate is a local project builder for governed AI-agent work. It helps teams turn an intended AI-assisted job into a reviewable project package before any implementation agent starts writing production code.

The main offer is simple:

```text
Describe the job
→ define governance and safety boundaries
→ generate a complete starter workspace
→ review evidence and approval gates
→ export a ZIP for implementation handoff
```

## What the builder generates

The exported package includes:

- project README and starter app files
- governance documents for scope, risk, data, tools, workflow and release
- role-specific agent prompts
- job-specific quality rubric and output schema
- safety boundaries for blocked data, blocked tools and stop conditions
- eval cases for agent behaviour, security and approval gates
- profile packs that can be reused across jobs
- audit and provenance evidence
- GitHub workflow templates for governance, security and release checks
- approval records that keep implementation blocked until human sign-off is recorded

## Who it is for

Use it when a team wants to use agents for work such as:

- QA auditing
- implementation planning
- security review
- documentation review
- data stewardship
- release review
- front-end demo scaffolding
- internal tool generation
- multi-agent delivery handoff

The boilerplate is especially useful when several people need to review what an agent will be allowed to do before the work starts.

## Problems it solves

AI-assisted delivery often fails because the agent begins with unclear permissions, vague acceptance criteria or no review trail. This project makes those controls explicit.

It helps teams establish:

- clear job scope
- accountable owners
- data classification
- least-privilege tool access
- blocked actions
- evidence requirements
- human approval before implementation
- release approval as a separate gate
- reusable eval cases
- auditability for meaningful agent actions

## What it does not provide

This project does not run agents for you, store secrets, connect to production systems, deploy infrastructure or replace human review. It generates the governed project structure and evidence that an implementation workflow can use after approval.

Production teams should still adapt CODEOWNERS, branch protection, security review, privacy review, data retention, incident response and compliance controls to their own organisation.
