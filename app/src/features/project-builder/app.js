import {
  GOVERNANCE_DOC_COUNT,
  JOB_PROFILES,
  PROJECT_TYPES,
  generateProjectFiles,
  getAgentRoleCount,
  getEvalCount
} from './templates.js';
import { approvalEffective, evaluateGovernancePolicies } from './policies.js';
import { createZipBlob } from './zip.js';

const defaults = {
  projectType: PROJECT_TYPES[0].id,
  jobProfile: JOB_PROFILES[0].id,
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
  jobStopRules: JOB_PROFILES[0].defaultStopRules
};

const fieldHelp = {
  projectName: 'Expected: a short, clear project title. This becomes the generated folder and ZIP name, so avoid client names, secrets or personal data.',
  jobProfile: 'Expected: the job this governed agent is being asked to perform. This personalizes evidence, rubric, escalation and stop rules.',
  owner: 'Expected: the accountable person or team who owns governance decisions and follow-up.',
  purpose: 'Expected: one or two sentences describing exactly what the governed project or agent workflow should do.',
  users: 'Expected: the people who will use, supervise or review the generated project.',
  riskLevel: 'Expected: low, medium, high or critical. Pick the highest realistic risk level for the workflow.',
  dataClass: 'Expected: the highest data class allowed in the project. Use public when only fictional or public demo data is allowed.',
  personalData: 'Expected: yes only if real personal data is allowed. For this demo, keep this as no.',
  secrets: 'Expected: yes only if credentials, API keys or tokens are required. This should normally stay no.',
  approvers: 'Expected: roles or names that must approve implementation before an agent can write feature code.',
  riskRationale: 'Expected: why the selected risk level is correct, including what risks exist and what is out of scope.',
  highRiskAreas: 'Expected: the areas needing extra review, such as data, accessibility, security, public claims or release readiness.',
  dataSources: 'Expected: approved sources the generated project or agent may read. Keep this least-privilege.',
  blockedData: 'Expected: data that must never be used, such as real candidate data, secrets, production data or confidential material.',
  blockedTools: 'Expected: tools the agent must not use, such as paid APIs, deployment systems, real databases or HR systems.',
  neverDo: 'Expected: forbidden behaviours the generated agents must refuse or stop on.',
  dataOwner: 'Expected: the accountable owner for data access decisions.',
  releaseOwner: 'Expected: the person or team that can approve release separately from implementation.',
  jobScope: 'Expected: exactly what this job is allowed to inspect, decide or change.',
  jobQualityRubric: 'Expected: the pass/fail or severity model used to judge output quality.',
  jobEvidenceRequirements: 'Expected: the proof this job must collect before making a recommendation.',
  jobEscalationRules: 'Expected: when the agent must stop and ask a human or specialist reviewer.',
  jobOutputSchema: 'Expected: the required structure for the job output so results are consistent and reviewable.',
  jobStopRules: 'Expected: role-specific forbidden actions, especially self-approval, unsupported claims and unsafe tool use.',
  riskReviewFrequency: 'Expected: how often risk should be reviewed, such as weekly, monthly or per release.',
  includeApproval: 'Expected: enable only when a real human approval is being recorded. Leave unchecked to keep implementation blocked.',
  approverName: 'Expected: the real name of the human implementation approver. Leave blank if approval is still pending.',
  approverRole: 'Expected: the approver role, such as Project owner, Technical reviewer or AI governance reviewer.',
  approvalDate: 'Expected: the approval date in local project records. Use the actual human approval date.',
  approvalScope: 'Expected: exactly what implementation work is approved and the allowed boundaries.',
  approvalConditions: 'Expected: conditions that must remain true, such as no real data, no secrets and no deployment.',
  approvalNotes: 'Expected: additional human review notes or constraints that future agents should read.'
};

const typeHelp = {
  'front-end-demo': 'Generates a static app scaffold with demo data, accessibility notes, browser-test evidence and governance files.',
  'agent-workflow': 'Generates prompts, eval cases, audit records and tool-governance documents for an AI-assisted workflow.',
  'internal-tool': 'Generates a dashboard-style local tool scaffold with stronger permission and data-boundary defaults.',
  'documentation-system': 'Generates a documentation-first workspace for policies, decisions, review notes and governance evidence.',
  'governed-agent-team': 'Generates a multi-agent delivery team pack with design-system governance, component handoff, accessibility QA, commerce boundaries and extra evals.'
};

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

const ICONS = {
  'arrow-right': '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
  'book-open': '<path d="M12 7v14"/><path d="M3 5.5A2.5 2.5 0 0 1 5.5 3H12v18H5.5A2.5 2.5 0 0 1 3 18.5z"/><path d="M21 5.5A2.5 2.5 0 0 0 18.5 3H12v18h6.5a2.5 2.5 0 0 0 2.5-2.5z"/>',
  'check-circle': '<circle cx="12" cy="12" r="9"/><path d="m8.5 12.5 2.2 2.2 4.8-5.2"/>',
  'chevron-down': '<path d="m6 9 6 6 6-6"/>',
  'circle-plus': '<circle cx="12" cy="12" r="9"/><path d="M12 8v8"/><path d="M8 12h8"/>',
  'clipboard-check': '<path d="M9 5h6"/><path d="M9 3h6a1 1 0 0 1 1 1v1h2a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2V4a1 1 0 0 1 1-1Z"/><path d="m9 14 2 2 4-5"/>',
  'download': '<path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M5 21h14"/>',
  'file-text': '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6"/><path d="M16 13H8"/><path d="M16 17H8"/><path d="M10 9H8"/>',
  'flask': '<path d="M10 2v6.5L5.4 18.2A2.6 2.6 0 0 0 7.8 22h8.4a2.6 2.6 0 0 0 2.4-3.8L14 8.5V2"/><path d="M8.5 14h7"/><path d="M8 2h8"/>',
  'gauge': '<path d="M21 13a9 9 0 1 0-18 0"/><path d="M12 13l4-4"/><path d="M8 17h8"/>',
  'info': '<circle cx="12" cy="12" r="9"/><path d="M12 11v5"/><path d="M12 8h.01"/>',
  'layout-dashboard': '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/>',
  'lock': '<rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/><path d="M12 15v2"/>',
  'minus-circle': '<circle cx="12" cy="12" r="9"/><path d="M8 12h8"/>',
  'network': '<path d="M12 3 4.5 7.25v8.5L12 20l7.5-4.25v-8.5Z"/><path d="M12 8v8"/><path d="m7.2 10.5 4.8 2.7 4.8-2.7"/><path d="M7.2 13.5 12 16l4.8-2.5"/>',
  'package': '<path d="m12 3 8 4.5v9L12 21l-8-4.5v-9Z"/><path d="M12 12 4.4 7.7"/><path d="M12 12v9"/><path d="m12 12 7.6-4.3"/>',
  'plus': '<path d="M12 5v14"/><path d="M5 12h14"/>',
  'rotate-ccw': '<path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v6h6"/>',
  'shield-check': '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><path d="m9 12 2 2 4-4"/>',
  'target': '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/><path d="M12 2v3"/><path d="M12 19v3"/><path d="M2 12h3"/><path d="M19 12h3"/>',
  'terminal': '<path d="m4 17 5-5-5-5"/><path d="M12 19h8"/>',
  'trash': '<path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M19 6l-1 15H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/>',
  'users': '<path d="M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2"/><circle cx="9.5" cy="7.5" r="3.5"/><path d="M22 21v-2a4 4 0 0 0-3-3.85"/><path d="M16 4.15a3.5 3.5 0 0 1 0 6.7"/>',
  'x-circle': '<circle cx="12" cy="12" r="9"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/>'
};

