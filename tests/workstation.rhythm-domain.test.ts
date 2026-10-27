import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { ContentRecord, SaveResult } from '../src/workstation/contracts/content.ts';
import type { PhraseNote, PhraseSection } from '../src/workstation/contracts/phrase.ts';
import { createProjectPhrase } from '../src/workstation/app/project-phrases.ts';
import { addProjectPhraseTimbre, ensureProjectMelodyTimbres, removeProjectPhraseTimbre, listProjectTimbres } from '../src/workstation/app/project-timbres.ts';
import { createMaterialLibrary, createProjectPackages, createReferenceEditing } from '../src/workstation/modules/materials/public.ts';
import { createTimbreEditor, createTimbrePlayback, createTimbreReferenceAdapter } from '../src/workstation/modules/timbre/public.ts';
import { createPhraseEditor, createPhrasePlayback, createPhraseReferenceAdapter, readPhraseBody } from '../src/workstation/modules/phrase/public.ts';
import { createSongEditor, createSongReferenceAdapter } from '../src/workstation/modules/song/public.ts';

function saved(result: SaveResult): ContentRecord {
  assert.equal(result.status, 'saved'); if (result.status !== 'saved') throw new Error('Expected saved phrase'); return result.content;
}
const note = (changes: Partial<Omit<PhraseNote, 'id'>> = {}): Omit<PhraseNote, 'id'> => ({
  startBeat: 1, durationBeats: .5, durationSeconds: .375, frequencyHz: 261.625565, velocity: .7, level: .45, pan: -.3, ...changes,
});
function fixture() {
  let raw: string | null = null; let writes = 0; let broken = false;
  const storage = { read: () => raw, write(value: string) { if (broken) throw new Error('测试磁盘拒绝写入'); raw = value; writes++; } };
  const adapters = [createTimbreReferenceAdapter(), createPhraseReferenceAdapter(), createSongReferenceAdapter()];
  const policy = { project: { rootKind: 'rootsound.song', adapters } };
  const library = createMaterialLibrary(storage, policy); const voices = createTimbrePlayback(library);
  const phrase = createPhraseEditor(library, voices); const phrases = createPhrasePlayback(library, voices);
  const song = createSongEditor(library, phrases, { defaultTempoMode: 'source' }); song.create();
  const songId = song.read().draft!.id; const source = createProjectPhrase(library, songId); phrase.openDraft(source.draftId);
  const tones = ensureProjectMelodyTimbres(library, songId);
  const piano = tones.find(record => record.name === '钢琴')!; const flute = tones.find(record => record.name === '长笛')!;
  const add = (voice: ContentRecord, section?: PhraseSection) => addProjectPhraseTimbre(library, songId, phrase.read().draft!.id, voice.id, section);
  return { library, storage, adapters, policy, phrase, phrases, song, songId, source, piano, flute, add,
    raw: () => raw, writes: () => writes, fail(value = true) { broken = value; } };
}

test('section metadata is optional and strict, preserving legacy part shapes and note data', () => {
  const f = fixture(); const original = f.phrase.read().body!;
  assert.equal(Object.hasOwn(original.parts[0]!, 'section'), false); assert.deepEqual(readPhraseBody(original), original);
  for (const section of ['melody', 'rhythm'] as const) {
    const candidate = structuredClone(original); candidate.parts[0]!.section = section;
    assert.equal(readPhraseBody(candidate).parts[0]!.section, section);
  }
  for (const section of ['drums', '', null, 1, true]) {
    const candidate = structuredClone(original); Object.assign(candidate.parts[0]!, { section });
    assert.throws(() => readPhraseBody(candidate), /旋律部或节奏部/u);
  }
  assert.deepEqual(f.phrase.read().body, original);
});

test('a tone can independently serve melody and rhythm, with no duplicate within either section', () => {
  const f = fixture(); const before = f.phrase.read().draft!; const scaffold = f.library.readContent(before.dependencies[0]!)!;
  const rhythm = f.add(f.piano, 'rhythm'); const afterRhythm = f.phrase.read().body!;
  assert.equal(afterRhythm.parts.length, 1); assert.equal(afterRhythm.parts[0]!.section, 'rhythm');
  assert.deepEqual(f.library.readContent(scaffold.id), scaffold, 'replacing an empty scaffold never deletes its saved source');
  const melody = f.add(f.piano); assert.notEqual(melody, rhythm);
  const body = f.phrase.read().body!; assert.equal(body.parts.length, 2);
  assert.equal(Object.hasOwn(body.parts.find(part => part.id === melody)!, 'section'), false);
  assert.deepEqual(f.phrase.read().draft!.dependencies, [f.piano.id], 'two uses share the same local voice identity');
  const token = f.library.currentToken(); const history = f.library.readDraftHistory(before.id);
  assert.equal(f.add(f.piano, 'melody'), melody); assert.equal(f.add(f.piano, 'rhythm'), rhythm);
  assert.equal(f.library.currentToken(), token); assert.deepEqual(f.library.readDraftHistory(before.id), history);
  const reopened = createMaterialLibrary(f.storage, f.policy); const editor = createPhraseEditor(reopened, createTimbrePlayback(reopened));
  editor.openDraft(before.id); assert.deepEqual(editor.read().body, body);
  f.phrase.undo(); assert.deepEqual(f.phrase.read().body, afterRhythm); f.phrase.undo(); assert.deepEqual(f.phrase.read().draft, before);
});

