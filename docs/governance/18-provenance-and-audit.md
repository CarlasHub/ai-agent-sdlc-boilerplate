# Provenance And Audit

This repository now keeps structured evidence for the boilerplate itself and for every generated package.

## Structured Files

- `.agent-sdlc/policy-status.json`
- `.agent-sdlc/package-manifest.json`
- `.agent-sdlc/provenance.json`
- `.agent-sdlc/audit-events.jsonl`
- `.agent-sdlc/qa-audit-report.json`

## Generated Package Evidence

Every exported ZIP includes:

- generated governance documents
- generated policy status
- generated package manifest
- generated provenance record
- generated audit event stream
- generated QA audit report seed
- profile pack JSON
- QA audit script
- full functionality test script

## Required Audit Fields

- requested task
- agent role
- files read
- files changed
- tools used
- tests run
- risks identified
- reviewer decision
- approval status

## Review Rule

No agent may approve its own output. QA auditor findings require human reviewer decision before release claims.