function svgIcon(name, className = 'ui-icon') {
  const iconName = ICONS[name] ? name : 'info';

  return `
    <svg class="${escapeHtml(className)} icon-${escapeHtml(iconName)}" aria-hidden="true" viewBox="0 0 24 24" fill="none" focusable="false" xmlns="http://www.w3.org/2000/svg">
      ${ICONS[iconName]}
    </svg>
  `;
}

function selectedType(id) {
  return PROJECT_TYPES.find((type) => type.id === id) || PROJECT_TYPES[0];
}

function selectedJobProfile(id) {
  return JOB_PROFILES.find((profile) => profile.id === id) || JOB_PROFILES[0];
}

const profileFieldDefaults = {
  jobScope: 'defaultScope',
  jobQualityRubric: 'defaultRubric',
  jobEvidenceRequirements: 'defaultEvidence',
  jobEscalationRules: 'defaultEscalation',
  jobOutputSchema: 'defaultOutputSchema',
  jobStopRules: 'defaultStopRules'
};

function isProfileDefaultValue(fieldName, value) {
  const profileKey = profileFieldDefaults[fieldName];
  if (!profileKey) return false;

  return JOB_PROFILES.some((profile) => profile[profileKey] === value);
}

function applyJobProfileDefaults(form, profile) {
  for (const [fieldName, profileKey] of Object.entries(profileFieldDefaults)) {
    const field = form.elements[fieldName];
    if (!field) continue;

    const currentValue = String(field.value || '').trim();
    if (!currentValue || isProfileDefaultValue(fieldName, currentValue)) {
      field.value = profile[profileKey];
    }
  }
}

function fieldId(name) {
  return `field-${name}`;
}

function infoButton(label, tooltipId) {
  return `
    <button
      class="info-button"
      type="button"
      aria-label="Show help for ${escapeHtml(label)}"
      aria-expanded="false"
      aria-controls="${escapeHtml(tooltipId)}"
      data-tooltip-trigger="${escapeHtml(tooltipId)}"
    >${svgIcon('info', 'ui-icon info-icon')}</button>
  `;
}

function tooltipMarkup(id, text, extraClass = '') {
  return `
    <p class="field-tooltip ${extraClass}" id="${escapeHtml(id)}" role="tooltip" hidden>
      ${escapeHtml(text)}
    </p>
  `;
}

function downloadBlob(blob, fileName) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = fileName;
  link.style.display = 'none';
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

function focusPrimaryHeading(root) {
  window.requestAnimationFrame(() => {
    const heading = root.querySelector('h1');
    if (!heading) return;

    heading.setAttribute('tabindex', '-1');
    heading.focus({ preventScroll: true });
  });
}

function relativeFileName(file, root) {
  return file.path.replace(`${root}/`, '');
}

function includedFiles(result, excludedFiles) {
  return result.files.filter((file) => !excludedFiles.has(relativeFileName(file, result.root)));
}

function removedFiles(result, excludedFiles) {
  return result.files.filter((file) => excludedFiles.has(relativeFileName(file, result.root)));
}

function withIncludedFiles(result, excludedFiles) {
  return {
    ...result,
    files: includedFiles(result, excludedFiles)
  };
}

function terminalRows(files, root, visibleCount = files.length, status = 'queued', removable = false) {
  return files.slice(0, visibleCount).map((file) => {
    const relativePath = relativeFileName(file, root);
    const command = status === 'written' ? 'write' : 'queue';
    const statusIcon = status === 'written' ? 'check-circle' : 'circle-plus';

    return `
      <li class="live-file-row ${removable ? 'is-editable' : ''}">
        <span class="file-status ${status}">${svgIcon(statusIcon, 'ui-icon file-status-icon')}</span>
        <code>${escapeHtml(`${command} ${relativePath}`)}</code>
        ${removable ? `
          <button class="file-action remove-file" type="button" data-remove-file="${escapeHtml(relativePath)}" aria-label="Remove ${escapeHtml(relativePath)} from project">
            ${svgIcon('trash', 'ui-icon action-icon')}
          </button>
        ` : ''}
      </li>
    `;
  }).join('');
}

function removedRows(files, root) {
  if (!files.length) return '';

  return `
    <div class="removed-files" aria-label="Removed files">
      <p><span>${svgIcon('minus-circle', 'ui-icon terminal-icon')}</span> ${files.length} file${files.length === 1 ? '' : 's'} removed from package</p>
      <ul>
        ${files.map((file) => {
          const relativePath = relativeFileName(file, root);

          return `
            <li class="live-file-row is-removed">
              <span class="file-status removed">${svgIcon('x-circle', 'ui-icon file-status-icon')}</span>
              <code>${escapeHtml(relativePath)}</code>
              <button class="file-action restore-file" type="button" data-restore-file="${escapeHtml(relativePath)}" aria-label="Restore ${escapeHtml(relativePath)} to project">
                ${svgIcon('rotate-ccw', 'ui-icon action-icon')}
              </button>
            </li>
          `;
        }).join('')}
      </ul>
    </div>
  `;
}

