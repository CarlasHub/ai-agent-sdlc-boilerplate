import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const statusPath = path.join(root, '.agent-sdlc', 'enterprise-readiness.json');

const requiredFiles = [
  'AGENTS.md',
  'README.md',
  '.github/CODEOWNERS',
  '.github/pull_request_template.md',
  '.github/workflows/governance-check.yml',
  '.github/workflows/security-check.yml',
  '.github/workflows/release-gate.yml',
  'docs/enterprise/source-research-brief.md',
  'docs/enterprise/target-architecture.md',
  'docs/enterprise/operating-model.md',
  'docs/enterprise/enterprise-readiness-scorecard.md',
  'docs/mappings/enterprise-control-map.md',
  'docs/governance/09-human-approval-record.md',
  'docs/governance/10-release-gate.md',
  'docs/threat-model/agent-threat-model.template.md',
  'scripts/serve-app.mjs',
  'app/README.md',
  'app/index.html',
  'app/src/main.js',
  'app/src/styles.css',
  'app/src/data/fictional-recruitment-map-data.js',
  'app/src/features/project-builder/app.js',
  'app/src/features/project-builder/templates.js',
  'app/src/features/project-builder/zip.js',
  'app/src/lib/dom.js',
  'app/tests/manual-test-plan.md',
  'app/tests/accessibility-checklist.md',
  'app/docs/agent-handoff.md',
  'app/docs/implementation-notes.md',
  'app/docs/review-evidence.md'
];

const requiredScripts = [
  'governance:init',
  'governance:check',
  'evals:check',
  'enterprise:check',
  'app:serve',
  'audit:new',
  'release:gate',
  'check'
];

const requiredResearchLinks = [
  'https://www.saif.google/secure-ai-framework/controls',
  'https://www.nist.gov/itl/ai-risk-management-framework',
  'https://genai.owasp.org/resource/agentic-ai-threats-and-mitigations/',
  'https://owasp.org/www-project-top-10-for-large-language-model-applications/',
  'https://media.defense.gov/2026/Apr/30/2003922823/-1/-1/0/CAREFULADOPTIONOFAGENTICAISERVICES_FINAL.PDF',
  'https://google.github.io/eng-practices/',
  'https://sre.google/sre-book/service-level-objectives/',
  'https://slsa.dev/spec/v1.2/about',
  'https://openssf.org/scorecard/'
];

const checks = [];

function fullPath(file) {
  return path.join(root, file);
}

function read(file) {
  return fs.existsSync(fullPath(file)) ? fs.readFileSync(fullPath(file), 'utf8') : '';
}

function record(name, passed, evidence, severity = 'blocker') {
  checks.push({
    name,
    status: passed ? 'passed' : 'failed',
    severity,
    evidence
  });
}

function fileExists(file) {
  return fs.existsSync(fullPath(file));
}

for (const file of requiredFiles) {
  record(`Required file exists: ${file}`, fileExists(file), file);
}

const packageJson = JSON.parse(read('package.json') || '{}');
for (const script of requiredScripts) {
  record(
    `Package script exists: ${script}`,
    Boolean(packageJson.scripts?.[script]),
    `package.json scripts.${script}`
  );
}

const approval = read('docs/governance/09-human-approval-record.md');
record(
  'Implementation approval is recorded',
  /^APPROVED_FOR_IMPLEMENTATION:\s*yes\s*$/im.test(approval),
  'docs/governance/09-human-approval-record.md'
);

const governanceWorkflow = read('.github/workflows/governance-check.yml');
record(
  'CI runs enterprise readiness gate',
  governanceWorkflow.includes('npm run enterprise:check'),
  '.github/workflows/governance-check.yml'
);

const sourceBrief = read('docs/enterprise/source-research-brief.md');
for (const link of requiredResearchLinks) {
  record(`Research source linked: ${link}`, sourceBrief.includes(link), 'docs/enterprise/source-research-brief.md');
}

