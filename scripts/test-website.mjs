import http from 'node:http';
import { readFile, writeFile, mkdir, mkdtemp } from 'node:fs/promises';
import path from 'node:path';
import { spawn } from 'node:child_process';

await mkdir('.test-output/website-current', { recursive: true });
const root = await mkdtemp(path.resolve('.test-output/website-current/site-'));
const base = path.resolve('.cache/website');
const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'application/javascript', '.jpg': 'image/jpeg', '.png': 'image/png', '.svg': 'image/svg+xml' };
const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://localhost');
    if (!url.pathname.startsWith('/RootSound/')) throw new Error('path');
    let name = decodeURIComponent(url.pathname.slice('/RootSound/'.length));
    if (!name || name.endsWith('/')) name += 'index.html';
    const file = path.resolve(base, name);
    if (!file.startsWith(base + path.sep)) throw new Error('path');
    const bytes = await readFile(file);
    res.setHeader('Content-Type', types[path.extname(file)] || 'application/octet-stream');
    res.end(bytes);
  } catch { res.writeHead(404); res.end(); }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const origin = 'http://127.0.0.1:' + server.address().port;
const harness = path.join(root, 'renderer.cjs');
await writeFile(harness, (await readFile('scripts/test-site-renderer.cjs', 'utf8')).replace('const [origin, root] = process.argv.slice(2);', 'const origin=' + JSON.stringify(origin) + ',root=' + JSON.stringify(root) + ';'));
const env = { ...process.env }; delete env.ELECTRON_RUN_AS_NODE;
try {
  const code = await new Promise((resolve, reject) => {
    const child = spawn(path.resolve('.cache/release-smoke-engine/electron.exe'), [harness], { env, windowsHide: true, stdio: 'inherit' });
    child.on('error', reject); child.on('exit', resolve);
  });
  console.log(await readFile(path.join(root, 'report.json'), 'utf8'));
  console.log('Evidence: ' + root);
  if (code) process.exitCode = 1;
} finally { server.close(); }
