import fs from 'node:fs';
import path from 'node:path';

import {
  GOVERNANCE_DOCS,
  JOB_PROFILES,
  PROJECT_TYPES,
  generateProjectFiles,
  getEvalCount,
  profilePacks
} from '../app/src/features/project-builder/templates.js';
import { evaluateGovernancePolicies } from '../app/src/features/project-builder/policies.js';

const root = process.cwd();
const reportPath = path.join(root, '.agent-sdlc/qa-audit-report.json');
const findings = [];

function fullPath(file) {
  return path.join(root, file);
}

function exists(file) {
  return fs.existsSync(fullPath(file));
}

function read(file) {
  return exists(file) ? fs.readFileSync(fullPath(file), 'utf8') : '';
}

function addFinding(id, severity, title, evidence, recommendation, status = 'open') {
  findings.push({
    id,
    severity,
    title,
    evidence,
    reproduction: `Run npm run qa:audit and inspect ${evidence}.`,
    impact: ['critical', 'high'].includes(severity)
      ? 'Blocks trustworthy delivery evidence.'
      : 'Needs tracked remediation or documented acceptance.',
    recommendation,
    owner: 'Project owner',
    status,
    reviewer_decision: 'pending human review',
    confidence: 'high'
  });
}

function fileMap(result) {
  return new Map(result.files.map((file) => [file.path.replace(`${result.root}/`, ''), file.content]));
}

for (const file of GOVERNANCE_DOCS.map((doc) => `docs/governance/${doc}`)) {
  if (!exists(file)) {
    addFinding(`missing-${file.replaceAll('/', '-')}`, 'critical', 'Missing governance document', file, 'Restore the required governance document.');
  }
}

for (const file of ['.agent-sdlc/policy-status.json', '.agent-sdlc/provenance.json', '.agent-sdlc/audit-events.jsonl']) {
  if (!exists(file)) {
    addFinding(`missing-${file.replaceAll('/', '-')}`, 'high', 'Structured evidence is missing', file, 'Restore the structured evidence file.');
  }
}

const approval = read('docs/governance/09-human-approval-record.md');
if (!/^APPROVED_FOR_IMPLEMENTATION:\s*yes\s*$/im.test(approval)) {
  addFinding(
    'implementation-approval-missing',
    'high',
    'Implementation approval is not recorded',
    'docs/governance/09-human-approval-record.md',
    'Record human approval or keep implementation blocked.'
  );
}

const policyStatusContent = read('.agent-sdlc/policy-status.json');
if (policyStatusContent) {
  const policyStatus = JSON.parse(policyStatusContent);
  if (policyStatus.status !== 'passed') {
    addFinding(
      'policy-status-blocked',
      'high',
      'Policy checks block implementation',
      'docs/governance/17-policy-checks.md',
      'Resolve blocking policy checks before implementation.'
    );
  }
}

const evalDir = fullPath('evals/test-cases');
const evalFiles = fs.existsSync(evalDir)
  ? fs.readdirSync(evalDir).filter((file) => file.endsWith('.md'))
  : [];
if (evalFiles.length < 8) {
  addFinding('eval-coverage-low', 'high', 'Eval coverage is incomplete', 'evals/test-cases', 'Restore the required eval cases.');
}

for (const file of evalFiles) {
  const content = read(path.join('evals/test-cases', file));
  for (const expected of ['Purpose:', 'Expected result:', 'Status:']) {
    if (!content.includes(expected)) {
      addFinding(
        `eval-${file}-${expected.toLowerCase().replace(/[^a-z]+/g, '-')}`,
        'medium',
        'Eval case is missing required structure',
        `evals/test-cases/${file}`,
        'Add purpose, expected result and status fields.'
      );
    }
  }
}

for (const pack of profilePacks()) {
  const file = `profile-packs/${pack.id}.json`;
  if (!exists(file)) {
    addFinding(`missing-profile-pack-${pack.id}`, 'medium', 'Profile pack JSON is missing', file, 'Export the reusable profile pack.');
  }
}