test('direct part creation marks rhythm explicitly and invalid section additions remain atomic', () => {
  const f = fixture(); const legacy = f.phrase.read().body!;
  const rhythm = f.phrase.addPart(f.piano.id, 'rhythm'); assert.equal(f.phrase.read().body!.parts.find(part => part.id === rhythm)!.section, 'rhythm');
  f.phrase.undo(); assert.deepEqual(f.phrase.read().body, legacy);
  const old = f.phrase.addPart(f.flute.id); assert.equal(Object.hasOwn(f.phrase.read().body!.parts.find(part => part.id === old)!, 'section'), false);
  const before = f.raw(); const history = f.library.readDraftHistory(f.source.draftId);
  assert.throws(() => f.phrase.addPart(f.flute.id, 'unknown' as PhraseSection), /旋律部或节奏部/u);
  assert.throws(() => f.add(f.flute, 'unknown' as PhraseSection), /旋律部或节奏部/u);
  assert.equal(f.raw(), before); assert.deepEqual(f.library.readDraftHistory(f.source.draftId), history);
});

test('cross-row transfer keeps note identity, pitch, seconds and mix in one undoable durable write', () => {
  const f = fixture(); const one = f.add(f.piano, 'rhythm'); const two = f.add(f.flute, 'rhythm');
  const id = f.phrase.addNote(one, note()); const original = f.phrase.read().body!;
  const history = f.library.readDraftHistory(f.source.draftId); const writes = f.writes();
  f.phrase.moveNote(one, id, two, { startBeat: 3.25 });
  assert.equal(f.writes(), writes + 1); assert.equal(f.library.readDraftHistory(f.source.draftId).past.length, history.past.length + 1);
  const moved = f.phrase.read().body!; assert.deepEqual(moved.parts.find(part => part.id === one)!.notes, []);
  assert.deepEqual(moved.parts.find(part => part.id === two)!.notes, [{ ...original.parts.find(part => part.id === one)!.notes[0]!, startBeat: 3.25 }]);
  const plan = f.phrase.previewPlan(); assert.equal(plan.events[0]!.atSeconds, 1.625); assert.equal(plan.events[0]!.pan, -.3);
  assert.equal(plan.events[0]!.sound.note.frequencyHz, 261.625565); assert.equal(plan.events[0]!.sound.note.holdSeconds, .375);
  assert.equal(plan.events[0]!.sound.envelope.sustain, .92, 'transferred note now plays the target flute voice');
  f.phrase.undo(); assert.deepEqual(f.phrase.read().body, original); f.phrase.redo(); assert.deepEqual(f.phrase.read().body, moved);
  const reopened = createMaterialLibrary(f.storage, f.policy); const editor = createPhraseEditor(reopened, createTimbrePlayback(reopened));
  editor.openDraft(f.source.draftId); assert.deepEqual(editor.read().body, moved);
  const token = f.library.currentToken(); f.phrase.moveNote(two, id, two); assert.equal(f.library.currentToken(), token, 'same-row unchanged transfer is a no-op');
});

test('invalid or failed note transfers preserve the original positions, token and undo history', () => {
  const f = fixture(); const melody = f.add(f.piano); const one = f.add(f.piano, 'rhythm'); const two = f.add(f.flute, 'rhythm');
  const id = f.phrase.addNote(one, note()); const before = f.raw(); const body = f.phrase.read().body;
  const token = f.library.currentToken(); const history = f.library.readDraftHistory(f.source.draftId);
  assert.throws(() => f.phrase.moveNote(one, id, melody), /同一部门/u);
  assert.throws(() => f.phrase.moveNote(one, id, 'missing'), /找不到/u);
  assert.throws(() => f.phrase.moveNote(one, 'missing', two), /找不到/u);
  assert.throws(() => f.phrase.moveNote(one, id, two, { level: 2 }), /音符音量/u);
  assert.throws(() => f.phrase.moveNote(one, id, two, { id: 'replaced' } as never), /尚不支持/u);
  assert.equal(f.raw(), before); assert.equal(f.library.currentToken(), token); assert.deepEqual(f.phrase.read().body, body);
  assert.deepEqual(f.library.readDraftHistory(f.source.draftId), history);
  f.fail(); assert.throws(() => f.phrase.moveNote(one, id, two), /测试磁盘/u);
  assert.equal(f.raw(), before); assert.equal(f.library.currentToken(), token); assert.deepEqual(f.phrase.read().body, body);
  assert.deepEqual(f.library.readDraftHistory(f.source.draftId), history);
});

