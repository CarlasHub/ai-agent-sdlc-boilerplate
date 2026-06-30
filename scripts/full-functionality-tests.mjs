import fs from 'node:fs';
import path from 'node:path';

import {
  GOVERNANCE_DOC_COUNT,
  JOB_PROFILES,
  PROJECT_TYPES,
  generateProjectFiles,
  getEvalCount,
  profilePacks
} from '../app/src/features/project-builder/templates.js';
import { approvalEffective, evaluateGovernancePolicies } from '../app/src/features/project-builder/policies.js';

const root = process.cwd();
const failures = [];

function assert(condition, message) {
  if (!condition) failures.push(message);
}

function read(file) {
  const fullPath = path.join(root, file);
  return fs.existsSync(fullPath) ? fs.readFileSync(fullPath, 'utf8') : '';
}

function exists(file) {
  return fs.existsSync(path.join(root, file));
}

function fileMap(result) {
  return new Map(result.files.map((file) => [file.path.replace(`${result.root}/`, ''), file.content]));
}

const baseProfile = JOB_PROFILES[0];
const baseConfig = {
  projectType: PROJECT_TYPES[0].id,
  jobProfile: baseProfile.id,
  projectName: 'Full Functionality Project',
  owner: 'Project owner',
  users: 'Developers, reviewers and governance stakeholders.',
  riskLevel: 'medium',
  dataClass: 'public',
  riskReviewFrequency: 'monthly',
  personalData: 'no',
  secrets: 'no',
  approvers: 'Project owner, technical reviewer, security reviewer and AI governance reviewer.',
  riskRationale: 'Governed local project with no real data.',
  highRiskAreas: 'Generated output, evidence and release readiness.',
  dataSources: 'Approved local project files and fictional sample data.',
  blockedData: 'Personal data, secrets, production data and confidential company data are blocked.',
  neverDo: 'Never use real data, secrets, bypass governance or approve own work.',
  blockedTools: 'Production deployment tools, real databases, client systems, HR systems and secret stores are blocked.',
  dataOwner: 'Project owner',
  releaseOwner: 'Project owner',
  jobScope: baseProfile.defaultScope,
  jobQualityRubric: baseProfile.defaultRubric,
  jobEvidenceRequirements: baseProfile.defaultEvidence,
  jobEscalationRules: baseProfile.defaultEscalation,
  jobOutputSchema: baseProfile.defaultOutputSchema,
  jobStopRules: baseProfile.defaultStopRules
};

const approvedConfig = {
  ...baseConfig,
  approverName: 'Alex Reviewer',
  approverRole: 'AI governance reviewer',
  approvalDate: '2026-06-30',
  approvalScope: 'Approved local implementation with approved data only.',
  approvalConditions: 'No real data, no secrets and no deployment without release approval.',
  approvalNotes: 'Approved for full functionality test.'
};

const safePolicy = evaluateGovernancePolicies(approvedConfig);
assert(safePolicy.status === 'passed', 'Safe approved configuration should pass policy checks.');
assert(approvalEffective(approvedConfig) === true, 'Safe approved configuration should be effective for implementation.');

const secretPolicy = evaluateGovernancePolicies({
  ...approvedConfig,
  secrets: 'yes',
  dataClass: 'secrets-blocked'
});
assert(secretPolicy.status === 'blocked', 'Secrets should block implementation readiness.');
assert(secretPolicy.blockers.some((item) => item.id === 'secrets-blocked'), 'Secrets blocker should be explicit.');

const regulatedPolicy = evaluateGovernancePolicies({
  ...approvedConfig,
  riskLevel: 'low',
  dataClass: 'regulated'
});
assert(regulatedPolicy.status === 'blocked', 'Regulated data with low risk should block policy readiness.');
assert(regulatedPolicy.blockers.some((item) => item.id === 'regulated-data-escalation'), 'Regulated data blocker should be explicit.');

const qaProfile = JOB_PROFILES.find((profile) => profile.id === 'qa-auditor');
assert(Boolean(qaProfile), 'QA Auditor profile must exist.');
const badQaPolicy = evaluateGovernancePolicies({
  ...approvedConfig,
  jobProfile: 'qa-auditor',
  jobStopRules: 'Stop on missing evidence.'
});
assert(badQaPolicy.status === 'blocked', 'QA Auditor must block when independence stop rules are removed.');
assert(badQaPolicy.blockers.some((item) => item.id === 'qa-auditor-independence'), 'QA independence blocker should be explicit.');

