import { createZipBlob } from '../app/src/features/project-builder/zip.js';
import { generateProjectFiles, PROJECT_TYPES } from '../app/src/features/project-builder/templates.js';

const decoder = new TextDecoder();

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

function readUInt16(bytes, offset) {
  return bytes[offset] | (bytes[offset + 1] << 8);
}

function readUInt32(bytes, offset) {
  return (
    bytes[offset] |
    (bytes[offset + 1] << 8) |
    (bytes[offset + 2] << 16) |
    (bytes[offset + 3] << 24)
  ) >>> 0;
}

function findEndOfCentralDirectory(bytes) {
  for (let offset = bytes.length - 22; offset >= 0; offset -= 1) {
    if (readUInt32(bytes, offset) === 0x06054b50) return offset;
  }

  throw new Error('ZIP end-of-central-directory record was not found.');
}

function extractLocalEntries(bytes) {
  const entries = new Map();
  let offset = 0;

  while (readUInt32(bytes, offset) === 0x04034b50) {
    const method = readUInt16(bytes, offset + 8);
    const compressedSize = readUInt32(bytes, offset + 18);
    const uncompressedSize = readUInt32(bytes, offset + 22);
    const nameLength = readUInt16(bytes, offset + 26);
    const extraLength = readUInt16(bytes, offset + 28);
    const nameStart = offset + 30;
    const dataStart = nameStart + nameLength + extraLength;
    const dataEnd = dataStart + compressedSize;
    const name = decoder.decode(bytes.slice(nameStart, nameStart + nameLength));
    const content = decoder.decode(bytes.slice(dataStart, dataEnd));

    if (method !== 0) throw new Error(`Unexpected compression method for ${name}: ${method}`);
    if (compressedSize !== uncompressedSize) throw new Error(`Compressed size mismatch for ${name}`);
    if (entries.has(name)) throw new Error(`Duplicate ZIP entry: ${name}`);

    entries.set(name, content);
    offset = dataEnd;
  }

  return { entries, centralDirectoryOffset: offset };
}

function readCentralDirectory(bytes, eocdOffset) {
  const expectedCount = readUInt16(bytes, eocdOffset + 10);
  const expectedSize = readUInt32(bytes, eocdOffset + 12);
  const offset = readUInt32(bytes, eocdOffset + 16);
  const names = [];
  let cursor = offset;

  for (let index = 0; index < expectedCount; index += 1) {
    if (readUInt32(bytes, cursor) !== 0x02014b50) {
      throw new Error(`Invalid central-directory header at entry ${index + 1}.`);
    }

    const nameLength = readUInt16(bytes, cursor + 28);
    const extraLength = readUInt16(bytes, cursor + 30);
    const commentLength = readUInt16(bytes, cursor + 32);
    const nameStart = cursor + 46;
    names.push(decoder.decode(bytes.slice(nameStart, nameStart + nameLength)));
    cursor = nameStart + nameLength + extraLength + commentLength;
  }

  if (cursor - offset !== expectedSize) {
    throw new Error('Central-directory size does not match the ZIP footer.');
  }

  return { names, offset };
}

async function unzipGeneratedFiles(files) {
  const blob = createZipBlob(files);
  const bytes = new Uint8Array(await blob.arrayBuffer());
  const eocdOffset = findEndOfCentralDirectory(bytes);
  const local = extractLocalEntries(bytes);
  const central = readCentralDirectory(bytes, eocdOffset);

  if (local.centralDirectoryOffset !== central.offset) {
    throw new Error('Local entries do not end at the central-directory offset.');
  }

  return local.entries;
}

function configFor(projectType) {
  const type = PROJECT_TYPES.find((item) => item.id === projectType);
  if (!type) throw new Error(`Unknown project type: ${projectType}`);

  return {
    ...baseConfig,
    projectType,
    purpose: type.defaultPurpose
  };
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function verifyProjectType(projectType) {
  const result = generateProjectFiles(configFor(projectType));
  const entries = await unzipGeneratedFiles(result.files);
  const expected = new Map(result.files.map((file) => [file.path, file.content]));

  assert(entries.size === expected.size, `${projectType} ZIP entry count mismatch.`);

  for (const [path, content] of expected) {
    assert(entries.has(path), `${projectType} ZIP is missing ${path}`);
    assert(entries.get(path) === content, `${projectType} ZIP content mismatch for ${path}`);
  }

  const toolMap = entries.get(`${result.root}/docs/governance/04-tool-access-map.md`) || '';
  assert(
    toolMap.includes('| npm scripts | Run governance, eval, local app and release checks | yes | no | yes |'),
    `${projectType} generated tool map does not permit approved npm script execution.`
  );

  return { result, entries };
}

const frontEnd = await verifyProjectType('front-end-demo');
const governedTeam = await verifyProjectType('governed-agent-team');
const teamRoot = governedTeam.result.root;
const requiredTeamFiles = [
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

for (const file of requiredTeamFiles) {
  assert(governedTeam.entries.has(`${teamRoot}/${file}`), `Governed Agent Team ZIP is missing ${file}`);
}

console.log(`Verified ${frontEnd.result.fileName}: ${frontEnd.entries.size} extractable files.`);
console.log(`Verified ${governedTeam.result.fileName}: ${governedTeam.entries.size} extractable files.`);
console.log('Generated ZIP extraction and governed-agent-team contents checks passed.');