function buildProgress(build) {
  if (!build?.result?.files?.length) return 0;
  return Math.round((build.visibleCount / build.result.files.length) * 100);
}

function getFormConfig(form) {
  const data = new FormData(form);
  const includeApproval = data.get('includeApproval') === 'yes';
  const type = selectedType(String(data.get('projectType') || defaults.projectType));
  const profile = selectedJobProfile(String(data.get('jobProfile') || defaults.jobProfile));

  return {
    projectType: type.id,
    jobProfile: profile.id,
    projectName: String(data.get('projectName') || defaults.projectName).trim(),
    owner: String(data.get('owner') || defaults.owner).trim(),
    purpose: String(data.get('purpose') || type.defaultPurpose).trim(),
    users: String(data.get('users') || defaults.users).trim(),
    riskLevel: String(data.get('riskLevel') || defaults.riskLevel),
    dataClass: String(data.get('dataClass') || defaults.dataClass),
    riskReviewFrequency: String(data.get('riskReviewFrequency') || defaults.riskReviewFrequency).trim(),
    personalData: String(data.get('personalData') || defaults.personalData),
    secrets: String(data.get('secrets') || defaults.secrets),
    approvers: String(data.get('approvers') || defaults.approvers).trim(),
    riskRationale: String(data.get('riskRationale') || defaults.riskRationale).trim(),
    highRiskAreas: String(data.get('highRiskAreas') || defaults.highRiskAreas).trim(),
    dataSources: String(data.get('dataSources') || defaults.dataSources).trim(),
    blockedData: String(data.get('blockedData') || defaults.blockedData).trim(),
    neverDo: String(data.get('neverDo') || defaults.neverDo).trim(),
    blockedTools: String(data.get('blockedTools') || defaults.blockedTools).trim(),
    dataOwner: String(data.get('dataOwner') || defaults.dataOwner).trim(),
    releaseOwner: String(data.get('releaseOwner') || defaults.releaseOwner).trim(),
    jobScope: String(data.get('jobScope') || profile.defaultScope).trim(),
    jobQualityRubric: String(data.get('jobQualityRubric') || profile.defaultRubric).trim(),
    jobEvidenceRequirements: String(data.get('jobEvidenceRequirements') || profile.defaultEvidence).trim(),
    jobEscalationRules: String(data.get('jobEscalationRules') || profile.defaultEscalation).trim(),
    jobOutputSchema: String(data.get('jobOutputSchema') || profile.defaultOutputSchema).trim(),
    jobStopRules: String(data.get('jobStopRules') || profile.defaultStopRules).trim(),
    approverName: includeApproval ? String(data.get('approverName') || 'pending').trim() : 'pending',
    approverRole: includeApproval ? String(data.get('approverRole') || 'pending').trim() : 'pending',
    approvalDate: includeApproval ? String(data.get('approvalDate') || new Date().toISOString().slice(0, 10)) : 'pending',
    approvalScope: includeApproval ? String(data.get('approvalScope') || 'Approved for local implementation inside the documented scope.').trim() : 'pending',
    approvalConditions: includeApproval ? String(data.get('approvalConditions') || 'No real data, no secrets, no production systems and no deployment without release approval.').trim() : 'pending',
    approvalNotes: includeApproval ? String(data.get('approvalNotes') || 'Implementation may proceed after governance validation passes.').trim() : 'pending'
  };
}

function typeOptions(activeType) {
  return PROJECT_TYPES.map((type) => {
    const id = `project-type-${type.id}`;
    const tooltipId = `${id}-tooltip`;

    return `
      <div class="type-option ${type.id === activeType ? 'is-selected' : ''}">
        <input id="${escapeHtml(id)}" type="radio" name="projectType" value="${type.id}" ${type.id === activeType ? 'checked' : ''}>
        <label class="type-card-label" for="${escapeHtml(id)}">
          <span class="type-mark">${escapeHtml(type.accent)}</span>
          <span>
            <strong>${escapeHtml(type.label)}</strong>
            <small>${escapeHtml(type.description)}</small>
          </span>
        </label>
        ${infoButton(type.label, tooltipId)}
        ${tooltipMarkup(tooltipId, typeHelp[type.id] || 'Expected: choose this project type when it matches the workspace your team needs.', 'type-tooltip')}
      </div>
    `;
  }).join('');
}

function jobProfileSelect(activeProfile) {
  const id = fieldId('jobProfile');
  const tooltipId = `${id}-tooltip`;

  return `
    <div class="field wide-field">
      <div class="field-label-row">
        <label for="${escapeHtml(id)}">Job profile</label>
        ${infoButton('Job profile', tooltipId)}
      </div>
      ${tooltipMarkup(tooltipId, fieldHelp.jobProfile)}
      <select id="${escapeHtml(id)}" name="jobProfile">
        ${JOB_PROFILES.map((profile) => `<option value="${profile.id}" ${profile.id === activeProfile ? 'selected' : ''}>${escapeHtml(profile.label)} - ${escapeHtml(profile.description)}</option>`).join('')}
      </select>
      <small>Personalizes the generated governance docs, job eval, evidence rules and stop conditions.</small>
    </div>
  `;
}

function field(name, label, value, type = 'text', caption = '') {
  const id = fieldId(name);
  const hintId = `${id}-hint`;
  const tooltipId = `${id}-tooltip`;

  return `
    <div class="field">
      <div class="field-label-row">
        <label for="${escapeHtml(id)}">${escapeHtml(label)}</label>
        ${infoButton(label, tooltipId)}
      </div>
      ${tooltipMarkup(tooltipId, fieldHelp[name] || 'Expected: provide the requested project information clearly and without sensitive data.')}
      <input id="${escapeHtml(id)}" name="${name}" type="${type}" value="${escapeHtml(value)}" ${caption ? `aria-describedby="${escapeHtml(hintId)}"` : ''} ${name === 'projectName' || name === 'owner' ? 'required' : ''}>
      ${caption ? `<small id="${escapeHtml(hintId)}">${escapeHtml(caption)}</small>` : ''}
    </div>
  `;
}

