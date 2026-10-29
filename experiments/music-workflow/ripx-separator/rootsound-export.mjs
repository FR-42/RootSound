import fs from 'node:fs';
import path from 'node:path';
import { createMidiProjectLibrary } from '../../../src/workstation/app/midi-project.ts';
import { createMaterialLibrary } from '../../../src/workstation/modules/materials/public.ts';
import { createSampleReferenceAdapter, readSampleBody } from '../../../src/workstation/modules/sampling/public.ts';
import { createTimbreReferenceAdapter, readSampleTimbreBody } from '../../../src/workstation/modules/timbre/public.ts';
import { createPhraseReferenceAdapter, readPhraseBody } from '../../../src/workstation/modules/phrase/public.ts';
import { createSongReferenceAdapter, readSongBody } from '../../../src/workstation/modules/song/public.ts';

const input = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const id = () => crypto.randomUUID();
function record(kind, owner, name, body, dependencies = []) {
  return { id: id(), kind: `rootsound.${kind}`, owner, name, schemaVersion: 1, revision: 1, body, dependencies };
}
function audioLibrary() {
  const contents = [], tracks = [], phraseIds = [];
  for (const lane of input.lanes) {
    const clips = [];
    for (const [index, chunk] of lane.chunks.entries()) {
      const bytes = fs.readFileSync(chunk.file), duration = chunk.frames / chunk.rate;
      const name = `${lane.label} ${index + 1}`;
      const sample = record('sample', 'sampling', `${name} 原音`, readSampleBody({ model: 'audio-sample', version: 1,
        source: { kind: 'file', name: `${name}.wav`, mimeType: 'audio/wav' },
        audio: { encoding: 'base64', byteLength: bytes.length, data: bytes.toString('base64') },
        decoded: { sampleRate: chunk.rate, channels: chunk.channels, frames: chunk.frames, durationSeconds: duration } }));
      const tone = record('timbre', 'timbre', `${name} 播放`, readSampleTimbreBody({ model: 'sample-instrument', version: 1,
        sampleId: sample.id, startSeconds: 0, endSeconds: duration, rootFrequencyHz: 440, attackSeconds: 0,
        releaseSeconds: .01, level: 1 }), [sample.id]);
      const phrase = record('phrase', 'phrase', name, readPhraseBody({ model: 'note-phrase', version: 1, timeUnit: 'beat',
        tempoBpm: 120, lengthBeats: duration * 2, parts: [{ id: id(), name: lane.label, timbreId: tone.id,
          notes: [{ id: id(), startBeat: 0, durationBeats: duration * 2, durationSeconds: duration, frequencyHz: 440, velocity: 1 }] }] }), [tone.id]);
      contents.push(sample, tone, phrase); phraseIds.push(phrase.id);
      clips.push({ id: id(), phraseId: phrase.id, startBeat: chunk.startFrame / chunk.rate * 2 });
    }
    tracks.push({ id: id(), name: lane.label, level: lane.gain, pan: 0, muted: false, solo: false, clips });
  }
  const root = { id: id(), kind: 'rootsound.song', owner: 'song', schemaVersion: 1, name: input.name,
    dependencies: phraseIds, body: readSongBody({ model: 'phrase-arrangement', version: 1, timeUnit: 'beat',
      tempoBpm: 120, tempoMode: 'source', lengthBeats: input.duration * 2, tracks }) };
  const policy = { project: { rootKind: 'rootsound.song', adapters: [createSampleReferenceAdapter(), createTimbreReferenceAdapter(), createPhraseReferenceAdapter(), createSongReferenceAdapter()] } };
  let snapshot = null;
  const library = createMaterialLibrary({ read: () => snapshot, write: value => { snapshot = value; } }, policy);
  const result = library.commitTransaction({ expectedToken: library.currentToken(), label: '导入分离原音', createContents: contents,
    createDrafts: [root], exactNameIds: [...contents.map(c => c.id), root.id], projectMembers: [{ rootId: root.id, contentIds: contents.map(c => c.id) }] });
  if (result.status !== 'committed') throw new Error(JSON.stringify(result));
  const reopened = createMaterialLibrary({ read: () => snapshot, write: () => { throw new Error('Read only'); } }, policy);
  if (reopened.listContentInfo().length !== contents.length) throw new Error('工程重开校验失败');
  return { libraryText: snapshot, trackCount: tracks.length, warnings: ['原音采样工程；片段中的单个触发音符不是原曲的旋律识别。120 BPM 仅为时间坐标。'] };
}
const result = input.mode === 'audio' ? audioLibrary() : createMidiProjectLibrary(new Uint8Array(fs.readFileSync(input.midi)), input.name);
const envelope = JSON.stringify({ format: 'RootSoundWorkspace', version: 2, id: id(), name: input.name,
  createdAtUtc: new Date().toISOString(), libraryText: result.libraryText });
if (Buffer.byteLength(envelope) > 512 * 1024 * 1024) throw new Error('工程超过 512 MiB；没有写入文件');
fs.mkdirSync(input.destination, { recursive: true });
const safe = input.name.replace(/[<>:"/\\|?*\x00-\x1f]/g, '_').replace(/[. ]+$/, '').slice(0, 100) || '分离工程';
let target = path.join(input.destination, `${safe}.rootsound`);
const temp = path.join(input.destination, `.${id()}.tmp`);
try {
  fs.writeFileSync(temp, envelope, { flag: 'wx' });
  for (let index = 2; ; index++) {
    try { fs.linkSync(temp, target); break; }
    catch (error) { if (error.code !== 'EEXIST') throw error; target = path.join(input.destination, `${safe} (${index}).rootsound`); }
  }
} finally { fs.rmSync(temp, { force: true }); }
console.log(JSON.stringify({ path: target, tracks: result.trackCount, notes: result.noteCount, warnings: result.warnings }));
