# Enterprise Source Research Brief

Verified on 2026-06-04 for the AI-Agent SDLC Enterprise Boilerplate.

## Primary Sources Used

| Source | Why it matters for this boilerplate | Implementation consequence |
|---|---|---|
| [Google Secure AI Framework controls](https://www.saif.google/secure-ai-framework/controls) | Defines AI controls across data, infrastructure, model, application, assurance and governance, including agent user control, agent permissions and agent observability. | Keep tool permissions least-privilege, require user approval for state-changing agent actions, and make agent actions auditable. |
| [NIST AI Risk Management Framework](https://www.nist.gov/itl/ai-risk-management-framework) | Frames AI risk management around trustworthy design, development, use and evaluation. | Keep intake, risk classification, evaluation and residual-risk evidence as first-class artefacts. |
| [OWASP Agentic AI Threats and Mitigations](https://genai.owasp.org/resource/agentic-ai-threats-and-mitigations/) | Provides an agentic-threat reference for autonomous systems enabled by LLMs and generative AI. | Maintain agent-specific threat modelling, red-team cases and tool-misuse evals. |
| [OWASP Top 10 for Large Language Model Applications](https://owasp.org/www-project-top-10-for-large-language-model-applications/) | Tracks application-layer GenAI risks such as prompt injection, insecure output handling, supply-chain vulnerabilities, sensitive information disclosure and excessive agency. | Require prompt-injection, output validation, data-boundary and agency-limit checks. |
| [Careful Adoption of Agentic AI Services](https://media.defense.gov/2026/Apr/30/2003922823/-1/-1/0/CAREFULADOPTIONOFAGENTICAISERVICES_FINAL.PDF) | Five Eyes guidance recommends careful adoption, low-risk and non-sensitive tasks, no broad access, lifecycle security, continuous monitoring and resilient design. | Keep the first version local, fictional-data-only, reversible and human-approved before implementation or release. |
| [Google Engineering Practices](https://google.github.io/eng-practices/) | Documents reviewer and change-author expectations for code review. | Require PR evidence, reviewer independence, small scoped changes and clear review ownership. |
| [Google SRE Service Level Objectives](https://sre.google/sre-book/service-level-objectives/) | Establishes SLI/SLO thinking for measurable reliability. | Track meaningful local demo and agent-process indicators rather than vague confidence claims. |
| [SLSA](https://slsa.dev/spec/v1.2/about) | Provides an incrementally adoptable supply-chain security framework. | Preserve provenance, CI evidence, dependency controls and release gates. |
| [OpenSSF Scorecard](https://openssf.org/scorecard/) | Gives maintainers and consumers signals for open-source security posture. | Add security posture checks and keep repository hygiene visible. |

## Enterprise Interpretation

This project should act like a controlled internal platform, not a loose prompt pack. A team should be able to answer:

- What is the agent allowed to do?
- What data is allowed?
- Which tools can it use?
- Which approval gates passed?
- Which evals covered unsafe behavior?
- Which reviewer checked the output?
- Which evidence would explain or roll back an incident?

## Design Principles

- Governance before implementation.
- Least privilege before tool access.
- Source-grounded controls before local opinion.
- Human review before release.
- Evidence over narrative.
- Reversibility before automation.
- Accessibility and fictional-data labelling as release requirements.
