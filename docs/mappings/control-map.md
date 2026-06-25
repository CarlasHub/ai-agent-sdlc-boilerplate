# Control Mapping

This file maps this boilerplate to established governance and security concepts. It is not a certification claim.

| Boilerplate control | NIST AI RMF | ISO/IEC 42001 concept | OWASP LLM / GenAI | SLSA / supply chain | SDL / DevSecOps |
|---|---|---|---|---|---|
| Agent charter | Govern, Map | AI system scope | Excessive agency context | Source definition | Requirements |
| Risk classification | Map, Measure | Risk assessment | All LLM risks | Build risk | Threat modelling |
| Tool-access map | Govern, Manage | Operational controls | Excessive agency, tool misuse | Build system boundary | Least privilege |
| MCP inventory | Map | Supplier/tool management | Supply chain, prompt injection | Dependency provenance | Architecture review |
| Data classification | Map, Manage | Data governance | Sensitive information disclosure | Artefact boundary | Privacy review |
| Prompt policy | Govern | Operational control | Prompt injection | Reproducibility | Secure design |
| Agent evals | Measure | Performance evaluation | Prompt injection, output handling | Verification | Security testing |
| PR evidence | Manage | Documented evidence | Insecure output handling | Provenance | Code review |
| Release gate | Manage | Change management | Excessive agency | Release integrity | Release control |
| Audit log | Govern, Manage | Monitoring and measurement | Sensitive data, agency | Provenance | Logging |
| Incident response | Manage | Corrective action | All risks | Recovery | Incident response |
| Continuous improvement | Govern | Continual improvement | Risk updates | SLSA improvement | Lessons learned |
