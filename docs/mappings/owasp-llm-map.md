# OWASP LLM / GenAI Risk Mapping

| Risk area | Boilerplate control |
|---|---|
| Prompt injection | prompt policy, red-team evals, untrusted content rule |
| Insecure output handling | human review, test evidence, PR template |
| Sensitive information disclosure | data classification, secret scanning, tool policy |
| Supply-chain vulnerabilities | dependency audit, MCP inventory, SLSA artefact record |
| Excessive agency | permission matrix, approval gates, least privilege |
| System prompt leakage | instruction policy, no secrets in prompts |
| Tool misuse | tool-access map, audit log, forbidden-action evals |
| Model denial of service | monitoring plan, cost and usage tracking |
