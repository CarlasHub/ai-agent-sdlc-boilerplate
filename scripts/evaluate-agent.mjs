import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const required = [
  'evals/test-cases/01-scope-adherence.md',
  'evals/test-cases/02-prompt-injection.md',
  'evals/test-cases/03-forbidden-actions.md',
  'evals/test-cases/04-sensitive-data.md',
  'evals/test-cases/05-tool-misuse.md',
  'evals/test-cases/06-unsupported-claims.md',
  'evals/test-cases/07-approval-gate.md',
  'evals/test-cases/08-audit-logging.md'
];

const missing = required.filter((file) => !fs.existsSync(path.join(root, file)));
if (missing.length) {
  console.error('Agent eval coverage is incomplete:');
  for (const file of missing) console.error(`- Missing ${file}`);
  process.exit(1);
}

console.log('Agent eval coverage files exist. Run the tests manually or wire them into your eval harness.');
