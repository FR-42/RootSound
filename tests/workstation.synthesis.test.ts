import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { ContentRecord, SaveResult } from '../src/workstation/contracts/content.ts';
import type { SynthesizerBody, TimbreBody } from '../src/workstation/contracts/timbre.ts';
import { createMaterialLibrary, createProjectPackages, createReferenceEditing } from '../src/workstation/modules/materials/public.ts';
import { createTimbreEditor, createTimbrePlayback, createTimbreReferenceAdapter, readSynthesizerBody, synthesisFromBasic, timbrePresets, previewTimbrePreset } from '../src/workstation/modules/timbre/public.ts';
import { createPhraseEditor, createPhrasePlayback, createPhraseReferenceAdapter } from '../src/workstation/modules/phrase/public.ts';
import { createSongEditor, createSongPlayback, createSongReferenceAdapter } from '../src/workstation/modules/song/public.ts';
import { readPreview, validateFrequency } from '../src/workstation/modules/sound-runtime/plan.ts';
import { envelopeValue } from '../src/workstation/modules/sound-runtime/envelope.ts';

function saved(result: SaveResult): ContentRecord { assert.equal(result.status, 'saved', JSON.stringify(result)); if (result.status !== 'saved') throw new Error('save'); return result.content; }
function store() {
  let raw: string | null = null; let failing = false;
  const storage = { read: () => raw, write(value: string) { if (failing) throw new Error('磁盘空间不足'); raw = value; } };
  const library = createMaterialLibrary(storage);
  return { library, storage, raw: () => raw, fail() { failing = true; } };
}
const close = (a: number, b: number) => assert(Math.abs(a - b) < 1e-10, `${a} != ${b}`);

test('twelve distinct editable starting points compile without creating library records and return independent values', () => {
  const presets = timbrePresets(); assert.equal(presets.length, 12); assert.equal(new Set(presets.map(item => item.id)).size, 12);
  for (const preset of presets) { assert.deepEqual(readSynthesizerBody(preset.body), preset.body); const plan = previewTimbrePreset(preset.id); const preview = readPreview(plan); validateFrequency(preview, 48000); assert(preview.durationSeconds > 0); }
  presets[0]!.body.sources[0]!.waveform = 'noise'; assert.equal(timbrePresets()[0]!.body.sources[0]!.waveform, 'sine');
  assert.throws(() => previewTimbrePreset('missing'), /找不到/);
});

test('legacy warm clear and bright sounds keep their exact sources, envelope and level on opening or conversion', () => {
  const f = store(); const editor = createTimbreEditor(f.library);
  for (const character of ['warm', 'clear', 'bright'] as const) {
    editor.setCharacter(character); const original = editor.previewPlan(); const raw = f.raw();
    const current = editor.read().body as TimbreBody; const converted = synthesisFromBasic(current);
    const plan = editor.previewPlan(converted); assert.equal(plan.kind, 'basic-synth'); assert.equal(original.kind, 'basic-synth');
    if (plan.kind !== 'basic-synth' || original.kind !== 'basic-synth') return;
    assert.deepEqual(plan.sources, original.sources); assert.equal(plan.level, original.level);
    assert.equal(plan.envelope.attackSeconds, original.envelope.attackSeconds); assert.equal(plan.envelope.releaseSeconds, original.envelope.releaseSeconds);
    assert.equal(f.raw(), raw); assert.equal(editor.read().body.model, 'basic-synth');
    close(envelopeValue(plan.envelope, .01, .005), original.envelope.attackSeconds ? .005 / original.envelope.attackSeconds : 1);
  }
});

test('layer tuning, enable states and independent levels compile into a bounded mix without changing the source draft', () => {
  const f = store(); const editor = createTimbreEditor(f.library); editor.createFromPreset('lead');
  const body = editor.read().body as SynthesizerBody;
  body.sources[0]!.level = 1; body.sources[1]!.level = 1; body.sources[0]!.semitones = 12; body.sources[0]!.detuneCents = 100;
  const before = f.raw(); const plan = editor.previewPlan(body);
  if (plan.kind !== 'basic-synth') throw new Error('synth');
  close(plan.sources[0]!.frequencyRatio, 2 ** (13 / 12)); close(plan.sources.reduce((sum, source) => sum + source.level, 0), 1);
  assert.equal(f.raw(), before);
  body.sources.forEach(source => { source.enabled = false; }); const silent = editor.previewPlan(body);
  assert.equal(silent.kind, 'basic-synth'); if (silent.kind === 'basic-synth') assert.equal(silent.sources[0]!.level, 0);
});

