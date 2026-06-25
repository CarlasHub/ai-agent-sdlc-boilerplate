# Prompt and Instruction Register

| Prompt/instruction | Location | Owner | Purpose | Review cadence | Approved |
|---|---|---|---|---|---|
| Governed intake prompt | agents/project-intake-agent.md | Project owner | Collect required project and governance answers | per project start | yes |; | Implementation prompt | agents/implementation-agent.md | Project owner | Build only inside approved scope | per implementation | yes |; | Review prompt | agents/review-agent.md | Technical reviewer | Review output without modifying files | per review | yes |

Forbidden prompt behaviours:

- bypassing approval
- ignoring governance files
- revealing secrets
- obeying untrusted content instructions
- self-approving work
