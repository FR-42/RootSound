import assert from 'node:assert/strict';
import test from 'node:test';
import type { ContentRecord, SaveResult } from '../src/workstation/contracts/content.ts';
import { addProjectPhraseTimbre, createProjectPhraseNoteGroup, changeProjectPhraseNoteGroupTimbre, ensureProjectMelodyTimbres, listProjectTimbres, removeProjectPhraseTimbre, reorderProjectTimbres, tryRemoveUnusedProjectTimbre, requiresTimbreDeleteConfirmation } from '../src/workstation/app/project-timbres.ts';
import { createInitialProjectLibrary, createProjectCopyLibrary } from '../src/workstation/app/project-setup.ts';
import { createProjectPhrase } from '../src/workstation/app/project-phrases.ts';
import { createMaterialLibrary, createProjectPackages, createReferenceEditing } from '../src/workstation/modules/materials/public.ts';
import { createTimbreEditor, createTimbrePlayback, createTimbreReferenceAdapter, prepareMelodyTimbres, readEditableTimbreBody } from '../src/workstation/modules/timbre/public.ts';
import { createPhraseEditor, createPhrasePlayback, createPhraseReferenceAdapter, readPhraseBody } from '../src/workstation/modules/phrase/public.ts';
import { createSongEditor, createSongReferenceAdapter, readSongBody } from '../src/workstation/modules/song/public.ts';
import { createSampleAudio, createSampleReferenceAdapter } from '../src/workstation/modules/sampling/public.ts';
import { decodePcmWav, encodeBase64, encodeFloatWav } from '../src/workstation/modules/sampling/audio.ts';

const STARTER_NAMES = ['钢琴', '长笛', '底鼓', '踢', '弦乐', '小号', '吉他'];

test('only untouched bundled tone identities skip a removal warning; created, imported and edited copies require it', () => {
  const preset = prepareMelodyTimbres()[0]!;
  const starter = { ...preset, id: 'rootsound.melody.piano.v1:this-song' };
  assert.equal(requiresTimbreDeleteConfirmation(starter), false);
  assert.equal(requiresTimbreDeleteConfirmation(preset), true, 'an imported copy with the same sound has a fresh identity');
  assert.equal(requiresTimbreDeleteConfirmation({ ...starter, name: '我的钢琴' }), true);
  assert.equal(requiresTimbreDeleteConfirmation({ ...starter, revision: 2 }), true);
  assert.equal(requiresTimbreDeleteConfirmation({ ...starter, body: { ...starter.body as object, level: .3 } as ContentRecord['body'] }), true);
  const draft = { ...starter, id: 'working', sourceId: starter.id, baseRevision: 1 };
  assert.equal(requiresTimbreDeleteConfirmation(starter, [draft]), false);
  assert.equal(requiresTimbreDeleteConfirmation(starter, [{ ...draft, body: { ...draft.body as object, level: .2 } as ContentRecord['body'] }]), true, 'an unsaved level change must be treated as user work');
});

function saved(result: SaveResult): ContentRecord { assert.equal(result.status, 'saved'); if (result.status !== 'saved') throw new Error('Expected save'); return result.content; }
function fixture() {
  let raw: string | null = null; let writes = 0; let fail = false;
  const storage = { read: () => raw, write(value: string) { if (fail) throw new Error('测试磁盘拒绝写入'); raw = value; writes++; } };
  const adapters = [createTimbreReferenceAdapter(), createPhraseReferenceAdapter(), createSongReferenceAdapter(), createSampleReferenceAdapter()];
  const policy = { project: { rootKind: 'rootsound.song', adapters } };
  const library = createMaterialLibrary(storage, policy); const playback = createTimbrePlayback(library);
  const phrase = createPhraseEditor(library, playback); const phrases = createPhrasePlayback(library, playback);
  const song = createSongEditor(library, phrases, { defaultTempoMode: 'source' }); song.create();
  const songId = song.read().draft!.id;
  return { library, playback, phrase, song, songId, storage, policy, adapters,
    raw: () => raw, writes: () => writes, fail(value = true) { fail = value; } };
}
function voice(f: ReturnType<typeof fixture>, name: string): ContentRecord {
  const editor = createTimbreEditor(f.library); editor.rename(name); return saved(editor.save('new'));
}

test('melody starters are independent validated local synthesis patches with struck and sustained envelopes', () => {
  const first = prepareMelodyTimbres(); const second = prepareMelodyTimbres();
  assert.deepEqual(first.map(record => record.name), STARTER_NAMES);
  assert.notEqual(first[0]!.id, second[0]!.id); assert.notEqual(first[1]!.id, second[1]!.id);
  const library = createMaterialLibrary();
  assert.equal(library.commitTransaction({ expectedToken: library.currentToken(), label: 'test voices', createContents: first }).status, 'committed');
  const bodies = first.map(record => readEditableTimbreBody(record.body));
  assert(bodies.every(body => body.model === 'synthesizer'));
  if (bodies[0]!.model !== 'synthesizer' || bodies[1]!.model !== 'synthesizer') throw new Error('Expected synth');
  assert(bodies[0]!.attackSeconds < bodies[1]!.attackSeconds); assert(bodies[0]!.sustain < .1); assert(bodies[1]!.sustain > .8);
  assert(bodies[1]!.sources.some(source => source.waveform === 'noise'));
  const byName = new Map(first.map(record => [record.name, readEditableTimbreBody(record.body)]));
  const bassDrum=byName.get('底鼓')!, kick=byName.get('踢')!, strings=byName.get('弦乐')!, guitar=byName.get('吉他')!;
  if(bassDrum.model!=='synthesizer'||kick.model!=='synthesizer'||strings.model!=='synthesizer'||guitar.model!=='synthesizer')throw new Error('Expected synth starters');
  assert.equal(bassDrum.sustain,0);assert.equal(kick.sustain,0);assert(bassDrum.sources.some(source=>source.semitones===-24));
  assert(kick.pitch.semitones>bassDrum.pitch.semitones);assert(kick.pitch.seconds<bassDrum.pitch.seconds);
  assert(strings.sources.some(source=>source.detuneCents<0)&&strings.sources.some(source=>source.detuneCents>0));
  assert(strings.attackSeconds>guitar.attackSeconds);assert(strings.sustain>.7);assert(guitar.sustain<.05);
  assert.equal(new Set(first.map(record=>JSON.stringify(record.body))).size,7);
  const playback = createTimbrePlayback(library);
  for (const record of first) {
    assert.deepEqual(record.dependencies, []);
    const plan = playback.planForSaved(record.id, { frequencyHz: 440, holdSeconds: 1, velocity: .8 });
    assert.equal(plan.kind, 'basic-synth'); assert.equal(plan.note.frequencyHz, 440); assert.equal(plan.note.holdSeconds, 1);
    assert.equal(plan.envelope.sustain, readEditableTimbreBody(record.body).model === 'synthesizer' ? (record.body as { sustain: number }).sustain : undefined);
  }
});