function textArea(name, label, value, rows = 2, caption = '') {
  const id = fieldId(name);
  const hintId = `${id}-hint`;
  const tooltipId = `${id}-tooltip`;

  return `
    <div class="field wide-field">
      <div class="field-label-row">
        <label for="${escapeHtml(id)}">${escapeHtml(label)}</label>
        ${infoButton(label, tooltipId)}
      </div>
      ${tooltipMarkup(tooltipId, fieldHelp[name] || 'Expected: write a concise answer that future reviewers can understand.')}
      <textarea id="${escapeHtml(id)}" name="${name}" rows="${rows}" ${caption ? `aria-describedby="${escapeHtml(hintId)}"` : ''}>${escapeHtml(value)}</textarea>
      ${caption ? `<small id="${escapeHtml(hintId)}">${escapeHtml(caption)}</small>` : ''}
    </div>
  `;
}

function selectField(name, label, value, options) {
  const id = fieldId(name);
  const tooltipId = `${id}-tooltip`;

  return `
    <div class="field">
      <div class="field-label-row">
        <label for="${escapeHtml(id)}">${escapeHtml(label)}</label>
        ${infoButton(label, tooltipId)}
      </div>
      ${tooltipMarkup(tooltipId, fieldHelp[name] || 'Expected: choose the option that best matches the governed project.')}
      <select id="${escapeHtml(id)}" name="${name}">
        ${options.map((option) => `<option value="${option}" ${option === value ? 'selected' : ''}>${option}</option>`).join('')}
      </select>
    </div>
  `;
}

function checkField(name, label) {
  const id = fieldId(name);
  const tooltipId = `${id}-tooltip`;

  return `
    <div class="check-field wide-field">
      <div class="field-label-row check-label-row">
        <label class="check-row" for="${escapeHtml(id)}">
          <input id="${escapeHtml(id)}" type="checkbox" name="${name}" value="yes">
          <span>${escapeHtml(label)}</span>
        </label>
        ${infoButton(label, tooltipId)}
      </div>
      ${tooltipMarkup(tooltipId, fieldHelp[name] || 'Expected: enable only when this condition is true.')}
    </div>
  `;
}

function sectionContinue(target, label, note) {
  return `
    <div class="section-actions">
      <a class="section-next" href="${escapeHtml(target)}">${escapeHtml(label)} <span class="button-chevron" aria-hidden="true">${svgIcon('arrow-right', 'ui-icon')}</span></a>
      <small>${escapeHtml(note)}</small>
    </div>
  `;
}

function metricCard(iconName, label, value, tone = 'neutral') {
  return `
    <article class="metric-card metric-${escapeHtml(tone)}">
      <span class="metric-symbol">${svgIcon(iconName, 'ui-icon metric-icon')}</span>
      <span class="metric-label">${escapeHtml(label)}</span>
      <strong>${escapeHtml(value)}</strong>
    </article>
  `;
}

function gateIcon(status) {
  const normalized = String(status).toLowerCase();
  if (normalized === 'pass') return 'check-circle';
  if (normalized === 'warn' || normalized === 'pending') return 'minus-circle';
  if (normalized === 'blocked') return 'x-circle';
  return 'info';
}

function gateRow(className, status, label) {
  return `
    <div class="gate-row ${escapeHtml(className)}">
      <span class="gate-icon">${svgIcon(gateIcon(status), 'ui-icon list-icon')}</span>
      <span>${escapeHtml(label)}</span>
      <strong>${escapeHtml(status)}</strong>
    </div>
  `;
}

function landingMarkup() {
  return `
    <section class="launch-shell" aria-labelledby="hero-title">
      <div class="terminal-card">
        <div class="terminal-titlebar">
          <span></span><span></span><span></span>
          <strong>agent-sdlc</strong>
        </div>
        <div class="terminal-body">
          <p><span>$</span> init project-blueprint</p>
          <p><span>></span> choose project type</p>
          <p><span>></span> generate governance evidence</p>
          <p><span>></span> download team-ready workspace.zip</p>
        </div>
      </div>
      <div class="launch-copy">
        <p class="eyebrow">Project Blueprint Starter</p>
        <h1 id="hero-title">Build a governed project blueprint with a real file preview.</h1>
        <p>Start with governance, see the exact workspace you are generating, then download a complete ZIP your team can inspect and run.</p>
        <button class="primary-action" type="button" data-action="start">
          ${svgIcon('plus', 'ui-icon button-icon')}
          Start blueprint
        </button>
      </div>
    </section>
  `;
}