for (const profile of JOB_PROFILES) {
  const policy = evaluateGovernancePolicies({
    projectType: PROJECT_TYPES[0].id,
    jobProfile: profile.id,
    riskLevel: 'medium',
    dataClass: 'public',
    personalData: 'no',
    secrets: 'no',
    approvers: 'Project owner, technical reviewer, security reviewer and AI governance reviewer.',
    blockedData: 'Personal data, secrets and production data are blocked.',
    blockedTools: 'Production deployment tools, real databases and secret stores are blocked.',
    neverDo: 'Never use real data, secrets, bypass governance or approve own work.',
    approvalScope: 'Approved local implementation with approved data only.',
    approvalConditions: 'No real data, no secrets and no deployment without release approval.',
    jobEvidenceRequirements: profile.defaultEvidence,
    jobStopRules: profile.defaultStopRules
  });

  if (policy.status !== 'passed') {
    addFinding(
      `profile-policy-${profile.id}`,
      'high',
      'Starter profile does not satisfy base policies',
      `profile-packs/${profile.id}.json`,
      'Fix profile defaults so a safe base configuration passes policy checks.'
    );
  }
}

for (const type of PROJECT_TYPES) {
  const profile = JOB_PROFILES[0];
  const result = generateProjectFiles({
    projectType: type.id,
    jobProfile: profile.id,
    projectName: 'QA Audit Sample',
    owner: 'Project owner',
    users: 'Developers and reviewers.',
    riskLevel: 'medium',
    dataClass: 'public',
    riskReviewFrequency: 'monthly',
    personalData: 'no',
    secrets: 'no',
    approvers: 'Project owner, technical reviewer, security reviewer and AI governance reviewer.',
    riskRationale: 'Governed local sample.',
    highRiskAreas: 'Generated output, review evidence and release readiness.',
    dataSources: 'Approved local files and fictional sample data.',
    blockedData: 'Personal data, secrets and production data are blocked.',
    neverDo: 'Never use real data, secrets, bypass governance or approve own work.',
    blockedTools: 'Production deployment tools, real databases and secret stores are blocked.',
    dataOwner: 'Project owner',
    releaseOwner: 'Project owner',
    jobScope: profile.defaultScope,
    jobQualityRubric: profile.defaultRubric,
    jobEvidenceRequirements: profile.defaultEvidence,
    jobEscalationRules: profile.defaultEscalation,
    jobOutputSchema: profile.defaultOutputSchema,
    jobStopRules: profile.defaultStopRules
  });
  const files = fileMap(result);

  for (const required of [
    '.agent-sdlc/policy-status.json',
    '.agent-sdlc/package-manifest.json',
    '.agent-sdlc/provenance.json',
    '.agent-sdlc/audit-events.jsonl',
    'scripts/qa-audit.mjs',
    'scripts/full-functionality-tests.mjs',
    'docs/governance/17-policy-checks.md',
    'docs/governance/18-provenance-and-audit.md',
    'profile-packs/index.json'
  ]) {
    if (!files.has(required)) {
      addFinding(
        `generated-${type.id}-missing-${required.replaceAll('/', '-')}`,
        'high',
        'Generated package is missing required functionality',
        required,
        'Restore generated evidence, QA audit or functionality test artifacts.'
      );
    }
  }

  if (getEvalCount({ projectType: type.id, jobProfile: profile.id }) < 9) {
    addFinding(
      `generated-${type.id}-eval-count`,
      'medium',
      'Generated eval count is lower than expected',
      'evals/test-cases',
      'Keep base eval coverage plus the selected job profile eval.'
    );
  }
}

const status = findings.some((finding) => ['critical', 'high'].includes(finding.severity)) ? 'failed' : 'passed';
const report = {
  schema_version: '1.0',
  status,
  generated_at: new Date().toISOString(),
  summary: {
    findings: findings.length,
    critical: findings.filter((item) => item.severity === 'critical').length,
    high: findings.filter((item) => item.severity === 'high').length,
    medium: findings.filter((item) => item.severity === 'medium').length,
    low: findings.filter((item) => item.severity === 'low').length
  },
  findings
};

if (fs.existsSync(reportPath)) {
  try {
    const previous = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
    const comparable = { ...report, generated_at: previous.generated_at };
    if (JSON.stringify(comparable) === JSON.stringify(previous)) {
      report.generated_at = previous.generated_at;
    }
  } catch {
    // Invalid previous evidence is replaced with the current report.
  }
}

fs.mkdirSync(path.dirname(reportPath), { recursive: true });
fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

if (status !== 'passed') {
  console.error('QA audit failed:');
  for (const finding of findings) {
    console.error(`- [${finding.severity}] ${finding.title}: ${finding.evidence}`);
  }
  process.exit(1);
}

console.log(`QA audit passed with ${findings.length} tracked finding${findings.length === 1 ? '' : 's'}.`);
