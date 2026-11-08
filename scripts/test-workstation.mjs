import { readdirSync } from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
const files = ['src/workstation/modules/materials/library.test.ts', 'src/workstation/modules/sound-runtime/browser.test.ts', ...readdirSync('tests').filter(name => name.endsWith('.test.ts')).sort().map(name => path.join('tests', name))];
const result = spawnSync(process.execPath, ['--test', '--test-reporter=tap', '--test-concurrency=2', ...process.argv.slice(2), ...files], { stdio: 'inherit' });
if (result.error) throw result.error;
process.exitCode = result.status ?? 1;