function previewMarkup(config, excludedFiles = new Set()) {
  const generated = generateProjectFiles(config);
  const type = selectedType(config.projectType);
  const profile = selectedJobProfile(config.jobProfile);
  const activeFiles = includedFiles(generated, excludedFiles);
  const inactiveFiles = removedFiles(generated, excludedFiles);
  const inclusionRatio = generated.files.length
    ? Math.max(8, Math.round((activeFiles.length / generated.files.length) * 100))
    : 0;
  const roleCount = getAgentRoleCount(config);
  const evalCount = getEvalCount(config);
  const policyStatus = evaluateGovernancePolicies(config);
  const hasImplementationApproval = approvalEffective(config);
  const governanceReadiness = hasImplementationApproval ? inclusionRatio : Math.min(inclusionRatio, 72);
  const approvalStateLabel = hasImplementationApproval ? 'APPROVED' : 'BLOCKED';
  const approvalCopy = hasImplementationApproval
    ? 'Human implementation approval will be recorded in the generated evidence.'
    : policyStatus.blockers.length
      ? 'Resolve blocking policy checks before implementation can start.'
      : 'Human review and approval required to continue.';

  return `
    <section class="blueprint-intelligence package-summary">
      <div class="panel-heading">
        <div>
          <p class="panel-kicker">Package summary</p>
          <h2>${escapeHtml(generated.fileName)}</h2>
        </div>
      </div>

      <div class="intel-metric-grid" aria-label="Blueprint package metrics">
        ${metricCard('file-text', 'Files included', `${activeFiles.length} / ${generated.files.length}`)}
        ${metricCard('shield-check', 'Governance docs', GOVERNANCE_DOC_COUNT)}
        ${metricCard('users', 'Agent roles', roleCount)}
        ${metricCard('flask', 'Eval cases', evalCount, 'purple')}
        ${metricCard('check-circle', 'Gate checks', hasImplementationApproval ? '8 / 8' : `${policyStatus.blockers.length ? '6' : '7'} / 8`, hasImplementationApproval ? 'success' : 'warning')}
        ${metricCard('gauge', 'Policy score', `${policyStatus.score}%`)}
      </div>

      <div class="readiness-meter" aria-label="Governance readiness progress">
        <div>
          <span>Export readiness</span>
          <strong>${governanceReadiness}%</strong>
        </div>
        <i><span style="width: ${governanceReadiness}%"></span></i>
      </div>
    </section>

    <section class="gate-approval-grid">
      <div class="gate-stack">
        <p class="panel-kicker">Gate Stack</p>
        <div class="gate-list" aria-label="Generated readiness checks">
          ${gateRow('is-pass', 'PASS', 'Governance gate')}
          ${gateRow('is-pass', 'PASS', 'Risk and data boundary check')}
          ${gateRow('is-pass', 'PASS', 'Eval coverage')}
          ${gateRow('is-pass', 'PASS', 'Least privilege agent prompts')}
          ${gateRow(policyStatus.blockers.length ? 'is-block' : 'is-pass', policyStatus.blockers.length ? 'BLOCKED' : 'PASS', 'Policy conditions')}
          ${gateRow(hasImplementationApproval ? 'is-pass' : 'is-hold', hasImplementationApproval ? 'PASS' : 'PENDING', 'Human approval')}
          ${gateRow('is-pass', 'PASS', 'Release gate included')}
          ${gateRow(inactiveFiles.length ? 'is-warn' : 'is-pass', inactiveFiles.length ? 'WARN' : 'PASS', 'Package integrity')}
        </div>
      </div>

      <div class="approval-state-card ${hasImplementationApproval ? 'is-approved' : 'is-blocked'}">
        <p class="panel-kicker">Approval State</p>
        <div class="approval-lock" aria-hidden="true">${svgIcon(hasImplementationApproval ? 'check-circle' : 'lock', 'ui-icon approval-icon')}</div>
        <strong>${approvalStateLabel}</strong>
        <p>${escapeHtml(approvalCopy)}</p>
        <a class="review-link" href="#section-approval">Review &amp; Approve <span class="button-chevron" aria-hidden="true">${svgIcon('arrow-right', 'ui-icon')}</span></a>
      </div>
    </section>

    <details class="intel-details">
      <summary>Generated files <span class="details-chevron" aria-hidden="true">${svgIcon('chevron-down', 'ui-icon')}</span></summary>
      <div class="file-browser live-file-browser" aria-label="Live generated project preview" aria-live="polite">
        <div class="command-line" aria-label="Local build command">
          <span>${svgIcon('terminal', 'ui-icon terminal-icon')}</span>
          <code>agent-sdlc build --type ${escapeHtml(type.id)} --job ${escapeHtml(profile.id)} --local-only</code>
        </div>
        <div class="terminal-feed">
          <p><span>${svgIcon('arrow-right', 'ui-icon terminal-icon')}</span> ${activeFiles.length} of ${generated.files.length} files included locally</p>
          <p class="feed-note"><span>${svgIcon('info', 'ui-icon terminal-icon')}</span> Removing governance or script files may make generated checks fail.</p>
          <ul>${terminalRows(activeFiles, generated.root, activeFiles.length, 'queued', true)}</ul>
          ${removedRows(inactiveFiles, generated.root)}
        </div>
      </div>
    </details>

    <details class="intel-details">
      <summary>Agent roles <span class="details-chevron" aria-hidden="true">${svgIcon('chevron-down', 'ui-icon')}</span></summary>
      <p>${roleCount} least-privilege agent role prompts will be generated for ${escapeHtml(profile.label)}.</p>
    </details>

    <details class="intel-details">
      <summary>Eval coverage <span class="details-chevron" aria-hidden="true">${svgIcon('chevron-down', 'ui-icon')}</span></summary>
      <p>${evalCount} eval cases cover scope adherence, prompt injection, forbidden actions, sensitive data, tool misuse, unsupported claims, approval gates and audit logging.</p>
    </details>

    <details class="intel-details">
      <summary>Policy checks <span class="details-chevron" aria-hidden="true">${svgIcon('chevron-down', 'ui-icon')}</span></summary>
      <p>${policyStatus.blockers.length ? `${policyStatus.blockers.length} blocking condition${policyStatus.blockers.length === 1 ? '' : 's'} require review before implementation.` : 'All generated policy conditions pass for implementation readiness.'}</p>
      <div class="gate-list compact-gate-list" aria-label="Policy check results">
        ${policyStatus.checks.map((item) => gateRow(item.status === 'pass' ? 'is-pass' : item.status === 'warn' ? 'is-warn' : 'is-hold', item.status.toUpperCase(), item.title)).join('')}
      </div>
    </details>

    <details class="intel-details">
      <summary>Human approval record <span class="details-chevron" aria-hidden="true">${svgIcon('chevron-down', 'ui-icon')}</span></summary>
      <div class="approval-summary">
        <p class="preview-label">Approval state</p>
        <h3>APPROVED_FOR_IMPLEMENTATION: ${hasImplementationApproval ? 'yes' : 'no'}</h3>
        <p>${escapeHtml(config.projectName)} exports as a governed ${escapeHtml(type.label)}. Release remains separate from implementation approval.</p>
      </div>
    </details>
  `;
}

