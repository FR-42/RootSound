import assert from 'node:assert/strict';
import test from 'node:test';
import { writeMidi } from 'midi-file';
import type { ContentRecord, Draft, MaterialStorage } from '../src/workstation/contracts/content.ts';
import { createMidiProjectLibrary } from '../src/workstation/app/midi-project.ts';
import { readMusicFile } from '../src/workstation/app/music-file.ts';
import { normalizeImportedTimbreNames } from '../src/workstation/app/curated-timbre-names.ts';
import { stageMaterialStorage } from '../src/workstation/app/material-library-session.ts';
import { openMusicDocument, commitMusicDocument } from '../src/workstation/app/music-document.ts';
import { ensureProjectMelodyTimbres } from '../src/workstation/app/project-timbres.ts';
import { createMaterialLibrary } from '../src/workstation/modules/materials/public.ts';
import { createTimbreEditor, createTimbrePlayback, createTimbreReferenceAdapter } from '../src/workstation/modules/timbre/public.ts';
import { studioInstrumentForMidi } from '../src/workstation/modules/timbre/instrument-catalog.ts';
import { createPhraseEditor, createPhrasePlayback, createPhraseReferenceAdapter } from '../src/workstation/modules/phrase/public.ts';
import { createSongEditor, createSongReferenceAdapter } from '../src/workstation/modules/song/public.ts';
import generalMidi from '../src/workstation/modules/timbre/general-midi.json' with { type: 'json' };

const policy = { project: { rootKind: 'rootsound.song', adapters: [createTimbreReferenceAdapter(), createPhraseReferenceAdapter(), createSongReferenceAdapter()] } };
type State = { contents: ContentRecord[]; drafts: Draft[] };
function midi(programs = [0, 1, 25, 40]): Uint8Array {
  return Uint8Array.from(writeMidi({ header: { format: 1, numTracks: programs.length, ticksPerBeat: 480 }, tracks: programs.map((program, channel) => [
    { deltaTime: 0, type: 'programChange', channel, programNumber: program },
    { deltaTime: 0, type: 'noteOn', channel, noteNumber: 60 + channel, velocity: 100 },
    { deltaTime: 480, type: 'noteOff', channel, noteNumber: 60 + channel, velocity: 0 },
    { deltaTime: 0, type: 'endOfTrack' },
  ]) }));
}
function legacy(): string {
  const state = JSON.parse(createMidiProjectLibrary(midi(), '命名验证').libraryText) as State;
  for (const tone of state.contents.filter(item => item.kind === 'rootsound.timbre')) {
    tone.name = generalMidi.programs[(tone.body as { midiProgram: number }).midiProgram]!;
  }
  return JSON.stringify(state);
}
const tones = (text: string) => (JSON.parse(text) as State).contents.filter(item => item.kind === 'rootsound.timbre');
function playable(text: string) {
  let saved = text;
  const library = createMaterialLibrary({ read: () => saved, write: value => { saved = value; } }, policy);
  const playback = createTimbrePlayback(library), score = createPhraseEditor(library, playback);
  const song = createSongEditor(library, createPhrasePlayback(library, playback), { defaultTempoMode: 'source' });
  return { library, score, song, text: () => saved };
}

for (const [label, importFile] of [
  ['project import', (bytes: Uint8Array) => createMidiProjectLibrary(bytes, '命名验证')],
  ['direct file import', (bytes: Uint8Array) => readMusicFile(bytes, '命名验证.mid', 'midi')],
] as const) test(`${label} names exact and substituted instruments from their actual curated samples without merging programs`, () => {
  const bytes = midi(), before = bytes.slice(), result = importFile(bytes), records = tones(result.libraryText);
  assert.deepEqual(records.map(item => item.name), ['三角钢琴', '三角钢琴', '木吉他', '独奏小提琴']);
  assert.equal(new Set(records.map(item => item.id)).size, 4);
  assert.deepEqual(records.map(item => (item.body as { midiProgram: number }).midiProgram), [0, 1, 25, 40]);
  for (const record of records) {
    const body = record.body as { instrument: string; midiProgram: number };
    assert.equal(body.instrument, studioInstrumentForMidi(body.midiProgram).key);
  }
  assert.deepEqual(bytes, before);
});

test('all 128 MIDI programs and drum substitutions use curated names in both import paths', () => {
  const cases: [number[], number[]][] = [[Array.from({ length: 128 }, (_, index) => index), []], [[], [35, 36, 38, 40, 81]]];
  for (const [programs, drums] of cases) {
    const bytes = Uint8Array.from(writeMidi({ header: { format: 0, numTracks: 1, ticksPerBeat: 480 }, tracks: [[
    ...programs.flatMap(program => [
      { deltaTime: 0, type: 'programChange' as const, channel: 0, programNumber: program },
      { deltaTime: 0, type: 'noteOn' as const, channel: 0, noteNumber: 60, velocity: 100 },
      { deltaTime: 30, type: 'noteOff' as const, channel: 0, noteNumber: 60, velocity: 0 },
    ]),
    ...drums.flatMap(pitch => [
      { deltaTime: 0, type: 'noteOn' as const, channel: 9, noteNumber: pitch, velocity: 100 },
      { deltaTime: 30, type: 'noteOff' as const, channel: 9, noteNumber: pitch, velocity: 0 },
    ]), { deltaTime: 0, type: 'endOfTrack' },
  ]] }));
    for (const text of [createMidiProjectLibrary(bytes, '全部音色').libraryText, readMusicFile(bytes, '全部音色.mid', 'midi').libraryText]) {
      const records = tones(text), count = programs.length + drums.length;
      assert.equal(records.length, count); assert.equal(new Set(records.map(item => item.id)).size, count);
      for (const record of records) {
        const body = record.body as { midiProgram?: number; midiDrum?: number };
        const name = studioInstrumentForMidi(body.midiProgram ?? 0, body.midiDrum).name;
        assert.equal(record.name, name);
      }
    }
  }
});

