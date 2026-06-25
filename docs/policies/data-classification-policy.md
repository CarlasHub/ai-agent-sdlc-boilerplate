# Data Classification Policy

## Classes

| Class | Description | Agent access |
|---|---|---|
| Public | Approved public information | Allowed |
| Internal | Internal project information | Allowed with project approval |
| Confidential | Sensitive business information | Restricted |
| Personal data | Data identifying a person | Restricted and logged |
| Regulated data | Legal, financial, health or protected data | Critical approval required |
| Secrets | API keys, passwords, tokens, private keys | Never allowed |

## Rule

Agents must not access data above the approved class documented in `docs/governance/03-data-classification.md`.