const packs = profilePacks();
assert(packs.length === JOB_PROFILES.length, 'Profile pack count must match job profiles.');
assert(packs.some((pack) => pack.id === 'qa-auditor' && pack.output_schema.includes('Finding id')), 'QA Auditor pack must include finding output schema.');

for (const pack of packs) {
  assert(exists(`profile-packs/${pack.id}.json`), `Root profile pack is missing: ${pack.id}.`);
}
assert(exists('profile-packs/index.json'), 'Root profile pack index is missing.');

for (const type of PROJECT_TYPES) {
  const result = generateProjectFiles({
    ...approvedConfig,
    projectType: type.id,
    purpose: type.defaultPurpose
  });
  const files = fileMap(result);

  assert(files.has('.agent-sdlc/policy-status.json'), `${type.id} package must include policy status.`);
  assert(files.has('.agent-sdlc/package-manifest.json'), `${type.id} package must include package manifest.`);
  assert(files.has('.agent-sdlc/provenance.json'), `${type.id} package must include provenance.`);
  assert(files.has('.agent-sdlc/audit-events.jsonl'), `${type.id} package must include audit event stream.`);
  assert(files.has('.agent-sdlc/qa-audit-report.json'), `${type.id} package must include QA audit report seed.`);
  assert(files.has('scripts/qa-audit.mjs'), `${type.id} package must include QA audit script.`);
  assert(files.has('scripts/full-functionality-tests.mjs'), `${type.id} package must include full functionality tests.`);
  assert(files.has('docs/governance/17-policy-checks.md'), `${type.id} package must include policy checks doc.`);
  assert(files.has('docs/governance/18-provenance-and-audit.md'), `${type.id} package must include provenance and audit doc.`);
  assert(files.has('profile-packs/index.json'), `${type.id} package must include reusable profile pack index.`);

  const manifest = JSON.parse(files.get('.agent-sdlc/package-manifest.json'));
  assert(manifest.files.some((file) => file.path === 'scripts/qa-audit.mjs'), `${type.id} manifest must list QA audit script.`);
  assert(manifest.files.some((file) => file.path === 'profile-packs/qa-auditor.json'), `${type.id} manifest must list QA profile pack.`);

  const generatedPolicy = JSON.parse(files.get('.agent-sdlc/policy-status.json'));
  assert(generatedPolicy.status === 'passed', `${type.id} generated safe policy should pass.`);

  const packageJson = JSON.parse(files.get('package.json'));
  assert(packageJson.scripts['qa:audit'], `${type.id} package.json must include qa:audit.`);
  assert(packageJson.scripts['test:functionality'], `${type.id} package.json must include test:functionality.`);

  const expectedEvalCount = getEvalCount({ projectType: type.id, jobProfile: baseProfile.id });
  const evalFiles = [...files].filter(([file]) => file.startsWith('evals/test-cases/'));
  assert(evalFiles.length === expectedEvalCount, `${type.id} eval count should be ${expectedEvalCount}.`);
}

const blockedResult = generateProjectFiles({
  ...approvedConfig,
  secrets: 'yes',
  dataClass: 'secrets-blocked'
});
const blockedFiles = fileMap(blockedResult);
const blockedStatus = JSON.parse(blockedFiles.get('.agent-sdlc/governance-status.json'));
assert(blockedStatus.approved_for_implementation === false, 'Policy blockers must prevent implementation approval even with approval fields complete.');
assert((blockedFiles.get('docs/governance/09-human-approval-record.md') || '').includes('APPROVED_FOR_IMPLEMENTATION: no'), 'Approval record should stay no when policy blockers exist.');

const functionalityDoc = read('docs/testing/full-functionality-test-cases.md');
for (const expected of [
  'TC-01 Governance Gate',
  'TC-02 Policy Engine',
  'TC-03 QA Auditor',
  'TC-04 Profile Packs',
  'TC-05 Provenance',
  'TC-06 Builder Journey',
  'TC-07 Generated ZIP'
]) {
  assert(functionalityDoc.includes(expected), `Full functionality test case doc is missing ${expected}.`);
}

assert(GOVERNANCE_DOC_COUNT >= 19, 'Governance document count should include policy and provenance docs.');

if (failures.length) {
  console.error('Full functionality tests failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`Full functionality tests passed for ${PROJECT_TYPES.length} project types and ${JOB_PROFILES.length} job profiles.`);
