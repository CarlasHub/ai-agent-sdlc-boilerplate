# Job Governance Profile

Selected profile: General Delivery

Profile purpose:

Balanced governance for implementation, review, documentation and release evidence work on the AI-Agent SDLC Boilerplate.

## Allowed Job Scope

Governance applies to the requested local project work, generated files, review evidence and release readiness only.

## Decision Rubric

Pass when scope is clear, checks pass, evidence is recorded, risks are named and approval gates remain intact.

## Evidence Requirements

Changed file list, tests run, assumptions, unresolved risks, reviewer notes and approval status.

## Escalation Rules

Escalate when scope changes, approval is missing, checks fail, risks are unclear or the agent needs unapproved tools.

## Required Output Schema

Summary, confirmed facts, assumptions, files changed, tests run, risks, approval status and next action.

## Stop Rules

Stop before secrets, real data, deployment outside the release-approved GitHub Pages scope, destructive changes, approval bypass or work outside the documented scope.

## Governance Condition

If requested work does not fit this profile, the agent must stop, record the mismatch and request a human governance decision before continuing.