test('new project files already own the complete palette and Save As retains customized starter identities', () => {
  let raw=createInitialProjectLibrary('新歌曲');
  const adapters=[createTimbreReferenceAdapter(),createPhraseReferenceAdapter(),createSongReferenceAdapter(),createSampleReferenceAdapter()];
  const policy={project:{rootKind:'rootsound.song',adapters}};
  const library=createMaterialLibrary({read:()=>raw,write:value=>{raw=value;}},policy);
  const song=createSongEditor(library,createPhrasePlayback(library,createTimbrePlayback(library)),{defaultTempoMode:'source'});
  const songId=song.read().draft!.id, tones=listProjectTimbres(library,songId);
  assert.deepEqual(new Set(tones.map(record=>record.name)),new Set(STARTER_NAMES));assert.equal(library.listDrafts().length,1);
  const scope=library.projectScopeOf!({type:'draft',id:songId});assert(tones.every(record=>library.projectScopeOf!({type:'content',id:record.id})===scope));
  const packed=createProjectPackages(library,adapters,{rootKind:'rootsound.song'}).exportDraft(songId);
  const file=JSON.parse(packed.text);assert.equal(file.memberIds.length,7);assert.equal(file.contents.filter((record:ContentRecord)=>record.kind==='rootsound.timbre').length,7);
  const guitar=tones.find(record=>record.name==='吉他')!;const editor=createTimbreEditor(library);editor.open(guitar.id);editor.rename('我的吉他');editor.setLevel(.2);saved(editor.save('overwrite'));
  const copy=createProjectCopyLibrary(raw,'歌曲副本',songId);
  const reopened=createMaterialLibrary({read:()=>copy,write(){throw new Error('unexpected duplicate seed');}},policy);
  const token=reopened.currentToken(), voices=ensureProjectMelodyTimbres(reopened,songId);
  assert.equal(reopened.currentToken(),token);assert.deepEqual(new Set(voices.map(record=>record.id)),new Set(tones.map(record=>record.id)));
  const changed=voices.find(record=>record.id===guitar.id)!;assert.equal(changed.name,'我的吉他');assert.equal(readEditableTimbreBody(changed.body).level,.2);
});

test('opening the current song library seeds all starter voices in one write and reopening never duplicates or resets them', () => {
  const f = fixture(); const song = f.song.read().draft!; const past = f.library.readDraftHistory(f.songId); const writes = f.writes();
  assert.deepEqual(listProjectTimbres(f.library, f.songId), []);
  const seeded = ensureProjectMelodyTimbres(f.library, f.songId); assert.equal(f.writes(), writes + 1);
  assert.deepEqual(new Set(seeded.map(record => record.name)), new Set(STARTER_NAMES));
  assert.deepEqual(f.song.read().draft, { ...song, body: { ...readSongBody(song.body), melodyTimbresSeeded: true } });
  assert.deepEqual(f.library.readDraftHistory(f.songId), past, 'one-time palette setup does not add a user undo step');
  const token = f.library.currentToken(); ensureProjectMelodyTimbres(f.library, f.songId); assert.equal(f.library.currentToken(), token);
  const editor = createTimbreEditor(f.library); editor.open(seeded[0]!.id); editor.rename('我改过名的声音'); editor.setLevel(.2); saved(editor.save('overwrite'));
  const reopened = createMaterialLibrary(f.storage, f.policy); const before = reopened.currentToken();
  const result = ensureProjectMelodyTimbres(reopened, f.songId);
  assert.equal(reopened.currentToken(), before); assert.deepEqual(new Set(result.map(record => record.id)), new Set(seeded.map(record => record.id)));
  assert(result.some(record => record.name === '我改过名的声音' && readEditableTimbreBody(record.body).level === .2));
});

test('fresh tone picker hides only the untouched empty scaffold while preserving its source and any customization', () => {
  const f = fixture(); const created = createProjectPhrase(f.library, f.songId); f.phrase.openDraft(created.draftId);
  const part = f.phrase.read().body!.parts[0]!; const source = f.library.readContent(part.timbreId)!;
  const picker = ensureProjectMelodyTimbres(f.library, f.songId);
  assert.deepEqual(new Set(picker.map(record => record.name)), new Set(STARTER_NAMES));
  assert.deepEqual(f.library.readContent(source.id), source, 'hiding the default does not delete or modify it');
  assert.equal(f.phrase.read().body!.parts[0]!.timbreId, source.id);
  const shown = () => listProjectTimbres(f.library, f.songId).some(record => record.id === source.id);
  f.phrase.addNote(part.id, { startBeat: 0, durationBeats: 1, frequencyHz: 220, velocity: .7 }); assert(shown());
  f.phrase.undo(); assert.equal(shown(), false);
  const before = f.phrase.read().draft!; const body = readPhraseBody(before.body); body.parts[0]!.name = '我命名的声部';
  f.library.updateDraft(before.id, { body }, { remember: true, expected: before }); assert(shown());
  f.phrase.undo(); assert.equal(shown(), false);
  const timbre = createTimbreEditor(f.library); timbre.open(source.id); timbre.setLevel(.3);
  assert(shown(), 'an unsaved tone customization remains a choice');
  saved(timbre.save('overwrite')); assert(shown(), 'a saved tone customization remains a choice');
  timbre.rename('我的音色'); saved(timbre.save('overwrite')); assert(shown(), 'an intentional rename remains a choice');
});

test('starter names avoid current-song collisions while separate songs own independent equal-named voices', () => {
  const f = fixture(); const custom = voice(f, '钢琴'); createProjectPhrase(f.library, f.songId, custom.id);
  const one = ensureProjectMelodyTimbres(f.library, f.songId);
  assert.deepEqual(new Set(one.map(record => record.name)), new Set([...STARTER_NAMES, '钢琴 2']));
  f.song.create(); const otherSong = f.song.read().draft!.id; const two = ensureProjectMelodyTimbres(f.library, otherSong);
  assert.deepEqual(new Set(two.map(record => record.name)), new Set(STARTER_NAMES));
  assert(two.every(record => !one.some(original => original.id === record.id)));
  assert(listProjectTimbres(f.library, f.songId).every(record => one.some(original => original.id === record.id)));
  const phrase = createProjectPhrase(f.library, f.songId); const raw = f.raw();
  assert.throws(() => addProjectPhraseTimbre(f.library, f.songId, phrase.draftId, two[0]!.id), /当前歌曲音色库/);
  assert.throws(() => addProjectPhraseTimbre(f.library, otherSong, phrase.draftId, two[0]!.id), /不属于当前歌曲/);
  assert.throws(() => addProjectPhraseTimbre(f.library, f.songId, phrase.draftId, custom.id), /当前歌曲音色库/);
  assert.equal(f.raw(), raw);
});