test('section-aware tone additions respect song ownership and failed writes do not add partial rhythm rows', () => {
  const f = fixture(); const melody = f.add(f.piano); f.phrase.addNote(melody, note());
  f.song.create(); const other = f.song.read().draft!.id; const foreign = ensureProjectMelodyTimbres(f.library, other)[0]!;
  const before = f.raw(); const body = f.phrase.read().body; const token = f.library.currentToken(); const history = f.library.readDraftHistory(f.source.draftId);
  assert.throws(() => addProjectPhraseTimbre(f.library, f.songId, f.source.draftId, foreign.id, 'rhythm'), /当前歌曲音色库/u);
  f.fail(); assert.throws(() => f.add(f.flute, 'rhythm'), /测试磁盘/u);
  assert.equal(f.raw(), before); assert.equal(f.library.currentToken(), token); assert.deepEqual(f.phrase.read().body, body);
  assert.deepEqual(f.library.readDraftHistory(f.source.draftId), history);
});

test('melody and rhythm compile together and retain section membership through occurrence edits and portable transfer', () => {
  const f = fixture(); const melody = f.add(f.piano); const one = f.add(f.piano, 'rhythm'); const two = f.add(f.flute, 'rhythm');
  f.phrase.addNote(melody, note({ startBeat: 0, frequencyHz: 440, level: .8, pan: .2 }));
  const id = f.phrase.addNote(one, note({ startBeat: 2 }));
  const source = saved(f.phrase.save('overwrite')); const original = structuredClone(source);
  const track = f.song.read().body!.tracks[0]!.id; const clip = f.song.addClip(track, source.id, 0); f.song.addClip(track, source.id, 16);
  const references = createReferenceEditing(f.library, f.adapters); const session = references.begin({ root: { type: 'draft', id: f.songId }, path: [clip] });
  f.phrase.openDraft(session.draftId); f.phrase.moveNote(one, id, two, { startBeat: 4, level: .2, pan: .6 });
  f.phrase.setTempo(180, { preserveNoteDurations: true });
  const result = references.apply(session.draftId); assert.equal(result.status, 'applied'); if (result.status !== 'applied') throw new Error('Expected apply');
  assert.notEqual(result.content.id, source.id); assert.deepEqual(f.library.readContent(source.id), original);
  const edited = readPhraseBody(result.content.body); assert.equal(edited.parts.find(part => part.id === two)!.section, 'rhythm');
  assert.equal(edited.parts.find(part => part.id === two)!.notes[0]!.durationSeconds, .375);
  assert.equal(edited.parts.find(part => part.id === melody)!.section, undefined);
  const expected = f.song.previewPlan(); assert.equal(expected.events.length, 4, 'both sections of both occurrences play');
  const output = createProjectPackages(f.library, f.adapters, { rootKind: 'rootsound.song' }).exportDraft(f.songId);
  const target = createMaterialLibrary(undefined, f.policy); const imported = createProjectPackages(target, f.adapters, { rootKind: 'rootsound.song' }).importProject(output.text);
  assert.equal(imported.status, 'imported'); if (imported.status !== 'imported') throw new Error('Expected import');
  const phrases = createPhrasePlayback(target, createTimbrePlayback(target)); const song = createSongEditor(target, phrases, { defaultTempoMode: 'source' });
  song.openDraft(imported.draft.id); assert.deepEqual(song.previewPlan(), expected);
  const bodies = target.listContent().filter(record => record.kind === 'rootsound.phrase').map(record => readPhraseBody(record.body));
  assert(bodies.every(body => body.parts.filter(part => part.section === 'rhythm').length === 2));
  assert(bodies.some(body => body.parts.find(part => part.id === two)?.notes.some(note => note.id === id && note.level === .2)));
});

