# Implementation Notes

## Project Blueprint Starter Implementation

The local app now generates governed project ZIP files entirely in the browser.

Design decisions:

- No backend service is used.
- No dependencies are added.
- ZIP generation uses a small local uncompressed ZIP writer.
- Generated projects default to implementation blocked unless optional human approval fields are completed.
- Generated projects include governance docs, agent prompts, eval cases, audit templates, CI workflows, npm gate scripts and a starter app scaffold.
- The Governed Agent Team option adds specialist team-agent prompts, component governance, accessibility and responsive QA, commerce/payment boundary rules, handoff packaging guidance and extra eval cases.
- ZIP download cleanup is deferred until after link click dispatch to avoid cancelling browser download handling.
- Route changes move focus to the primary `h1` so keyboard and screen-reader users are not left on a stale control after view changes.
- The WP template folder was used as reference for governance patterns only: token-first design, reusable components, accessibility notes, responsive handoff, payment UI boundaries, open questions and packaging evidence.

Assumptions:

- Generated ZIP files are intended as starter workspaces, not production releases.
- Teams will replace default owners and approval records with real human reviewers.
- Reference design assets remain outside generated packages unless separately approved.

Checks:

- `node --check app/src/main.js`
- `node --check app/src/features/project-builder/app.js`
- `node --check app/src/features/project-builder/templates.js`
- `node --check app/src/features/project-builder/zip.js`
- `npm run app:verify-zip`
- `npm run app:verify-behavior`