test('adding the first real voice replaces only the generated empty part, preserves saved originals and has one durable undo', () => {
  const f = fixture(); const created = createProjectPhrase(f.library, f.songId); f.phrase.openDraft(created.draftId);
  const before = f.phrase.read().draft!; const body = readPhraseBody(before.body); const placeholder = f.library.readContent(body.parts[0]!.timbreId)!;
  const tones = ensureProjectMelodyTimbres(f.library, f.songId); const piano = tones.find(record => record.name === '钢琴')!;
  const writes = f.writes(); const history = f.library.readDraftHistory(before.id);
  const part = addProjectPhraseTimbre(f.library, f.songId, before.id, piano.id);
  assert.equal(f.writes(), writes + 1); assert.equal(f.phrase.read().body!.parts.length, 1);
  assert.equal(f.phrase.read().body!.parts[0]!.id, part); assert.deepEqual(f.phrase.read().draft!.dependencies, [piano.id]);
  assert.deepEqual(f.library.readContent(placeholder.id), placeholder); assert.deepEqual(f.library.readContent(created.id)!.body, before.body);
  assert.equal(f.library.readDraftHistory(before.id).past.length, history.past.length + 1);
  const token = f.library.currentToken(); assert.equal(addProjectPhraseTimbre(f.library, f.songId, before.id, piano.id), part);
  assert.equal(f.library.currentToken(), token, 'reselecting an existing voice does not add a duplicate or history');
  f.phrase.undo(); assert.deepEqual(f.phrase.read().draft, before); f.phrase.redo();
  assert.equal(f.phrase.read().body!.parts[0]!.id, part);
  const reopened = createMaterialLibrary(f.storage, f.policy); const editor = createPhraseEditor(reopened, createTimbrePlayback(reopened)); editor.openDraft(before.id);
  editor.undo(); assert.deepEqual(editor.read().body, body); editor.redo(); assert.equal(editor.read().body!.parts[0]!.id, part);
});

test('a played or customized empty original is preserved and adding another voice never changes existing notes', () => {
  const f = fixture(); const created = createProjectPhrase(f.library, f.songId); f.phrase.openDraft(created.draftId);
  const part = f.phrase.read().body!.parts[0]!.id;
  f.phrase.addNote(part, { startBeat: .25, durationBeats: 1.5, frequencyHz: 330, velocity: .7 });
  const notes = structuredClone(f.phrase.read().body!.parts[0]!.notes); const tones = ensureProjectMelodyTimbres(f.library, f.songId);
  addProjectPhraseTimbre(f.library, f.songId, created.draftId, tones.find(record => record.name === '长笛')!.id);
  assert.equal(f.phrase.read().body!.parts.length, 2); assert.deepEqual(f.phrase.read().body!.parts[0]!.notes, notes);
  const second = createProjectPhrase(f.library, f.songId); f.phrase.openDraft(second.draftId);
  const original = f.phrase.read().body!.parts[0]!; const timbre = createTimbreEditor(f.library); timbre.open(original.timbreId); timbre.setLevel(.3);
  saved(timbre.save('overwrite'));
  addProjectPhraseTimbre(f.library, f.songId, second.draftId, tones.find(record => record.name === '钢琴')!.id);
  assert.equal(f.phrase.read().body!.parts.length, 2); assert.equal(f.phrase.read().body!.parts[0]!.id, original.id);
  const third = createProjectPhrase(f.library, f.songId); f.phrase.openDraft(third.draftId);
  const pending = f.phrase.read().body!.parts[0]!; timbre.open(pending.timbreId); timbre.setLevel(.4);
  addProjectPhraseTimbre(f.library, f.songId, third.draftId, tones.find(record => record.name === '长笛')!.id);
  assert.equal(f.phrase.read().body!.parts.length, 2, 'an unfinished customization is never hidden as a disposable placeholder');
  assert.equal(f.phrase.read().body!.parts[0]!.id, pending.id); assert.equal(timbre.read().body.level, .4);
});

test('seed and part-add storage failures preserve tokens, records, dependencies and undo history atomically', () => {
  const f = fixture(); const created = createProjectPhrase(f.library, f.songId); f.phrase.openDraft(created.draftId);
  let raw = f.raw(); let token = f.library.currentToken(); f.fail();
  assert.throws(() => ensureProjectMelodyTimbres(f.library, f.songId), /测试磁盘/);
  assert.equal(f.raw(), raw); assert.equal(f.library.currentToken(), token); assert.equal(listProjectTimbres(f.library, f.songId).length, 0);
  f.fail(false); const tones = ensureProjectMelodyTimbres(f.library, f.songId); const before = f.phrase.read();
  const past = f.library.readDraftHistory(created.draftId); const records = f.library.listContent();
  raw = f.raw(); token = f.library.currentToken(); f.fail();
  assert.throws(() => addProjectPhraseTimbre(f.library, f.songId, created.draftId, tones.find(record => record.name === '钢琴')!.id), /测试磁盘/);
  assert.equal(f.raw(), raw); assert.equal(f.library.currentToken(), token); assert.deepEqual(f.phrase.read(), before);
  assert.deepEqual(f.library.listContent(), records); assert.deepEqual(f.library.readDraftHistory(created.draftId), past);
});

test('project packaging keeps all starters local and graph-ID remapping does not seed duplicate copies', () => {
  const f = fixture(); const original = ensureProjectMelodyTimbres(f.library, f.songId);
  const output = createProjectPackages(f.library, f.adapters, { rootKind: 'rootsound.song' }).exportDraft(f.songId);
  const target = createMaterialLibrary(undefined, f.policy);
  const imported = createProjectPackages(target, f.adapters, { rootKind: 'rootsound.song' }).importProject(output.text);
  assert.equal(imported.status, 'imported'); if (imported.status !== 'imported') throw new Error('Expected import');
  const before = target.currentToken(); const voices = ensureProjectMelodyTimbres(target, imported.draft.id);
  assert.equal(target.currentToken(), before); assert.equal(voices.length, 7);
  assert(voices.every(record => !original.some(item => item.id === record.id)));
  assert(voices.every(record => target.projectScopeOf!({ type: 'content', id: record.id }) === target.projectScopeOf!({ type: 'draft', id: imported.draft.id })));
});

