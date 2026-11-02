import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { ContentRecord, JsonValue } from '../src/workstation/contracts/content.ts';
import type { SampleBody, SamplePayloadPort } from '../src/workstation/contracts/sampling.ts';
import { MAX_SAMPLE_FILE_BYTES } from '../src/workstation/contracts/files.ts';
import { createMaterialLibrary, createProjectPackages } from '../src/workstation/modules/materials/public.ts';
import type { ReferenceAdapter } from '../src/workstation/contracts/references.ts';
import { readTimbreImport } from '../src/workstation/app/timbre-file-import.ts';
import { createSampling, createSampleAudio, createSampleReferenceAdapter, readSampleBody, resolveSampleBytes } from '../src/workstation/modules/sampling/public.ts';
import { decodePcmWav, encodeBase64, encodeFloatWav } from '../src/workstation/modules/sampling/audio.ts';

const token = `rootsound-payload:${'a'.repeat(32)}:${'b'.repeat(64)}`;
function fixture() {
  const pcm = { sampleRate: 8000, channels: [Float32Array.from({ length: 32 }, (_, n) => (n - 16) / 32)] };
  const bytes = encodeFloatWav(pcm);
  const body: SampleBody = { model: 'audio-sample', version: 1,
    source: { kind: 'file', name: 'small.wav', mimeType: 'audio/wav' },
    audio: { encoding: 'host-asset', byteLength: bytes.byteLength, data: token },
    decoded: { sampleRate: 8000, channels: 1, frames: 32, durationSeconds: 32 / 8000 } };
  const record: ContentRecord = { id: 'small-sample', kind: 'rootsound.sample', owner: 'sampling', schemaVersion: 1,
    name: 'small', revision: 1, dependencies: [], body: body as unknown as JsonValue };
  let raw = JSON.stringify({ format: 'RootSoundMaterialLibrary', version: 1, contents: [record], drafts: [] });
  let writes = 0;
  const library = createMaterialLibrary({ read: () => raw, write(value) { raw = value; writes++; } });
  let loads = 0, decodes = 0;
  const payloads: SamplePayloadPort = { async load(id, size) { assert.equal(id, token); assert.equal(size, bytes.length); loads++; return bytes; } };
  const decoder = { async decode(input: Uint8Array) { decodes++; const decoded = decodePcmWav(input); assert(decoded); return decoded; } };
  return { bytes, pcm, body, record, library, payloads, decoder, raw: () => raw, writes: () => writes, loads: () => loads, decodes: () => decodes };
}

test('host sample metadata validates opaque references without acquiring bytes and keeps the actual encoding', () => {
  const f = fixture();
  assert.deepEqual(readSampleBody(f.body), f.body);
  assert.deepEqual(createSampleReferenceAdapter().slots(f.record), []);
  assert.equal(f.loads(), 0); assert.equal(f.decodes(), 0); assert.equal(f.writes(), 0);
  const wrongFields = `rootsound-payload:${'a'.repeat(31)}:${'b'.repeat(65)}`;
  assert.equal(wrongFields.length, token.length);
  for (const data of ['', 'file:///C:/private.wav', '../private.wav', token.toUpperCase(), `${token}:extra`,
    `${token}\n`, `${token}\r\n`, wrongFields, token.replace('a', 'z')])
    assert.throws(() => readSampleBody({ ...f.body, audio: { ...f.body.audio, data } }), /会话引用/);
  for (const byteLength of [0, -1, 1.5, NaN, Infinity, MAX_SAMPLE_FILE_BYTES + 1])
    assert.throws(() => readSampleBody({ ...f.body, audio: { ...f.body.audio, byteLength } }), /会话引用/);
  assert.throws(() => readSampleBody({ ...f.body, audio: { ...f.body.audio, encoding: 'file' } }), /编码/);
});

