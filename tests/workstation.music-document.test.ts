import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createInitialProjectLibrary, createProjectCopyLibrary, renameProjectLibrary } from '../src/workstation/app/project-setup.ts';
import { openMusicDocument, commitMusicDocument } from '../src/workstation/app/music-document.ts';
import { createMaterialLibrary } from '../src/workstation/modules/materials/public.ts';
import { createTimbrePlayback, createTimbreReferenceAdapter } from '../src/workstation/modules/timbre/public.ts';
import { createPhraseEditor, createPhrasePlayback, createPhraseReferenceAdapter } from '../src/workstation/modules/phrase/public.ts';
import { createSongEditor, createSongReferenceAdapter } from '../src/workstation/modules/song/public.ts';
import { createMidiProjectLibrary } from '../src/workstation/app/midi-project.ts';
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
