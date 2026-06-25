# AI-Agent SDLC Maturity Model

## Level 0: Uncontrolled prompting

People use AI informally. No records, no review, no tool governance.

Risks:

- hidden data exposure
- inconsistent outputs
- no audit trail
- no accountability

## Level 1: Documented usage

The team has basic rules and reusable prompts.

Expected controls:

- basic usage policy
- human review
- no secrets in prompts

## Level 2: Governed project intake

Projects using agents must complete intake before implementation.

Expected controls:

- agent charter
- risk classification
- tool map
- data classification
- approval gate

## Level 3: Tool-connected governance

Agents use tools or MCP servers under documented permissions.

Expected controls:

- MCP inventory
- permission matrix
- audit logs
- prompt injection tests
- release gates

## Level 4: Integrated enterprise workflow

Agent governance is integrated into CI/CD, security, PR review and monitoring.

Expected controls:

- CI enforcement
- CODEOWNERS
- threat model
- eval suite
- incident response
- evidence-based PR template

## Level 5: Continuously improved and audited

Agents are monitored, audited and improved continuously.

Expected controls:

- regular access review
- eval trend tracking
- incident learning loop
- control mapping
- governance metrics
- independent review for critical agents