test('host acquisition is explicit, verifies size and owns its returned bytes; base64 stays unchanged', async () => {
  const f = fixture(); const original = new Uint8Array(f.bytes);
  const host = await resolveSampleBytes(f.body.audio, f.payloads);
  assert.deepEqual(host, f.bytes); assert.notEqual(host, f.bytes);
  f.bytes.fill(0); assert.deepEqual(host, original); assert.equal(f.loads(), 1);
  const base64: SampleBody['audio'] = { encoding: 'base64', byteLength: original.length, data: encodeBase64(original) };
  assert.deepEqual(await resolveSampleBytes(base64, { async load() { throw new Error('Must not request host data'); } }), original);
  assert.equal(readSampleBody({ ...f.body, audio: base64 }).audio.encoding, 'base64');
});

test('missing sessions, loader failures and incomplete payloads are reported rather than replacing audio', async () => {
  const f = fixture();
  await assert.rejects(resolveSampleBytes(f.body.audio), /本机工程会话/);
  await assert.rejects(resolveSampleBytes(f.body.audio, { async load() { throw new Error('Session expired'); } }), /Session expired/);
  for (const value of [null, 'bytes', new ArrayBuffer(f.bytes.length), new Uint8Array(f.bytes.length - 1), new Uint8Array(f.bytes.length + 1)])
    await assert.rejects(resolveSampleBytes(f.body.audio, { async load() { return value as unknown as Uint8Array; } }), /不完整/);
  assert.equal(f.writes(), 0); assert.equal(f.loads(), 0);
});

test('prepared host samples load once per content revision and never during construction or unrelated edits', async () => {
  const f = fixture(); const before = f.raw(); const sources = createSampleAudio(f.library, f.decoder, f.payloads);
  assert.equal(f.loads(), 0); assert.throws(() => sources.readPrepared(f.record.id), /尚未准备/);
  await sources.prepare([f.record.id, f.record.id]);
  assert.deepEqual(sources.readPrepared(f.record.id).audio, f.pcm);
  assert.equal(f.loads(), 1); assert.equal(f.decodes(), 1); assert.equal(f.raw(), before);
  await sources.prepare([f.record.id]);
  f.library.createDraft({ kind: 'unrelated', owner: 'test', schemaVersion: 1, name: 'Small draft', body: {} });
  await sources.prepare([f.record.id]);
  assert.equal(f.loads(), 1); assert.equal(f.decodes(), 1);
  assert.deepEqual(readSampleBody(f.library.readContent(f.record.id)!.body).audio, f.body.audio);
});

test('failed host preparation keeps no fake prepared sample and can be retried', async () => {
  const f = fixture(); let shouldFail = true;
  const sources = createSampleAudio(f.library, f.decoder, { async load(id, bytes) {
    if (shouldFail) throw new Error('Transient host failure'); return f.payloads.load(id, bytes);
  } });
  await assert.rejects(sources.prepare([f.record.id]), /Transient host failure/);
  assert.throws(() => sources.readPrepared(f.record.id), /尚未准备/); assert.equal(f.decodes(), 0);
  shouldFail = false; await sources.prepare([f.record.id]);
  assert.deepEqual(sources.readPrepared(f.record.id).audio, f.pcm); assert.equal(f.loads(), 1);
});

test('sampling menus and unchanged saves preserve host identities; audition and opening fetch only the chosen sample', async () => {
  const f = fixture(); const sampling = createSampling(f.library, { payloads: f.payloads, decoder: f.decoder,
    files: { async open() { return { status: 'cancelled' }; } },
    capture: { async start() { throw new Error('No audio device'); }, cancel() {} } });
  const originalRecord = f.library.readContent(f.record.id), original = f.raw();
  assert.equal(sampling.read().savedSamples[0]!.id, f.record.id); assert.equal(f.loads(), 0);
  const initial = sampling.read(); const preview = await sampling.audioForSaved(f.record.id);
  assert.deepEqual(preview, f.pcm); assert.deepEqual(sampling.read(), initial); assert.equal(f.raw(), original);
  await sampling.open(f.record.id);
  assert.equal(sampling.read().changed, false); assert.deepEqual(sampling.previewAudio(), f.pcm);
  assert.equal(sampling.save().id, f.record.id); assert.equal(f.writes(), 0);
  assert.deepEqual(f.library.readContent(f.record.id), originalRecord); assert.equal(f.loads(), 2);
  sampling.dispose();
});

