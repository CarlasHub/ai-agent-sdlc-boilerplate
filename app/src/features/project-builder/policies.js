const HIGH_RISK_CLASSES = new Set(['personal-data', 'regulated', 'secrets-blocked']);
const ELEVATED_RISK_CLASSES = new Set(['confidential', ...HIGH_RISK_CLASSES]);
const HIGH_RISK_LEVELS = new Set(['high', 'critical']);

function text(value) {
  return String(value || '').trim();
}

function lower(value) {
  return text(value).toLowerCase();
}

function includesAny(value, words) {
  const source = lower(value);
  return words.some((word) => source.includes(word));
}

function approvalComplete(config) {
  return Boolean(
    text(config.approverName) &&
    text(config.approverRole) &&
    text(config.approvalDate) &&
    lower(config.approverName) !== 'pending' &&
    lower(config.approverRole) !== 'pending' &&
    lower(config.approvalDate) !== 'pending'
  );
}

function check(id, title, passed, detail, severity = 'block') {
  return {
    id,
    title,
    status: passed ? 'pass' : severity,
    detail
  };
}

export function evaluateGovernancePolicies(config) {
  const dataClass = lower(config.dataClass || 'public');
  const riskLevel = lower(config.riskLevel || 'medium');
  const personalData = lower(config.personalData || 'no');
  const secrets = lower(config.secrets || 'no');
  const approvers = lower(config.approvers);
  const blockedData = lower(config.blockedData);
  const blockedTools = lower(config.blockedTools);
  const neverDo = lower(config.neverDo);
  const approvalScope = lower(config.approvalScope);
  const approvalConditions = lower(config.approvalConditions);
  const jobProfile = lower(config.jobProfile);
  const jobStopRules = lower(config.jobStopRules);
  const jobEvidenceRequirements = lower(config.jobEvidenceRequirements);
  const hasApproval = approvalComplete(config);
  const checks = [];

  checks.push(check(
    'risk-data-alignment',
    'Risk level matches data class',
    !ELEVATED_RISK_CLASSES.has(dataClass) || riskLevel === 'medium' || HIGH_RISK_LEVELS.has(riskLevel),
    'Confidential, personal, regulated or secret-related data needs at least medium risk.'
  ));

  checks.push(check(
    'regulated-data-escalation',
    'Regulated and personal data escalate to high risk',
    !HIGH_RISK_CLASSES.has(dataClass) || HIGH_RISK_LEVELS.has(riskLevel),
    'Personal, regulated or secret-related data needs high or critical risk.',
    'block'
  ));

  checks.push(check(
    'personal-data-boundary',
    'Personal data is explicitly blocked or governed',
    personalData !== 'yes' || (HIGH_RISK_LEVELS.has(riskLevel) && includesAny(blockedData, ['personal data', 'pii', 'customer data', 'candidate data'])),
    'Personal data requires high/critical risk and an explicit blocked or governed data statement.'
  ));

  checks.push(check(
    'secrets-blocked',
    'Secrets remain denied',
    secrets !== 'yes',
    'Secrets are blocked by this boilerplate until exceptional security approval and a dedicated secret-handling plan exist.'
  ));

  checks.push(check(
    'least-privilege-tools',
    'Blocked tools protect real systems',
    includesAny(blockedTools, ['production', 'deploy']) &&
      includesAny(blockedTools, ['database', 'databases', 'client systems', 'hr systems']) &&
      includesAny(blockedTools, ['secret', 'credential', 'token']),
    'Blocked tools must explicitly prevent production changes, real systems/databases and secrets.'
  ));

  checks.push(check(
    'approval-owner-coverage',
    'Approval roles cover governance and security',
    includesAny(approvers, ['governance', 'security']) || riskLevel === 'low',
    'Medium or higher risk requires governance or security review coverage.',
    'warn'
  ));

  checks.push(check(
    'approval-scope-boundary',
    'Approval scope preserves deployment and data limits',
    !hasApproval || (
      includesAny(`${approvalScope} ${approvalConditions}`, ['no real data', 'approved data', 'fictional']) &&
      includesAny(`${approvalScope} ${approvalConditions}`, ['no secrets', 'secrets']) &&
      includesAny(`${approvalScope} ${approvalConditions}`, ['no deployment', 'release approval'])
    ),
    'Implementation approval must state data, secrets and deployment boundaries.'
  ));

  checks.push(check(
    'qa-auditor-independence',
    'QA auditor cannot self-approve or edit audited work',
    jobProfile !== 'qa-auditor' || (
      includesAny(jobStopRules, ['approve own', 'self-approval', 'own audit']) &&
      includesAny(jobStopRules, ['edit audited', 'audited work', 'modify the audited'])
    ),
    'QA Auditor packs must preserve independence: no self-approval and no editing audited work.'
  ));

  checks.push(check(
    'evidence-is-actionable',
    'Evidence requirements support reproducibility',
    includesAny(jobEvidenceRequirements, ['evidence', 'test', 'reproduction', 'steps', 'file', 'screenshot']),
    'Evidence requirements should name concrete proof such as tests, reproduction steps, files or screenshots.',
    'warn'
  ));

  checks.push(check(
    'stop-rules-cover-bypass',
    'Stop rules block unsafe bypasses',
    includesAny(`${jobStopRules} ${neverDo}`, ['bypass', 'approve own', 'secrets', 'real data']),
    'Stop rules must block governance bypass, self-approval, secrets and real data.'
  ));

  const blockers = checks.filter((item) => item.status === 'block');
  const warnings = checks.filter((item) => item.status === 'warn');
  const passed = checks.filter((item) => item.status === 'pass');
  const score = Math.round((passed.length / checks.length) * 100);

  return {
    status: blockers.length ? 'blocked' : 'passed',
    ready_for_implementation: blockers.length === 0,
    score,
    checks,
    blockers,
    warnings
  };
}

export function approvalEffective(config) {
  return approvalComplete(config) && evaluateGovernancePolicies(config).ready_for_implementation;
}
