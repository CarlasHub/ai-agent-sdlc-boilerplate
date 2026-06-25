import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const ignoredDirectories = new Set(['.git', 'node_modules']);
const ignoredFiles = new Set(['scripts/security-secret-scan.mjs']);
const secretPatterns = [
  {
    name: 'OpenAI API key',
    pattern: /(?<![A-Za-z0-9_-])sk-[A-Za-z0-9_-]{20,}(?![A-Za-z0-9_-])/g
  },
  {
    name: 'AWS access key',
    pattern: /(?<![A-Za-z0-9_-])AKIA[0-9A-Z]{16}(?![A-Za-z0-9_-])/g
  },
  {
    name: 'private key',
    pattern: /BEGIN (RSA|OPENSSH) PRIVATE KEY/g
  }
];
const findings = [];

function walk(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const fullPath = path.join(directory, entry.name);
    const relativePath = path.relative(root, fullPath);

    if (entry.isDirectory()) {
      if (!ignoredDirectories.has(entry.name)) walk(fullPath);
      continue;
    }

    if (!entry.isFile() || ignoredFiles.has(relativePath)) continue;

    const content = fs.readFileSync(fullPath, 'utf8');
    const lines = content.split('\n');

    lines.forEach((line, index) => {
      for (const { name, pattern } of secretPatterns) {
        pattern.lastIndex = 0;
        if (pattern.test(line)) {
          findings.push(`${relativePath}:${index + 1}: potential ${name}`);
        }
      }
    });
  }
}

walk(root);

if (findings.length) {
  console.error('Potential secret found. Remove it before merge:');
  for (const finding of findings) console.error(`- ${finding}`);
  process.exit(1);
}

console.log('No obvious committed secrets found.');
