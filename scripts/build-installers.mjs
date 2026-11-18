import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { createReadStream } from 'node:fs';
import { access, mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { walkTree, cpioOrder } from '../node_modules/@electron/osx-sign/dist/pkg-utils/walk.js';
import { cpioStream, newCpioWriteResult } from '../node_modules/@electron/osx-sign/dist/pkg-utils/cpio-writer.js';
import { gzipStream } from '../node_modules/@electron/osx-sign/dist/pkg-utils/gzip.js';
import { writeBom } from '../node_modules/@electron/osx-sign/dist/pkg-utils/bom-writer.js';
import { renderPackageInfo } from '../node_modules/@electron/osx-sign/dist/pkg-utils/package-info.js';
import { renderDistribution } from '../node_modules/@electron/osx-sign/dist/pkg-utils/distribution.js';
import { writeXar } from '../node_modules/@electron/osx-sign/dist/pkg-utils/xar.js';

const plan = JSON.parse(await readFile('.cache/release-package-plan.json', 'utf8'));
assert.match(plan.version, /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/u);
assert(plan.macAdhocSignatureVerified?.length > 0);
const output = path.resolve('release', plan.version);
await mkdir(output, { recursive: true });
const windowsInstaller = path.join(output, '简乐安装.exe');
const macInstaller = path.join(output, '简乐安装.pkg');
const windowsOnly = process.argv.includes('--windows-only');
for (const target of windowsOnly ? [windowsInstaller] : [windowsInstaller, macInstaller]) {
  if (await access(target).then(() => true, () => false)) throw new Error(`Release asset already exists: ${target}`);
}

if (!windowsOnly) {
const tree = await walkTree(path.join(plan.mac, 'RootSound.app'));
const links = new Set();
for (const entry of cpioOrder(tree)) {
  const relative = entry.path.slice(2);
  const target = plan.macLinks[relative];
  if (target) {
    assert(!path.posix.isAbsolute(target) && !target.includes('\\'));
    assert(path.posix.normalize(path.posix.join(path.posix.dirname(relative), target)).startsWith('RootSound.app/'));
    entry.type = 'symlink';
    entry.mode = 0o120777;
    entry.linkTarget = target;
    entry.size = Buffer.byteLength(target);
    delete entry.children;
    links.add(relative);
  } else if (entry.type === 'directory') {
    entry.mode = 0o40755;
  } else {
    assert.equal(entry.type, 'file', `Unexpected symlink: ${relative}`);
    entry.mode = 0o100000 | (plan.macModes[relative] ? plan.macModes[relative] & 0o777 : 0o644);
  }
}
assert.equal(links.size, Object.keys(plan.macLinks).length);
const payloadInfo = newCpioWriteResult();
const payload = await gzipStream(cpioStream(tree, payloadInfo), { concurrency: 3 });
const bom = writeBom(tree, payloadInfo.checksums, payloadInfo);
const identifier = 'com.rootsound.desktop';
const version = plan.macBuildVersion;
assert.match(version, /^\d+\.\d+\.\d+\.\d+$/u);
const bundle = { path: 'RootSound.app', identifier, shortVersionString: plan.version.split('-')[0], bundleVersion: plan.macBundleVersion };
const entries = [...cpioOrder(tree)].slice(1);
const installKBytes = Math.ceil(entries.reduce((bytes, entry) => bytes + entry.size, 0) / 1024);
const installLocation = '/Applications';
const packageRef = `${identifier}.pkg`;
const info = renderPackageInfo({ identifier, version, installLocation, bundle, installKBytes, numberOfFiles: entries.length })
  .replace('relocatable="false"', 'relocatable="true"')
  .replace('<atomic-update-bundle/>', `<atomic-update-bundle><bundle id="${identifier}"/></atomic-update-bundle>`);
const distribution = renderDistribution({ identifier, version, installLocation, installKBytes, packageRef,
  hostArchitectures: 'arm64', bundle, productStyle: true, title: '简乐', minimumSystemVersion: plan.macMinimumVersion })
  .replace('customize="never"', 'customize="allow"')
  .replace(`id="${identifier}" title="简乐" visible="false"`, `id="${identifier}" title="简乐" description="简乐" visible="true" customLocationAllowAlternateVolumes="true"`)
  .replace('    <choices-outline>', '    <background file="background.png" mime-type="image/png" scaling="tofit"/>\n'
    + '    <welcome file="welcome.html" mime-type="text/html"/>\n'
    + `    <must-close><app id="${identifier}"/></must-close>\n    <choices-outline>`);
assert(distribution.includes('customLocationAllowAlternateVolumes="true"'));
const welcome = `<!doctype html><meta charset="utf-8"><style>body{font:15px -apple-system,sans-serif;color:#422b34;padding:34px 24px}h1{font-size:42px;font-weight:500;margin:20px 0}p{color:#69505a}</style><h1>简乐</h1><p>${plan.version}</p>`;
await writeXar(macInstaller, [
  { name: 'Distribution', parts: [Buffer.from(distribution)], compress: true },
  { name: 'Resources', children: [
    { name: 'background.png', parts: [await readFile('.cache/installer-art/background.png')], compress: true },
    { name: 'welcome.html', parts: [Buffer.from(welcome)], compress: true },
  ] },
  { name: packageRef, children: [{ name: 'Bom', parts: [bom], compress: true },
    { name: 'Payload', parts: payload }, { name: 'PackageInfo', parts: [Buffer.from(info)], compress: true }] },
]);
}

const compilerTemporary = path.resolve('.cache/installer-temp');
await mkdir(compilerTemporary, { recursive: true });
execFileSync(path.resolve(process.argv[2]), [
  '/INPUTCHARSET', 'UTF8',
  `/DVERSION=${plan.version}`, `/DVERSION_NUMBER=${plan.macBuildVersion}`, `/DOUTPUT=${windowsInstaller}`, `/DAPP_SOURCE=${plan.windows}`,
  `/DAPP_ICON=${path.resolve('desktop/assets/RootSound.ico')}`, path.resolve('scripts/RootSound-installer.nsi'),
], { stdio: 'inherit', windowsHide: true, env: { ...process.env, TEMP: compilerTemporary, TMP: compilerTemporary } });

const checksums = [];
for (const asset of [windowsInstaller, macInstaller]) {
  const hash = createHash('sha256');
  for await (const chunk of createReadStream(asset)) hash.update(chunk);
  checksums.push(`${hash.digest('hex')}  ${path.basename(asset)}`);
}
await writeFile(path.join(output, 'SHA256SUMS.txt'), checksums.join('\n') + '\n');
console.log(checksums.join('\n'));
