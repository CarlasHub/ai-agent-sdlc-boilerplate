# Policy Checks

Status: passed

Score: 100/100

| Check | Result | Policy | Evidence |
|---|---|---|---|
| risk-data-alignment | pass | Risk level matches data class | Public fictional data with medium risk is acceptable for the approved demo scope. |
| regulated-data-escalation | pass | Regulated and personal data escalate to high risk | Regulated and personal data are out of scope. |
| personal-data-boundary | pass | Personal data is explicitly blocked or governed | Personal data is blocked in the data classification and tool boundaries. |
| secrets-blocked | pass | Secrets remain denied | Secrets, API keys, credentials and tokens are blocked. |
| least-privilege-tools | pass | Blocked tools protect real systems | Production deployment tools, real databases, HR systems, client systems and secret stores are blocked. |
| approval-owner-coverage | pass | Approval roles cover governance and security | Project owner, technical reviewer, accessibility reviewer and AI governance reviewer are recorded. |
| approval-scope-boundary | pass | Approval scope preserves deployment and data limits | Approval is limited to fictional data, no secrets and release-approved GitHub Pages only. |
| qa-auditor-independence | pass | QA auditor cannot self-approve or edit audited work | QA Auditor profile forbids self-approval and modifying audited output. |
| evidence-is-actionable | pass | Evidence requirements support reproducibility | QA evidence includes reproduction steps, files, screenshots, impact and recommended fixes. |
| stop-rules-cover-bypass | pass | Stop rules block unsafe bypasses | Agent rules block real data, secrets, approval bypass and self-approval. |

## Blocking Issues

none

## Warnings

none