function builderMarkup(excludedFiles = new Set()) {
  const type = selectedType(defaults.projectType);
  const profile = selectedJobProfile(defaults.jobProfile);

  return `
    <form class="console-shell" id="project-form">
      <aside class="console-sidebar" aria-label="AI-Agent SDLC navigation">
        <div class="brand-lockup">
          <div class="brand-mark" aria-hidden="true">${svgIcon('network', 'ui-icon brand-icon')}</div>
          <div>
            <strong>AI-Agent<br>SDLC<br>Blueprint</strong>
          </div>
        </div>

        <nav class="side-nav" aria-label="Workspace">
          <a class="is-active" href="#project-builder-config"><span class="nav-icon">${svgIcon('layout-dashboard', 'ui-icon')}</span>Builder</a>
          <a href="#project-export"><span class="nav-icon">${svgIcon('download', 'ui-icon')}</span>Export</a>
          <a href="#about-boilerplate"><span class="nav-icon">${svgIcon('book-open', 'ui-icon')}</span>About</a>
        </nav>

        <div class="sidebar-footer">
          <div class="environment-card">
            <span>Output</span>
            <strong>Local ZIP</strong>
            <small>No backend required</small>
          </div>
          <div class="secure-card">
            <strong>Default gate</strong>
            <span>Approval first</span>
          </div>
        </div>
      </aside>

      <section class="top-command-row">
        <section class="network-panel step-overview" aria-labelledby="step-overview-title">
          <p class="panel-kicker" id="step-overview-title">Builder steps</p>
          <div class="step-chip-grid" aria-label="Project builder steps">
            <article><span>01</span><strong>Scope</strong></article>
            <article><span>02</span><strong>Guardrails</strong></article>
            <article><span>03</span><strong>Approval</strong></article>
            <article><span>04</span><strong>Export</strong></article>
          </div>
        </section>

        <section class="readiness-health-panel" aria-label="Current package status">
          <div class="readiness-gauge">
            <p class="panel-kicker">Package status</p>
            <div class="gauge-row">
              <div class="gauge-ring" aria-hidden="true"></div>
              <div><strong>72%</strong><span>Review</span></div>
            </div>
          </div>
          <ul class="status-fact-list">
            <li><strong>Approval</strong><span class="status-blocked">Blocked</span></li>
            <li><strong>Secrets</strong><span class="status-locked">Denied</span></li>
            <li><strong>Access</strong><span class="status-ready">Least privilege</span></li>
          </ul>
        </section>
      </section>

      <main class="console-main">
        <section class="hero-console" aria-labelledby="builder-title">
          <div class="hero-copy">
            <p class="eyebrow">Local governed package</p>
            <h1 id="builder-title">Agent SDLC boilerplate</h1>
            <p class="hero-subtitle">Scope / Guardrails / Approval / Export</p>
            <p>Fill the steps below and export a review-ready ZIP.</p>
            <a class="primary-action hero-action" href="#project-builder-config">
              Start builder
              <span class="button-chevron" aria-hidden="true">${svgIcon('arrow-right', 'ui-icon')}</span>
            </a>
          </div>

          <div class="blueprint-flow" aria-label="SDLC blueprint flow">
            <div class="governance-node scope"><span class="node-icon">${svgIcon('target', 'ui-icon')}</span><span class="node-number">01</span><strong>Scope</strong></div>
            <div class="flow-line"></div>
            <div class="governance-node guardrails"><span class="node-icon">${svgIcon('shield-check', 'ui-icon')}</span><span class="node-number">02</span><strong>Guardrails</strong></div>
            <div class="flow-line"></div>
            <div class="governance-node approval"><span class="node-icon">${svgIcon('users', 'ui-icon')}</span><span class="node-number">03</span><strong>Approval</strong></div>
            <div class="flow-line"></div>
            <div class="governance-node export"><span class="node-icon">${svgIcon('download', 'ui-icon')}</span><span class="node-number">04</span><strong>Export</strong></div>
            <ul class="orbit-list">
              <li>Risk checks</li>
              <li>Data boundaries</li>
              <li>Eval cases</li>
              <li>Audit evidence</li>
            </ul>
          </div>
        </section>

        <section class="builder-config-panel" id="project-builder-config" aria-labelledby="config-title">
          <div class="panel-heading">
            <div>
              <p class="panel-kicker">Builder</p>
              <h2 id="config-title">Configure package</h2>
            </div>
            <button class="ghost-action" type="button" data-action="reset">Reset</button>
          </div>

          <section class="config-section" id="section-project">
            <div class="section-heading">
              <p class="step-label">Step 1 of 4</p>
              <h3>Scope</h3>
              <p>Project, job profile and purpose.</p>
            </div>
            <div class="field-grid">
              ${field('projectName', 'Project name', defaults.projectName, 'text', 'Used for folder, ZIP and governance docs.')}
              ${jobProfileSelect(profile.id)}
              ${textArea('purpose', 'Purpose', type.defaultPurpose, 4)}
            </div>
            <div class="type-list">${typeOptions(type.id)}</div>
            ${sectionContinue('#section-governance', 'Continue to guardrails', 'Next: confirm owner, users, risk and allowed data.')}
          </section>

          <section class="config-section" id="section-governance">
            <div class="section-heading">
              <p class="step-label">Step 2 of 4</p>
              <h3>Guardrails</h3>
              <p>Owner, users, risk and data boundaries.</p>
            </div>
            <div class="field-grid">
              ${field('owner', 'Owner', defaults.owner, 'text', 'Named accountable owner.')}
              ${textArea('users', 'Users', defaults.users, 2)}
              ${selectField('riskLevel', 'Risk level', defaults.riskLevel, ['low', 'medium', 'high', 'critical'])}
              ${selectField('dataClass', 'Data class', defaults.dataClass, ['public', 'internal', 'confidential', 'personal-data', 'regulated', 'secrets-blocked'])}
              ${selectField('personalData', 'Personal data', defaults.personalData, ['no', 'yes'])}
              ${selectField('secrets', 'Secrets', defaults.secrets, ['no', 'yes'])}
            </div>
            ${sectionContinue('#section-controls', 'Continue to boundaries', 'Next: state what agents may read, use and refuse.')}
          </section>

          <section class="config-section" id="section-controls">
            <div class="section-heading">
              <p class="step-label">Step 3 of 4</p>
              <h3>Agent rules</h3>
              <p>Job rules, blocked actions and accountable owners.</p>
            </div>
            <div class="field-group-stack">
              <section class="field-group" aria-labelledby="agent-job-rules-title">
                <h3 id="agent-job-rules-title">Agent job rules</h3>
                <div class="field-grid">
                  ${textArea('jobScope', 'Job scope', defaults.jobScope, 3)}
                  ${textArea('jobQualityRubric', 'Decision rubric', defaults.jobQualityRubric, 3)}
                  ${textArea('jobEvidenceRequirements', 'Evidence requirements', defaults.jobEvidenceRequirements, 3)}
                  ${textArea('jobOutputSchema', 'Output schema', defaults.jobOutputSchema, 3)}
                  ${textArea('jobEscalationRules', 'Escalation rules', defaults.jobEscalationRules, 3)}
                </div>
              </section>

              <section class="field-group" aria-labelledby="safety-boundaries-title">
                <h3 id="safety-boundaries-title">Safety boundaries</h3>
                <div class="field-grid">
                  ${textArea('blockedData', 'Blocked data', defaults.blockedData, 2)}
                  ${textArea('blockedTools', 'Blocked tools', defaults.blockedTools, 2)}
                  ${textArea('neverDo', 'Never do', defaults.neverDo, 2)}
                  ${textArea('jobStopRules', 'Job stop rules', defaults.jobStopRules, 3)}
                  ${textArea('dataSources', 'Data sources', defaults.dataSources, 2)}
                </div>
              </section>

              <section class="field-group" aria-labelledby="governance-ownership-title">
                <h3 id="governance-ownership-title">Governance ownership</h3>
                <div class="field-grid">
                  ${textArea('approvers', 'Approvers', defaults.approvers, 2)}
                  ${field('dataOwner', 'Data owner', defaults.dataOwner)}
                  ${field('releaseOwner', 'Release owner', defaults.releaseOwner)}
                  ${field('riskReviewFrequency', 'Risk review', defaults.riskReviewFrequency)}
                  ${textArea('riskRationale', 'Risk rationale', defaults.riskRationale, 2)}
                  ${textArea('highRiskAreas', 'Risk areas', defaults.highRiskAreas, 2)}
                </div>
              </section>
            </div>
            ${sectionContinue('#section-approval', 'Continue to approval', 'Next: leave implementation blocked or record real human sign-off.')}
          </section>

          <section class="config-section" id="section-approval">
            <div class="section-heading">
              <p class="step-label">Step 4 of 4</p>
              <h3>Approval</h3>
              <p>Leave blank to keep implementation blocked.</p>
            </div>
            ${checkField('includeApproval', 'Include human implementation approval in the generated project.')}
            <div class="field-grid approval-fields" aria-label="Implementation approval fields">
              ${field('approverName', 'Approver', '', 'text', 'Leave empty to keep implementation blocked.')}
              ${field('approverRole', 'Role', '', 'text')}
              ${field('approvalDate', 'Date', '', 'date')}
              ${textArea('approvalScope', 'Scope', 'Approved for local implementation inside the documented scope.', 2)}
              ${textArea('approvalConditions', 'Conditions', 'No real data, no secrets, no production systems and no deployment without release approval.', 2)}
              ${textArea('approvalNotes', 'Notes', 'Implementation may proceed after governance validation passes.', 2)}
            </div>
            ${sectionContinue('#project-export', 'Review export', 'Final: check the package preview before downloading the ZIP.')}
          </section>

          <div class="export-bar" id="project-export">
            <div>
              <strong>Export package</strong>
              <span>Governance docs, agent prompts, evals and gates.</span>
            </div>
            <button class="primary-action" type="submit">
              ${svgIcon('download', 'ui-icon button-icon')}
              Export governed package
            </button>
          </div>
        </section>

        <section class="about-panel" id="about-boilerplate" aria-labelledby="about-title">
          <div class="panel-heading">
            <div>
              <p class="panel-kicker">About</p>
              <h2 id="about-title">How the boilerplate works</h2>
            </div>
          </div>
          <div class="about-grid">
            <article><span>01</span><strong>Scope</strong><p>Name the project, select the job profile and define the expected output.</p></article>
            <article><span>02</span><strong>Guardrails</strong><p>Record owner, users, risk, data class, secrets and personal-data boundaries.</p></article>
            <article><span>03</span><strong>Agent rules</strong><p>Generate prompts, quality rubric, evidence requirements, blocked tools and stop rules.</p></article>
            <article><span>04</span><strong>Approval</strong><p>Keep implementation blocked unless a human approval record is entered.</p></article>
            <article><span>05</span><strong>Export</strong><p>Download a local ZIP with governance docs, eval cases, audit templates and release gates.</p></article>
          </div>
        </section>
      </main>

      <aside class="intelligence-panel" id="package-summary" data-preview aria-label="Package summary">
        ${previewMarkup(defaults, excludedFiles)}
      </aside>
    </form>
  `;
}