const enterpriseDocs = [
  'docs/enterprise/source-research-brief.md',
  'docs/enterprise/target-architecture.md',
  'docs/enterprise/operating-model.md',
  'docs/enterprise/enterprise-readiness-scorecard.md',
  'docs/mappings/enterprise-control-map.md'
];
for (const file of enterpriseDocs) {
  const content = read(file);
  record(
    `No unresolved placeholders in ${file}`,
    !/\[FILL_|\[\[|TODO:|TBD/i.test(content),
    file
  );
}

const evalDir = fullPath('evals/test-cases');
const evalCount = fs.existsSync(evalDir)
  ? fs.readdirSync(evalDir).filter((file) => file.endsWith('.md')).length
  : 0;
record('At least eight agent eval cases exist', evalCount >= 8, `eval count: ${evalCount}`);

const agentFiles = fs.existsSync(fullPath('agents'))
  ? fs.readdirSync(fullPath('agents')).filter((file) => file.endsWith('.md'))
  : [];
for (const file of agentFiles) {
  const content = read(path.join('agents', file));
  record(
    `Agent prompt includes governance gate: ${file}`,
    content.includes('npm run governance:check'),
    path.join('agents', file)
  );
}

const appReadme = read('app/README.md');
record(
  'App scaffold states fictional-data boundary',
  /fictional sample data|fictional public sample data|fictional public demo data/i.test(appReadme),
  'app/README.md'
);
record(
  'App scaffold includes accessibility evidence files',
  fileExists('app/tests/accessibility-checklist.md') && fileExists('app/docs/review-evidence.md'),
  'app/tests/accessibility-checklist.md and app/docs/review-evidence.md'
);

const codeowners = read('.github/CODEOWNERS');
record(
  'CODEOWNERS still needs real enterprise owner groups',
  !codeowners.includes('@your-org/'),
  '.github/CODEOWNERS',
  'warning'
);

record(
  'Git repository metadata is not available',
  fs.existsSync(fullPath('.git')),
  '.git',
  'warning'
);

const releaseGate = read('docs/governance/10-release-gate.md');
record(
  'Release approval is not recorded',
  /^RELEASE_APPROVED:\s*yes\s*$/im.test(releaseGate),
  'docs/governance/10-release-gate.md',
  'warning'
);

const auditEventsDir = fullPath('docs/audit/events');
const auditEventCount = fs.existsSync(auditEventsDir)
  ? fs.readdirSync(auditEventsDir).filter((file) => file.endsWith('.md')).length
  : 0;
record('Audit events exist', auditEventCount > 0, `audit events: ${auditEventCount}`, 'warning');

const blockerChecks = checks.filter((check) => check.severity === 'blocker');
const failedBlockers = blockerChecks.filter((check) => check.status === 'failed');
const failedWarnings = checks.filter((check) => check.severity === 'warning' && check.status === 'failed');
const score = blockerChecks.length
  ? Math.round(((blockerChecks.length - failedBlockers.length) / blockerChecks.length) * 100)
  : 100;

const status = {
  enterprise_ready: failedBlockers.length === 0,
  score,
  generated_at: new Date().toISOString(),
  failed_blockers: failedBlockers,
  warnings: failedWarnings,
  checks
};

fs.mkdirSync(path.dirname(statusPath), { recursive: true });
fs.writeFileSync(statusPath, JSON.stringify(status, null, 2));

if (failedBlockers.length) {
  console.error('\nEnterprise readiness check failed:\n');
  for (const issue of failedBlockers) {
    console.error(`- ${issue.name} (${issue.evidence})`);
  }
  if (failedWarnings.length) {
    console.error('\nWarnings:');
    for (const warning of failedWarnings) {
      console.error(`- ${warning.name} (${warning.evidence})`);
    }
  }
  process.exit(1);
}

console.log(`Enterprise readiness check passed with score ${score}/100.`);
if (failedWarnings.length) {
  console.log('\nWarnings:');
  for (const warning of failedWarnings) {
    console.log(`- ${warning.name} (${warning.evidence})`);
  }
}
