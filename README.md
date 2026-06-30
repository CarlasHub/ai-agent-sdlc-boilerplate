# AI-Agent SDLC Enterprise Boilerplate

A governance-first starter repository for teams building software with AI agents, MCP servers, coding assistants, browser agents, Figma-to-code agents, documentation agents, database agents, or workflow agents.

This repository is deliberately designed so implementation **cannot start first**.

The first action is always:

```text
Intake questions
→ Fill governance documentation
→ Validate placeholders and gates
→ Human approval
→ Implementation begins
```

## What problem this solves

AI agents can read context, call tools, generate code, create files, inspect browsers, query systems, create pull requests and produce artefacts. That means they need the same discipline as software delivery, plus extra controls for tool access, prompt injection, excessive agency, data exposure, auditability and human approval.

This boilerplate gives teams a repeatable AI-Agent SDLC operating model.

## What this offers

This project offers a governed project-builder experience for teams that want to use AI agents without letting implementation start ahead of scope, risk, evidence and approval.

The browser builder lets a team describe an AI-assisted job once, then export a review-ready ZIP that contains:

- a starter project workspace
- governance documents
- role-specific agent prompts
- job-specific quality rubrics
- safety boundaries and stop rules
- evaluation cases
- audit and provenance records
- CI governance workflows
- release and human-approval gates
- a local app scaffold for approved demo or internal-tool work

The output is designed for review before implementation. It helps answer practical questions:

- What is this agent allowed to do?
- Which data can it use?
- Which tools are blocked?
- Who owns risk, data and release decisions?
- What evidence must exist before a reviewer accepts the work?
- Which checks prevent implementation or release?

The builder currently supports several starter project shapes, including front-end demos, agent workflows, internal tools, documentation systems and governed multi-agent delivery teams. It also supports job profiles such as QA auditor, security reviewer, data steward, implementation builder, release manager and documentation reviewer, so the generated governance changes with the work being performed.

This is not an agent runtime, SaaS backend or automatic deployment system. It is a governance-first starter kit and evidence generator for teams preparing AI-agent-assisted work.

## Foundation

This is a proposed enterprise-style framework built from established practices:

- SDLC and DevSecOps
- MLOps lifecycle thinking
- NIST AI RMF: Govern, Map, Measure, Manage
- ISO/IEC 42001 AI management-system principles
- OWASP Top 10 for LLM and GenAI risks
- Microsoft SDL-style threat modelling and security gates
- SLSA-style artefact provenance and supply-chain integrity
- Agent-specific governance: least privilege, tool mapping, audit logs, human approval and continuous monitoring

It is not an official universal standard. It is a practical framework for teams that want disciplined AI-agent delivery.

## Repository structure

```text
.github/
  workflows/                 CI enforcement gates
  copilot-instructions.md     GitHub Copilot governance instructions
  pull_request_template.md    Required PR evidence template
  CODEOWNERS                  Ownership gates
.agent-sdlc/
  project.answers.example.json
  governance-status.example.json
app/
  index.html                  Local front-end demo entry point
  src/                        Application source modules
  src/data/                   Fictional public sample data
  src/features/               Feature-owned implementation modules
  src/lib/                    Shared local helpers
  tests/                      Manual and accessibility test evidence
  docs/                       Agent handoff and implementation evidence
agents/
  project-intake-agent.md
  implementation-agent.md
  review-agent.md
  red-team-agent.md
  release-agent.md
docs/
  offering-overview.md        What the project offers and what it generates
  enterprise/                 Enterprise architecture, operating model and source-backed readiness model
  framework/                  AI-Agent SDLC framework and maturity model
  governance/                 Generated governance artefacts
  policies/                   Team policy templates
  threat-model/               Agent threat model and risk register
  mappings/                   Mapping to NIST, ISO, OWASP, SLSA, SDL
  audit/                      Logs and evidence templates
evals/
  test-cases/                 Agent behaviour and security evaluation cases
scripts/
  init-agent.mjs              Required intake and documentation generator
  validate-governance.mjs     Blocks implementation until gates pass
  evaluate-agent.mjs          Checks eval case coverage
  create-audit-event.mjs      Creates audit log entries
  enterprise-readiness.mjs    Enterprise platform readiness gate
  serve-app.mjs               Dependency-free local static app server
  release-gate.mjs            Release readiness check
templates/
  intake-questions.json       Required pre-project questions
  docs/                       Placeholder-based document templates
```

## Required first step

Run:

```bash
npm run governance:init
```

The intake script asks the required project questions, then generates the governance documents from templates.
It also creates a dependency-free `app/` scaffold for the approved local demo workspace so implementation agents have a clear source, data, docs and test structure to work inside after approval.

After the documents are generated, the agent must stop.

A human must review the generated documents and explicitly approve implementation by updating:

```text
docs/governance/09-human-approval-record.md
```

Set:

```text
APPROVED_FOR_IMPLEMENTATION: yes
```

Then run:

```bash
npm run governance:check
npm run enterprise:check
```

If placeholders remain, if required documents are missing, or if approval is not recorded, the check fails.
If enterprise control evidence is missing, `enterprise:check` fails and writes `.agent-sdlc/enterprise-readiness.json`.

## Agent rule

Any AI agent working in this repo must follow this rule:

```text
No implementation work is allowed until governance:check passes.
```

This rule is repeated in:

- `AGENTS.md`
- `.github/copilot-instructions.md`
- `agents/implementation-agent.md`
- `.cursor/rules/ai-agent-sdlc.mdc`
- `CLAUDE.md`
- `codex/AGENTS.md`

## Setup

```bash
npm install
npm run governance:init
npm run governance:check
npm run evals:check
```

## What counts as an artefact

In this framework, an artefact is any output produced or modified by an AI agent, including:

- code
- prompts
- tests
- documentation
- generated configs
- pull request summaries
- logs
- design notes
- release notes
- monitoring reports
- risk records
- MCP tool mappings

Every important artefact should be traceable to a request, agent, tool, reviewer and approval decision.

## Intended use

Use this boilerplate when starting a project where AI agents may be used to:

- write or edit code
- inspect a repository
- use MCP servers
- inspect Figma designs
- inspect browser DevTools
- create pull requests
- summarise tickets
- query databases
- write documentation
- produce release notes
- analyse logs or monitoring data

## Non-negotiables

- Do not start implementation before intake and approval.
- Do not grant broad tool access by default.
- Do not let an agent approve its own work.
- Do not let an agent access secrets.
- Do not let an agent deploy to production without release governance.
- Do not accept AI output without evidence and review.
- Do not treat prompts as disposable. Version and review them.

## Commands

```bash
npm run governance:init       # asks questions and generates docs
npm run governance:check      # validates docs, placeholders and approval
npm run evals:check           # checks required agent evaluation cases exist
npm run enterprise:check      # checks enterprise readiness controls and source-backed evidence
npm run qa:audit              # writes structured QA findings to .agent-sdlc/qa-audit-report.json
npm run test:functionality    # verifies policy rules, profile packs, provenance and generated packages
npm run app:serve             # serves the local project builder at localhost
npm run audit:new             # creates a timestamped audit event template
npm run release:gate          # validates release-readiness evidence
npm run check                 # runs all checks
```

## Status

This is a serious enterprise-style boilerplate, but your organisation should still map it to its own legal, security, privacy, data-protection and compliance requirements before production use.
