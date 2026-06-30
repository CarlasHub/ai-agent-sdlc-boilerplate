import fs from 'node:fs';
import path from 'node:path';

import { PROJECT_TYPES, createSlug, generateProjectFiles } from '../app/src/features/project-builder/templates.js';

const root = process.cwd();
const failures = [];

const baseConfig = {
  projectType: 'front-end-demo',
  projectName: 'Governed Agent Project',
  owner: 'Project owner',
  users: 'Developers, reviewers, product owners and AI governance stakeholders.',
  riskLevel: 'medium',
  dataClass: 'public',
  riskReviewFrequency: 'monthly',
  personalData: 'no',
  secrets: 'no',
  approvers: 'Project owner, technical reviewer, security reviewer and AI governance reviewer.',
  riskRationale: 'The project uses AI-assisted work and generated code, but it is constrained to approved local files and approved data.',
  highRiskAreas: 'Generated code quality, tool-access control, review evidence, unsupported claims and release readiness.',
  dataSources: 'Local project files, governance templates, approved documentation and fictional sample data.',
  blockedData: 'Personal data, secrets, credentials, production data, confidential company data and real customer data must be blocked.',
  neverDo: 'The agent must never use real data, write secrets, deploy, use paid APIs, approve its own work or bypass governance gates.',
  blockedTools: 'Production deployment tools, real databases, secret stores, HR systems, client systems, paid APIs and tools that affect real users.',
  dataOwner: 'Project owner and AI governance reviewer.',
  releaseOwner: 'Project owner and technical reviewer.',
  approverName: 'pending',
  approverRole: 'pending',
  approvalDate: 'pending',
  approvalScope: 'pending',
  approvalConditions: 'pending',
  approvalNotes: 'pending'
};

const governanceDocs = [
  '00-start-here.md',
  '01-agent-charter.md',
  '02-risk-classification.md',
  '03-data-classification.md',
  '04-tool-access-map.md',
  '05-mcp-server-inventory.md',
  '06-permission-matrix.md',
  '07-agent-workflow-design.md',
  '08-agent-evaluation-plan.md',
  '09-human-approval-record.md',
  '10-release-gate.md',
  '11-monitoring-and-audit-plan.md',
  '12-incident-response.md',
  '13-prompt-register.md',
  '14-artefact-provenance-record.md',
  '15-decision-log.md'
];

const commonRequiredFiles = [
  '.agent-sdlc/project.answers.json',
  '.agent-sdlc/governance-status.json',
  ...governanceDocs.map((file) => `docs/governance/${file}`),
  'README.md',
  'AGENTS.md',
  'package.json',
  '.github/pull_request_template.md',
  '.github/workflows/governance-check.yml',
  '.github/workflows/release-gate.yml',
  '.github/workflows/security-check.yml',
  'scripts/validate-governance.mjs',
  'scripts/evaluate-agent.mjs',
  'scripts/release-gate.mjs',
  'scripts/create-audit-event.mjs',
  'scripts/serve-app.mjs',
  'agents/project-intake-agent.md',
  'agents/implementation-agent.md',
  'agents/review-agent.md',
  'agents/red-team-agent.md',
  'agents/release-agent.md',
  'agents/monitoring-agent.md',
  'evals/test-cases/01-scope-adherence.md',
  'evals/test-cases/02-prompt-injection.md',
  'evals/test-cases/03-forbidden-actions.md',
  'evals/test-cases/04-sensitive-data.md',
  'evals/test-cases/05-tool-misuse.md',
  'evals/test-cases/06-unsupported-claims.md',
  'evals/test-cases/07-approval-gate.md',
  'evals/test-cases/08-audit-logging.md',
  'app/index.html',
  'app/src/main.js',
  'app/src/styles.css',
  'app/tests/manual-test-plan.md',
  'app/tests/accessibility-checklist.md',
  'app/docs/implementation-notes.md',
  'app/docs/review-evidence.md'
];

const governedTeamRequiredFiles = [
  'docs/team-agent-operating-model.md',
  'docs/team-agent-component-governance.md',
  'docs/team-agent-accessibility-and-responsive-qa.md',
  'docs/team-agent-commerce-payment-boundaries.md',
  'docs/team-agent-handoff-and-packaging.md',
  'agents/design-system-agent.md',
  'agents/component-architecture-agent.md',
  'agents/accessibility-qa-agent.md',
  'agents/commerce-boundary-agent.md',
  'agents/handoff-packaging-agent.md',
  'evals/test-cases/09-component-reuse.md',
  'evals/test-cases/10-design-token-boundaries.md',
  'evals/test-cases/11-accessibility-handoff.md',
  'evals/test-cases/12-commerce-payment-boundary.md'
];

function fail(message) {
  failures.push(message);
}

function assert(condition, message) {
  if (!condition) fail(message);
}