test('adding a current-song sampled voice retains its local sample dependency and exact source audio', async () => {
  const f = fixture(); const bytes = encodeFloatWav({ sampleRate: 8000, channels: [new Float32Array(800).fill(.1)] });
  const sample: ContentRecord = { id: 'test-sample', kind: 'rootsound.sample', owner: 'sampling', schemaVersion: 1, revision: 1,
    name: '测试原声', dependencies: [], body: { model: 'audio-sample', version: 1, source: { kind: 'file', name: 'test.wav', mimeType: 'audio/wav' },
      audio: { encoding: 'base64', byteLength: bytes.length, data: encodeBase64(bytes) }, decoded: { sampleRate: 8000, channels: 1, frames: 800, durationSeconds: .1 } } };
  assert.equal(f.library.commitTransaction({ expectedToken: f.library.currentToken(), label: 'test source', createContents: [sample] }).status, 'committed');
  const audio = createSampleAudio(f.library, { async decode(input) { return decodePcmWav(input)!; } });
  const editor = createTimbreEditor(f.library, audio); await editor.createFromSample(sample.id); editor.rename('采样声音'); const source = saved(editor.save('new'));
  const origin = createProjectPhrase(f.library, f.songId, source.id); const sourceBody = readPhraseBody(f.library.readContent(origin.id)!.body);
  const localVoice = f.library.readContent(sourceBody.parts[0]!.timbreId)!; const localSample = f.library.readContent(localVoice.dependencies[0]!)!;
  const created = createProjectPhrase(f.library, f.songId); addProjectPhraseTimbre(f.library, f.songId, created.draftId, localVoice.id);
  const body = readPhraseBody(f.library.readDraft(created.draftId)!.body); assert.equal(body.parts[0]!.timbreId, localVoice.id);
  assert.deepEqual(f.library.readContent(localVoice.id), localVoice); assert.deepEqual(f.library.readContent(localSample.id), localSample);
  assert.notEqual(localSample.id, sample.id); assert.deepEqual(localSample.body, sample.body);
});

test('fresh Melody note families can share a tone while one-family replacement preserves every note and other department', () => {
  const f=fixture();const tones=ensureProjectMelodyTimbres(f.library,f.songId),piano=tones.find(voice=>voice.name==='钢琴')!,flute=tones.find(voice=>voice.name==='长笛')!;
  const created=createProjectPhrase(f.library,f.songId);f.phrase.openDraft(created.draftId);
  const first=createProjectPhraseNoteGroup(f.library,f.songId,created.draftId,piano.id);
  const beforeSecond=f.phrase.read().draft!,writes=f.writes(),history=f.library.readDraftHistory(created.draftId);
  const second=createProjectPhraseNoteGroup(f.library,f.songId,created.draftId,piano.id);assert.notEqual(second,first);assert.equal(f.writes(),writes+1);
  assert.deepEqual(f.phrase.read().body!.parts.map(part=>part.id),[first,second]);assert.deepEqual(f.phrase.read().draft!.dependencies,[piano.id]);
  assert.equal(f.library.readDraftHistory(created.draftId).past.length,history.past.length+1);f.phrase.undo();assert.deepEqual(f.phrase.read().draft,beforeSecond);f.phrase.redo();
  const rhythm=addProjectPhraseTimbre(f.library,f.songId,created.draftId,piano.id,'rhythm');assert.equal(addProjectPhraseTimbre(f.library,f.songId,created.draftId,piano.id,'rhythm'),rhythm);
  const note={startBeat:1.25,durationBeats:.5,durationSeconds:.31,frequencyHz:329.6275569128699,velocity:.73,level:.42,pan:-.3};
  const firstNote=f.phrase.addNote(first,note);f.phrase.addNote(second,{...note,startBeat:3});f.phrase.addNote(rhythm,{...note,startBeat:5,frequencyHz:110});f.phrase.setPartVisible(first,false);
  const before=f.phrase.read().draft!,raw=f.raw(),token=f.library.currentToken(),previousHistory=f.library.readDraftHistory(created.draftId);
  f.fail();assert.throws(()=>f.phrase.setPartTimbre(first,flute.id),/测试磁盘/);assert.equal(f.raw(),raw);assert.equal(f.library.currentToken(),token);assert.deepEqual(f.library.readDraftHistory(created.draftId),previousHistory);f.fail(false);
  const writeCount=f.writes();f.phrase.setPartTimbre(first,flute.id);assert.equal(f.writes(),writeCount+1);
  const after=f.phrase.read().body!,replaced=after.parts.find(part=>part.id===first)!;assert.equal(replaced.timbreId,flute.id);assert.equal(replaced.name,'长笛');assert.equal(replaced.unassigned,undefined);assert.equal(replaced.notes[0]!.id,firstNote);
  assert.deepEqual(replaced.notes,readPhraseBody(before.body).parts.find(part=>part.id===first)!.notes);
  assert.deepEqual(after.parts.filter(part=>part.id!==first),readPhraseBody(before.body).parts.filter(part=>part.id!==first));assert.deepEqual(new Set(f.phrase.read().draft!.dependencies),new Set([piano.id,flute.id]));
  f.phrase.undo();assert.deepEqual(f.phrase.read().draft,before);f.phrase.redo();assert.deepEqual(f.phrase.read().body,after);
  f.song.create();const foreign=ensureProjectMelodyTimbres(f.library,f.song.read().draft!.id)[0]!,beforeForeign=f.raw();
  assert.throws(()=>f.phrase.setPartTimbre(first,foreign.id),/当前歌曲音色库/);assert.throws(()=>createProjectPhraseNoteGroup(f.library,f.songId,created.draftId,foreign.id),/当前歌曲音色库/);assert.equal(f.raw(),beforeForeign);
});

