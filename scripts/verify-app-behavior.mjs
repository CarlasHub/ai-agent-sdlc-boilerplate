import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const appSource = fs.readFileSync(path.join(root, 'app/src/features/project-builder/app.js'), 'utf8');
const styleSource = fs.readFileSync(path.join(root, 'app/src/styles.css'), 'utf8');
const blocking = [];

function requireSource(pattern, message) {
  if (!pattern.test(appSource)) blocking.push(message);
}

requireSource(/link\.download\s*=\s*fileName/, 'Download link does not set the requested ZIP filename.');
requireSource(/link\.click\(\)/, 'Download path does not trigger the generated link click.');
requireSource(/window\.setTimeout\(\(\)\s*=>\s*URL\.revokeObjectURL\(url\),\s*0\)/, 'Download URL cleanup is not deferred until after click dispatch.');
requireSource(/function focusPrimaryHeading\(root\)/, 'Route focus helper is missing.');
requireSource(/heading\.setAttribute\('tabindex', '-1'\)/, 'Route heading is not made programmatically focusable.');
requireSource(/heading\.focus\(\{\s*preventScroll:\s*true\s*\}\)/, 'Route heading focus does not preserve scroll position.');
requireSource(/render\(\{\s*focusHeading:\s*true\s*\}\)/g, 'State transitions do not request heading focus.');

if (!/\.primary-action:focus-visible/.test(styleSource)) {
  blocking.push('Primary action focus-visible styling is missing.');
}

if (!/\.type-option input:focus-visible \+ \.type-card-label/.test(styleSource)) {
  blocking.push('Project type radio focus styling is missing.');
}

if (blocking.length) {
  console.error('App behavior verification failed:');
  for (const issue of blocking) console.error(`- ${issue}`);
  process.exit(1);
}

console.log('App behavior verification passed.');
