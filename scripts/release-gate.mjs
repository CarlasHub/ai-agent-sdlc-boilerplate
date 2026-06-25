import fs from 'node:fs';
import path from 'node:path';

const file = path.join(process.cwd(), 'docs/governance/10-release-gate.md');
if (!fs.existsSync(file)) {
  console.error('Missing release gate document.');
  process.exit(1);
}
const content = fs.readFileSync(file, 'utf8');
const blocking = [];
if (/\[FILL_|\[\[|TODO:|TBD/i.test(content)) blocking.push('Release gate has unresolved placeholders.');
if (!/^RELEASE_APPROVED:\s*yes\s*$/im.test(content)) blocking.push('Release is not approved. Set RELEASE_APPROVED: yes only after release review.');

if (blocking.length) {
  console.error('Release gate failed:');
  for (const issue of blocking) console.error(`- ${issue}`);
  process.exit(1);
}
console.log('Release gate passed.');
