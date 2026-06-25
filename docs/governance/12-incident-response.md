# Incident Response Plan

Incident owner: Project owner.

Escalation contacts:

Project owner, technical reviewer and accessibility reviewer.

Disable procedure:

Stop the local agent session, revoke tool permissions, remove any configured MCP access, stop running scripts and block further implementation until review is complete.

Rollback procedure:

Stop the agent, preserve logs, identify changed files, revert unsafe changes with Git, restore the last approved state, document the incident and update prompts, tests or permissions before retrying.

Evidence preservation:

Preserve terminal output, audit logs, changed file list, Git diff, generated artefacts, review notes and incident notes inside docs/audit/ and docs/governance/.

Post-incident improvement process:

Lessons are added by updating agent instructions, eval cases, permission rules, governance templates, test plans and the decision log before the agent is allowed to continue.
