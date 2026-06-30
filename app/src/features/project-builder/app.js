import { PROJECT_TYPES, generateProjectFiles } from './templates.js';
import { createZipBlob } from './zip.js';

const defaults = {
  projectType: PROJECT_TYPES[0].id,
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
  releaseOwner: 'Project owner and technical reviewer.'
};

const fieldHelp = {
  projectName: 'Expected: a short, clear project title. This becomes the generated folder and ZIP name, so avoid client names, secrets or personal data.',
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

function selectedType(id) {
  return PROJECT_TYPES.find((type) => type.id === id) || PROJECT_TYPES[0];
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
    >i</button>
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

    return `
      <li class="live-file-row ${removable ? 'is-editable' : ''}">
        <span class="file-status ${status}">${status === 'written' ? 'ok' : '+'}</span>
        <code>${escapeHtml(`${command} ${relativePath}`)}</code>
        ${removable ? `
          <button class="file-action remove-file" type="button" data-remove-file="${escapeHtml(relativePath)}" aria-label="Remove ${escapeHtml(relativePath)} from project">
            trash
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
      <p><span>-</span> ${files.length} file${files.length === 1 ? '' : 's'} removed from package</p>
      <ul>
        ${files.map((file) => {
          const relativePath = relativeFileName(file, root);

          return `
            <li class="live-file-row is-removed">
              <span class="file-status removed">off</span>
              <code>${escapeHtml(relativePath)}</code>
              <button class="file-action restore-file" type="button" data-restore-file="${escapeHtml(relativePath)}" aria-label="Restore ${escapeHtml(relativePath)} to project">
                restore
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

  return {
    projectType: type.id,
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
      <a class="section-next" href="${escapeHtml(target)}">${escapeHtml(label)} <span aria-hidden="true">-&gt;</span></a>
      <small>${escapeHtml(note)}</small>
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
          <span aria-hidden="true">+</span>
          Start blueprint
        </button>
      </div>
    </section>
  `;
}

function journeyChecklist(config, type, activeFiles, hasImplementationApproval) {
  const approvalState = hasImplementationApproval ? 'done' : 'hold';
  const exportState = activeFiles.length ? 'ready' : 'hold';

  return `
    <ol class="journey-checklist" aria-label="Project journey status">
      <li class="is-done">
        <span>1</span>
        <div>
          <strong>Scope</strong>
          <small>${escapeHtml(config.projectName)} uses the ${escapeHtml(type.label)} starter.</small>
        </div>
      </li>
      <li class="is-done">
        <span>2</span>
        <div>
          <strong>Guardrails</strong>
          <small>${escapeHtml(config.owner)} owns ${escapeHtml(config.riskLevel)} risk with ${escapeHtml(config.dataClass)} data.</small>
        </div>
      </li>
      <li class="is-${approvalState}">
        <span>3</span>
        <div>
          <strong>Approval</strong>
          <small>${hasImplementationApproval ? 'Implementation approval will be recorded.' : 'Implementation remains blocked by design.'}</small>
        </div>
      </li>
      <li class="is-${exportState}">
        <span>4</span>
        <div>
          <strong>Export</strong>
          <small>${activeFiles.length} files are ready for the local ZIP.</small>
        </div>
      </li>
    </ol>
  `;
}

function previewMarkup(config, excludedFiles = new Set()) {
  const generated = generateProjectFiles(config);
  const type = selectedType(config.projectType);
  const activeFiles = includedFiles(generated, excludedFiles);
  const inactiveFiles = removedFiles(generated, excludedFiles);
  const inclusionRatio = generated.files.length
    ? Math.max(8, Math.round((activeFiles.length / generated.files.length) * 100))
    : 0;
  const roleCount = config.projectType === 'governed-agent-team' ? 11 : 6;
  const evalCount = config.projectType === 'governed-agent-team' ? 12 : 8;
  const hasImplementationApproval =
    Boolean(config.approverName) &&
    Boolean(config.approverRole) &&
    config.approverName !== 'pending' &&
    config.approverRole !== 'pending';
  const nextActionTitle = hasImplementationApproval
    ? 'Review generated files, then export the ZIP.'
    : 'Export a review ZIP; implementation stays blocked.';
  const nextActionCopy = hasImplementationApproval
    ? 'Human approval will be written into the generated evidence. Release approval still remains separate.'
    : 'Use the continue links to finish each section. The ZIP is safe to review because it records APPROVED_FOR_IMPLEMENTATION: no.';

  return `
    <div class="next-action-card">
      <p class="eyebrow">Next action</p>
      <h2>${escapeHtml(nextActionTitle)}</h2>
      <p>${escapeHtml(nextActionCopy)}</p>
    </div>

    ${journeyChecklist(config, type, activeFiles, hasImplementationApproval)}

    <div class="output-header">
      <div>
        <p class="eyebrow">Generated package</p>
        <h2>${escapeHtml(generated.fileName)}</h2>
        <p>${escapeHtml(type.label)} with ${escapeHtml(config.riskLevel)} risk and ${escapeHtml(config.dataClass)} data boundaries.</p>
      </div>
      <span class="status-chip ${hasImplementationApproval ? 'is-open' : 'is-blocked'}">
        ${hasImplementationApproval ? 'implementation open' : 'implementation blocked'}
      </span>
    </div>

    <div class="command-line" aria-label="Local build command">
      <span>$</span>
      <code>agent-sdlc build --type ${escapeHtml(type.id)} --local-only</code>
    </div>

    <div class="summary-grid" aria-label="Generated package summary">
      <div><span>Files</span><strong>${activeFiles.length}/${generated.files.length}</strong></div>
      <div><span>Governance docs</span><strong>16</strong></div>
      <div><span>Agent roles</span><strong>${roleCount}</strong></div>
      <div><span>Eval cases</span><strong>${evalCount}</strong></div>
    </div>

    <div class="readiness-meter" aria-label="Included files progress">
      <div>
        <span>Package completeness</span>
        <strong>${inclusionRatio}%</strong>
      </div>
      <i><span style="width: ${inclusionRatio}%"></span></i>
    </div>

    <div class="gate-list" aria-label="Generated readiness checks">
      <div class="gate-row is-pass"><strong>PASS</strong><span>Governance gate, approval record and release gate included.</span></div>
      <div class="gate-row is-pass"><strong>PASS</strong><span>${roleCount} agent role prompts generated with least-privilege operating rules.</span></div>
      <div class="gate-row is-pass"><strong>PASS</strong><span>${evalCount} eval cases included for scope, injection, tool misuse and audit logging.</span></div>
      <div class="gate-row ${inactiveFiles.length ? 'is-warn' : 'is-pass'}"><strong>${inactiveFiles.length ? 'WARN' : 'PASS'}</strong><span>${inactiveFiles.length} file${inactiveFiles.length === 1 ? '' : 's'} excluded from the ZIP.</span></div>
      <div class="gate-row ${hasImplementationApproval ? 'is-pass' : 'is-hold'}"><strong>${hasImplementationApproval ? 'PASS' : 'HOLD'}</strong><span>${hasImplementationApproval ? 'Human implementation approval will be recorded.' : 'Implementation remains blocked until real human approval is entered.'}</span></div>
    </div>

    <details class="file-browser live-file-browser" aria-label="Live generated project preview" aria-live="polite">
      <summary>
        <span>Review generated files</span>
        <strong>${activeFiles.length} included</strong>
      </summary>
      <div>
        <div class="file-browser-bar">
          <span></span><span></span><span></span>
          <strong>${escapeHtml(`${generated.root} -- watch`)}</strong>
        </div>
        <div class="terminal-feed">
          <p><span>$</span> plan workspace ${escapeHtml(generated.root)}</p>
          <p><span>></span> ${activeFiles.length} of ${generated.files.length} files included locally</p>
          <p class="feed-note"><span>!</span> Files are optional. Removing governance or script files may make generated checks fail.</p>
          <ul>
            ${terminalRows(activeFiles, generated.root, activeFiles.length, 'queued', true)}
          </ul>
          ${activeFiles.length ? '<p class="feed-more">Use trash to exclude a file from the generated ZIP.</p>' : '<p class="feed-more is-warning">No files are currently included.</p>'}
          ${removedRows(inactiveFiles, generated.root)}
        </div>
      </div>
    </details>

    <div class="approval-summary">
      <p class="preview-label">Human approval record</p>
      <h3>APPROVED_FOR_IMPLEMENTATION: ${hasImplementationApproval ? 'yes' : 'no'}</h3>
      <p>${escapeHtml(config.projectName)} exports as a governed ${escapeHtml(type.label)}. Release remains separate from implementation approval.</p>
    </div>
  `;
}

function builderMarkup(excludedFiles = new Set()) {
  const type = selectedType(defaults.projectType);

  return `
    <div class="builder-shell">
      <header class="builder-header">
        <div class="builder-title-block">
          <p class="eyebrow">CarlasHub /</p>
          <h1 id="builder-title">ai-agent-sdlc-boilerplate</h1>
          <p>Generate a governed AI-agent starter kit. Work left to right: define scope, set guardrails, decide approval, then export the local ZIP.</p>
          <div class="header-metrics" aria-label="Default package contents">
            <span>Public</span>
            <span><strong>16</strong> governance docs</span>
            <span><strong>6+</strong> agent roles</span>
            <span><strong>8+</strong> eval cases</span>
          </div>
        </div>
        <div class="header-actions">
          <span class="run-state">local export only</span>
          <button class="primary-action top-submit" type="submit" form="project-form">
            Export ZIP
          </button>
          <button class="ghost-action" type="button" data-action="reset">Reset</button>
        </div>
      </header>

      <ol class="workflow-strip" aria-label="Builder workflow">
        <li class="is-start">
          <strong>Scope</strong>
          <span>Name the project and choose the starter pattern.</span>
        </li>
        <li>
          <strong>Guardrails</strong>
          <span>Set owner, users, risk and data boundaries.</span>
        </li>
        <li>
          <strong>Approval</strong>
          <span>Keep implementation blocked or record sign-off.</span>
        </li>
        <li>
          <strong>Export</strong>
          <span>Review included files and download the ZIP.</span>
        </li>
      </ol>

      <form class="builder-layout" id="project-form">
        <section class="setup-panel" aria-labelledby="builder-title">
          <nav class="setup-nav" aria-label="Builder sections">
            <a href="#section-project">Scope</a>
            <a href="#section-governance">Guardrails</a>
            <a href="#section-controls">Boundaries</a>
            <a href="#section-approval">Approval</a>
          </nav>

          <section class="form-section" id="section-project">
            <div class="section-heading">
              <p class="step-label">Step 1 of 4</p>
              <h2>Scope the package.</h2>
              <p>Name the project, explain the outcome, and choose the starter pattern closest to the workflow.</p>
            </div>
            <div class="field-grid basics-grid">
              ${field('projectName', 'Project name', defaults.projectName, 'text', 'Used for folder, ZIP and governance docs.')}
              ${textArea('purpose', 'Purpose', type.defaultPurpose, 4)}
            </div>
            <div class="type-list">
              ${typeOptions(type.id)}
            </div>
            ${sectionContinue('#section-governance', 'Continue to guardrails', 'Next: confirm owner, users, risk and allowed data.')}
          </section>

          <section class="form-section" id="section-governance">
            <div class="section-heading">
              <p class="step-label">Step 2 of 4</p>
              <h2>Define accountable guardrails.</h2>
              <p>Make ownership, users, risk level and allowed data obvious before any files are exported.</p>
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

          <section class="form-section" id="section-controls">
            <div class="section-heading">
              <p class="step-label">Step 3 of 4</p>
              <h2>Block unsafe agent behavior.</h2>
              <p>State the approvers, data sources, forbidden data, blocked tools and actions agents must refuse.</p>
            </div>
            <div class="field-grid">
              ${textArea('approvers', 'Approvers', defaults.approvers, 2)}
              ${textArea('riskRationale', 'Risk rationale', defaults.riskRationale, 2)}
              ${textArea('highRiskAreas', 'Risk areas', defaults.highRiskAreas, 2)}
              ${textArea('dataSources', 'Data sources', defaults.dataSources, 2)}
              ${textArea('blockedData', 'Blocked data', defaults.blockedData, 2)}
              ${textArea('blockedTools', 'Blocked tools', defaults.blockedTools, 2)}
              ${textArea('neverDo', 'Never do', defaults.neverDo, 2)}
              ${field('dataOwner', 'Data owner', defaults.dataOwner)}
              ${field('releaseOwner', 'Release owner', defaults.releaseOwner)}
              ${field('riskReviewFrequency', 'Risk review', defaults.riskReviewFrequency)}
            </div>
            ${sectionContinue('#section-approval', 'Continue to approval', 'Next: leave implementation blocked or record real human sign-off.')}
          </section>

          <section class="form-section" id="section-approval">
            <div class="section-heading">
              <p class="step-label">Step 4 of 4</p>
              <h2>Record approval only when it exists.</h2>
              <p>The ZIP can be exported for review while implementation remains blocked by default.</p>
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
        </section>

        <aside class="preview-panel" data-preview aria-label="Live generated project preview">
          ${previewMarkup(defaults, excludedFiles)}
        </aside>

        <div class="export-bar" id="project-export">
          <div>
            <strong>Final step: review the preview, then export.</strong>
            <span>The ZIP contains governance docs, role prompts, evals, audit templates and release gates generated locally.</span>
          </div>
          <button class="primary-action" type="submit">
            Export project
          </button>
        </div>
      </form>
    </div>
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
            <span aria-hidden="true">ZIP</span>
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
          <p><span>$</span> governance-packager build ${escapeHtml(result.root)}</p>
          <p><span>></span> resolving governance docs, agents, evals, scripts, app</p>
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
          <span aria-hidden="true">ZIP</span>
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
