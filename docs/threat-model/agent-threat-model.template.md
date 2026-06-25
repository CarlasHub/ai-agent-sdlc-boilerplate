# Agent Threat Model

## Agent name

[FILL_AGENT_NAME]

## Assets

- source code
- prompts
- user data
- tool credentials
- MCP server access
- build artefacts
- production systems

## Trust boundaries

| Boundary | Description | Risk |
|---|---|---|
| User prompt to agent | Natural-language instructions | prompt injection, ambiguity |
| Agent to tool | Tool calls and MCP actions | excessive agency, misuse |
| Agent to external content | Webpages, docs, tickets, Figma text | indirect prompt injection |
| Agent to codebase | Reads/writes files | insecure or out-of-scope changes |
| Agent to CI/CD | Build and release actions | unauthorised deployment |

## Threats

| Threat | Likelihood | Impact | Control | Owner |
|---|---|---|---|---|
| Prompt injection | [FILL] | [FILL] | [FILL] | [FILL] |
| Sensitive data disclosure | [FILL] | [FILL] | [FILL] | [FILL] |
| Excessive agency | [FILL] | [FILL] | [FILL] | [FILL] |
| Tool misuse | [FILL] | [FILL] | [FILL] | [FILL] |
| Supply-chain compromise | [FILL] | [FILL] | [FILL] | [FILL] |
| Unsafe code execution | [FILL] | [FILL] | [FILL] | [FILL] |

## Residual risk

[FILL_RESIDUAL_RISK]