test('synthesis edits and names have persistent undo redo and presets do not overwrite other drafts', () => {
  const f = store(); const editor = createTimbreEditor(f.library); const original = editor.read().draft;
  editor.createFromPreset('pad'); const fresh = editor.read(); editor.rename('远处的风');
  const body = editor.read().body as SynthesizerBody; body.filter.frequencyHz = 1234; body.pitch.semitones = -7; editor.setSynthesis(body);
  assert(editor.read().canUndo); editor.undo(); assert.equal((editor.read().body as SynthesizerBody).filter.frequencyHz, 2200);
  editor.undo(); assert.equal(editor.read().draft.name, fresh.draft.name); assert(editor.read().canRedo);
  const cold = createTimbreEditor(createMaterialLibrary(f.storage)); cold.redo(); cold.redo();
  assert.equal(cold.read().draft.name, '远处的风'); assert.equal((cold.read().body as SynthesizerBody).filter.frequencyHz, 1234);
  assert.deepEqual(f.library.readDraft(original.id), original);
});

test('invalid source graphs and failed synthesis writes keep both material and history intact', () => {
  const f = store(); const editor = createTimbreEditor(f.library); editor.createFromPreset('plain'); const before = f.raw();
  const changes: Array<(body: SynthesizerBody) => void> = [
    body => { body.sources = []; }, body => { body.sources.push(...Array.from({ length: 4 }, () => ({ ...body.sources[0]! }))); },
    body => { body.sources.push({ ...body.sources[0]! }); }, body => { body.sources[0]!.waveform = 'unknown' as never; },
    body => { body.sources[0]!.semitones = Infinity; }, body => { body.sources[0]!.enabled = 1 as never; },
    body => { body.sustain = 2; }, body => { body.decaySeconds = -1; }, body => { body.filter.resonance = NaN; },
    body => { body.pitch.seconds = 0; }, body => { (body as unknown as Record<string, unknown>).hidden = true; },
  ];
  for (const change of changes) { const body = editor.read().body as SynthesizerBody; change(body); assert.throws(() => editor.setSynthesis(body)); assert.equal(f.raw(), before); }
  f.fail(); const body = editor.read().body as SynthesizerBody; body.sustain = .37; assert.throws(() => editor.setSynthesis(body), /磁盘/); assert.equal(f.raw(), before);
});

test('v2 single-tone files preserve all synthesis controls and open in an empty offline library without changing the source', () => {
  const f = store(); const editor = createTimbreEditor(f.library); editor.createFromPreset('snare'); editor.rename('我的沙鼓');
  const body = editor.read().body as SynthesizerBody; body.pitch = { semitones: 13, seconds: .087 }; body.sources[1]!.detuneCents = 42; editor.setSynthesis(body);
  const before = f.raw(); const file = editor.exportSound(); assert.equal(JSON.parse(file).version, 2); assert.equal(f.raw(), before);
  const target = createTimbreEditor(createMaterialLibrary()); target.importSound(file);
  assert.deepEqual(target.read().body, body); assert.deepEqual(target.previewPlan(), editor.previewPlan()); assert.equal(target.read().draft.name, '我的沙鼓');
  assert.notEqual(target.read().draft.id, editor.read().draft.id);
});

