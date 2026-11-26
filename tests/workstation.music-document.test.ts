import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createInitialProjectLibrary, createProjectCopyLibrary, renameProjectLibrary } from '../src/workstation/app/project-setup.ts';
import { openMusicDocument, commitMusicDocument } from '../src/workstation/app/music-document.ts';
import { createMaterialLibrary } from '../src/workstation/modules/materials/public.ts';
import { createTimbrePlayback, createTimbreReferenceAdapter } from '../src/workstation/modules/timbre/public.ts';
import { createPhraseEditor, createPhrasePlayback, createPhraseReferenceAdapter } from '../src/workstation/modules/phrase/public.ts';
import { createSongEditor, createSongReferenceAdapter } from '../src/workstation/modules/song/public.ts';
import { createMidiProjectLibrary } from '../src/workstation/app/midi-project.ts';
import { phraseBeatSeconds, phraseHeldSeconds } from '../src/workstation/contracts/phrase-time.ts';
import { musicClockVoice } from './music-clock-fixture.ts';

function open(text: string) {
  let snapshot = text;
  const library = createMaterialLibrary({ read: () => snapshot, write: value => { snapshot = value; } },
    { project: { rootKind: 'rootsound.song', adapters: [createTimbreReferenceAdapter(), createPhraseReferenceAdapter(), createSongReferenceAdapter()] } });
  const tones = createTimbrePlayback(library,undefined,undefined,musicClockVoice);
  const song = createSongEditor(library, createPhrasePlayback(library, tones), { defaultTempoMode: 'source' });
  const score = createPhraseEditor(library, tones);
  openMusicDocument(library, song, score);
  return { library, song, score, snapshot: () => snapshot };
}

test('music document starts as one empty named score and reopens without creating new data', () => {
  const f = open(createInitialProjectLibrary('新音乐'));
  assert.equal(f.score.read().draft!.name, '新音乐');
  assert.equal(f.score.read().body!.parts.length, 0);
  assert.equal(f.library.listContentInfo().filter(item => item.kind === 'rootsound.phrase').length, 1);
  const before = f.snapshot();
  commitMusicDocument(f.library, f.song, f.score);
  assert.equal(f.snapshot(), before, 'a clean close/save preparation must not mark the project dirty');
  assert.equal(open(f.snapshot()).score.read().draft!.sourceId, f.score.read().draft!.sourceId);
});

test('opening an externally renamed file gives both editor drafts the filename without altering the music', () => {
  const f = open(createInitialProjectLibrary('旧内部名称'));
  const original = structuredClone(f.score.read().body);
  openMusicDocument(f.library, f.song, f.score, '资源管理器里的新名称');
  assert.equal(f.song.read().draft!.name, '资源管理器里的新名称');
  assert.equal(f.score.read().draft!.name, '资源管理器里的新名称');
  assert.deepEqual(f.score.read().body, original);
  commitMusicDocument(f.library, f.song, f.score);
  assert.equal(open(f.snapshot()).score.read().draft!.name, '资源管理器里的新名称');
});

test('music edits stay in the working snapshot; saving/reopening retains notes, names and tempo', () => {
  const original = createInitialProjectLibrary('草稿'); const f = open(original);
  const tone = f.library.listContentInfo().find(item => item.kind === 'rootsound.timbre')!;
  const part = f.score.addPart(tone.id);
  f.score.addNote(part, { startBeat: 2, durationBeats: 1, durationSeconds: .4, frequencyHz: 440, velocity: .7 });
  f.score.setTempo(160, { preserveNoteDurations: true }); f.score.rename('我的音乐');
  assert.equal(open(original).score.read().body!.parts.length, 0, 'formal file is unchanged until its snapshot is explicitly saved');
  commitMusicDocument(f.library, f.song, f.score);
  const reopened = open(f.snapshot());
  assert.equal(reopened.score.read().draft!.name, '我的音乐');
  assert.equal(reopened.song.read().draft!.name, '我的音乐');
  assert.equal(reopened.score.read().body!.tempoBpm, 160);
  assert.equal(reopened.score.previewPlan().events.length, 1);
  assert.equal(reopened.score.previewPlan().events[0]!.atSeconds, .75);
  assert.equal(reopened.score.previewPlan().events[0]!.sound.note.holdSeconds, .4);
  const stable = reopened.snapshot(); commitMusicDocument(reopened.library, reopened.song, reopened.score); assert.equal(reopened.snapshot(), stable);
});

