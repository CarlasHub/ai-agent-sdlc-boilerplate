# AI-Agent SDLC Framework

## Purpose

The AI-Agent SDLC Framework defines a governed lifecycle for teams building or operating AI agents that can use tools, access context, produce artefacts, and perform actions.

It extends traditional SDLC with controls for:

- agent scope
- tool access
- MCP server use
- prompt and instruction governance
- risk classification
- human approval
- agent behaviour evaluation
- threat modelling
- audit logging
- release gates
- monitoring
- continuous improvement

## Lifecycle model

```text
1. Identify
2. Classify
3. Govern
4. Design
5. Configure tools
6. Build prompts and workflow
7. Test and red-team
8. Human review
9. Release under control
10. Monitor and audit
11. Improve
```

## Stage 1: Identify

Define why the agent exists and what outcome it supports.

Required artefacts:

- Agent charter
- Business justification
- Owner
- Success criteria

Gate:

- No agent may be built without a documented purpose and owner.

## Stage 2: Classify

Classify risk before granting tools.

Risk levels:

- Low: read-only, no sensitive data, no external action
- Medium: reads internal data or drafts outputs requiring approval
- High: writes files, creates PRs, calls APIs, uses private systems
- Critical: touches production, secrets, payments, regulated data, customer data or infrastructure

Gate:

- High and critical agents require security and governance review.

## Stage 3: Govern

Define policies, ownership and approval routes.

Required artefacts:

- Human approval policy
- Tool-access policy
- Data classification
- Permission matrix
- Review owners

Gate:

- No broad access without documented justification.

## Stage 4: Design

Design the agent as a modular workflow.

Prefer small role-specific agents:

- intake agent
- requirements agent
- code inspection agent
- implementation agent
- test agent
- security review agent
- accessibility review agent
- release agent
- monitoring agent

Gate:

- One agent should not do everything unless the risk is low and the tool access is read-only.

## Stage 5: Configure tools

List every tool and MCP server.

Required artefacts:

- MCP server inventory
- Tool-access map
- Data-access register
- Permission matrix

Gate:

- Unknown tools are blocked.
- Write-capable tools require approval.

## Stage 6: Build prompts and workflow

Prompts, instructions and policies are part of the system.

They must be:

- versioned
- reviewed
- scoped
- explicit about forbidden actions
- explicit about evidence requirements
- explicit about fallback behaviour

Gate:

- Agents must not operate from vague prompts.

## Stage 7: Test and red-team

Test both output and behaviour.

Required test categories:

- normal task completion
- scope adherence
- prompt injection resistance
- forbidden action refusal
- sensitive data protection
- tool misuse prevention
- hallucination and unsupported claim control
- audit logging
- approval gate behaviour

Gate:

- High-risk agents require adversarial tests before release.

## Stage 8: Human review

Human review is required for meaningful changes.

Review checks:

- scope
- correctness
- security
- privacy
- accessibility where relevant
- performance where relevant
- tool access
- test evidence
- rollback plan

Gate:

- No self-approval by the same agent that produced the artefact.

## Stage 9: Release under control

Release through normal SDLC and DevSecOps processes.

Required artefacts:

- release gate checklist
- approval record
- rollback plan
- monitoring plan
- known risks

Gate:

- No production release without traceable approval and rollback path.

## Stage 10: Monitor and audit

Monitor the agent after release.

Track:

- tool calls
- blocked actions
- approval requests
- failures
- rejected outputs
- data access
- token and cost usage
- user reports
- security events
- regressions

Gate:

- Agents without logs are not production-ready.

## Stage 11: Improve

Use findings to improve prompts, policies, tests, permissions and documentation.

Improvement triggers:

- repeated wrong outputs
- repeated human rejection
- excessive tool access
- failed evals
- incidents
- new risks
- new tools
- regulatory changes

Gate:

- Governance must be maintained, not only created once.