test('independent same-tone families and a replacement survive phrase save and portable song import', () => {
  const f=fixture(),tones=ensureProjectMelodyTimbres(f.library,f.songId),piano=tones.find(voice=>voice.name==='钢琴')!,flute=tones.find(voice=>voice.name==='长笛')!;
  const created=createProjectPhrase(f.library,f.songId);f.phrase.openDraft(created.draftId);
  const first=createProjectPhraseNoteGroup(f.library,f.songId,created.draftId,piano.id),second=createProjectPhraseNoteGroup(f.library,f.songId,created.draftId,piano.id);
  f.phrase.addNote(first,{startBeat:1,durationBeats:.5,durationSeconds:.37,frequencyHz:440,velocity:.7,level:.5,pan:-.2});
  f.phrase.addNote(second,{startBeat:2,durationBeats:1,durationSeconds:.8,frequencyHz:330,velocity:.8,level:.6,pan:.3});f.phrase.setPartTimbre(first,flute.id);
  const expected=structuredClone(f.phrase.read().body!),phrase=saved(f.phrase.save('overwrite'));f.song.addClip(f.song.read().body!.tracks[0]!.id,phrase.id,0);
  const expectedPlan=f.song.previewPlan(),output=createProjectPackages(f.library,f.adapters,{rootKind:'rootsound.song'}).exportDraft(f.songId),target=createMaterialLibrary(undefined,f.policy);
  const imported=createProjectPackages(target,f.adapters,{rootKind:'rootsound.song'}).importProject(output.text);assert.equal(imported.status,'imported');if(imported.status!=='imported')throw new Error('Expected import');
  const restored=target.listContent().filter(record=>record.kind==='rootsound.phrase').map(record=>readPhraseBody(record.body)).find(body=>body.parts.some(part=>part.id===first))!;
  assert.deepEqual(restored.parts.map(part=>part.id),[first,second]);assert.deepEqual(restored.parts.map(part=>part.notes),expected.parts.map(part=>part.notes));
  assert.deepEqual(restored.parts.map(part=>target.readContent(part.timbreId)!.name),['长笛','钢琴']);
  const song=createSongEditor(target,createPhrasePlayback(target,createTimbrePlayback(target)),{defaultTempoMode:'source'});song.openDraft(imported.draft.id);assert.deepEqual(song.previewPlan(),expectedPlan);
  assert.equal(listProjectTimbres(target,imported.draft.id).length,7);
});

test('app replacement accepts legacy rhythm families without changing their identity, section, notes or unrelated families', () => {
  const f = fixture(); const tones = ensureProjectMelodyTimbres(f.library, f.songId);
  const piano = tones.find(record => record.name === '钢琴')!, flute = tones.find(record => record.name === '长笛')!;
  const created = createProjectPhrase(f.library, f.songId); f.phrase.openDraft(created.draftId);
  const melody = createProjectPhraseNoteGroup(f.library, f.songId, created.draftId, piano.id);
  const rhythm = addProjectPhraseTimbre(f.library, f.songId, created.draftId, piano.id, 'rhythm');
  f.phrase.addNote(melody, { startBeat: 1, durationBeats: .5, durationSeconds: .31, frequencyHz: 440, velocity: .7, pan: .2 });
  f.phrase.addNote(rhythm, { startBeat: 2.25, durationBeats: .25, durationSeconds: .17, frequencyHz: 110, velocity: .8, pan: -.3 });
  f.phrase.setPartVisible(rhythm, false);
  const before = f.phrase.read().draft!, beforeBody = readPhraseBody(before.body), token = f.library.currentToken(), raw = f.raw();
  const history = f.library.readDraftHistory(created.draftId); const source = f.library.readContent(created.id);
  f.fail(); assert.throws(() => changeProjectPhraseNoteGroupTimbre(f.library, f.songId, created.draftId, rhythm, flute.id), /测试磁盘/);
  assert.equal(f.library.currentToken(), token); assert.equal(f.raw(), raw); assert.deepEqual(f.phrase.read().draft, before);
  assert.deepEqual(f.library.readDraftHistory(created.draftId), history); f.fail(false);
  const writes = f.writes(); changeProjectPhraseNoteGroupTimbre(f.library, f.songId, created.draftId, rhythm, flute.id);
  assert.equal(f.writes(), writes + 1); assert.equal(f.library.readDraftHistory(created.draftId).past.length, history.past.length + 1);
  const after = f.phrase.read().body!; const old = beforeBody.parts.find(part => part.id === rhythm)!;
  const expected = { ...old, timbreId: flute.id, name: flute.name }; delete expected.unassigned;
  assert.deepEqual(after.parts.find(part => part.id === rhythm), expected);
  assert.deepEqual(after.parts.find(part => part.id === melody), beforeBody.parts.find(part => part.id === melody));
  assert.deepEqual(f.library.readContent(created.id), source); assert(listProjectTimbres(f.library, f.songId).some(record => record.id === piano.id));
  f.phrase.undo(); assert.deepEqual(f.phrase.read().draft, before); f.phrase.redo(); assert.deepEqual(f.phrase.read().body, after);
});

test('all-section tone removal is one atomic reversible operation and department-specific callers remain scoped', () => {
  const f = fixture(); const tones = ensureProjectMelodyTimbres(f.library, f.songId);
  const piano = tones.find(record => record.name === '钢琴')!, flute = tones.find(record => record.name === '长笛')!;
  const created = createProjectPhrase(f.library, f.songId); f.phrase.openDraft(created.draftId);
  const first = createProjectPhraseNoteGroup(f.library, f.songId, created.draftId, piano.id);
  const second = createProjectPhraseNoteGroup(f.library, f.songId, created.draftId, piano.id);
  const rhythm = addProjectPhraseTimbre(f.library, f.songId, created.draftId, piano.id, 'rhythm');
  const other = addProjectPhraseTimbre(f.library, f.songId, created.draftId, flute.id, 'rhythm');
  for (const [index, id] of [first, second, rhythm, other].entries()) f.phrase.addNote(id, {
    startBeat: index + .25, durationBeats: .5, durationSeconds: .23, frequencyHz: 110 * (index + 1), velocity: .65, level: .8, pan: -.2 });
  const before = f.phrase.read().draft!, beforeBody = readPhraseBody(before.body), raw = f.raw(), token = f.library.currentToken();
  const history = f.library.readDraftHistory(created.draftId), members = f.library.currentProjectView!(f.songId)!.memberIds;
  f.fail(); assert.throws(() => removeProjectPhraseTimbre(f.library, f.songId, created.draftId, piano.id, 'all'), /测试磁盘/);
  assert.equal(f.raw(), raw); assert.equal(f.library.currentToken(), token); assert.deepEqual(f.phrase.read().draft, before);
  assert.deepEqual(f.library.readDraftHistory(created.draftId), history); assert.deepEqual(f.library.currentProjectView!(f.songId)!.memberIds, members); f.fail(false);
  const writes = f.writes(); removeProjectPhraseTimbre(f.library, f.songId, created.draftId, piano.id, 'all');
  assert.equal(f.writes(), writes + 1); assert.equal(f.library.readDraftHistory(created.draftId).past.length, history.past.length + 1);
  const after = f.phrase.read().body!; assert.deepEqual(after.parts, beforeBody.parts.filter(part => part.id === other));
  assert.deepEqual(f.phrase.read().draft!.dependencies, [flute.id]); assert(listProjectTimbres(f.library, f.songId).some(record => record.id === piano.id));
  f.phrase.undo(); assert.deepEqual(f.phrase.read().draft, before); f.phrase.redo(); assert.deepEqual(f.phrase.read().body, after);
  const reopened = createMaterialLibrary(f.storage, f.policy); const editor = createPhraseEditor(reopened, createTimbrePlayback(reopened)); editor.openDraft(created.draftId);
  editor.undo(); assert.deepEqual(editor.read().body, beforeBody);
  removeProjectPhraseTimbre(reopened, f.songId, created.draftId, piano.id);
  assert.deepEqual(editor.read().body!.parts.map(part => part.id), [rhythm, other]); editor.undo();
  removeProjectPhraseTimbre(reopened, f.songId, created.draftId, piano.id, 'rhythm');
  assert.deepEqual(editor.read().body!.parts.map(part => part.id), [first, second, other]);
});