test('per-note gain is undoable and survives saving and reopening without changing MIDI velocity or level', () => {
  const f = open(createInitialProjectLibrary('单音符增益'));
  const tone = f.library.listContentInfo().find(item => item.kind === 'rootsound.timbre')!;
  const partId = f.score.addPart(tone.id);
  const input = { startBeat: 0, durationBeats: 1, frequencyHz: 440, velocity: .7, level: .8 };
  const id = f.score.addNote(partId, input);
  const nextId = f.score.addNote(partId, { ...input, startBeat: 1 });
  const draftId = f.score.read().draft!.id;
  f.score.setNoteWritesDeferred!(true);
  f.score.editDraftNote!(draftId, partId, { kind: 'gain', id, gainDb: 6 });
  assert.equal(f.score.previewPlan().events[0]!.noteGainDb, 6);
  f.score.undo();
  assert.equal(f.score.previewPlan().events[0]!.noteGainDb, undefined);
  f.score.redo();
  assert.equal(f.score.previewPlan().events[0]!.noteGainDb, 6);
  assert.throws(() => f.score.editDraftNote!(draftId, partId, { kind: 'gain', id, gainDb: 7 }), /音符音量/);
  f.score.flushNoteWrites!();
  commitMusicDocument(f.library, f.song, f.score);
  const reopened = open(f.snapshot()).score;
  assert.deepEqual(reopened.read().body!.parts[0]!.notes, [{ ...input, id, gainDb: 6 }, { ...input, id: nextId, startBeat: 1 }]);
  assert.deepEqual(reopened.previewPlan().events.map(event => event.noteGainDb), [6, undefined]);
});

test('gain curves save with their own card and compile against the current tempo', () => {
  const f = open(createInitialProjectLibrary('曲线'));
  const tone = f.library.listContentInfo().find(item => item.kind === 'rootsound.timbre')!;
  const first = f.score.addPart(tone.id), second = f.score.addPart(tone.id);
  for (const id of [first, second]) f.score.addNote(id, { startBeat: 0, durationBeats: 4, frequencyHz: 440, velocity: .7 });
  const points = [{ beat: 0, db: -6 }, { beat: 2, db: 6 }, { beat: 4, db: 0 }];
  f.score.setPartGainCurve(first, points);
  f.score.setPartPerformanceCurve(first, 'pitch', [{ beat: 0, db: 0, after: 1 }, { beat: 2, db: 7, before: 6 }]);
  f.score.setPartPerformanceCurve(first, 'velocity', [{ beat: 0, db: 10 }]);
  f.score.setPartPerformanceCurve(first, 'sustain', [{ beat: 1, db: 1 }, { beat: 5, db: 0 }]);
  f.score.setPartPerformanceCurve(first, 'soft', [{ beat: 0, db: 1 }]);
  f.score.setTempo(60);
  commitMusicDocument(f.library, f.song, f.score);
  const reopened = open(f.snapshot()).score;
  assert.deepEqual(reopened.read().body!.parts[0]!.gainCurve, points);
  assert.equal(reopened.read().body!.parts[1]!.gainCurve, undefined);
  const plan = reopened.previewPlan();
  assert.equal(plan.events[0]!.gainCurveId, first);
  assert.equal(plan.events[1]!.gainCurveId, undefined);
  assert.deepEqual(plan.gainCurves?.[first], [{ atSeconds: 0, db: -6 }, { atSeconds: 2, db: 6 }, { atSeconds: 4, db: 0 }]);
  assert.deepEqual(plan.pitchCurves?.[first], [{ atSeconds: 0, db: 0, after: 1 }, { atSeconds: 2, db: 7, before: 6 }]);
  assert.equal(plan.events[0]!.pitchCurveId, first);
  assert.equal(plan.events[1]!.pitchCurveId, undefined);
  assert(Math.abs(plan.events[0]!.sound.note.velocity - .8 * .84) < 1e-8);
  assert.equal(plan.events[0]!.sound.note.holdSeconds, 5);
  assert.equal(plan.events[1]!.sound.note.holdSeconds, 4);
  assert.throws(() => reopened.setPartGainCurve(first, [{ beat: 1, db: 0 }, { beat: 1, db: 2 }]), /重叠/);
  assert.throws(() => reopened.mergeParts(first, second), /曲线不同/);
});

