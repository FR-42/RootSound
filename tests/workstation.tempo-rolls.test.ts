import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createInitialProjectLibrary } from '../src/workstation/app/project-setup.ts';
import { openMusicDocument, commitMusicDocument } from '../src/workstation/app/music-document.ts';
import { createMaterialLibrary } from '../src/workstation/modules/materials/public.ts';
import { createTimbrePlayback, createTimbreReferenceAdapter } from '../src/workstation/modules/timbre/public.ts';
import { createPhraseEditor, createPhrasePlayback, createPhraseReferenceAdapter, readPhraseBody } from '../src/workstation/modules/phrase/public.ts';
import { createSongEditor, createSongReferenceAdapter } from '../src/workstation/modules/song/public.ts';
import { phraseBeatSeconds, phraseSecondsBeat, phraseDurationSeconds, phraseHeldSeconds, phraseStepsAtBeat, phraseTempoSpans } from '../src/workstation/contracts/phrase-time.ts';
import { melodyScoreGrid } from '../src/workstation/modules/ui-rendering/melody-geometry.ts';
import { musicClockVoice } from './music-clock-fixture.ts';

function fixture(input = createInitialProjectLibrary('多段BPM')) {
  let text = input;
  const library = createMaterialLibrary({ read: () => text, write: next => { text = next; } }, { project: { rootKind: 'rootsound.song',
    adapters: [createTimbreReferenceAdapter(), createPhraseReferenceAdapter(), createSongReferenceAdapter()] } });
  const tones = createTimbrePlayback(library, undefined, undefined, musicClockVoice), phrase = createPhraseEditor(library, tones);
  const song = createSongEditor(library, createPhrasePlayback(library, tones), { defaultTempoMode: 'source' });
  openMusicDocument(library, song, phrase);
  return { library, phrase, song, text: () => text };
}
test('sequential BPM rolls share one exact clock and preserve held seconds when either tempo changes', async () => {
  const f = fixture(), p = f.phrase; p.setLength(16);
  const part = p.addPart(p.read().availableSounds[0]!.id);
  p.addNote(part, { startBeat: 4, durationBeats: 1, durationSeconds: .3, frequencyHz: 440, velocity: .7 });
  const section = p.addTempoSection(); assert.equal(p.read().body!.lengthBeats, 32);
  p.setTempoSection(section, 60);
  p.addNote(part, { startBeat: 18, durationBeats: 1, durationSeconds: .3, frequencyHz: 660, velocity: .7 });
  let body = p.read().body!;
  assert.equal(phraseDurationSeconds(body), 24);
  for (const beat of [0, 4, 15.999, 16, 16.001, 18, 32]) assert(Math.abs(phraseSecondsBeat(body, phraseBeatSeconds(body, beat)) - beat) < 1e-10);
  await p.preparePreview(); assert.deepEqual(p.previewPlan().events.map(e => e.atSeconds), [2, 10]);
  p.setTempo(240, { preserveNoteDurations: true }); body = p.read().body!;
  await p.preparePreview(); assert.deepEqual(p.previewPlan().events.map(e => e.atSeconds), [1, 6]);
  assert(p.previewPlan().events.every(e => Math.abs(e.sound.note.holdSeconds-.3)<1e-12));
  assert.equal(body.tempoSections![0]!.tempoBpm, 60); assert.equal(phraseDurationSeconds(body), 20);
});

test('normal BPM edits retain musical note lengths and scale seconds in the affected rolls',async()=>{
  const f=fixture(),p=f.phrase;p.setLength(16);
  const part=p.addPart(p.read().availableSounds[0]!.id);
  p.addNote(part,{startBeat:4,durationBeats:1,durationSeconds:.3,frequencyHz:440,velocity:.7});
  const section=p.addTempoSection();p.setTempoSection(section,60);
  p.addNote(part,{startBeat:18,durationBeats:2,durationSeconds:.75,frequencyHz:660,velocity:.7});
  p.setTempo(240);await p.preparePreview();
  let plan=p.previewPlan();assert(Math.abs(plan.events[0]!.sound.note.holdSeconds-.15)<1e-12);
  assert(Math.abs(plan.events[1]!.sound.note.holdSeconds-.75)<1e-12);
  assert.deepEqual(plan.events.map(e=>e.atSeconds),[1,6]);
  p.setTempoSection(section,120);await p.preparePreview();plan=p.previewPlan();
  assert(Math.abs(plan.events[1]!.sound.note.holdSeconds-.375)<1e-12);
  assert.deepEqual(plan.events.map(e=>e.atSeconds),[1,5]);
  const expected=p.read().body;commitMusicDocument(f.library,f.song,p);
  assert.deepEqual(fixture(f.text()).phrase.read().body,expected);
});

