# Agent Workflow Design

Workflow pattern:

The workflow is modular: intake agent collects answers and fills templates, implementation agent builds only after approval, review agent checks scope and evidence, red-team agent checks unsafe behaviour, release agent checks release readiness and monitoring agent reviews post-release signals.

Agent modules:

Project intake agent: asks required questions and fills governance templates. Implementation agent: updates approved project files only. Review agent: checks scope, tests and documentation. Red-team agent: checks prompt injection, data leakage and forbidden actions. Release agent: checks release gate. Monitoring agent: reviews logs, defects and incidents.

Handoff rules:

Agents must summarise completed work, list modified files, identify unresolved risks, provide evidence and stop for human review before another agent or stage continues.

Failure behaviour:

The agent must stop, explain the blocker, ask for missing information and avoid inventing answers or bypassing governance controls.

Escalation path:

Project owner and technical reviewer.