test('app family replacement atomically keeps a formerly dependency-only tone in the song library through save and transfer', () => {
  const f=fixture(),custom=voice(f,'独立音色'),created=createProjectPhrase(f.library,f.songId,custom.id);f.phrase.openDraft(created.draftId);
  const part=f.phrase.read().body!.parts[0]!,old=f.library.readContent(part.timbreId)!;
  assert.equal(f.library.currentProjectView!(f.songId)!.memberIds.includes(old.id),false,'the original tone is reachable only through its phrase');
  const flute=ensureProjectMelodyTimbres(f.library,f.songId).find(record=>record.name==='长笛')!;
  f.phrase.addNote(part.id,{startBeat:2,durationBeats:.5,durationSeconds:.35,frequencyHz:440,velocity:.75,level:.4,pan:.2});f.phrase.setPartVisible(part.id,false);
  const before=f.phrase.read().draft!,raw=f.raw(),token=f.library.currentToken(),history=f.library.readDraftHistory(created.draftId),members=f.library.currentProjectView!(f.songId)!.memberIds;
  f.fail();assert.throws(()=>changeProjectPhraseNoteGroupTimbre(f.library,f.songId,created.draftId,part.id,flute.id),/测试磁盘/);
  assert.equal(f.raw(),raw);assert.equal(f.library.currentToken(),token);assert.deepEqual(f.phrase.read().draft,before);assert.deepEqual(f.library.readDraftHistory(created.draftId),history);assert.deepEqual(f.library.currentProjectView!(f.songId)!.memberIds,members);f.fail(false);
  const writes=f.writes();changeProjectPhraseNoteGroupTimbre(f.library,f.songId,created.draftId,part.id,flute.id);assert.equal(f.writes(),writes+1);assert.equal(f.library.readDraftHistory(created.draftId).past.length,history.past.length+1);
  const after=f.phrase.read().draft!,replaced=readPhraseBody(after.body).parts[0]!;assert.equal(replaced.timbreId,flute.id);assert.equal(replaced.id,part.id);assert.equal(replaced.unassigned,undefined);assert.deepEqual(replaced.notes,readPhraseBody(before.body).parts[0]!.notes);assert.deepEqual(after.dependencies,[flute.id]);
  assert(f.library.currentProjectView!(f.songId)!.memberIds.includes(old.id));assert.deepEqual(f.library.readContent(old.id),old);
  f.phrase.undo();assert.deepEqual(f.phrase.read().draft,before);f.phrase.redo();assert.deepEqual(f.phrase.read().draft,after);
  const unchanged=f.library.currentToken();changeProjectPhraseNoteGroupTimbre(f.library,f.songId,created.draftId,part.id,flute.id);assert.equal(f.library.currentToken(),unchanged);
  saved(f.phrase.save('overwrite'));assert(listProjectTimbres(f.library,f.songId).some(record=>record.id===old.id));
  const output=createProjectPackages(f.library,f.adapters,{rootKind:'rootsound.song'}).exportDraft(f.songId),target=createMaterialLibrary(undefined,f.policy);
  const imported=createProjectPackages(target,f.adapters,{rootKind:'rootsound.song'}).importProject(output.text);assert.equal(imported.status,'imported');if(imported.status!=='imported')throw new Error('Expected import');
  const restoredOld=listProjectTimbres(target,imported.draft.id).find(record=>record.name===old.name)!;assert(restoredOld);assert.deepEqual(restoredOld.body,old.body);
  const restoredParts=target.listContent().filter(record=>record.kind==='rootsound.phrase').flatMap(record=>readPhraseBody(record.body).parts);assert.equal(target.readContent(restoredParts.find(value=>value.id===part.id)!.timbreId)!.name,'长笛');
});

test('unused starters can be removed in one undoable edit and never reseed after cold open or portable Save As', () => {
  const f = fixture(); const tones = ensureProjectMelodyTimbres(f.library, f.songId), tone = tones[0]!;
  const before = f.song.read().draft!, past = f.library.readDraftHistory(f.songId), writes = f.writes();
  const editor = createTimbreEditor(f.library); editor.open(tone.id); const cleanDraft = editor.read().draft!.id;
  const afterOpenWrites = f.writes();
  assert.equal(tryRemoveUnusedProjectTimbre(f.library, f.songId, tone.id), true);
  assert.equal(f.writes(), afterOpenWrites + 1); assert(afterOpenWrites > writes);
  assert.equal(f.library.readContent(tone.id), undefined); assert.equal(f.library.readDraft(cleanDraft), undefined);
  assert.equal(f.library.readDraftHistory(f.songId).past.length, past.past.length + 1);
  const token = f.library.currentToken(); assert.equal(ensureProjectMelodyTimbres(f.library, f.songId).length, 6); assert.equal(f.library.currentToken(), token);
  f.song.undo(); assert.deepEqual(f.song.read().draft, before); assert.deepEqual(f.library.readContent(tone.id), tone);
  assert(f.library.readDraft(cleanDraft)); assert.equal(listProjectTimbres(f.library, f.songId).length, 7);
  f.song.redo(); assert.equal(f.library.readContent(tone.id), undefined);
  const reopened = createMaterialLibrary(f.storage, f.policy), coldToken = reopened.currentToken();
  assert.equal(ensureProjectMelodyTimbres(reopened, f.songId).length, 6); assert.equal(reopened.currentToken(), coldToken);
  const exported = createProjectPackages(reopened, f.adapters, { rootKind: 'rootsound.song' }).exportDraft(f.songId);
  assert(!JSON.parse(exported.text).contents.some((record: ContentRecord) => record.id === tone.id));
  const copied = createProjectCopyLibrary(f.raw()!, '副本', f.songId), copy = createMaterialLibrary({ read: () => copied, write() { throw new Error('unexpected reseed'); } }, f.policy);
  assert.equal(ensureProjectMelodyTimbres(copy, f.songId).length, 6);
  const target = createMaterialLibrary(undefined, f.policy), result = createProjectPackages(target, f.adapters, { rootKind: 'rootsound.song' }).importProject(exported.text);
  assert.equal(result.status, 'imported'); if (result.status !== 'imported') throw new Error('Expected import');
  const importedToken = target.currentToken(); assert.equal(ensureProjectMelodyTimbres(target, result.draft.id).length, 6); assert.equal(target.currentToken(), importedToken);
  const coldSong = createSongEditor(reopened, createPhrasePlayback(reopened, createTimbrePlayback(reopened)), { defaultTempoMode: 'source' });
  coldSong.openDraft(f.songId); coldSong.undo(); assert(reopened.readContent(tone.id)); coldSong.redo(); assert.equal(reopened.readContent(tone.id), undefined);
});

