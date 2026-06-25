# Visual Model

```text
                         GOVERNANCE WRAPPER
        policies | ownership | approvals | audit | risk controls

  ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐
  │ Identify │ → │ Classify │ → │  Design  │ → │ Configure│
  └──────────┘   └──────────┘   └──────────┘   └──────────┘
                                                   │
                                                   ▼
  ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐
  │ Improve  │ ← │ Monitor  │ ← │ Release  │ ← │  Test    │
  └──────────┘   └──────────┘   └──────────┘   └──────────┘
                                                   ▲
                                                   │
                                             ┌──────────┐
                                             │  Review  │
                                             └──────────┘

Cross-cutting controls:
- least privilege
- prompt governance
- MCP inventory
- data classification
- tool-call logging
- security testing
- human approval
- provenance
- rollback
```