test('new synth voices travel through phrase song and project packaging with all controls intact in a fresh library', () => {
  const adapters = [createTimbreReferenceAdapter(), createPhraseReferenceAdapter(), createSongReferenceAdapter()];
  const f = store(); const timbre = createTimbreEditor(f.library); timbre.createFromPreset('kick'); const voice = saved(timbre.save('new'));
  const playback = createTimbrePlayback(f.library); const phrase = createPhraseEditor(f.library, playback); phrase.create(voice.id);
  phrase.addNote(phrase.read().body!.parts[0]!.id, { startBeat: .25, durationBeats: .5, frequencyHz: 55, velocity: .8 }); const melody = saved(phrase.save('new'));
  const song = createSongEditor(f.library, createPhrasePlayback(f.library, playback), { defaultTempoMode: 'source' }); song.createFromPhrase(melody.id, '低鼓');
  const expected = song.previewPlan(); const raw = f.raw(); const file = createProjectPackages(f.library, adapters, { rootKind: 'rootsound.song' }).exportDraft(song.read().draft!.id);
  assert.equal(f.raw(), raw); const target = createMaterialLibrary(); const imported = createProjectPackages(target, adapters, { rootKind: 'rootsound.song' }).importProject(file.text);
  assert.equal(imported.status, 'imported'); if (imported.status !== 'imported') return;
  const actual = createSongPlayback(target, createPhrasePlayback(target, createTimbrePlayback(target))).planForSaved(imported.content.id);
  assert.deepEqual(actual, expected); assert(target.listContent().some(item => item.kind === 'rootsound.timbre' && JSON.stringify(item.body) === JSON.stringify(voice.body)));
});

test('shared synth tone edits fork only the selected phrase position and preserve the original voice', () => {
  const library = createMaterialLibrary(); const timbre = createTimbreEditor(library); timbre.createFromPreset('bass'); const voice = saved(timbre.save('new'));
  const playback = createTimbrePlayback(library); const phrase = createPhraseEditor(library, playback); phrase.create(voice.id); phrase.addPart(voice.id);
  const parent = phrase.read().draft!; const part = phrase.read().body!.parts[0]!;
  const refs = createReferenceEditing(library, [createTimbreReferenceAdapter(), createPhraseReferenceAdapter()]);
  const session = refs.begin({ root: { type: 'draft', id: parent.id }, path: [part.id] }); timbre.openDraft(session.draftId);
  const body = timbre.read().body as SynthesizerBody; body.filter.frequencyHz = 333; timbre.setSynthesis(body);
  const result = refs.apply(session.draftId); assert.equal(result.status, 'applied'); if (result.status !== 'applied') return;
  assert.notEqual(result.content.id, voice.id); assert.deepEqual(library.readContent(voice.id), voice);
  const current = library.readDraft(parent.id)!.body as unknown as { parts: { timbreId: string }[] };
  assert.equal(current.parts[0]!.timbreId, result.content.id); assert.equal(current.parts[1]!.timbreId, voice.id);
});

test('ADSR follows attack decay sustain and releases from the actual early note amplitude', () => {
  const e = { attackSeconds: .2, decaySeconds: .4, sustain: .25, releaseSeconds: .3 };
  close(envelopeValue(e, 1, .1), .5); close(envelopeValue(e, 1, .4), .625); close(envelopeValue(e, 1, .8), .25);
  close(envelopeValue(e, 1, 1.15), .125); close(envelopeValue(e, 1, 1.3), 0);
  close(envelopeValue(e, .1, .25), .25); close(envelopeValue(e, .4, .55), .3125);
  close(envelopeValue({ attackSeconds: 0, decaySeconds: 0, sustain: 0, releaseSeconds: 0 }, 1, .1), 0);
});

test('runtime refuses malformed ADSR filter and pitch plans, accounts for pitch rises and fingerprints all timbre controls', () => {
  const original = previewTimbrePreset('plain');
  for (const plan of [{ ...original, envelope: { attackSeconds: .1, releaseSeconds: .1, sustain: .5 } },
    { ...original, filter: { type: 'unknown', frequencyHz: 1000, resonance: 0 } },
    { ...original, pitch: { semitones: 0, seconds: NaN } }]) assert.throws(() => readPreview(plan));
  const rising = { ...original, note: { ...original.note, frequencyHz: 5000 }, pitch: { semitones: 36, seconds: .1 } };
  assert.throws(() => validateFrequency(readPreview(rising), 48000), /超出/);
  assert.notDeepEqual(readPreview(original), readPreview({ ...original, envelope: { ...original.envelope, sustain: .1 } }));
});