test('opening existing native music changes only recognized default names and survives Save and reopen', () => {
  const original = legacy(), before = JSON.parse(original) as State;
  const migrated = normalizeImportedTimbreNames(original), after = JSON.parse(migrated) as State;
  assert.deepEqual(after.drafts, before.drafts);
  assert.deepEqual(after.contents.map(({ name, ...record }) => record), before.contents.map(({ name, ...record }) => record));
  assert.deepEqual(tones(migrated).map(item => item.name), ['三角钢琴', '三角钢琴', '木吉他', '独奏小提琴']);
  const f = playable(migrated); openMusicDocument(f.library, f.song, f.score); commitMusicDocument(f.library, f.song, f.score);
  const envelope = JSON.stringify({ format: 'RootSoundWorkspace', version: 2, libraryText: f.text() });
  const reloaded = playable(JSON.parse(envelope).libraryText);
  openMusicDocument(reloaded.library, reloaded.song, reloaded.score);
  assert.equal(reloaded.score.read().body!.parts.reduce((count, part) => count + part.notes.length, 0), 4);
  assert.deepEqual(tones(reloaded.text()).map(item => item.name), tones(f.text()).map(item => item.name));
  assert.equal(normalizeImportedTimbreNames(f.text()), f.text());
});

test('custom names, stock presets and separate cards survive collisions with normalized defaults', () => {
  const f = playable(legacy()), songId = f.song.readDraft()!.id;
  const voice = f.library.listContent().find(item => item.kind === 'rootsound.timbre' && (item.body as { midiProgram?: number }).midiProgram === 40)!;
  const editor = createTimbreEditor(f.library); editor.open(voice.id); editor.rename('我的弦乐');
  let saved = editor.save('overwrite'); if (saved.status === 'needs-confirmation') saved = editor.save('overwrite', saved.confirmation);
  assert.equal(saved.status, 'saved');
  ensureProjectMelodyTimbres(f.library, songId);
  const original = tones(f.text()), migrated = normalizeImportedTimbreNames(f.text()), next = tones(migrated);
  assert.equal(next.find(item => item.id === voice.id)!.name, '我的弦乐');
  assert.equal(next.find(item => item.id === original.find(item => item.name === '三角钢琴')!.id)!.name, '三角钢琴');
  assert.equal(next.find(item => item.id === original.find(item => item.name === '大钢琴')!.id)!.name, '三角钢琴');
  assert.equal(next.find(item => item.id === original.find(item => item.name === '明亮钢琴')!.id)!.name, '三角钢琴');
  assert.equal(next.filter(item => item.name === '三角钢琴').length, 3);
  assert.deepEqual(next.map(({ name, ...record }) => record), original.map(({ name, ...record }) => record));
  assert.doesNotThrow(() => playable(migrated));
});

test('metadata normalization preserves a tone edit and its durable undo and redo', () => {
  const f = playable(legacy()), tone = f.library.listContent().find(item => item.kind === 'rootsound.timbre')!;
  const editor = createTimbreEditor(f.library); editor.open(tone.id); editor.setLevel(.4);
  const draftId = editor.read().draft!.id, history = f.library.readDraftHistory(draftId);
  const next = playable(normalizeImportedTimbreNames(f.text())), reopened = createTimbreEditor(next.library);
  reopened.openDraft(draftId); assert.equal(reopened.read().draft!.name, '三角钢琴');
  assert.equal(reopened.read().body!.level, .4);
  reopened.undo(); assert.equal(reopened.read().body!.level, .7); assert.equal(reopened.read().draft!.name, '三角钢琴');
  reopened.redo(); assert.equal(reopened.read().body!.level, .4); assert.equal(reopened.read().draft!.name, '三角钢琴');
  assert.equal(next.library.readDraftHistory(draftId).past.length, history.past.length);
});

test('startup stages normalization until successful load, guards concurrent writes and leaves curated files byte exact', () => {
  let text = legacy(), writes = 0;
  const storage: MaterialStorage = { read: () => text, write: value => { text = value; writes++; } };
  const original = text, staged = stageMaterialStorage(storage, normalizeImportedTimbreNames);
  assert.equal(text, original); createMaterialLibrary(staged.storage, policy); assert.equal(writes, 0);
  staged.publish(); assert.equal(writes, 1); assert.equal(tones(text)[0]!.name, '三角钢琴');
  const current = text, repeat = stageMaterialStorage(storage, normalizeImportedTimbreNames); repeat.publish();
  assert.equal(text, current); assert.equal(writes, 1);
  text = original; const conflict = stageMaterialStorage(storage, normalizeImportedTimbreNames); text = current;
  assert.throws(() => conflict.publish(), /加载时发生了变化/); assert.equal(text, current);
  for (const invalid of ['not JSON', '{"format":"another","midiProgram":0}', 'null']) assert.equal(normalizeImportedTimbreNames(invalid), invalid);
});
