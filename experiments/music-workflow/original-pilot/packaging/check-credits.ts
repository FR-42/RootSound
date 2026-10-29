import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';

const [directory, name = '余焰 · 第一稿'] = process.argv.slice(2);
if (!directory) throw new Error('Pass the newly packaged delivery directory.');

function info(bytes: Buffer) {
  assert.equal(bytes.toString('ascii', 0, 4), 'RIFF');
  assert.equal(bytes.readUInt32LE(4) + 8, bytes.length);
  assert.equal(bytes.toString('ascii', 8, 12), 'WAVE');
  const tags: Record<string, string> = {};
  for (let offset = 12; offset + 8 <= bytes.length;) {
    const type = bytes.toString('ascii', offset, offset + 4), length = bytes.readUInt32LE(offset + 4);
    const start = offset + 8, end = start + length; assert(end <= bytes.length);
    if (type === 'LIST' && bytes.toString('ascii', start, start + 4) === 'INFO') {
      for (let at = start + 4; at + 8 <= end;) {
        const id = bytes.toString('ascii', at, at + 4), size = bytes.readUInt32LE(at + 4);
        assert(at + 8 + size <= end);
        tags[id] = bytes.toString('utf8', at + 8, at + 8 + size).replace(/\0+$/u, '');
        at += 8 + size + size % 2;
      }
    }
    offset = end + length % 2;
  }
  return tags;
}
function verify(records: any[]) {
  const voices = records.filter(record => record.kind === 'rootsound.sample' && /^voice_.*\.wav$/u.test(record.body.source.name));
  assert.equal(voices.length, 14, 'Every derived voice sample must remain embedded.');
  return voices.map(record => {
    const bytes = Buffer.from(record.body.audio.data, 'base64');
    assert.equal(bytes.length, record.body.audio.byteLength);
    const tags = info(bytes), joined = Object.values(tags).join('\n');
    assert.match(joined, /VocalSet/u);
    assert.match(joined, /CC[ -]BY[ -]4\.0/u);
    assert.match(joined, /https:\/\/creativecommons\.org\/licenses\/by\/4\.0\//u);
    assert.match(joined, /Wilkins/u); assert.match(joined, /Seetharaman/u);
    assert.match(joined, /Wahl/u); assert.match(joined, /Pardo/u);
    return { name: record.name, source: record.body.source.name,
      sha256: createHash('sha256').update(bytes).digest('hex'), info: tags };
  });
}
const workspace = JSON.parse(await readFile(path.join(directory, `${name}.rootsound`), 'utf8'));
const library = JSON.parse(workspace.libraryText);
const portable = JSON.parse(await readFile(path.join(directory, `${name}.rsproject`), 'utf8'));
const workspaceVoices = verify(library.contents), portableVoices = verify(portable.contents);
assert.deepEqual(workspaceVoices.map(item => item.sha256).sort(), portableVoices.map(item => item.sha256).sort());
const report = { passed: true, workspaceVocalSamples: workspaceVoices.length, portableVocalSamples: portableVoices.length,
  riffInfoRead: true, creatorAttributionRetained: true, licenseNameAndUrlRetained: true,
  correspondingAudioFilesIdenticalAcrossFormats: true, voices: workspaceVoices };
await writeFile(path.join(directory, '封包署名核验.json'), JSON.stringify(report, null, 2), { flag: 'wx' });
console.log(JSON.stringify({ passed: true, workspaceVocalSamples: workspaceVoices.length,
  portableVocalSamples: portableVoices.length, creatorAttributionRetained: true, licenseNameAndUrlRetained: true }));
