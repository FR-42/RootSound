import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { SampleFilesPort } from '../src/workstation/contracts/files.ts';
import { MAX_SAMPLE_FILE_BYTES } from '../src/workstation/contracts/files.ts';
import type { SampleCapturePort, SampleRecording } from '../src/workstation/contracts/sampling.ts';
import type { PcmAudio } from '../src/workstation/contracts/sound.ts';
import { createMaterialLibrary } from '../src/workstation/modules/materials/public.ts';
import { createSampling, createSampleReferenceAdapter, readSampleBody } from '../src/workstation/modules/sampling/public.ts';
import { copyPcm, decodeBase64, decodePcmWav, encodeBase64, encodeFloatWav, validatePcm, waveform } from '../src/workstation/modules/sampling/audio.ts';

function deferred<T>() {
  let resolve!: (value: T) => void; let reject!: (error: Error) => void;
  const promise = new Promise<T>((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}
function pcm(rate = 44100): PcmAudio { return { sampleRate: rate, channels: [new Float32Array([0, 0.125, -0.25, 0.75, -1.25, 1.5, -0])] }; }
function fixture() {
  let raw: string | null = null; let failing = false; let writes = 0; let cancels = 0;
  const storage = { read: () => raw, write(value: string) { if (failing) throw new Error('磁盘空间不足'); raw = value; writes++; } };
  const library = createMaterialLibrary(storage); const audio = pcm(); const bytes = encodeFloatWav(audio);
  let file: Awaited<ReturnType<SampleFilesPort['open']>> = { status: 'opened', name: '原始片段.wav', mimeType: 'audio/wav', bytes };
  let decode = async (input: Uint8Array) => decodePcmWav(input) ?? (() => { throw new Error('不支持的音频'); })();
  const result = deferred<PcmAudio>(); let progress: ((seconds: number, level: number) => void) | undefined; let stops = 0;
  const recording: SampleRecording = { result: result.promise, stop() { stops++; result.resolve(audio); }, cancel() { cancels++; result.reject(new Error('录音已取消')); } };
  // The real capture adapter consumes rejected results even while permission/setup is pending.
  void result.promise.catch(() => {});
  const capture: SampleCapturePort = { async start(listener) { progress = listener; return recording; }, cancel() { cancels++; } };
  const files: SampleFilesPort = { async open() { return file; } };
  const decoder = { decode: (input: Uint8Array) => decode(input) };
  const sampling = createSampling(library, { files, decoder, capture });
  return { storage, library, sampling, audio, bytes, result, files, decoder, capture,
    raw: () => raw, writes: () => writes, stops: () => stops, cancels: () => cancels,
    fail: (value = true) => { failing = value; }, file: (value: typeof file) => { file = value; },
    decode: (value: typeof decode) => { decode = value; }, progress: (seconds: number, level: number) => { progress?.(seconds, level); } };
}

test('file import preserves original bytes, native PCM clock and floating values without writing a library draft or content', async () => {
  const f = fixture(); await f.sampling.importFile(); const view = f.sampling.read();
  assert.equal(view.phase, 'idle'); assert.equal(view.sampleRate, 44100); assert.equal(view.channelCount, 1); assert.equal(view.changed, true);
  assert.deepEqual(f.sampling.previewAudio(), f.audio); assert.equal(view.waveform.length, f.audio.channels[0]!.length);
  assert(view.waveform.every(value => Number.isFinite(value) && value >= 0 && value <= 1));
  assert.equal(f.writes(), 0); assert.deepEqual(f.library.listContent(), []); assert.deepEqual(f.library.listDrafts(), []);
  const record = f.sampling.save(); assert.equal(f.writes(), 1); assert.equal(record.kind, 'rootsound.sample'); assert.equal(record.owner, 'sampling');
  const body = readSampleBody(record.body); assert.deepEqual(decodeBase64(body.audio.data, body.audio.byteLength), f.bytes);
  assert.equal(body.decoded.sampleRate, 44100); assert.equal(body.source.name, '原始片段.wav'); assert.equal(f.library.listDrafts().length, 0);
});

test('original compressed file bytes remain exact even when a decoder mutates its private input copy', async () => {
  const f = fixture(); const original = new Uint8Array([0xff, 0xfb, 0x90, 0, 255, 17, 29, 0]);
  f.file({ status: 'opened', name: '原文件.mp3', mimeType: 'audio/mpeg', bytes: original });
  f.decode(async bytes => { bytes.fill(0); return pcm(48000); }); await f.sampling.importFile();
  const saved = f.sampling.save(); const body = readSampleBody(saved.body);
  assert.deepEqual(decodeBase64(body.audio.data, body.audio.byteLength), original); assert.equal(body.source.mimeType, 'audio/mpeg');
  assert.equal(body.decoded.sampleRate, 48000); assert.equal(body.source.kind, 'file');
});

test('audio identity survives naming and saving but changes when a completed source is replaced', async () => {
  const f = fixture(); assert.equal(f.sampling.read().audioToken, undefined);
  await f.sampling.importFile(); const identity = f.sampling.read().audioToken; assert(identity);
  f.sampling.rename('哼出来的想法'); const saved = f.sampling.save();
  assert.equal(f.sampling.read().audioToken, identity); f.sampling.leave(); assert.equal(f.sampling.read().audioToken, identity);
  await f.sampling.open(saved.id); assert.notEqual(f.sampling.read().audioToken, identity);
});

test('failed saves retain pending audio and retry atomically; duplicate save is harmless and renamed saves use a new identity', async () => {
  const f = fixture(); await f.sampling.importFile(); const before = f.sampling.previewAudio(); f.fail();
  assert.throws(() => f.sampling.save(), /磁盘空间不足/); assert.equal(f.raw(), null); assert.equal(f.sampling.read().changed, true);
  assert.deepEqual(f.sampling.previewAudio(), before); f.fail(false); const first = f.sampling.save(); const writes = f.writes();
  assert.equal(f.sampling.save().id, first.id); assert.equal(f.writes(), writes); assert.equal(f.sampling.read().changed, false);
  f.sampling.rename('另一份名字'); const second = f.sampling.save(); assert.notEqual(second.id, first.id);
  assert.equal(readSampleBody(second.body).source.name, '原始片段.wav'); assert.deepEqual(f.library.readContent(first.id), first);
  assert.equal(f.library.listContent().length, 2); assert.equal(f.library.listDrafts().length, 0);
});

test('saved samples reopen after reconstruction with exact bytes and readonly catalog audition preserves pending audio', async () => {
  const f = fixture(); await f.sampling.importFile(); const saved = f.sampling.save();
  const library = createMaterialLibrary(f.storage); const other = createSampling(library, { files: f.files, decoder: f.decoder, capture: f.capture });
  assert.equal(other.read().savedSamples[0]!.id, saved.id); assert.equal(other.read().name, ''); await other.open(saved.id);
  assert.deepEqual(other.previewAudio(), f.audio); assert.equal(other.read().changed, false); other.rename('尚未保存的名称');
  const before = other.read(); const raw = f.raw(); const audition = await other.audioForSaved(saved.id);
  assert.deepEqual(audition, f.audio); assert.deepEqual(other.read(), before); assert.equal(f.raw(), raw);
  audition.channels[0]![0] = 0.9; assert.equal(other.previewAudio().channels[0]![0], 0);
});

test('failed or cancelled import preserves the previous pending sample and reports decoder errors without a write', async () => {
  const f = fixture(); await f.sampling.importFile(); const before = f.sampling.previewAudio(); const name = f.sampling.read().name;
  f.file({ status: 'cancelled' }); await f.sampling.importFile(); assert.equal(f.sampling.read().name, name);
  f.file({ status: 'opened', name: '不能解码的文件.bin', mimeType: '', bytes: new Uint8Array([1, 2, 3]) });
  await assert.rejects(f.sampling.importFile(), /不支持/); assert.equal(f.sampling.read().phase, 'idle'); assert(f.sampling.read().problem);
  assert.deepEqual(f.sampling.previewAudio(), before); assert.equal(f.writes(), 0);
});

test('leaving cancels late file selection and late saved-sample decode without replacing completed pending audio', async () => {
  const f = fixture(); await f.sampling.importFile(); const saved = f.sampling.save(); const before = f.sampling.previewAudio();
  const selected = deferred<Awaited<ReturnType<SampleFilesPort['open']>>>(); const files: SampleFilesPort = { open: () => selected.promise };
  const controller = createSampling(f.library, { files, decoder: f.decoder, capture: f.capture }); await controller.open(saved.id);
  const opening = controller.importFile(); assert.equal(controller.read().phase, 'loading'); controller.leave();
  selected.resolve({ status: 'opened', name: '迟到的文件.wav', bytes: f.bytes, mimeType: 'audio/wav' }); await opening;
  assert.equal(controller.read().phase, 'idle'); assert.equal(controller.read().name, saved.name); assert.deepEqual(controller.previewAudio(), before);
  const decoded = deferred<PcmAudio>(); f.decode(() => decoded.promise); const loading = controller.open(saved.id); controller.leave();
  decoded.resolve({ sampleRate: 48000, channels: [new Float32Array([0.99])] }); await loading;
  assert.deepEqual(controller.previewAudio(), before); assert.equal(controller.read().sampleRate, 44100);
});

test('a newer import wins over an older decoder completion and dispose invalidates pending callbacks', async () => {
  const f = fixture(); const older = deferred<PcmAudio>(); let calls = 0;
  f.decode(async () => ++calls === 1 ? older.promise : pcm(48000));
  const first = f.sampling.importFile(); await Promise.resolve(); await Promise.resolve();
  await f.sampling.importFile(); older.resolve(pcm(44100)); await first; assert.equal(f.sampling.read().sampleRate, 48000);
  let changes = 0; const remove = f.sampling.subscribe(() => { changes++; }); f.sampling.dispose(); const count = changes;
  f.progress(20, 0.8); remove(); f.sampling.dispose(); assert.equal(changes, count); await assert.rejects(f.sampling.importFile(), /已经关闭/);
});

test('recording starts independently of its result, stops into lossless Float32 WAV and does not save automatically', async () => {
  const f = fixture(); await f.sampling.startRecording(); assert.equal(f.sampling.read().phase, 'recording');
  f.progress(1.25, 0.25); assert.equal(f.sampling.read().elapsedSeconds, 1.25); assert.equal(f.sampling.read().inputLevel, 0.25);
  await f.sampling.stopRecording(); assert.equal(f.stops(), 1); assert.equal(f.sampling.read().phase, 'idle'); assert.equal(f.sampling.read().sourceKind, 'microphone');
  assert.deepEqual(f.sampling.previewAudio(), f.audio); assert.equal(f.writes(), 0); const saved = f.sampling.save(); const body = readSampleBody(saved.body);
  const bytes = decodeBase64(body.audio.data, body.audio.byteLength); assert.equal(new DataView(bytes.buffer).getUint16(20, true), 3);
  assert.deepEqual(decodePcmWav(bytes), f.audio); assert.equal(body.source.kind, 'microphone');
});

test('automatic recording completion is processed, while recording errors keep the previous completed sample', async () => {
  const f = fixture(); await f.sampling.importFile(); await f.sampling.startRecording();
  f.result.resolve(pcm(48000)); await f.sampling.stopRecording(); assert.equal(f.sampling.read().sampleRate, 48000);
  const g = fixture(); await g.sampling.importFile(); const previous = g.sampling.previewAudio(); await g.sampling.startRecording();
  g.result.reject(new Error('麦克风已经断开')); await assert.rejects(g.sampling.stopRecording(), /已经断开/);
  assert.equal(g.sampling.read().phase, 'idle'); assert.deepEqual(g.sampling.previewAudio(), previous); assert.equal(g.writes(), 0);
});

test('cancel and late permission completion cannot restart recording or overwrite completed pending content', async () => {
  const f = fixture(); await f.sampling.importFile(); const saved = f.sampling.save();
  const permission = deferred<SampleRecording>(); let lateCancels = 0; const result = deferred<PcmAudio>(); void result.promise.catch(() => {});
  const capture: SampleCapturePort = { start: () => permission.promise, cancel() { lateCancels++; } };
  const controller = createSampling(f.library, { files: f.files, decoder: f.decoder, capture }); await controller.open(saved.id);
  const starting = controller.startRecording(); assert.equal(controller.read().phase, 'requesting'); controller.leave();
  permission.resolve({ result: result.promise, stop() {}, cancel() { lateCancels++; result.reject(new Error('cancelled')); } }); await starting;
  assert(lateCancels >= 2); assert.equal(controller.read().phase, 'idle'); assert.equal(controller.read().currentId, saved.id);
  assert.deepEqual(controller.previewAudio(), f.audio);
});

test('cancelling an active recording releases it, ignores late progress and retains the previous imported sample', async () => {
  const f = fixture(); await f.sampling.importFile(); const before = f.sampling.previewAudio(); await f.sampling.startRecording();
  const cancels = f.cancels(); f.sampling.cancelRecording(); assert(f.cancels() > cancels); f.progress(25, 1);
  assert.equal(f.sampling.read().phase, 'idle'); assert.equal(f.sampling.read().elapsedSeconds, 0); assert.equal(f.sampling.read().inputLevel, 0);
  assert.deepEqual(f.sampling.previewAudio(), before); assert.equal(f.writes(), 0);
});

test('a workspace observer that leaves immediately cannot trigger a new file picker or microphone permission request afterwards', async () => {
  const f = fixture(); let fileOpens = 0; let captureStarts = 0;
  const controller = createSampling(f.library, { decoder: f.decoder,
    files: { async open() { fileOpens++; return { status: 'cancelled' }; } },
    capture: { async start() { captureStarts++; throw new Error('Should not request a microphone'); }, cancel() {} } });
  controller.subscribe(() => { if (controller.read().phase !== 'idle') controller.leave(); });
  await controller.importFile(); await controller.startRecording();
  assert.equal(fileOpens, 0); assert.equal(captureStarts, 0); assert.equal(controller.read().phase, 'idle'); assert.equal(f.writes(), 0);
});

test('sample views and preview arrays are defensive lightweight summaries, including subscriber failures', async () => {
  const f = fixture(); const unsubscribe = f.sampling.subscribe(() => { throw new Error('display failed'); });
  await f.sampling.importFile(); const saved = f.sampling.save(); const view = f.sampling.read();
  assert(!JSON.stringify(view).includes('base64')); view.waveform.fill(99); view.savedSamples[0]!.name = '不能修改原对象';
  const preview = f.sampling.previewAudio(); preview.channels[0]!.fill(0);
  assert.deepEqual(f.sampling.previewAudio(), f.audio); assert.equal(f.sampling.read().savedSamples[0]!.name, saved.name);
  assert(f.sampling.read().waveform.every(value => value <= 1)); unsubscribe();
});

test('future or corrupted samples stay in the library and cannot replace a currently loaded sample', async () => {
  const f = fixture(); await f.sampling.importFile(); const valid = f.sampling.save(); const body = readSampleBody(valid.body);
  const future = { ...valid, id: crypto.randomUUID(), schemaVersion: 2, name: '未来采样' };
  assert.equal(f.library.commitTransaction({ expectedToken: f.library.currentToken(), label: '保留未来内容', createContents: [future] }).status, 'committed');
  const raw = f.raw(); await assert.rejects(f.sampling.open(future.id), /支持/); assert.equal(f.raw(), raw); assert.equal(f.sampling.read().currentId, valid.id);
  assert.throws(() => readSampleBody({ ...body, version: 2 }), /版本/);
  assert.throws(() => readSampleBody({ ...body, editingContext: {} }), /设置/);
  assert.throws(() => readSampleBody({ ...body, audio: { ...body.audio, byteLength: 0 } }), /长度/);
  assert.throws(() => readSampleBody({ ...body, decoded: { ...body.decoded, channels: 0 } }), /信息/);
  const adapter = createSampleReferenceAdapter(); assert.deepEqual(adapter.slots(valid), []);
  assert.throws(() => adapter.replace(valid, [{ slotId: 'x', targetId: 'y' }]), /没有/);
  assert.throws(() => adapter.slots({ ...valid, dependencies: ['external'] }), /独立采样/);
});

test('PCM and WAV helpers keep floating precision, arbitrary native clocks, channel identity and raw byte views', () => {
  const stereo: PcmAudio = { sampleRate: 96000, channels: [new Float32Array([0.123456789, -1.5, 0]), new Float32Array([-0.987654321, 0.75, -0])] };
  const bytes = encodeFloatWav(stereo); const buffer = new Uint8Array(bytes.length + 10); buffer.set(bytes, 5);
  assert.deepEqual(decodePcmWav(buffer.subarray(5, 5 + bytes.length)), stereo);
  const owned = copyPcm(stereo); owned.channels[0]![0] = 0; assert.notEqual(stereo.channels[0]![0], 0);
  assert.deepEqual(waveform(stereo, 1), [1]); assert.deepEqual(decodeBase64(encodeBase64(buffer), buffer.length), buffer);
});

test('invalid PCM, oversize original files, bad RIFF frames and noncanonical file encodings are rejected', async () => {
  assert.throws(() => validatePcm({ sampleRate: 0, channels: [new Float32Array([0])] }), /PCM/);
  assert.throws(() => validatePcm({ sampleRate: 48000, channels: [new Float32Array([Infinity])] }), /非有限/);
  assert.throws(() => validatePcm({ sampleRate: 48000, channels: [new Float32Array([0]), new Float32Array(2)] }), /长度/);
  assert.throws(() => validatePcm({ sampleRate: 8000, channels: [new Float32Array(8000 * 121)] }), /120/);
  assert.throws(() => decodeBase64('Zh==', 1), /编码/); assert.throws(() => decodeBase64('Zg=\n', 1), /编码|损坏/);
  const wav = encodeFloatWav(pcm()); const broken = new Uint8Array(wav.subarray(0, 59)); const header = new DataView(broken.buffer);
  header.setUint32(4, broken.length - 8, true); header.setUint32(54, 1, true);
  assert.throws(() => decodePcmWav(broken), /帧/);
  const tooBig = fixture(); tooBig.file({ status: 'opened', name: '过大的文件', mimeType: 'audio/wav', bytes: new Uint8Array(MAX_SAMPLE_FILE_BYTES + 1) });
  await assert.rejects(tooBig.sampling.importFile(), /16 MiB/); assert.equal(tooBig.writes(), 0);
});

test('uncompressed 24-bit PCM audition keeps its native rate without converting the stored source file', () => {
  const bytes = new Uint8Array(50); const view = new DataView(bytes.buffer); const write = (at: number, value: string) => { for (let index = 0; index < value.length; index++) bytes[at + index] = value.charCodeAt(index); };
  write(0, 'RIFF'); view.setUint32(4, 42, true); write(8, 'WAVE'); write(12, 'fmt '); view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); view.setUint16(22, 1, true); view.setUint32(24, 88200, true); view.setUint32(28, 88200 * 3, true); view.setUint16(32, 3, true); view.setUint16(34, 24, true);
  write(36, 'data'); view.setUint32(40, 6, true); bytes.set([0, 0, 128, 255, 255, 127], 44);
  const audio = decodePcmWav(bytes)!; assert.equal(audio.sampleRate, 88200); assert.deepEqual(audio.channels[0], new Float32Array([-1, 8388607 / 8388608]));
});