test('music Save As and library rename update the sole editor title without dropping notes', () => {
  const f = open(createInitialProjectLibrary('原名'));
  const tone = f.library.listContentInfo().find(item => item.kind === 'rootsound.timbre')!;
  const part = f.score.addPart(tone.id); f.score.addNote(part, { startBeat: 0, durationBeats: 1, frequencyHz: 220, velocity: .5 });
  commitMusicDocument(f.library, f.song, f.score);
  const copied = open(createProjectCopyLibrary(f.snapshot(), '副本', f.song.read().draft!.id));
  assert.equal(copied.score.read().draft!.name, '副本'); assert.equal(copied.score.previewPlan().events.length, 1);
  assert.equal(open(f.snapshot()).score.read().draft!.name, '原名');
  const renamed = open(renameProjectLibrary(copied.snapshot(), '改名'));
  assert.equal(renamed.score.read().draft!.name, '改名'); assert.equal(renamed.score.previewPlan().events.length, 1);
});

test('older positioned music is flattened into one editable score preserving timing, held seconds and mix', () => {
  const f = open(createInitialProjectLibrary('旧工程'));
  const tone = f.library.listContentInfo().find(item => item.kind === 'rootsound.timbre')!;
  const part = f.score.addPart(tone.id); f.score.addNote(part, { startBeat: 1, durationBeats: 1, durationSeconds: .3, frequencyHz: 330, velocity: .6 });
  commitMusicDocument(f.library, f.song, f.score);
  const track = f.song.read().body!.tracks[0]!;
  f.song.addClip(track.id, f.score.read().draft!.sourceId!, 8);
  f.song.updateTrack(track.id, { level: .5, pan: .2 });
  const before = f.song.previewPlan();
  const merged = open(f.snapshot());
  const after = merged.score.previewPlan();
  assert.deepEqual(after.events.map(event => [event.atSeconds, event.sound.note.holdSeconds, event.sound.level, event.pan]),
    before.events.map(event => [event.atSeconds, event.sound.note.holdSeconds, event.sound.level, event.pan]));
  assert.equal(merged.score.read().body!.parts.length, 1);
});

test('a tiny ten-track MIDI opens in a single score without the former eight-voice limit', () => {
  const tracks = Array.from({ length: 10 }, (_, channel) => {
    const bytes = [0, 0xc0 + channel, channel, 0, 0x90 + channel, 60 + channel, 100, 0x83, 0x60, 0x80 + channel, 60 + channel, 0, 0, 255, 47, 0];
    return [77,84,114,107,0,0,0,bytes.length,...bytes];
  });
  const bytes = Uint8Array.from([77,84,104,100,0,0,0,6,0,1,0,10,1,224,...tracks.flat()]);
  const imported = createMidiProjectLibrary(bytes, '十个声音');
  const f = open(renameProjectLibrary(imported.libraryText, '十个声音'));
  assert.equal(f.score.read().body!.parts.length, 10);
  assert.equal(f.score.previewPlan().events.length, 10);
  assert.equal(f.song.read().body!.tracks.length, 1);
});