test('reapplying an unchanged BPM does not rewrite legacy note lengths',()=>{
  const f=fixture(),p=f.phrase,part=p.addPart(p.read().availableSounds[0]!.id);
  p.addNote(part,{startBeat:0,durationBeats:1,frequencyHz:440,velocity:.7});
  const section=p.addTempoSection(),before=structuredClone(p.read().body);
  p.setTempo(before!.tempoBpm);p.setTempoSection(section,before!.tempoSections![0]!.tempoBpm);
  assert.deepEqual(p.read().body,before);
});

test('held notes crossing a BPM boundary keep their complete duration when the boundary moves',async()=>{
  const f=fixture(),p=f.phrase;p.setLength(16);const section=p.addTempoSection();p.setTempoSection(section,60);
  const part=p.addPart(p.read().availableSounds[0]!.id);
  p.addNote(part,{startBeat:15,durationBeats:3,durationSeconds:2.5,frequencyHz:440,velocity:.7});
  p.addNote(part,{startBeat:14,durationBeats:1,durationSeconds:.5,frequencyHz:660,velocity:.7});
  p.setTempoSection(section,120);await p.preparePreview();
  assert(Math.abs(p.previewPlan().events.find(event=>event.sound.note.frequencyHz===440)!.sound.note.holdSeconds-1.5)<1e-12);
  const before=p.previewPlan().events;
  p.setTempoSectionStart(section,8);await p.preparePreview();
  assert.deepEqual(p.previewPlan().events,before);
  assert.equal(p.read().body!.parts[0]!.hiddenNotes,undefined);
});
test('BPM rolls survive manual project commit and fresh reopen, with undo for adding and editing rolls', async () => {
  const f = fixture(); f.phrase.setLength(16); const before = f.phrase.read().body;
  const section = f.phrase.addTempoSection(); f.phrase.setTempoSection(section, 90);
  f.phrase.undo(); assert.equal(f.phrase.read().body!.tempoSections![0]!.tempoBpm, 120);
  f.phrase.undo(); assert.deepEqual(f.phrase.read().body, before);
  f.phrase.redo(); f.phrase.redo();
  const expected = f.phrase.read().body;
  commitMusicDocument(f.library, f.song, f.phrase);
  const reopened = fixture(f.text()); assert.deepEqual(reopened.phrase.read().body, expected);
  await reopened.phrase.preparePreview();
  assert.equal(reopened.phrase.previewPlan(undefined, { allowSilence: true }).durationSeconds, 8 + 16 * 60 / 90);
});
test('each roll restarts its local grid and tempo validation rejects ambiguous or unordered boundaries', () => {
  const f = fixture(); f.phrase.setLength(16); const id = f.phrase.addTempoSection(); f.phrase.setTempoSection(id, 60);
  const body = f.phrase.read().body!, view = { leftSeconds: 6, zoom: .5, rowHeight: 24 };
  const beats = melodyScoreGrid(body, view, 1000).filter(line => line.beat).map(line => line.seconds);
  assert(beats.includes(7.5)); assert(beats.includes(8)); assert(beats.includes(9)); assert(!beats.includes(8.5));
  assert.throws(() => readPhraseBody({ ...body, tempoSections: [{ id, startBeat: 0, tempoBpm: 60 }] }));
  assert.throws(() => readPhraseBody({ ...body, tempoSections: [{ id, startBeat: 16, tempoBpm: 1001 }] }));
});

