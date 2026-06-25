# AI-Agent Incident Response Policy

## Incident examples

- agent accesses unauthorised data
- agent exposes secrets
- agent modifies out-of-scope files
- agent deploys without approval
- agent follows prompt injection
- agent produces harmful or insecure output
- agent performs unexpected tool action

## Response steps

1. Stop or disable the agent.
2. Preserve logs and artefacts.
3. Identify tools and data accessed.
4. Assess impact.
5. Notify owners.
6. Roll back if required.
7. Patch prompts, permissions or tools.
8. Add regression eval.
9. Record lesson learned.
