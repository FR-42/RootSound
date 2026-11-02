import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { ContentRecord, Draft, MaterialTransactionResult } from '../src/workstation/contracts/content.ts';
import { createMaterialLibrary } from '../src/workstation/modules/materials/public.ts';
import { openMaterialSession } from '../src/workstation/app/material-library-session.ts';
import { createDesktopSamplePayloads } from '../src/workstation/app/platform/sample-payloads.ts';
import { createSampleAudio, readSampleBody, resolveSampleBytes } from '../src/workstation/modules/sampling/public.ts';
import { decodePcmWav, encodeFloatWav } from '../src/workstation/modules/sampling/audio.ts';

/** Deliberately tiny fixtures: these tests exercise copy/serialization counts,
 * never the production file-size limit or any real project/audio file. */
function fixture() {
  let raw: string | null = null, reads = 0, writes = 0;
  const storage = { read() { reads++; return raw; }, write(value: string) { writes++; raw = value; } };
  const library = createMaterialLibrary(storage);
  const source = library.createDraft({ kind: 'fixture.asset', owner: 'fixture', schemaVersion: 1,
    name: 'small immutable payload', body: { data: 'QUJD'.repeat(1024), properties: { exact: '🎵\n\\"' } } });
  const saved = library.saveDraft(source.id, 'new');
  assert.equal(saved.status, 'saved');
  if (saved.status !== 'saved') throw new Error('Fixture did not save');
  const draft = library.createDraft({ kind: 'fixture.phrase', owner: 'fixture', schemaVersion: 1,
    name: 'working phrase', dependencies: [saved.content.id], body: { notes: [{ at: .25, held: .5 }] } });
  return { library, storage, content: saved.content, draft, raw: () => raw!, reads: () => reads, writes: () => writes };
}

function committed(result: MaterialTransactionResult): void {
  assert.equal(result.status, 'committed', JSON.stringify(result));
}

test('session startup retains prototype storage methods and their receiver', () => {
  class Storage {
    raw: string | null = null;
    reads = 0; writes = 0;
    read() { this.reads++; return this.raw; }
    write(value: string) { this.writes++; this.raw = value; }
    writePermanent(value: string) { this.write(value); }
  }
  const storage = new Storage();
  const session = openMaterialSession(storage);
  assert.equal(storage.reads, 1); assert.equal(session.hasPrevious, false);
  session.library.createDraft({ kind: 'fixture', owner: 'fixture', schemaVersion: 1, name: 'working', body: {} });
  assert.equal(storage.writes, 1); assert.equal(storage.reads, 2);
  assert.equal(session.hasPrevious, false);
});

test('tiny transaction candidates validate in memory without serializing and reparsing a second library', t => {
  const f = fixture(); let stateSerializations = 0, stateParses = 0;
  const originalStringify = JSON.stringify, originalParse = JSON.parse;
  t.mock.method(JSON, 'stringify', function (value: unknown, ...args: unknown[]) {
    if (value && typeof value === 'object' && (value as { format?: unknown }).format === 'RootSoundMaterialLibrary') stateSerializations++;
    return Reflect.apply(originalStringify, JSON, [value, ...args]);
  });
  t.mock.method(JSON, 'parse', function (value: string, ...args: unknown[]) {
    if (typeof value === 'string' && value.includes('"RootSoundMaterialLibrary"')) stateParses++;
    return Reflect.apply(originalParse, JSON, [value, ...args]);
  });
  const writes = f.writes();
  committed(f.library.commitTransaction({ expectedToken: f.library.currentToken(), label: 'small composite edit',
    anchorDraftId: f.draft.id, replaceDrafts: [{ expected: f.draft, replacement: { ...f.draft, name: 'edited phrase',
      body: { notes: [{ at: .75, held: .25 }] } } }] }));
  assert.equal(stateSerializations, 1, 'only the single durable working snapshot is serialized');
  assert.equal(stateParses, 0, 'candidate validation must not decode another full snapshot');
  assert.equal(f.writes(), writes + 1);
  assert.deepEqual(f.library.readContent(f.content.id), f.content);
  assert.equal(f.library.readDraft(f.draft.id)!.name, 'edited phrase');
  assert(f.raw().length < 32 * 1024, 'fixture must remain small');

  const reopened = createMaterialLibrary(f.storage);
  assert.equal(stateParses, 1, 'a real cold restore still parses and validates saved text');
  assert.deepEqual(reopened.readContent(f.content.id), f.content);
  assert.equal(reopened.readDraft(f.draft.id)!.name, 'edited phrase');
});