test('working project exports retain session references for native expansion while external project import rejects them atomically', () => {
  const f = fixture();
  const adapter: ReferenceAdapter = { kind: 'test.song',
    slots(record) { return [{ id: 'audio', targetId: (record.body as { sampleId: string }).sampleId, label: 'sample' }]; },
    validateTarget(_record, _slot, target) { assert.equal(target.kind, 'rootsound.sample'); },
    replace(_record, changes) { return { body: { sampleId: changes[0]!.targetId }, dependencies: [changes[0]!.targetId] }; },
  };
  const adapters = [adapter, createSampleReferenceAdapter()];
  const draft = f.library.createDraft({ kind: 'test.song', owner: 'test', schemaVersion: 1, name: 'Small song',
    dependencies: [f.record.id], body: { sampleId: f.record.id } });
  const output = createProjectPackages(f.library, adapters, { rootKind: 'test.song' }).exportDraft(draft.id);
  const file = JSON.parse(output.text);
  assert.equal(file.contents.find((record: ContentRecord) => record.kind === 'rootsound.sample').body.audio.encoding, 'host-asset');
  const target = createMaterialLibrary(); const packages = createProjectPackages(target, adapters, { rootKind: 'test.song' });
  const before = target.currentToken(); const refused = packages.importProject(output.text);
  assert.equal(refused.status, 'conflict'); assert.match(refused.status === 'conflict' ? refused.reason : '', /必须内嵌采样/);
  assert.equal(target.currentToken(), before); assert.deepEqual(target.listContent(), []); assert.deepEqual(target.listDrafts(), []);
  const sample = file.contents.find((record: ContentRecord) => record.kind === 'rootsound.sample');
  sample.body.audio = { encoding: 'base64', byteLength: f.bytes.length, data: encodeBase64(f.bytes) };
  sample.body.source.name = token; // Merely naming a file after a token is ordinary text, not a session reference.
  assert.equal(packages.importProject(JSON.stringify(file)).status, 'imported');
  assert.equal(f.loads(), 0); assert.equal(f.decodes(), 0);
});

test('external tone graphs reject session payloads before adoption while embedded source files remain accepted', () => {
  const f = fixture();
  const tone: ContentRecord = { id: 'small-tone', kind: 'rootsound.timbre', owner: 'timbre', schemaVersion: 1,
    name: 'Small tone', revision: 1, dependencies: [f.record.id], body: { model: 'sample-instrument', version: 1,
      sampleId: f.record.id, startSeconds: 0, endSeconds: 32 / 8000, rootFrequencyHz: 440, attackSeconds: 0, releaseSeconds: .01, level: .7 } };
  const graph = { format: 'RootSoundTimbre', version: 1, timbre: tone, contents: [f.record] };
  assert.throws(() => readTimbreImport(JSON.stringify(graph), 'small.rssound'), /必须内嵌采样/);
  assert.throws(() => readTimbreImport(JSON.stringify(graph), 'small.rssynth'), /必须内嵌采样/);
  const embedded = structuredClone(graph);
  (embedded.contents[0]!.body as unknown as SampleBody).audio = { encoding: 'base64', byteLength: f.bytes.length, data: encodeBase64(f.bytes) };
  const parsed = readTimbreImport(JSON.stringify(embedded), 'small.rssound');
  assert.deepEqual(parsed.timbre, tone); assert.equal(readSampleBody(parsed.dependencies[0]!.body).audio.encoding, 'base64');
  assert.equal(f.loads(), 0); assert.equal(f.decodes(), 0); assert.equal(f.writes(), 0);
});
