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
const windowsInstaller = path.join(output, `RootSound-Windows-x64-${plan.version}-Setup.exe`);
const macInstaller = path.join(output, `RootSound-macOS-arm64-${plan.version}.pkg`);
for (const target of [windowsInstaller, macInstaller]) {
  if (await access(target).then(() => true, () => false)) throw new Error(`Release asset already exists: ${target}`);
}

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
const version = plan.version.split('-')[0];
const bundle = { path: 'RootSound.app', identifier, shortVersionString: version, bundleVersion: version };
const entries = [...cpioOrder(tree)].slice(1);
const installKBytes = Math.ceil(entries.reduce((bytes, entry) => bytes + entry.size, 0) / 1024);
const installLocation = '/Applications';
const packageRef = `${identifier}.pkg`;
const info = renderPackageInfo({ identifier, version, installLocation, bundle, installKBytes, numberOfFiles: entries.length });
const distribution = renderDistribution({ identifier, version, installLocation, installKBytes, packageRef,
  hostArchitectures: 'arm64', bundle, productStyle: true, title: 'RootSound', minimumSystemVersion: plan.macMinimumVersion });
await writeXar(macInstaller, [
  { name: 'Distribution', parts: [Buffer.from(distribution)], compress: true },
  { name: packageRef, children: [{ name: 'Bom', parts: [bom], compress: true },
    { name: 'Payload', parts: payload }, { name: 'PackageInfo', parts: [Buffer.from(info)], compress: true }] },
]);

execFileSync(path.resolve(process.argv[2]), [
  '/INPUTCHARSET', 'UTF8',
  `/DVERSION=${plan.version}`, `/DOUTPUT=${windowsInstaller}`, `/DAPP_SOURCE=${plan.windows}`,
  `/DAPP_ICON=${path.resolve('desktop/assets/RootSound.ico')}`, path.resolve('scripts/RootSound-installer.nsi'),
], { stdio: 'inherit', windowsHide: true });

const checksums = [];
for (const asset of [windowsInstaller, macInstaller]) {
  const hash = createHash('sha256');
  for await (const chunk of createReadStream(asset)) hash.update(chunk);
  checksums.push(`${hash.digest('hex')}  ${path.basename(asset)}`);
}
await writeFile(path.join(output, 'SHA256SUMS.txt'), checksums.join('\n') + '\n');
console.log(checksums.join('\n'));