test('moving a boundary leaves all notes, other boundaries and the lower beat grid at their original times', async () => {
  const f = fixture(), p = f.phrase;
  p.setLength(16);
  const lower = p.addTempoSection(), later = p.addTempoSection();
  p.setTempoSection(lower, 180);
  p.setTempoSection(later, 90);
  p.setTempoSectionSteps(lower, 3);
  const part = p.addPart(p.read().availableSounds[0]!.id);
  for (const beat of [4, 15.5, 16.5, 19, 34]) {
    p.addNote(part, { startBeat: beat, durationBeats: 1, frequencyHz: 440, velocity: .7 });
  }
  const original = p.read().body!, originalText = f.text();
  const close = (a: number, b: number) => assert(Math.abs(a - b) < 1e-9, `${a} differs from ${b}`);
  const verify = (next: typeof original) => {
    const spans = phraseTempoSpans(next), before = phraseTempoSpans(original);
    close(spans[1]!.startSeconds, 8.5);
    close(spans[2]!.startSeconds, before[2]!.startSeconds);
    close(phraseDurationSeconds(next), phraseDurationSeconds(original));
    assert.equal(next.parts[0]!.hiddenNotes, undefined);
    assert.equal(next.tempoSections![0]!.gridOffsetBeats, 1.5);
    assert.equal(phraseStepsAtBeat(next, 17), 3);
    assert.deepEqual(next.parts[0]!.notes.map(note => note.id), original.parts[0]!.notes.map(note => note.id));
    next.parts[0]!.notes.forEach((note, i) => {
      const old = original.parts[0]!.notes[i]!;
      close(phraseBeatSeconds(next, note.startBeat), phraseBeatSeconds(original, old.startBeat));
      close(phraseHeldSeconds(next, note), phraseHeldSeconds(original, old));
    });
    const beats = (body: typeof original) => melodyScoreGrid(body, { leftSeconds: 8, zoom: 1, rowHeight: 24 }, 2000)
      .filter(line => line.beat && line.seconds >= 8.5 - 1e-9).map(line => line.seconds);
    const oldBeats = beats(original), newBeats = beats(next);
    assert.equal(oldBeats.length, newBeats.length);
    oldBeats.forEach((beat, i) => close(beat, newBeats[i]!));
    close(newBeats[0]!, 8 + 2 / 3);
  };
  verify(p.previewTempoSectionStart(lower, 17));
  assert.equal(f.text(), originalText);
  p.setTempoSectionStart(lower, 17);
  const committed = p.read().body!;
  verify(committed);
  p.undo(); assert.deepEqual(p.read().body, original);
  p.redo(); assert.deepEqual(p.read().body, committed);
  assert.throws(() => p.setTempoSectionStart(lower, 0));
  assert.throws(() => p.setTempoSectionStart(lower, 40));
  assert.deepEqual(p.read().body, committed);
  commitMusicDocument(f.library, f.song, p);
  const reopened = fixture(f.text());
  verify(reopened.phrase.read().body!);
  const movedBack = reopened.phrase.previewTempoSectionStart(lower, 16);
  assert.equal(movedBack.tempoSections![0]!.gridOffsetBeats, undefined);
  close(phraseTempoSpans(movedBack)[1]!.startSeconds, 8);
});

test('the last roll edge resizes alone, preserves cropped notes across reopen and restores them without moving other rolls',async()=>{
  for(const multiple of [false,true]){
    const f=fixture(),p=f.phrase;p.setLength(16);const section=multiple?p.addTempoSection():undefined;
    if(section)p.setTempoSection(section,90);
    const part=p.addPart(p.read().availableSounds[0]!.id),end=p.read().body!.lengthBeats;
    const id=p.addNote(part,{startBeat:end-2,durationBeats:.5,durationSeconds:.25,frequencyHz:440,velocity:.7});
    const original=p.read().body!,text=f.text();
    const preview=p.previewLastTempoRollLength(end-4);assert.equal(preview.lengthBeats,end-4);
    assert.equal(preview.parts[0]!.hiddenNotes![0]!.note.id,id);assert.equal(f.text(),text);
    p.setLastTempoRollLength(end-4);assert.deepEqual(p.read().body!.tempoSections,original.tempoSections);
    await p.preparePreview();assert.equal(p.previewPlan().events.length,0);
    p.undo();assert.deepEqual(p.read().body,original);p.redo();
    commitMusicDocument(f.library,f.song,p);const reopened=fixture(f.text());
    reopened.phrase.setLastTempoRollLength(end);assert.deepEqual(reopened.phrase.read().body,original);
    assert.throws(()=>reopened.phrase.setLastTempoRollLength((section?16:0)+3));
    assert.throws(()=>reopened.phrase.setLastTempoRollLength(1025));
  }
});