test('flattening retains silent undefined-tone notes so users can assign another sound', () => {
  const f = open(createInitialProjectLibrary('未定义音色'));
  const tone = f.library.listContentInfo().find(item => item.kind === 'rootsound.timbre')!;
  const part = f.score.addPart(tone.id); f.score.addNote(part, { startBeat: 0, durationBeats: 1, frequencyHz: 440, velocity: .5 });
  f.score.setPartVisible(part, false); commitMusicDocument(f.library, f.song, f.score);
  f.song.addClip(f.song.read().body!.tracks[0]!.id, f.score.read().draft!.sourceId!, 4);
  const merged = open(f.snapshot());
  assert.equal(merged.score.read().body!.parts[0]!.unassigned, true);
  assert.equal(merged.score.read().body!.parts[0]!.notes.length, 2);
  commitMusicDocument(merged.library, merged.song, merged.score);
  assert.equal(open(merged.snapshot()).score.read().body!.parts[0]!.notes.length, 2);
});

test('an old multi-BPM native song opens and saves with its roll map, timing and hidden material', () => {
  const f = open(createInitialProjectLibrary('旧变速工程'));
  const tone = f.library.listContentInfo().find(item => item.kind === 'rootsound.timbre')!;
  const part = f.score.addPart(tone.id);
  f.score.setLength(4);
  const second = f.score.addTempoSection();
  f.score.setTempoSection(second, 80);
  f.score.addNote(part, { startBeat: 3, durationBeats: 2, frequencyHz: 440, velocity: .7 });
  f.score.addNote(part, { startBeat: 5, durationBeats: .5, durationSeconds: .3, frequencyHz: 220, velocity: .5 });
  f.score.setPartGainCurve(part, [{ beat: 3, db: 0 }, { beat: 5, db: -5 }]);
  f.score.setPartPerformanceCurve(part, 'pitch', [{ beat: 5, db: 2 }]);
  const old = f.score.read().body!;
  old.parts[0]!.hiddenNotes = [{ sectionId: second,
    note: { id: 'hidden', startBeat: old.lengthBeats, durationBeats: 1, durationSeconds: .75, frequencyHz: 330, velocity: .5 } }];
  old.midiExpression = [{ id: 'lane', events: [{ type: 'controller', controller: 64, value: 0, beat: 5, order: 2 }],
    hiddenEvents: [{ sectionId: second, event: { type: 'controller', controller: 64, value: 0, beat: old.lengthBeats, order: 3 } }] }];
  f.library.updateDraft(f.score.read().draft!.id, { body: old });
  commitMusicDocument(f.library, f.song, f.score);
  const original = f.snapshot();
  const migrated = open(original), body = migrated.score.read().body!;
  assert.equal(body.tempoBpm, 120);
  assert.deepEqual(body.tempoSections, old.tempoSections);
  const sourceId = migrated.score.read().draft!.sourceId!;
  assert.equal(JSON.stringify(migrated.library.readContent(sourceId)!.body), JSON.stringify(f.library.readContent(sourceId)!.body));
  const timing = (body: typeof old) => body.parts[0]!.notes.map(note => [
    phraseBeatSeconds(body, note.startBeat), phraseHeldSeconds(body, note)]);
  assert.deepEqual(timing(body), timing(old));
  const curves = (body: typeof old) => [...body.parts[0]!.gainCurve!, ...body.parts[0]!.performanceCurves!.pitch!]
    .map(point => phraseBeatSeconds(body, point.beat));
  assert.deepEqual(curves(body), curves(old));
  assert.equal(phraseBeatSeconds(body, body.midiExpression![0]!.events[0]!.beat), phraseBeatSeconds(old, 5));
  assert.equal(body.parts[0]!.hiddenNotes![0]!.sectionId, second);
  assert.equal(body.parts[0]!.hiddenNotes![0]!.note.durationSeconds, .75);
  assert.equal(body.midiExpression![0]!.hiddenEvents![0]!.sectionId, second);
  commitMusicDocument(migrated.library, migrated.song, migrated.score);
  const reopened = open(migrated.snapshot()).score.read().body!;
  assert.deepEqual(reopened, body);
});