test('removing the whole unused starter palette keeps a genuinely empty song library after package import', () => {
  const f = fixture(), tones = ensureProjectMelodyTimbres(f.library, f.songId);
  for (const tone of tones) assert.equal(tryRemoveUnusedProjectTimbre(f.library, f.songId, tone.id), true);
  assert.deepEqual(listProjectTimbres(f.library, f.songId), []); assert.deepEqual(f.library.currentProjectView!(f.songId)!.memberIds, []);
  const token = f.library.currentToken(); assert.deepEqual(ensureProjectMelodyTimbres(f.library, f.songId), []); assert.equal(f.library.currentToken(), token);
  const file = createProjectPackages(f.library, f.adapters, { rootKind: 'rootsound.song' }).exportDraft(f.songId);
  const target = createMaterialLibrary(undefined, f.policy), imported = createProjectPackages(target, f.adapters, { rootKind: 'rootsound.song' }).importProject(file.text);
  assert.equal(imported.status, 'imported'); if (imported.status !== 'imported') throw new Error('Expected import');
  const importedToken = target.currentToken(); assert.deepEqual(ensureProjectMelodyTimbres(target, imported.draft.id), []); assert.equal(target.currentToken(), importedToken);
  f.song.undo(); assert.equal(listProjectTimbres(f.library, f.songId).length, 1); f.song.redo(); assert.deepEqual(listProjectTimbres(f.library, f.songId), []);
});

test('song-wide tone order survives rename, undo, cold open and graph-ID remapping including unused members', () => {
  const f = fixture(), tones = ensureProjectMelodyTimbres(f.library, f.songId), initial = tones.map(record => record.id);
  const moving = initial.at(-1)!, writes = f.writes(), before = f.song.read().draft!;
  reorderProjectTimbres(f.library, f.songId, moving, 0);
  assert.equal(f.writes(), writes + 1); const ordered = [moving, ...initial.slice(0, -1)];
  assert.deepEqual(listProjectTimbres(f.library, f.songId).map(record => record.id), ordered);
  assert.deepEqual(f.song.read().draft!.dependencies, [], 'visual order adds no musical dependencies');
  const unchanged = f.library.currentToken(); reorderProjectTimbres(f.library, f.songId, moving, 0); assert.equal(f.library.currentToken(), unchanged);
  f.song.undo(); assert.deepEqual(f.song.read().draft, before); assert.deepEqual(listProjectTimbres(f.library, f.songId).map(record => record.id), initial);
  f.song.redo(); const editor = createTimbreEditor(f.library); editor.open(moving); editor.rename('最后改成首位'); saved(editor.save('overwrite'));
  const one = createProjectPhrase(f.library, f.songId), two = createProjectPhrase(f.library, f.songId);
  f.song.reorderPhraseShelf(two.id, 0); f.song.setPhraseShelfVisible(one.id, false);
  const currentBody = f.song.read().body!, orderNames = listProjectTimbres(f.library, f.songId).map(record => record.name);
  const reopened = createMaterialLibrary(f.storage, f.policy); assert.deepEqual(listProjectTimbres(reopened, f.songId).map(record => record.id), ordered);
  const file = createProjectPackages(f.library, f.adapters, { rootKind: 'rootsound.song' }).exportDraft(f.songId);
  const target = createMaterialLibrary(undefined, f.policy), imported = createProjectPackages(target, f.adapters, { rootKind: 'rootsound.song' }).importProject(file.text);
  assert.equal(imported.status, 'imported'); if (imported.status !== 'imported') throw new Error('Expected import');
  assert.deepEqual(ensureProjectMelodyTimbres(target, imported.draft.id).map(record => record.name), orderNames);
  const importedBody = readSongBody(imported.draft.body), byName = new Map(target.listContent().map(record => [record.name, record.id]));
  assert(importedBody.timbreLibraryOrder!.every(id => !initial.includes(id)));
  assert.deepEqual(importedBody.phraseShelfOrder, currentBody.phraseShelfOrder!.map(id => byName.get(f.library.readContent(id)!.name)));
  assert.deepEqual(importedBody.hiddenPhraseIds, [byName.get(f.library.readContent(one.id)!.name)]);
  f.song.create(); const otherId = f.song.read().draft!.id; const other = ensureProjectMelodyTimbres(f.library, otherId);
  assert(other.every(record => !ordered.includes(record.id))); assert.deepEqual(readSongBody(f.library.readDraft(otherId)!.body).timbreLibraryOrder, undefined);
});

test('unused deletion refuses every saved or working phrase use, other departments and ordinary undo dependencies', () => {
  const f = fixture(), tones = ensureProjectMelodyTimbres(f.library, f.songId), piano = tones.find(record => record.name === '钢琴')!, flute = tones.find(record => record.name === '长笛')!;
  const savedPhrase = createProjectPhrase(f.library, f.songId, piano.id);
  let token = f.library.currentToken(); assert.equal(tryRemoveUnusedProjectTimbre(f.library, f.songId, piano.id), false); assert.equal(f.library.currentToken(), token);
  const working = createProjectPhrase(f.library, f.songId), part = addProjectPhraseTimbre(f.library, f.songId, working.draftId, flute.id, 'rhythm');
  f.phrase.openDraft(working.draftId); f.phrase.addNote(part, { startBeat: 1, durationBeats: .25, frequencyHz: 220, velocity: .8 });
  const before = f.raw(); assert.equal(tryRemoveUnusedProjectTimbre(f.library, f.songId, flute.id), false); assert.equal(f.raw(), before);
  removeProjectPhraseTimbre(f.library, f.songId, working.draftId, flute.id, 'rhythm');
  token = f.library.currentToken(); assert.equal(tryRemoveUnusedProjectTimbre(f.library, f.songId, flute.id), false, 'an independent phrase undo must remain valid'); assert.equal(f.library.currentToken(), token);
  f.phrase.undo(); assert.equal(f.phrase.read().body!.parts.find(item => item.id === part)!.notes.length, 1);
  assert.equal(f.library.readContent(savedPhrase.id)!.dependencies.includes(piano.id), true);
  f.song.create(); const other = f.song.read().draft!.id; ensureProjectMelodyTimbres(f.library, other);
  const raw = f.raw(); assert.throws(() => tryRemoveUnusedProjectTimbre(f.library, other, piano.id), /当前歌曲音色库/); assert.equal(f.raw(), raw);
});