test('direct candidate validation preserves atomic undo redo and rejects invalid references without a write', () => {
  const f = fixture(); const before = f.library.readDraft(f.draft.id)!;
  committed(f.library.commitTransaction({ expectedToken: f.library.currentToken(), label: 'remember small change',
    anchorDraftId: before.id, replaceDrafts: [{ expected: before, replacement: { ...before,
      body: { notes: [{ at: 1.5, held: .125 }] } } }] }));
  const edited = f.library.readDraft(before.id)!;
  assert.deepEqual(f.library.travelDraft(before.id, 'undo', edited).body, before.body);
  assert.deepEqual(f.library.travelDraft(before.id, 'redo', f.library.readDraft(before.id)!).body, edited.body);
  assert.deepEqual(f.library.readContent(f.content.id), f.content);

  const current = f.library.readDraft(before.id)!, token = f.library.currentToken(), raw = f.raw(), writes = f.writes();
  const corrupt: Draft = { ...current, dependencies: ['missing-payload'] };
  const failed = f.library.commitTransaction({ expectedToken: token, label: 'reject missing reference',
    replaceDrafts: [{ expected: current, replacement: corrupt }] });
  assert.equal(failed.status, 'conflict'); assert.equal(f.writes(), writes);
  assert.equal(f.raw(), raw); assert.equal(f.library.currentToken(), token);
  assert.deepEqual(f.library.readDraft(current.id), current);
  assert.deepEqual(f.library.readContent(f.content.id), f.content);

  const candidate: ContentRecord = { ...f.content, id: 'invalid-json-candidate',
    name: 'invalid', body: { nested: { number: Infinity } } };
  assert.equal(f.library.commitTransaction({ expectedToken: token, label: 'reject invalid JSON', createContents: [candidate] }).status, 'conflict');
  assert.equal(f.writes(), writes); assert.equal(f.raw(), raw);
});

test('bootstrap observes the first storage read once and retains ordinary external-conflict protection', () => {
  const initial = fixture(); let reads = 0, writes = 0, raw: string | null = initial.raw();
  const opened = openMaterialSession({ read() { reads++; return raw; }, write(value) { writes++; raw = value; } });
  assert.equal(reads, 1); assert.equal(writes, 0); assert.equal(opened.hasPrevious, true);
  assert.deepEqual(opened.library.readContent(initial.content.id), initial.content);
  const draft = opened.library.readDraft(initial.draft.id)!;
  const replacement = JSON.parse(raw!); replacement.drafts[0].name = 'an external edit'; raw = JSON.stringify(replacement);
  const external = raw;
  assert.throws(() => opened.library.updateDraft(draft.id, { name: 'stale overwrite' }), /其他窗口|写入失败/);
  assert.equal(raw, external); assert.equal(writes, 0);
  assert.deepEqual(opened.library.readDraft(draft.id), draft);

  let emptyReads = 0;
  const empty = openMaterialSession({ read() { emptyReads++; return null; }, write() { throw new Error('Unexpected bootstrap write'); } });
  assert.equal(emptyReads, 1); assert.equal(empty.hasPrevious, false); assert.deepEqual(empty.library.listContentInfo(), []);
});

const token = `rootsound-payload:${'a'.repeat(32)}:${'b'.repeat(64)}`;
function fetchPort(action: (input: string | URL | Request, options?: RequestInit) => Promise<Response>) {
  return createDesktopSamplePayloads(action as typeof fetch);
}

test('opaque payload fetch is lazy, same-origin and bounded by the declared byte length', async () => {
  let calls = 0;
  const payloads = fetchPort(async (input, options) => {
    calls++; assert.equal(input, `/__payload/${encodeURIComponent(token)}`);
    assert.equal(options?.cache, 'no-store'); assert.equal(options?.credentials, 'same-origin'); assert.equal(options?.redirect, 'error');
    let chunk = 0; const pieces = [new Uint8Array([1, 2]), new Uint8Array([3]), new Uint8Array([4])];
    return new Response(new ReadableStream<Uint8Array>({ pull(controller) {
      if (chunk === pieces.length) controller.close(); else controller.enqueue(pieces[chunk++]!);
    } }, { highWaterMark: 0 }), { headers: { 'Content-Length': '4' } });
  });
  assert.equal(calls, 0); assert.deepEqual(await payloads.load(token, 4), new Uint8Array([1, 2, 3, 4])); assert.equal(calls, 1);

  let refusedCalls = 0; const refused = fetchPort(async () => { refusedCalls++; throw new Error('Must preflight'); });
  const wrongFields = `rootsound-payload:${'a'.repeat(31)}:${'b'.repeat(65)}`;
  assert.equal(wrongFields.length, token.length);
  for (const invalid of ['', '/tmp/source.wav', token + ':extra', token + '\n', token + '\r\n', wrongFields, token.replace('aaaa', 'AAAA'), 'rootsound-payload:../'])
    await assert.rejects(refused.load(invalid, 4), /引用|长度/);
  for (const bytes of [0, -1, NaN, Infinity, 1.5, 16 * 1024 * 1024 + 1])
    await assert.rejects(refused.load(token, bytes), /引用|长度/);
  assert.equal(refusedCalls, 0);
});

