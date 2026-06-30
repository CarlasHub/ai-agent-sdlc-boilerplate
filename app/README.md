# Project Blueprint Starter

Project Blueprint Starter is a local front-end for generating governed AI-Agent SDLC starter ZIP files.

## What the app offers

The app gives users a guided browser workflow for creating a governed AI-agent project package. It is meant to be used before implementation starts, so the project has clear scope, ownership, safety boundaries, evals and approval evidence.

The builder captures:

- project name, type and purpose
- job profile, such as QA auditor or security reviewer
- owner, users, risk level and data class
- personal-data and secrets boundaries
- job scope, decision rubric and evidence requirements
- output schema and escalation rules
- blocked data, blocked tools and stop rules
- approvers, data owner, release owner and risk rationale
- optional human implementation approval details

The export creates a ZIP with a governed starter workspace, governance docs, agent roles, eval cases, profile packs, audit records, CI workflow templates and local app files.

## User journey

1. Configure the package in the Builder section.
2. Review the package summary and approval state.
3. Keep implementation blocked, or record a real human approval when appropriate.
4. Export the governed package.
5. Open the generated project and review the folders, governance docs, agent prompts and evals before implementation work starts.

## Scope

- Let users start a governed project from the browser.
- Let users choose the project type and capture governance inputs.
- Generate a downloadable ZIP with required project files, governance docs, agent prompts, evals, audit templates, CI workflows and a local app scaffold.
- Include a Governed Agent Team option for component-led template delivery, inspired by the inspected WP template handoff pattern: design tokens, component maps, accessibility notes, commerce/payment boundaries, developer handoff and packaging evidence.
- Keep the local demo boundary to approved public or fictional sample data.
- Do not use paid APIs, backend services, secrets, production systems, real client data, real candidate data or personal data.

## Structure

```text
app/
  index.html
  src/
    main.js
    styles.css
    features/
      project-builder/
        app.js
        templates.js
        zip.js
    lib/
      dom.js
  tests/
    accessibility-checklist.md
    manual-test-plan.md
  docs/
    agent-handoff.md
    implementation-notes.md
    review-evidence.md
```

## Agent Rules

- Run `npm run governance:check` before implementation work.
- Record meaningful work with `npm run audit:new`.
- Keep implementation inside this approved local demo scope.
- Treat `/Users/Carla/Documents/WP-templates` as reference material only. Do not copy private/source design assets into generated packages unless a human explicitly approves that scope.

## Verification

- `node --check app/src/main.js`
- `node --check app/src/features/project-builder/app.js`
- `node --check app/src/features/project-builder/templates.js`
- `node --check app/src/features/project-builder/zip.js`

## Run Locally

```bash
npm run app:serve
```

Then open the URL printed by the command.