function assemblyMarkup(build) {
  const { result } = build;
  const complete = build.visibleCount >= result.files.length;
  const visibleFiles = result.files.slice(0, build.visibleCount);
  const nextFile = result.files[build.visibleCount];
  const progress = buildProgress(build);

  return `
    <section class="assembly-shell" aria-labelledby="assembly-title">
      <div class="assembly-copy">
        <p class="eyebrow">${complete ? 'Project assembled' : 'Building workspace'}</p>
        <h1 id="assembly-title">${escapeHtml(result.fileName)}</h1>
        <p>${complete ? 'All files are written into the local package. The project ZIP is ready when you are.' : 'Watch the governed project come together file by file before the download is unlocked.'}</p>
        <div class="progress-wrap" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${progress}" aria-label="Project build progress">
          <span style="width: ${progress}%"></span>
        </div>
        <p class="build-count">${build.visibleCount} / ${result.files.length} files added${nextFile ? ` - writing ${escapeHtml(relativeFileName(nextFile, result.root))}` : ''}</p>
        <div class="action-row">
          <button class="primary-action" type="button" data-action="get-project" ${complete ? '' : 'disabled'}>
            ${svgIcon('package', 'ui-icon button-icon')}
            ${complete ? 'Get project ZIP' : 'Building...'}
          </button>
          <button class="ghost-action" type="button" data-action="new-project">Start another project</button>
        </div>
      </div>
      <div class="file-browser assembly-browser" aria-label="Project files being added" aria-live="polite">
        <div class="file-browser-bar">
          <span></span><span></span><span></span>
          <strong>${escapeHtml(`${result.root} -- build`)}</strong>
        </div>
        <div class="terminal-feed">
          <p><span>${svgIcon('terminal', 'ui-icon terminal-icon')}</span> governance-packager build ${escapeHtml(result.root)}</p>
          <p><span>${svgIcon('arrow-right', 'ui-icon terminal-icon')}</span> resolving governance docs, agents, evals, scripts, app</p>
          <ul>
            ${terminalRows(visibleFiles, result.root, visibleFiles.length, 'written')}
          </ul>
          ${complete ? '<p class="feed-more is-ready">package ready: click Get project ZIP</p>' : '<p class="feed-more cursor-line">writing files...</p>'}
        </div>
      </div>
    </section>
  `;
}