test('unfinished tone edits block unused deletion, and failed reorder or deletion preserves all records and undo atomically', () => {
  const f = fixture(), tones = ensureProjectMelodyTimbres(f.library, f.songId), tone = tones[0]!;
  const editor = createTimbreEditor(f.library); editor.open(tone.id); editor.setLevel(.2);
  let raw = f.raw(); assert.equal(tryRemoveUnusedProjectTimbre(f.library, f.songId, tone.id), false); assert.equal(f.raw(), raw);
  saved(editor.save('overwrite'));
  raw = f.raw(); assert.equal(tryRemoveUnusedProjectTimbre(f.library, f.songId, tone.id), false, 'a clean saved editor still owns its independent undo history'); assert.equal(f.raw(), raw);
  const content = f.library.listContent(), drafts = f.library.listDrafts(), history = f.library.readDraftHistory(f.songId), token = f.library.currentToken(); raw = f.raw(); f.fail();
  assert.throws(() => reorderProjectTimbres(f.library, f.songId, tone.id, tones.length - 1), /测试磁盘/);
  assert.throws(() => tryRemoveUnusedProjectTimbre(f.library, f.songId, tones[1]!.id), /测试磁盘/);
  assert.equal(f.raw(), raw); assert.equal(f.library.currentToken(), token); assert.deepEqual(f.library.listContent(), content); assert.deepEqual(f.library.listDrafts(), drafts); assert.deepEqual(f.library.readDraftHistory(f.songId), history);
});

test('tone library metadata is validated and remapped without exposing a mutable view or inventing dependencies', () => {
  const f = fixture(); const song = f.song.read().draft!, body = readSongBody(song.body);
  assert.throws(() => readSongBody({ ...body, timbreLibraryOrder: ['same', 'same'] }), /重复标识/);
  assert.throws(() => readSongBody({ ...body, melodyTimbresSeeded: 'yes' }), /开启或关闭/);
  const custom = { ...song, body: { ...body, melodyTimbresSeeded: true, timbreLibraryOrder: ['a', 'missing'], phraseShelfOrder: ['p'], hiddenPhraseIds: ['p', 'absent'] } };
  const remapped = createSongReferenceAdapter().remapMetadata!(custom, new Map([['a', 'new-a'], ['p', 'new-p']]));
  const next = readSongBody(remapped.body); assert.deepEqual(next.timbreLibraryOrder, ['new-a']); assert.deepEqual(next.phraseShelfOrder, ['new-p']); assert.deepEqual(next.hiddenPhraseIds, ['new-p']); assert.equal(next.melodyTimbresSeeded, true);
  next.timbreLibraryOrder!.push('changed'); assert.deepEqual(custom.body.timbreLibraryOrder, ['a', 'missing']); assert.deepEqual(custom.dependencies, []);
});

test('library setup, reorder and unused deletion preserve active nested occurrence saves and independent note undo', () => {
  const f = fixture(), original = createProjectPhrase(f.library, f.songId), row = f.song.read().body!.tracks[0]!.id;
  const clip = f.song.addClip(row, original.id, 0), references = createReferenceEditing(f.library, f.adapters);
  const parent = references.begin({ root: { type: 'draft', id: f.songId }, path: [clip] }); f.phrase.openDraft(parent.draftId);
  const part = f.phrase.read().body!.parts[0]!.id;
  f.phrase.addNote(part, { startBeat: 1, durationBeats: .5, durationSeconds: .4, frequencyHz: 440, velocity: .7 });
  const child = references.begin({ root: { type: 'draft', id: parent.draftId }, path: [part] }), editor = createTimbreEditor(f.library);
  editor.openDraft(child.draftId); editor.setLevel(.31);
  const noteHistory = f.library.readDraftHistory(parent.draftId), tones = ensureProjectMelodyTimbres(f.library, f.songId);
  assert.deepEqual(f.library.readDraftHistory(parent.draftId), noteHistory, 'metadata-only snapshot repair keeps note undo');
  const moving = tones.at(-1)!; reorderProjectTimbres(f.library, f.songId, moving.id, 0);
  assert.deepEqual((f.library.readDraft(parent.draftId)!.editingContext as { rootSnapshot: unknown }).rootSnapshot, f.library.readDraft(f.songId));
  assert.deepEqual((f.library.readDraft(parent.draftId)!.editingContext as { route: unknown[] }).route[0], f.library.readContent(original.id));
  assert(references.locations(parent.draftId).locations.length > 0);
  f.song.undo(); assert(references.locations(parent.draftId).locations.length > 0); f.song.redo();
  const unused = tones.find(record => record.id !== moving.id)!;
  assert.equal(tryRemoveUnusedProjectTimbre(f.library, f.songId, unused.id), true);
  f.song.undo(); assert(references.locations(parent.draftId).locations.length > 0); f.song.redo();
  assert.equal(references.apply(child.draftId).status, 'applied');
  assert.equal(references.apply(parent.draftId).status, 'applied');
  const plan = f.song.previewPlan(); assert.equal(plan.events.length, 1); assert.equal(plan.events[0]!.sound.note.holdSeconds, .4);
  const file = createProjectPackages(f.library, f.adapters, { rootKind: 'rootsound.song' }).exportDraft(f.songId);
  const target = createMaterialLibrary(undefined, f.policy), imported = createProjectPackages(target, f.adapters, { rootKind: 'rootsound.song' }).importProject(file.text);
  assert.equal(imported.status, 'imported'); if (imported.status !== 'imported') throw new Error('Expected import');
  assert.equal(ensureProjectMelodyTimbres(target, imported.draft.id).some(record => record.name === unused.name), false);
});

test('palette metadata setup does not mask an unrelated song edit that invalidated an occurrence snapshot', () => {
  const f = fixture(), original = createProjectPhrase(f.library, f.songId), row = f.song.read().body!.tracks[0]!.id;
  const clip = f.song.addClip(row, original.id, 0), references = createReferenceEditing(f.library, f.adapters);
  const parent = references.begin({ root: { type: 'draft', id: f.songId }, path: [clip] }); f.phrase.openDraft(parent.draftId);
  f.phrase.addNote(f.phrase.read().body!.parts[0]!.id, { startBeat: 1, durationBeats: .25, frequencyHz: 440, velocity: .7 });
  f.song.rename('不应被初始化掩盖的实际改名'); ensureProjectMelodyTimbres(f.library, f.songId);
  const before = f.raw(), result = references.apply(parent.draftId);
  assert.equal(result.status, 'conflict'); assert.equal(f.raw(), before); assert.equal(f.phrase.read().body!.parts[0]!.notes.length, 1);
});
