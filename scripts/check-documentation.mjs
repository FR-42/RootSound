import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';

function markdownFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const file = path.join(directory, entry.name);
    return entry.isDirectory() ? markdownFiles(file) : entry.name.endsWith('.md') ? [file] : [];
  });
}
const files = [...readdirSync('.').filter(name => name.endsWith('.md')), ...markdownFiles('docs'), ...markdownFiles('governance')];
const errors = [];
let links = 0;
for (const file of files) {
  const text = readFileSync(file, 'utf8');
  for (const match of text.matchAll(/\[[^\]]*\]\(([^)]+)\)/gu)) {
    const target = match[1].replace(/^<|>$/gu, '').split(/\s+"/u)[0].split('#')[0];
    if (!target || /^[a-z][a-z\d+.-]*:/iu.test(target)) continue;
    links++;
    const resolved = path.resolve(path.dirname(file), decodeURIComponent(target));
    if (!existsSync(resolved)) errors.push(`${file}: missing link ${target}`);
  }
  for (const match of text.matchAll(/(?:scripts|tests)\/[A-Za-z\d_.-]+\.(?:mjs|py|ps1|test\.ts)/gu)) {
    if (!existsSync(match[0])) errors.push(`${file}: missing command/reference ${match[0]}`);
  }
}
const manifest = JSON.parse(readFileSync('history/2026-11-05-maintenance/MANIFEST.json', 'utf8'));
for (const entry of manifest.entries) {
  if (!existsSync(entry.snapshot)) { errors.push(`Missing archive ${entry.snapshot}`); continue; }
  const bytes = readFileSync(entry.snapshot);
  if (statSync(entry.snapshot).size !== entry.bytes || createHash('sha256').update(bytes).digest('hex') !== entry.sha256) errors.push(`Archive changed: ${entry.snapshot}`);
  if (entry.action === 'archived' && existsSync(entry.source)) errors.push(`Archived source still active: ${entry.source}`);
}
const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));
for (const [name, command] of Object.entries(packageJson.scripts)) {
  for (const match of command.matchAll(/(?:scripts|tests)\/[A-Za-z\d_.-]+\.(?:mjs|py|ps1|test\.ts)/gu)) {
    if (!existsSync(match[0])) errors.push(`package.json ${name}: missing ${match[0]}`);
  }
}
if (errors.length) { console.error(errors.join('\n')); process.exitCode = 1; }
else console.log(`Documentation: ${files.length} active Markdown files, ${links} local links, ${manifest.entries.length} archive hashes and package command paths verified.`);
