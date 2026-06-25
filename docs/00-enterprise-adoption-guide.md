# Enterprise Adoption Guide

## Minimum production controls

Before using this boilerplate in production, configure:

- branch protection
- required GitHub Actions checks
- CODEOWNERS with real teams
- secret scanning
- dependency scanning
- approved MCP server registry
- central audit log location
- incident response owner
- data-protection review
- security review for high-risk agents
- legal/compliance review for regulated domains

## Recommended rollout

1. Start with one low-risk read-only agent.
2. Complete the governance intake.
3. Run evals manually.
4. Enable CI gates.
5. Review audit logs weekly.
6. Add write access only after evidence.
7. Move to high-risk agents only after the operating model is proven.