test('deleting a roll keeps visible and hidden notes at their beats under the previous roll and is undoable', () => {
  const { phrase: p } = fixture();
  p.setLength(8);
  const lower = p.addTempoSection();
  p.setTempoSection(lower, 60);
  p.setTempoSectionSteps(lower, 3);
  const part = p.addPart(p.read().availableSounds[0]!.id);
  const keep = p.addNote(part, { startBeat: 10, durationBeats: 1, durationSeconds: 1, frequencyHz: 440, velocity: .75 });
  const hidden = p.addNote(part, { startBeat: 22, durationBeats: 1, durationSeconds: 1, frequencyHz: 660, velocity: .75 });
  p.setLastTempoRollLength(20);
  const before = p.read().body!;
  p.removeTempoSection(lower);
  const merged = p.read().body!;
  assert.equal(merged.lengthBeats, 20);
  assert.deepEqual(phraseTempoSpans(merged).map(span => span.tempoBpm), [120]);
  const retained = merged.parts[0]!.notes[0]!;
  assert.deepEqual([retained.id, retained.startBeat, retained.durationBeats, retained.durationSeconds], [keep, 10, 1, .5]);
  assert.equal(phraseStepsAtBeat(merged, 10), phraseStepsAtBeat(before, 0));
  assert.equal(merged.parts[0]!.hiddenNotes?.[0]?.sectionId, 'first');
  assert.throws(() => p.removeTempoSection('first'));
  p.undo(); assert.deepEqual(p.read().body, before); p.redo();
  p.setLastTempoRollLength(24);
  assert.deepEqual(p.read().body!.parts[0]!.notes.map(note => [note.id, note.startBeat]), [[keep, 10], [hidden, 22]]);
});

test('roll resolutions are independent, persist, inherit on addition and never retime notes or playback',async()=>{
  const f=fixture(),p=f.phrase;p.setLength(16);const second=p.addTempoSection(),part=p.addPart(p.read().availableSounds[0]!.id);
  p.addNote(part,{startBeat:2/3,durationBeats:.4,durationSeconds:.2,frequencyHz:440,velocity:.7});
  p.addNote(part,{startBeat:16+1/3,durationBeats:.4,durationSeconds:.2,frequencyHz:660,velocity:.7});
  const notes=structuredClone(p.read().body!.parts);await p.preparePreview();const before=p.previewPlan().events.map(e=>[e.atSeconds,e.sound.note.holdSeconds]);
  p.setTempoSectionSteps(second,3);let body=p.read().body!;
  assert.equal(phraseStepsAtBeat(body,0),4);assert.equal(phraseStepsAtBeat(body,16),3);assert.deepEqual(body.parts,notes);
  // Fine enough zoom to expose both grids; their intervals differ within one canvas.
  const lines=melodyScoreGrid(body,{leftSeconds:7.8,zoom:1,rowHeight:24},4000).map(line=>line.seconds);
  assert(lines.some(t=>Math.abs(t-(8+1/6))<1e-8));assert(!lines.some(t=>Math.abs(t-(8+1/8))<1e-8));
  p.setTempoSectionSteps(undefined,5);body=p.read().body!;assert.equal(phraseStepsAtBeat(body,0),5);assert.equal(phraseStepsAtBeat(body,16),3);
  const third=p.addTempoSection();assert.equal(p.read().body!.tempoSections!.find(s=>s.id===third)!.stepsPerBeat,3);
  p.undo();p.undo();assert.equal(phraseStepsAtBeat(p.read().body!,0),4);assert.equal(phraseStepsAtBeat(p.read().body!,16),3);p.redo();
  commitMusicDocument(f.library,f.song,p);const reopened=fixture(f.text());body=reopened.phrase.read().body!;
  assert.equal(phraseStepsAtBeat(body,0),5);assert.equal(phraseStepsAtBeat(body,16),3);assert.deepEqual(body.parts,notes);
  await reopened.phrase.preparePreview();assert.deepEqual(reopened.phrase.previewPlan().events.map(e=>[e.atSeconds,e.sound.note.holdSeconds]),before);
  assert.throws(()=>p.setTempoSectionSteps(second,1));assert.throws(()=>p.setTempoSectionSteps(second,10));
  const legacy=readPhraseBody({...body,tempoSections:body.tempoSections!.map(({stepsPerBeat,...rest})=>rest)});
  const g=fixture(f.text());g.library.updateDraft(g.phrase.read().draft!.id,{body:legacy});g.phrase.setTempoSectionSteps(undefined,2);
  assert.equal(phraseStepsAtBeat(g.phrase.read().body!,16),5,'changing first roll freezes legacy implicit resolutions');
});
