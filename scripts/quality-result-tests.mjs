import fs from 'node:fs';
import path from 'node:path';

import {
  GOVERNANCE_DOC_COUNT,
  JOB_PROFILES,
  PROJECT_TYPES,
  createSlug,
  generateProjectFiles,
  getEvalCount,
  profilePacks
} from '../app/src/features/project-builder/templates.js';

const root = process.cwd();
const failures = [];

const baseConfig = {
  projectType: 'front-end-demo',
  jobProfile: 'general-delivery',
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
  jobScope: JOB_PROFILES[0].defaultScope,
  jobQualityRubric: JOB_PROFILES[0].defaultRubric,
  jobEvidenceRequirements: JOB_PROFILES[0].defaultEvidence,
  jobEscalationRules: JOB_PROFILES[0].defaultEscalation,
  jobOutputSchema: JOB_PROFILES[0].defaultOutputSchema,
  jobStopRules: JOB_PROFILES[0].defaultStopRules,
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
  '15-decision-log.md',
  '16-job-governance-profile.md',
  '17-policy-checks.md',
  '18-provenance-and-audit.md'
];

const commonRequiredFiles = [
  '.agent-sdlc/project.answers.json',
  '.agent-sdlc/governance-status.json',
  '.agent-sdlc/policy-status.json',
  '.agent-sdlc/package-manifest.json',
  '.agent-sdlc/provenance.json',
  '.agent-sdlc/audit-events.jsonl',
  '.agent-sdlc/qa-audit-report.json',
  ...governanceDocs.map((file) => `docs/governance/${file}`),
  'profile-packs/index.json',
  ...profilePacks().map((pack) => `profile-packs/${pack.id}.json`),
  'README.md',
  'AGENTS.md',
  'package.json',
  '.github/pull_request_template.md',
  '.github/workflows/governance-check.yml',
  '.github/workflows/release-gate.yml',
  '.github/workflows/security-check.yml',
  'scripts/validate-governance.mjs',
  'scripts/evaluate-agent.mjs',
  'scripts/qa-audit.mjs',
  'scripts/full-functionality-tests.mjs',
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
  'evals/test-cases/20-general-delivery-governance.md',
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
  const profile = JOB_PROFILES.find((item) => item.id === (overrides.jobProfile || baseConfig.jobProfile)) || JOB_PROFILES[0];

  return {
    ...baseConfig,
    projectType: typeId,
    purpose: type.defaultPurpose,
    jobProfile: profile.id,
    jobScope: profile.defaultScope,
    jobQualityRubric: profile.defaultRubric,
    jobEvidenceRequirements: profile.defaultEvidence,
    jobEscalationRules: profile.defaultEscalation,
    jobOutputSchema: profile.defaultOutputSchema,
    jobStopRules: profile.defaultStopRules,
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

  for (const script of ['governance:check', 'evals:check', 'qa:audit', 'test:functionality', 'audit:new', 'release:gate', 'check']) {
    assert(Boolean(scripts[script]), `${label} package.json is missing script: ${script}`);
  }

  requireIncludes(scripts.check, 'governance:check', `${label} package check script`);
  requireIncludes(scripts.check, 'evals:check', `${label} package check script`);
  requireIncludes(scripts.check, 'qa:audit', `${label} package check script`);
  requireIncludes(scripts.check, 'test:functionality', `${label} package check script`);
  requireIncludes(scripts.check, 'release:gate', `${label} package check script`);
}

function assertGovernanceQuality(files, label) {
  const approvalRecord = files.get('docs/governance/09-human-approval-record.md') || '';
  const releaseGate = files.get('docs/governance/10-release-gate.md') || '';
  const toolMap = files.get('docs/governance/04-tool-access-map.md') || '';
  const jobProfileDoc = files.get('docs/governance/16-job-governance-profile.md') || '';
  const policyDoc = files.get('docs/governance/17-policy-checks.md') || '';
  const provenanceDoc = files.get('docs/governance/18-provenance-and-audit.md') || '';
  const agents = files.get('AGENTS.md') || '';
  const readme = files.get('README.md') || '';

  assert(governanceDocs.length === GOVERNANCE_DOC_COUNT, 'Quality test governance doc list is out of sync with template count.');
  requirePattern(approvalRecord, /^APPROVED_FOR_IMPLEMENTATION:\s*(yes|no)\s*$/im, `${label} approval record`);
  requirePattern(releaseGate, /^RELEASE_APPROVED:\s*no\s*$/im, `${label} release gate`);
  requireIncludes(toolMap, '| Local file system |', `${label} tool map`);
  requireIncludes(toolMap, '| npm scripts |', `${label} tool map`);
  requireIncludes(toolMap, 'Blocked tools:', `${label} tool map`);
  requireIncludes(jobProfileDoc, '# Job Governance Profile', `${label} job profile doc`);
  requireIncludes(jobProfileDoc, '## Decision rubric', `${label} job profile doc`);
  requireIncludes(jobProfileDoc, '## Evidence requirements', `${label} job profile doc`);
  requireIncludes(jobProfileDoc, '## Escalation rules', `${label} job profile doc`);
  requireIncludes(jobProfileDoc, '## Required output schema', `${label} job profile doc`);
  requireIncludes(jobProfileDoc, '## Stop rules', `${label} job profile doc`);
  requireIncludes(policyDoc, '# Policy Checks', `${label} policy checks doc`);
  requireIncludes(policyDoc, 'Status:', `${label} policy checks doc`);
  requireIncludes(provenanceDoc, '# Provenance And Audit', `${label} provenance doc`);
  requireIncludes(provenanceDoc, '.agent-sdlc/package-manifest.json', `${label} provenance doc`);
  requireIncludes(agents, 'Run `npm run governance:check` before implementation.', `${label} AGENTS.md`);
  requireIncludes(agents, 'docs/governance/16-job-governance-profile.md', `${label} AGENTS.md`);
  requireIncludes(agents, 'Do not create feature code', `${label} AGENTS.md`);
  requireIncludes(readme, 'npm run governance:check', `${label} README.md`);
  requireIncludes(readme, 'Job profile:', `${label} README.md`);
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
    files.get('docs/governance/07-agent-workflow-design.md'),
    files.get('docs/governance/16-job-governance-profile.md')
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

function assertStructuredEvidence(files, label) {
  const policyStatus = JSON.parse(files.get('.agent-sdlc/policy-status.json') || '{}');
  const manifest = JSON.parse(files.get('.agent-sdlc/package-manifest.json') || '{}');
  const provenance = JSON.parse(files.get('.agent-sdlc/provenance.json') || '{}');
  const qaReport = JSON.parse(files.get('.agent-sdlc/qa-audit-report.json') || '{}');
  const auditEvents = files.get('.agent-sdlc/audit-events.jsonl') || '';
  const profileIndex = JSON.parse(files.get('profile-packs/index.json') || '{}');

  assert(Array.isArray(policyStatus.checks) && policyStatus.checks.length >= 8, `${label} policy status is not structured.`);
  assert(Array.isArray(manifest.files) && manifest.files.length > 40, `${label} package manifest is missing file entries.`);
  assert(manifest.files.some((file) => file.path === 'scripts/qa-audit.mjs'), `${label} manifest does not list QA audit script.`);
  assert(provenance.policy_status === policyStatus.status, `${label} provenance does not match policy status.`);
  assert(qaReport.status === 'pending', `${label} QA report seed should start pending.`);
  assert(auditEvents.trim().startsWith('{'), `${label} audit event stream should contain JSONL.`);
  assert(Array.isArray(profileIndex.profiles) && profileIndex.profiles.length === JOB_PROFILES.length, `${label} profile index is incomplete.`);

  for (const pack of profilePacks()) {
    const content = JSON.parse(files.get(`profile-packs/${pack.id}.json`) || '{}');
    assert(content.id === pack.id, `${label} profile pack ${pack.id} is malformed.`);
  }
}

function verifyProjectType(type) {
  const result = generateProjectFiles(configFor(type.id));
  const files = fileMap(result);
  const label = type.id;
  const config = configFor(type.id);
  const expectedCount = type.id === 'governed-agent-team' ? 92 : 78;
  const requiredEvalCount = getEvalCount(config);

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
  assertStructuredEvidence(files, label);
}

function verifyJobProfiles() {
  for (const profile of JOB_PROFILES) {
    const config = configFor('front-end-demo', { jobProfile: profile.id });
    const result = generateProjectFiles(config);
    const files = fileMap(result);
    const label = `job profile ${profile.id}`;
    const jobProfileDoc = files.get('docs/governance/16-job-governance-profile.md') || '';
    const evalFile = `evals/test-cases/20-${profile.id}-governance.md`;

    requireFile(files, evalFile, label);
    requireIncludes(jobProfileDoc, `Selected profile: ${profile.label}`, label);
    requireIncludes(jobProfileDoc, profile.defaultScope, label);
    requireIncludes(jobProfileDoc, profile.defaultRubric, label);
    requireIncludes(jobProfileDoc, profile.defaultEvidence, label);
    requireIncludes(jobProfileDoc, profile.defaultEscalation, label);
    requireIncludes(jobProfileDoc, profile.defaultOutputSchema, label);
    requireIncludes(jobProfileDoc, profile.defaultStopRules, label);
    requireIncludes(files.get(evalFile) || '', profile.label, label);
    assert(getEvalCount(config) === 9, `${label} should generate 9 eval cases for a standard project.`);
  }
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
    'console-shell',
    'console-sidebar',
    'Builder steps',
    'Package status',
    'Start builder',
    'Package summary',
    'Configure package',
    'Gate Stack',
    'Approval State',
    'jobProfileSelect',
    'Job profile',
    'Job scope',
    'Decision rubric',
    'Evidence requirements',
    'Escalation rules',
    'Output schema',
    'Job stop rules',
    'Continue to guardrails',
    'Continue to boundaries',
    'Continue to approval',
    'Review export',
    'Human review and approval required to continue.',
    'Export governed package',
    'Agent job rules',
    'Safety boundaries',
    'Governance ownership',
    'Generated files',
    'Agent roles',
    'Eval coverage',
    'Policy checks',
    'Policy score',
    'Human approval record',
    'Agent SDLC boilerplate',
    'Export readiness',
    'About',
    'How the boilerplate works',
    'Download a local ZIP with governance docs'
  ]) {
    requireIncludes(appSource, expected, 'Builder journey UI');
  }

  for (const removed of [
    'My Projects',
    'Governance Docs',
    'Agent Library',
    'Audit Templates',
    'Export History',
    'System Health',
    'Recent Projects',
    'Activity Feed',
    'Customer Support Copilot',
    'Data Insights Agent',
    'Invoice Processing Agent',
    'Governed. Intelligent. Auditable.',
    'Create New Project'
  ]) {
    assert(!appSource.includes(removed), `Builder journey UI still contains removed placeholder copy: ${removed}`);
  }

  for (const expected of [
    '--bg-main: #010107',
    '--bg-shell: #010716',
    '--bg-panel: #020a18',
    '--cyan: #00dfff',
    '--violet: #9a63ff',
    '--amber: #ffb947',
    '--text-main: #edf2f8',
    'background: #0a1a31',
    'background: #17110a',
    '.button-chevron',
    '.console-shell',
    '.console-sidebar',
    '.network-panel',
    '.readiness-health-panel',
    '.hero-console',
    '.governance-node',
    '.intelligence-panel',
    '.blueprint-intelligence',
    '.field-group-stack',
    '.step-chip-grid',
    '.status-fact-list',
    '.about-panel',
    '.about-grid'
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
verifyJobProfiles();
verifyBuilderJourneyUi();

if (failures.length) {
  console.error('Result quality tests failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`Result quality tests passed for ${PROJECT_TYPES.length} project types and ${JOB_PROFILES.length} job profiles.`);
console.log('Checked generated structure, job personalization, governance semantics, safety boundaries, eval coverage and builder journey UI.');
