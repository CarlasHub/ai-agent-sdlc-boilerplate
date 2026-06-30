# Quality Of Results

Use the quality gate to assess whether the builder output is complete, governed and useful:

```bash
npm run quality:results
```

The gate checks:

- every project type generates the expected file set
- generated paths stay inside the project root
- required governance docs, agent prompts, evals, scripts and app files exist
- unresolved placeholders do not leak into generated artifacts
- implementation approval defaults to blocked and switches only with a complete approval record
- release approval remains separate from implementation approval
- eval files include purpose, expected result and manual execution status
- safety boundaries mention real data, secrets, governance bypass, approved files and release approval
- the builder UI exposes the guided journey actions and softened GitHub dimmed palette

Run the full project gate before pushing:

```bash
npm run check
```

The full gate includes governance, eval coverage, enterprise readiness, result quality, ZIP extraction, app behavior, secret scanning and release approval checks.