function successMarkup(result) {
  return `
    <section class="success-panel" aria-labelledby="success-title">
      <div class="terminal-titlebar">
        <span></span><span></span><span></span>
        <strong>package complete</strong>
      </div>
      <p class="eyebrow">Project delivered</p>
      <h1 id="success-title">${escapeHtml(result.fileName)}</h1>
      <p>The ZIP contains ${result.files.length} files: governance, agents, evals, scripts, CI and the starter app scaffold.</p>
      <div class="action-row">
        <button class="primary-action" type="button" data-action="download-again">
          ${svgIcon('package', 'ui-icon button-icon')}
          Get project ZIP again
        </button>
        <button class="ghost-action" type="button" data-action="new-project">Start another project</button>
      </div>
    </section>
  `;
}

export function createProjectBuilderApp(root) {
  const state = {
    started: true,
    lastResult: null,
    lastBlob: null,
    build: null,
    excludedFiles: new Set()
  };
  let buildTimer = null;

  function clearBuildTimer() {
    if (buildTimer) {
      window.clearInterval(buildTimer);
      buildTimer = null;
    }
  }

  function render({ focusHeading = false } = {}) {
    if (state.build) {
      root.innerHTML = assemblyMarkup(state.build);
    } else if (state.lastResult) {
      root.innerHTML = successMarkup(state.lastResult);
    } else if (state.started) {
      root.innerHTML = builderMarkup(state.excludedFiles);
    } else {
      root.innerHTML = landingMarkup();
    }

    if (focusHeading) focusPrimaryHeading(root);
  }

  function startAssembly(result, blob) {
    clearBuildTimer();
    state.started = false;
    state.lastResult = null;
    state.lastBlob = blob;
    state.build = {
      result,
      blob,
      visibleCount: 0
    };
    render({ focusHeading: true });

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      state.build.visibleCount = result.files.length;
      render();
      return;
    }

    buildTimer = window.setInterval(() => {
      if (!state.build) {
        clearBuildTimer();
        return;
      }

      const remaining = result.files.length - state.build.visibleCount;
      const step = remaining > 20 ? 4 : remaining > 8 ? 3 : 1;
      state.build.visibleCount = Math.min(result.files.length, state.build.visibleCount + step);
      render();

      if (state.build.visibleCount >= result.files.length) {
        clearBuildTimer();
      }
    }, 95);
  }

  function updatePreview(form) {
    const preview = root.querySelector('[data-preview]');
    if (!preview) return;

    const config = getFormConfig(form);
    preview.innerHTML = previewMarkup(config, state.excludedFiles);

    root.querySelectorAll('.type-option').forEach((option) => {
      const input = option.querySelector('input');
      option.classList.toggle('is-selected', input?.checked === true);
    });
  }

  function closeTooltips(exceptButton = null) {
    root.querySelectorAll('[data-tooltip-trigger]').forEach((button) => {
      if (button === exceptButton) return;

      const tooltip = root.querySelector(`#${CSS.escape(button.dataset.tooltipTrigger)}`);
      button.setAttribute('aria-expanded', 'false');
      if (tooltip) tooltip.hidden = true;
    });
  }

  function toggleTooltip(button) {
    const tooltip = root.querySelector(`#${CSS.escape(button.dataset.tooltipTrigger)}`);
    if (!tooltip) return;

    const shouldOpen = button.getAttribute('aria-expanded') !== 'true';
    closeTooltips(button);
    button.setAttribute('aria-expanded', String(shouldOpen));
    tooltip.hidden = !shouldOpen;
  }

  function attachEvents() {
    root.addEventListener('click', (event) => {
      const tooltipButton = event.target.closest('[data-tooltip-trigger]');
      if (tooltipButton) {
        event.preventDefault();
        event.stopPropagation();
        toggleTooltip(tooltipButton);
        return;
      }

      if (!event.target.closest('.field-tooltip')) {
        closeTooltips();
      }

      const removeButton = event.target.closest('[data-remove-file]');
      if (removeButton) {
        state.excludedFiles.add(removeButton.dataset.removeFile);
        const form = root.querySelector('form');
        if (form) updatePreview(form);
        return;
      }

      const restoreButton = event.target.closest('[data-restore-file]');
      if (restoreButton) {
        state.excludedFiles.delete(restoreButton.dataset.restoreFile);
        const form = root.querySelector('form');
        if (form) updatePreview(form);
        return;
      }

      const button = event.target.closest('button');
      if (!button) return;

      const action = button.dataset.action;
      if (action === 'start') {
        clearBuildTimer();
        state.started = true;
        state.lastResult = null;
        state.build = null;
        state.excludedFiles = new Set();
        render({ focusHeading: true });
      }

      if (action === 'reset' || action === 'new-project') {
        clearBuildTimer();
        state.started = true;
        state.lastResult = null;
        state.lastBlob = null;
        state.build = null;
        state.excludedFiles = new Set();
        render({ focusHeading: true });
      }

      if (action === 'download-again' && state.lastBlob && state.lastResult) {
        downloadBlob(state.lastBlob, state.lastResult.fileName);
      }

      if (action === 'get-project' && state.build && state.build.visibleCount >= state.build.result.files.length) {
        state.lastResult = state.build.result;
        state.lastBlob = state.build.blob;
        downloadBlob(state.build.blob, state.build.result.fileName);
        state.build = null;
        render({ focusHeading: true });
      }
    });

    root.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        closeTooltips();
      }
    });

    root.addEventListener('input', (event) => {
      const form = event.target.closest('form');
      if (form) updatePreview(form);
    });

    root.addEventListener('change', (event) => {
      const form = event.target.closest('form');
      if (!form) return;

      if (event.target.name === 'projectType') {
        const type = selectedType(event.target.value);
        const purpose = form.elements.purpose;
        if (purpose && PROJECT_TYPES.some((item) => item.defaultPurpose === purpose.value)) {
          purpose.value = type.defaultPurpose;
        }
      }

      if (event.target.name === 'jobProfile') {
        applyJobProfileDefaults(form, selectedJobProfile(event.target.value));
      }

      updatePreview(form);
    });

    root.addEventListener('submit', (event) => {
      event.preventDefault();
      const form = event.target;
      const config = getFormConfig(form);
      const result = withIncludedFiles(generateProjectFiles(config), state.excludedFiles);
      const blob = createZipBlob(result.files);

      startAssembly(result, blob);
    });
  }

  return {
    init() {
      render();
      attachEvents();
    }
  };
}