test('payload network failures, truncated streams, length disagreement and overflow reject without decoding', async () => {
  for (const response of [new Response(null, { status: 404 }), new Response(null),
    new Response(new Uint8Array([1, 2]), { headers: { 'Content-Length': '3' } }),
    new Response(new Uint8Array([1, 2]), { headers: { 'Content-Length': 'invalid' } }),
    new Response(new Uint8Array([1]))]) {
    await assert.rejects(fetchPort(async () => response).load(token, 2), /采样|读取/);
  }
  let cancelled = false;
  const tooLong = new Response(new ReadableStream<Uint8Array>({
    start(controller) { controller.enqueue(new Uint8Array([1, 2, 3])); }, cancel() { cancelled = true; },
  }, { highWaterMark: 0 }));
  await assert.rejects(fetchPort(async () => tooLong).load(token, 2), /超过/); assert.equal(cancelled, true);
  await assert.rejects(fetchPort(async () => { throw new Error('network failed'); }).load(token, 2), /network failed/);
  const broken = new Response(new ReadableStream<Uint8Array>({ pull(controller) { controller.error(new Error('broken stream')); } }));
  await assert.rejects(fetchPort(async () => broken).load(token, 2), /broken stream/);
});

test('compact sample metadata never loads audio until explicit preparation, and failed loads can retry', async () => {
  const pcm = { sampleRate: 8000, channels: [Float32Array.from({ length: 80 }, (_, index) => Math.sin(index * .2) * .25)] };
  const bytes = encodeFloatWav(pcm);
  const body = readSampleBody({ model: 'audio-sample', version: 1,
    source: { kind: 'file', name: 'tiny-fixture.wav', mimeType: 'audio/wav' },
    audio: { encoding: 'host-asset', byteLength: bytes.length, data: token },
    decoded: { sampleRate: 8000, channels: 1, frames: 80, durationSeconds: .01 } });
  const record: ContentRecord = { id: 'tiny-host-sample', kind: 'rootsound.sample', owner: 'sampling', schemaVersion: 1,
    name: 'tiny sample', revision: 1, dependencies: [], body: body as unknown as ContentRecord['body'] };
  let raw = JSON.stringify({ format: 'RootSoundMaterialLibrary', version: 1, contents: [record], drafts: [] });
  const library = createMaterialLibrary({ read: () => raw, write(value) { raw = value; } });
  let loads = 0, decodes = 0, fail = true;
  const audio = createSampleAudio(library, { async decode(value) { decodes++; assert.deepEqual(value, bytes); const result = decodePcmWav(value); assert(result); return result; } },
    { async load(value, expected) { loads++; assert.equal(value, token); assert.equal(expected, bytes.length); if (fail) throw new Error('offline cache unavailable'); return bytes; } });
  library.listContentInfo(); readSampleBody(library.readContent(record.id)!.body);
  assert.equal(loads, 0); assert.equal(decodes, 0); assert.throws(() => audio.readPrepared(record.id), /尚未准备/);
  await assert.rejects(audio.prepare([record.id]), /offline cache/); assert.equal(decodes, 0);
  fail = false; await audio.prepare([record.id]); assert.equal(loads, 2); assert.equal(decodes, 1);
  assert.deepEqual(audio.readPrepared(record.id).audio, pcm);
  library.createDraft({ kind: 'fixture', owner: 'fixture', schemaVersion: 1, name: 'metadata edit', body: {} });
  await audio.prepare([record.id, record.id]); assert.equal(loads, 2); assert.equal(decodes, 1);
  assert(raw.length < 4 * 1024, 'only lightweight references enter the working library');

  await assert.rejects(resolveSampleBytes(body.audio), /本机|会话/);
  await assert.rejects(resolveSampleBytes(body.audio, { async load() { return new Uint8Array(1); } }), /不完整/);
  const loaded = await resolveSampleBytes(body.audio, { async load() { return bytes; } });
  assert.notEqual(loaded.buffer, bytes.buffer); assert.deepEqual(loaded, bytes);
});
