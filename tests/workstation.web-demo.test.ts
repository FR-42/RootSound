import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFile, readdir, stat } from 'node:fs/promises';
import vm from 'node:vm';

test('website is a download page without an editor or operation instructions', async () => {
  const html = await readFile('.cache/website/index.html', 'utf8');
  assert(!/<iframe|动手试试|editor-instructions|在线编曲/.test(html));
  assert.match(html, /你好，/);
  assert.match(html, /assets\/workspace\.jpg/);
  for (const name of ['windows', 'mac']) assert(html.includes(`data-platform="${name}"`));
  assert.match(html, /特别鸣谢/);
  assert.match(html, /建议使用非 Edge 浏览器/);
  const old = await readFile('.cache/website/play/index.html', 'utf8');
  assert.match(old, /http-equiv="refresh"/);
  assert(!/<script|iframe/.test(old));
  assert(!(await readdir('.cache/website/play')).some(name => name !== 'index.html'));
  assert(!(await readdir('.cache/website')).some(name => ['examples', 'guides', 'instruments'].includes(name)));
  assert((await stat('.cache/website/assets/workspace.jpg')).size < 800_000);
});

test('website downloads retain published fallbacks and update only to a complete published installer pair', async () => {
  const code = await readFile('website/site.js', 'utf8');
  async function run(releases: unknown, fails = false) {
    const nodes = Object.fromEntries(['windows', 'mac'].map(name => [name, { href: `https://github.com/FR-42/RootSound/releases/download/preview261119/default.${name === 'windows' ? 'exe' : 'pkg'}`, hidden: false }]));
    const sizes = { windows: { textContent: '' }, mac: { textContent: '' } };
    let settle!: () => void;
    const done = new Promise<void>(resolve => { settle = resolve; });
    vm.runInNewContext(code, {
      AbortController, URL, setTimeout: () => 1, clearTimeout: () => settle(),
      fetch: async () => { if (fails) throw new Error('offline'); return { ok: true, json: async () => releases }; },
      document: { querySelector: (selector: string) => { const key = selector.includes('windows') ? 'windows' : 'mac'; return selector.includes('data-size') ? sizes[key] : nodes[key]; } },
    });
    await done;
    return nodes;
  }
  const assets = ['简乐安装.exe', '简乐安装.pkg'].map(name => ({ name, size: 123_000_000, browser_download_url: `https://github.com/FR-42/RootSound/releases/download/test/${name}` }));
  assert((await run([], true)).windows!.href.includes('preview261119'));
  assert((await run([{ draft: true, assets }])).mac!.href.includes('preview261119'));
  assert((await run([{ draft: false, assets: assets.slice(0, 1) }])).windows!.href.includes('preview261119'));
  assert((await run([{ draft: false, assets }])).windows!.href.includes('/test/'));
  assert((await run([{ draft: false, assets: assets.map(a => ({ ...a, browser_download_url: 'https://untrusted.invalid/file' })) }])).windows!.href.includes('preview261119'));
});