function configFor(typeId, overrides = {}) {
  const type = PROJECT_TYPES.find((item) => item.id === typeId);
  if (!type) throw new Error(`Unknown project type: ${typeId}`);

  return {
    ...baseConfig,
    projectType: typeId,
    purpose: type.defaultPurpose,
    ...overrides
  };
}

function relativePath(file, result) {
  return file.path.replace(`${result.root}/`, '');
}

function fileMap(result) {
  return new Map(result.files.map((file) => [relativePath(file, result), file.content]));
}

function requireFile(files, file, label) {
  assert(files.has(file), `${label} is missing required file: ${file}`);
}

function requireIncludes(content, expected, label) {
  assert(content.includes(expected), `${label} is missing required text: ${expected}`);
}

function requirePattern(content, pattern, label) {
  assert(pattern.test(content), `${label} does not match ${pattern}`);
}

function assertNoPlaceholderLeaks(files, label) {
  const allowedScannerFiles = new Set([
    'scripts/validate-governance.mjs',
    'scripts/release-gate.mjs'
  ]);

  for (const [file, content] of files) {
    if (allowedScannerFiles.has(file)) continue;
    assert(!/\[FILL_|\[\[|TODO:|TBD/i.test(content), `${label} contains unresolved placeholder text in ${file}`);
  }
}

function assertSafePaths(result, files, label) {
  const seen = new Set();

  for (const file of result.files) {
    const relative = relativePath(file, result);
    assert(file.path.startsWith(`${result.root}/`), `${label} has file outside root: ${file.path}`);
    assert(!path.isAbsolute(relative), `${label} has absolute relative path: ${relative}`);
    assert(!relative.split('/').includes('..'), `${label} has path traversal segment: ${relative}`);
    assert(!seen.has(relative), `${label} has duplicate generated path: ${relative}`);
    seen.add(relative);
  }

  assert(seen.size === files.size, `${label} file map collapsed duplicate paths.`);
}

function assertPackageScripts(files, label) {
  const packageJson = JSON.parse(files.get('package.json'));
  const scripts = packageJson.scripts || {};

  for (const script of ['governance:check', 'evals:check', 'audit:new', 'release:gate', 'check']) {
    assert(Boolean(scripts[script]), `${label} package.json is missing script: ${script}`);
  }

  requireIncludes(scripts.check, 'governance:check', `${label} package check script`);
  requireIncludes(scripts.check, 'evals:check', `${label} package check script`);
  requireIncludes(scripts.check, 'release:gate', `${label} package check script`);
}

function assertGovernanceQuality(files, label) {
  const approvalRecord = files.get('docs/governance/09-human-approval-record.md') || '';
  const releaseGate = files.get('docs/governance/10-release-gate.md') || '';
  const toolMap = files.get('docs/governance/04-tool-access-map.md') || '';
  const agents = files.get('AGENTS.md') || '';
  const readme = files.get('README.md') || '';

  requirePattern(approvalRecord, /^APPROVED_FOR_IMPLEMENTATION:\s*(yes|no)\s*$/im, `${label} approval record`);
  requirePattern(releaseGate, /^RELEASE_APPROVED:\s*no\s*$/im, `${label} release gate`);
  requireIncludes(toolMap, '| Local file system |', `${label} tool map`);
  requireIncludes(toolMap, '| npm scripts |', `${label} tool map`);
  requireIncludes(toolMap, 'Blocked tools:', `${label} tool map`);
  requireIncludes(agents, 'Run `npm run governance:check` before implementation.', `${label} AGENTS.md`);
  requireIncludes(agents, 'Do not create feature code', `${label} AGENTS.md`);
  requireIncludes(readme, 'npm run governance:check', `${label} README.md`);
  requireIncludes(readme, 'APPROVED_FOR_IMPLEMENTATION: yes', `${label} README.md`);
  requireIncludes(readme, 'RELEASE_APPROVED: yes', `${label} README.md`);
}

function assertEvalQuality(files, label, requiredEvalCount) {
  const evalFiles = [...files].filter(([file]) => file.startsWith('evals/test-cases/'));

  assert(evalFiles.length === requiredEvalCount, `${label} expected ${requiredEvalCount} eval files, got ${evalFiles.length}`);

  for (const [file, content] of evalFiles) {
    requireIncludes(content, 'Purpose:', `${label} ${file}`);
    requireIncludes(content, 'Expected result:', `${label} ${file}`);
    requireIncludes(content, 'pending manual execution', `${label} ${file}`);
  }
}

function assertSafetyBoundaries(files, label) {
  const aggregate = [
    files.get('AGENTS.md'),
    files.get('docs/governance/03-data-classification.md'),
    files.get('docs/governance/04-tool-access-map.md'),
    files.get('docs/governance/06-permission-matrix.md'),
    files.get('docs/governance/07-agent-workflow-design.md')
  ].join('\n');

  for (const expected of [
    'secrets',
    'real data',
    'bypass governance',
    'approved local project files',
    'release approval'
  ]) {
    requireIncludes(aggregate.toLowerCase(), expected, `${label} safety boundary evidence`);
  }
}

function verifyProjectType(type) {
  const result = generateProjectFiles(configFor(type.id));
  const files = fileMap(result);
  const label = type.id;
  const expectedCount = type.id === 'governed-agent-team' ? 73 : 59;
  const requiredEvalCount = type.id === 'governed-agent-team' ? 12 : 8;

  assert(result.root === createSlug(baseConfig.projectName), `${label} root slug does not match project name.`);
  assert(result.fileName === `${result.root}.zip`, `${label} ZIP filename does not match root.`);
  assert(result.files.length === expectedCount, `${label} expected ${expectedCount} files, got ${result.files.length}.`);
  assertSafePaths(result, files, label);

  for (const file of commonRequiredFiles) requireFile(files, file, label);
  if (type.id === 'governed-agent-team') {
    for (const file of governedTeamRequiredFiles) requireFile(files, file, label);
  } else {
    for (const file of governedTeamRequiredFiles) {
      assert(!files.has(file), `${label} unexpectedly includes governed-agent-team file: ${file}`);
    }
  }

  assertNoPlaceholderLeaks(files, label);
  assertPackageScripts(files, label);
  assertGovernanceQuality(files, label);
  assertEvalQuality(files, label, requiredEvalCount);
  assertSafetyBoundaries(files, label);
}

function verifyApprovalSemantics() {
  const pending = generateProjectFiles(configFor('front-end-demo'));
  const pendingFiles = fileMap(pending);
  const pendingStatus = JSON.parse(pendingFiles.get('.agent-sdlc/governance-status.json'));

  assert(pendingStatus.approved_for_implementation === false, 'Pending config should not be approved for implementation.');
  requirePattern(
    pendingFiles.get('docs/governance/09-human-approval-record.md') || '',
    /^APPROVED_FOR_IMPLEMENTATION:\s*no\s*$/im,
    'Pending approval record'
  );

  const approved = generateProjectFiles(configFor('front-end-demo', {
    approverName: 'Alex Reviewer',
    approverRole: 'AI governance reviewer',
    approvalDate: '2026-06-30',
    approvalScope: 'Approved local implementation only.',
    approvalConditions: 'No real data, no secrets and no deployment.',
    approvalNotes: 'Approved for test coverage.'
  }));
  const approvedFiles = fileMap(approved);
  const approvedStatus = JSON.parse(approvedFiles.get('.agent-sdlc/governance-status.json'));

  assert(approvedStatus.approved_for_implementation === true, 'Approved config should be approved for implementation.');
  assert(Array.isArray(approvedStatus.blocking_issues) && approvedStatus.blocking_issues.length === 0, 'Approved config should have no blocking issues.');
  requirePattern(
    approvedFiles.get('docs/governance/09-human-approval-record.md') || '',
    /^APPROVED_FOR_IMPLEMENTATION:\s*yes\s*$/im,
    'Approved approval record'
  );
}

function verifyBuilderJourneyUi() {
  const appSource = fs.readFileSync(path.join(root, 'app/src/features/project-builder/app.js'), 'utf8');
  const styleSource = fs.readFileSync(path.join(root, 'app/src/styles.css'), 'utf8');

  for (const expected of [
    'journey-checklist',
    'Continue to guardrails',
    'Continue to boundaries',
    'Continue to approval',
    'Review export',
    'Export a review ZIP; implementation stays blocked.'
  ]) {
    requireIncludes(appSource, expected, 'Builder journey UI');
  }

  for (const expected of [
    '--canvas-default: #22272e',
    '--fg-default: #adbac7',
    '.section-next',
    '.journey-checklist',
    '.workflow-strip li.is-start'
  ]) {
    requireIncludes(styleSource, expected, 'Builder journey CSS');
  }

  for (const blockedColor of ['#fff', '#ffffff', '#e6edf3', '#0d1117']) {
    assert(!styleSource.toLowerCase().includes(blockedColor), `Builder CSS reintroduced harsh color token: ${blockedColor}`);
  }
}

const ids = new Set();
for (const type of PROJECT_TYPES) {
  assert(!ids.has(type.id), `Duplicate project type id: ${type.id}`);
  ids.add(type.id);
  assert(Boolean(type.label), `Project type ${type.id} has no label.`);
  assert(Boolean(type.defaultPurpose), `Project type ${type.id} has no default purpose.`);
  verifyProjectType(type);
}

verifyApprovalSemantics();
verifyBuilderJourneyUi();

if (failures.length) {
  console.error('Result quality tests failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`Result quality tests passed for ${PROJECT_TYPES.length} project types.`);
console.log('Checked generated structure, governance semantics, safety boundaries, eval coverage and builder journey UI.');