test('unassigned tone uses stay silent and preserve notes and origin through portable project transfer', () => {
  const f=fixture();const melody=f.add(f.piano),rhythm=f.add(f.piano,'rhythm');f.phrase.addNote(melody,note());f.phrase.addNote(rhythm,note({startBeat:2}));
  const before=f.phrase.previewPlan();f.phrase.setPartVisible(melody,false);assert.equal(f.phrase.previewPlan().events.length,before.events.length-1);
  const phrase=saved(f.phrase.save('overwrite'));const track=f.song.read().body!.tracks[0]!.id;f.song.addClip(track,phrase.id,0);const expected=f.song.previewPlan();
  const output=createProjectPackages(f.library,f.adapters,{rootKind:'rootsound.song'}).exportDraft(f.songId);const target=createMaterialLibrary(undefined,f.policy);
  const imported=createProjectPackages(target,f.adapters,{rootKind:'rootsound.song'}).importProject(output.text);assert.equal(imported.status,'imported');if(imported.status!=='imported')throw new Error('Expected import');
  const body=target.listContent().filter(record=>record.kind==='rootsound.phrase').map(record=>readPhraseBody(record.body)).find(body=>body.parts.some(part=>part.id===melody))!;
  assert.equal(body.parts.find(part=>part.id===melody)!.unassigned,true);assert.equal(body.parts.find(part=>part.id===rhythm)!.unassigned,undefined);
  const song=createSongEditor(target,createPhrasePlayback(target,createTimbrePlayback(target)),{defaultTempoMode:'source'});song.openDraft(imported.draft.id);assert.deepEqual(song.previewPlan(),expected);
});

test('removing a project tone deletes its department uses once and retains the sound as a project library member', () => {
  const f=fixture();const editor=createTimbreEditor(f.library);editor.rename('自己的音色');const voice=saved(editor.save('new'));
  const created=createProjectPhrase(f.library,f.songId,voice.id);f.phrase.openDraft(created.draftId);const original=f.phrase.read().body!.parts[0]!,id=original.timbreId;
  const duplicate=f.phrase.addPart(id);const rhythm=f.phrase.addPart(id,'rhythm');f.phrase.addNote(original.id,note());f.phrase.addNote(duplicate,note({startBeat:2}));f.phrase.addNote(rhythm,note({startBeat:4}));
  const before=f.phrase.read().draft!;const tone=f.library.readContent(id)!;const writes=f.writes();const history=f.library.readDraftHistory(created.draftId);
  f.fail();assert.throws(()=>removeProjectPhraseTimbre(f.library,f.songId,created.draftId,id),/测试磁盘/);assert.deepEqual(f.phrase.read().draft,before);assert.deepEqual(f.library.readDraftHistory(created.draftId),history);f.fail(false);
  removeProjectPhraseTimbre(f.library,f.songId,created.draftId,id);assert.equal(f.writes(),writes+1);assert.deepEqual(f.phrase.read().body!.parts.map(part=>part.id),[rhythm]);assert.deepEqual(f.library.readContent(id),tone);
  assert(f.library.currentProjectView!(f.songId)!.memberIds.includes(id));assert(listProjectTimbres(f.library,f.songId).some(tone=>tone.id===id));
  f.phrase.undo();assert.deepEqual(f.phrase.read().draft,before);f.phrase.redo();assert.deepEqual(f.phrase.read().body!.parts.map(part=>part.id),[rhythm]);
  removeProjectPhraseTimbre(f.library,f.songId,created.draftId,id,'rhythm');assert.deepEqual(f.phrase.read().body!.parts,[]);assert.deepEqual(f.phrase.read().draft!.dependencies,[]);
  assert(listProjectTimbres(f.library,f.songId).some(tone=>tone.id===id));const token=f.library.currentToken();removeProjectPhraseTimbre(f.library,f.songId,created.draftId,id,'rhythm');assert.equal(f.library.currentToken(),token);
});

test('tone library audition rejects another song and never adds tone uses or history', async () => {
  const f=fixture();const current=f.phrase.read().draft!;const history=f.library.readDraftHistory(current.id);const input={frequencyHz:261.6255653005986,holdSeconds:.35,velocity:.75};
  const sound=await f.phrase.previewTimbrePlan(f.flute.id,input);assert.equal(sound.note.frequencyHz,input.frequencyHz);assert.deepEqual(f.phrase.read().draft,current);assert.deepEqual(f.library.readDraftHistory(current.id),history);
  f.song.create();const other=f.song.read().draft!.id;const foreign=ensureProjectMelodyTimbres(f.library,other)[0]!;const before=f.raw();
  await assert.rejects(f.phrase.previewTimbrePlan(foreign.id,input),/当前歌曲音色库/);assert.equal(f.raw(),before);assert.deepEqual(f.phrase.read().draft,current);
});
