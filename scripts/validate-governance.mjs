import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const requiredFiles = [
  'docs/governance/00-start-here.md',
  'docs/governance/01-agent-charter.md',
  'docs/governance/02-risk-classification.md',
  'docs/governance/03-data-classification.md',
  'docs/governance/04-tool-access-map.md',
  'docs/governance/05-mcp-server-inventory.md',
  'docs/governance/06-permission-matrix.md',
  'docs/governance/07-agent-workflow-design.md',
  'docs/governance/08-agent-evaluation-plan.md',
  'docs/governance/09-human-approval-record.md',
  'docs/governance/10-release-gate.md',
  'docs/governance/11-monitoring-and-audit-plan.md',
  'docs/governance/12-incident-response.md',
  'docs/governance/13-prompt-register.md',
  'docs/governance/14-artefact-provenance-record.md',
  'docs/governance/15-decision-log.md',
  'docs/governance/16-job-governance-profile.md',
  'docs/governance/17-policy-checks.md',
  'docs/governance/18-provenance-and-audit.md'
];

const blocking = [];
const placeholderPatterns = [
  /\[\[.+?\]\]/,
  /\[FILL_[A-Z0-9_]+\]/,
  /FILL_/,
  /TODO:/i,
  /TBD/i
];

for (const file of requiredFiles) {
  const fullPath = path.join(root, file);
  if (!fs.existsSync(fullPath)) {
    blocking.push(`Missing required file: ${file}`);
    continue;
  }
  const content = fs.readFileSync(fullPath, 'utf8');
  for (const pattern of placeholderPatterns) {
    if (pattern.test(content)) {
      blocking.push(`Unresolved placeholder found in: ${file}`);
      break;
    }
  }
}

const approvalPath = path.join(root, 'docs/governance/09-human-approval-record.md');
if (fs.existsSync(approvalPath)) {
  const approval = fs.readFileSync(approvalPath, 'utf8');
  if (!/^APPROVED_FOR_IMPLEMENTATION:\s*yes\s*$/im.test(approval)) {
    blocking.push('Implementation is not approved. Set APPROVED_FOR_IMPLEMENTATION: yes only after human review.');
  }
}

const answersPath = path.join(root, '.agent-sdlc/project.answers.json');
if (!fs.existsSync(answersPath)) {
  blocking.push('Missing .agent-sdlc/project.answers.json. Run npm run governance:init.');
}

const policyPath = path.join(root, '.agent-sdlc/policy-status.json');
if (!fs.existsSync(policyPath)) {
  blocking.push('Missing .agent-sdlc/policy-status.json.');
} else {
  try {
    const policy = JSON.parse(fs.readFileSync(policyPath, 'utf8'));
    if (policy.status !== 'passed') {
      blocking.push('Policy checks are blocking implementation. Review docs/governance/17-policy-checks.md.');
    }
  } catch {
    blocking.push('.agent-sdlc/policy-status.json is not valid JSON.');
  }
}

const statusPath = path.join(root, '.agent-sdlc/governance-status.json');
const status = {
  governance_initialized: fs.existsSync(answersPath),
  approved_for_implementation: blocking.every((item) => !item.includes('not approved')),
  last_check: new Date().toISOString(),
  blocking_issues: blocking
};
fs.mkdirSync(path.dirname(statusPath), { recursive: true });
fs.writeFileSync(statusPath, JSON.stringify(status, null, 2));

if (blocking.length) {
  console.error('\nGovernance check failed:\n');
  for (const issue of blocking) console.error(`- ${issue}`);
  console.error('\nImplementation remains blocked.\n');
  process.exit(1);
}

console.log('Governance check passed. Implementation may proceed within the approved scope.');
