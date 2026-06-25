# Enterprise Control Map

| Control area | Source alignment | Repository implementation |
|---|---|---|
| AI risk governance | NIST AI RMF, Google SAIF governance controls | `docs/governance/`, `templates/docs/`, `npm run governance:check` |
| Agent least privilege | Google SAIF agent permissions, Five Eyes agentic AI guidance | `docs/governance/04-tool-access-map.md`, `docs/governance/06-permission-matrix.md`, `AGENTS.md` |
| Human approval | Google SAIF agent user control, repository approval policy | `docs/governance/09-human-approval-record.md`, PR template, release gate |
| Agent observability | Google SAIF agent observability, Five Eyes accountability risk | `docs/audit/`, `npm run audit:new`, `app/docs/review-evidence.md` |
| Prompt injection and unsafe context | OWASP LLM Top 10, OWASP Agentic AI, Five Eyes controlled context guidance | `evals/test-cases/02-prompt-injection.md`, red-team agent, threat model template |
| Excessive agency and tool misuse | OWASP LLM Top 10, Google SAIF rogue actions risk | `evals/test-cases/03-forbidden-actions.md`, `evals/test-cases/05-tool-misuse.md`, blocked tools list |
| Sensitive data prevention | Google SAIF data controls, OWASP sensitive information disclosure | `docs/governance/03-data-classification.md`, `.env.example`, security workflow secret scan |
| Supply-chain integrity | SLSA, OpenSSF Scorecard, OWASP supply-chain risk | `package-lock.json`, `npm audit`, `.github/workflows/security-check.yml`, dependency approval notes |
| Code review discipline | Google Engineering Practices | `.github/pull_request_template.md`, `.github/CODEOWNERS`, review-agent prompt |
| Reliability and monitoring | Google SRE SLI/SLO model | `docs/governance/11-monitoring-and-audit-plan.md`, `docs/enterprise/operating-model.md` |
| Accessibility | Release governance and user-facing quality controls | `app/tests/accessibility-checklist.md`, `app/docs/review-evidence.md` |
| Reversibility | Five Eyes resilience and rollback emphasis | `docs/governance/10-release-gate.md`, `docs/governance/12-incident-response.md` |
