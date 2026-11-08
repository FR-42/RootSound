import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { SaveResult } from '../src/workstation/contracts/content.ts';
import { createMaterialLibrary } from '../src/workstation/modules/materials/public.ts';
import { createTimbreEditor, createTimbrePlayback, createTimbreReferenceAdapter } from '../src/workstation/modules/timbre/public.ts';
import { createPhraseEditor, createPhrasePlayback, createPhraseReferenceAdapter } from '../src/workstation/modules/phrase/public.ts';
import { createSongEditor, createSongReferenceAdapter } from '../src/workstation/modules/song/public.ts';
import { createProjectAssets } from '../src/workstation/modules/project-assets/public.ts';
import { ENTITY_DRAG_TYPE, readEntityDrag, writeEntityDrag } from '../src/workstation/modules/ui-rendering/entity-drag.ts';
import { visibleWorkspace } from '../src/workstation/modules/ui-rendering/visible-workspaces.ts';

function content(result: SaveResult) {
  assert.equal(result.status, 'saved');
  if (result.status !== 'saved') throw new Error('Fixture save failed');
  return result.content;
}
function fixture() {
  const adapters = [createTimbreReferenceAdapter(), createPhraseReferenceAdapter(), createSongReferenceAdapter()];
  const library = createMaterialLibrary(undefined, { project: { rootKind: 'rootsound.song', adapters } });
  const timbre = createTimbreEditor(library); timbre.rename('木琴'); const source = content(timbre.save('new'));
  const voices = createTimbrePlayback(library); const phrase = createPhraseEditor(library, voices);
  phrase.create(source.id); const part = phrase.read().body!.parts[0]!;
  phrase.addNote(part.id, { startBeat: 0, durationBeats: 1, frequencyHz: 220, velocity: .7 });
  const melody = content(phrase.save('new'));
  const song = createSongEditor(library, createPhrasePlayback(library, voices), { defaultTempoMode: 'source' });
  return { library, timbre, source, phrase, melody, song,
    entities: createProjectAssets(library, () => song.read().draft) };
}

test('the entity rail reads light metadata without opening source bodies or creating a project', () => {
  const f = fixture(); const token = f.library.currentToken();
  const metadataOnly = { ...f.library, readContent() { throw new Error('Body was read by the entity list'); } };
  const entities = createProjectAssets(metadataOnly, () => undefined).read();
  assert.equal(entities.project, undefined); assert.deepEqual(entities.current, []);
  assert.deepEqual(new Set(entities.available.map(item => item.id)), new Set([f.source.id, f.melody.id]));
  assert(entities.available.every(item => !('body' in item)));
  assert.equal(f.library.currentToken(), token);
});

test('current-song entities hide historical retained material, foreign songs and adopted public originals', () => {
  const f = fixture(); f.song.createFromPhrase(f.melody.id, '第一首');
  const firstDraft = f.song.read().draft!; const first = f.entities.read();
  assert.equal(first.current.length, 2); assert.deepEqual(first.available, []);
  assert(first.current.every(item => ![f.source.id, f.melody.id].includes(item.id)));
  f.song.createFromPhrase(f.melody.id, '第二首'); const second = f.entities.read();
  assert(second.current.every(item => !first.current.some(other => other.id === item.id)));
  assert.deepEqual(second.available, []);
  f.song.openDraft(firstDraft.id);
  const body = f.song.read().body!; const clip = body.tracks[0]!.clips[0]!;
  f.song.removeClip(body.tracks[0]!.id, clip.id);
  assert.deepEqual(f.entities.read().current, []);
});

test('entity drag payloads keep identity, reject malformed input and feed the normal reversible edit paths', () => {
  const f = fixture(); const data = new Map<string, string>();
  const transfer = { effectAllowed: 'none' as DataTransfer['effectAllowed'], setData(type: string, value: string) { data.set(type, value); }, getData(type: string) { return data.get(type) ?? ''; } };
  writeEntityDrag(transfer, { id: f.source.id, kind: 'rootsound.timbre' });
  assert.equal(transfer.effectAllowed, 'copy'); const sound = readEntityDrag(transfer)!;
  const partId = f.phrase.addPart(sound.id);
  assert.equal(f.phrase.read().body!.parts.at(-1)!.timbreId, f.source.id);
  f.phrase.undo(); assert(!f.phrase.read().body!.parts.some(part => part.id === partId));
  f.song.create(); const track = f.song.read().body!.tracks[0]!;
  writeEntityDrag(transfer, { id: f.melody.id, kind: 'rootsound.phrase' });
  const clipId = f.song.addClip(track.id, readEntityDrag(transfer)!.id, 3);
  assert.equal(f.song.read().body!.tracks[0]!.clips[0]!.startBeat, 3);
  assert.notEqual(f.song.read().body!.tracks[0]!.clips[0]!.phraseId, f.melody.id);
  f.song.undo(); assert(!f.song.read().body!.tracks[0]!.clips.some(clip => clip.id === clipId));
  for (const text of ['', '{', '[]', '{"version":2,"id":"a","kind":"rootsound.timbre"}',
    '{"version":1,"id":" ","kind":"rootsound.timbre"}', '{"version":1,"id":"a","kind":"rootsound.song"}',
    '{"version":1,"id":"a","kind":"rootsound.phrase","body":{}}', 'x'.repeat(8193)]) {
    data.set(ENTITY_DRAG_TYPE, text); assert.equal(readEntityDrag(transfer), undefined);
  }
  assert.equal(readEntityDrag({ getData() { throw new Error('Transfer unavailable'); } }), undefined);
});

test('the rail follows the edited phrase scope instead of offering another active song\'s unusable timbres', () => {
  const f = fixture(); const publicDraft = f.phrase.read().draft!;
  f.song.createFromPhrase(f.melody.id, '第一首');
  const first = f.entities.read(); const localPhrase = first.current.find(item => item.kind === 'rootsound.phrase')!;
  const publicView = f.entities.read({ draftId: publicDraft.id });
  assert.equal(publicView.project, undefined); assert.deepEqual(publicView.current, []);
  assert(publicView.available.every(item => f.phrase.read().availableSounds.some(sound => sound.id === item.id) || item.kind === 'rootsound.phrase'));
  f.phrase.open(localPhrase.id); const localDraft = f.phrase.read().draft!;
  f.song.createFromPhrase(f.melody.id, '第二首');
  const focused = f.entities.read({ draftId: localDraft.id });
  assert.equal(focused.project!.name, '第一首');
  const valid = new Set(f.phrase.read().availableSounds.map(item => item.id));
  assert(focused.current.filter(item => item.kind === 'rootsound.timbre').every(item => valid.has(item.id)));
  assert.deepEqual(new Set(focused.current.map(item => item.id)), new Set(first.current.map(item => item.id)));
  assert.equal(f.entities.read({ draftId: '' }).project, undefined);
});

test('dormant co-creation startup entries resolve to the visible editor without affecting other workspaces', () => {
  assert.equal(visibleWorkspace('co-creation'), 'sound');
  for (const id of ['sound', 'phrase', 'song', 'sampling', 'library'] as const) assert.equal(visibleWorkspace(id), id);
});
