import fs from 'node:fs';
import path from 'node:path';

const dir = path.join(process.cwd(), 'docs', 'audit', 'events');
fs.mkdirSync(dir, { recursive: true });
const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const file = path.join(dir, `${stamp}-agent-event.md`);
const content = `# Agent Audit Event\n\nDate: ${new Date().toISOString()}\n\nAgent/tool:\n\n[FILL_AGENT_OR_TOOL]\n\nRequest:\n\n[FILL_REQUEST]\n\nFiles read:\n\n[FILL_FILES_READ]\n\nFiles changed:\n\n[FILL_FILES_CHANGED]\n\nTools used:\n\n[FILL_TOOLS_USED]\n\nData accessed:\n\n[FILL_DATA_ACCESSED]\n\nAction taken:\n\n[FILL_ACTION_TAKEN]\n\nApproval required: yes/no\n\nApproval reference:\n\n[FILL_APPROVAL_REFERENCE]\n\nRisks or anomalies:\n\n[FILL_RISKS]\n\nOutcome:\n\n[FILL_OUTCOME]\n`;
fs.writeFileSync(file, content);
console.log(`Created ${file}`);
