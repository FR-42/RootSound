import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { ContentRecord, MaterialLibrary, NewContent, SaveResult } from '../src/workstation/contracts/content.ts';
import type { ReferenceApplyResult } from '../src/workstation/contracts/references.ts';
import type { TimbreBody } from '../src/workstation/contracts/timbre.ts';
import { createMaterialLibrary, createReferenceEditing } from '../src/workstation/modules/materials/public.ts';
import { countUsagePositions } from '../src/workstation/modules/materials/usage-positions.ts';
import { createTimbreReferenceAdapter, createTimbrePlayback } from '../src/workstation/modules/timbre/public.ts';
import { createPhraseReferenceAdapter, createPhrasePlayback, readPhraseBody } from '../src/workstation/modules/phrase/public.ts';
import { createSongReferenceAdapter, createSongEditor, readSongBody } from '../src/workstation/modules/song/public.ts';

const adapters = () => [createTimbreReferenceAdapter(), createPhraseReferenceAdapter(), createSongReferenceAdapter()];
const options = () => ({ project: { rootKind: 'rootsound.song', adapters: adapters() } });
function saved(value: SaveResult) { assert.equal(value.status, 'saved', JSON.stringify(value)); if (value.status !== 'saved') throw new Error('save'); return value; }
function applied(value: ReferenceApplyResult) { assert.equal(value.status, 'applied', JSON.stringify(value)); if (value.status !== 'applied') throw new Error('apply'); return value; }
function save(library: MaterialLibrary, input: NewContent) { return saved(library.saveDraft(library.createDraft(input).id, 'new')).content; }
function fixture(repeated = false) {
  let raw: string | null = null; let broken = false; let writes = 0;
  const storage = { read: () => raw, write(value: string) { if (broken) throw new Error('disk'); raw = value; writes++; } };
  const library = createMaterialLibrary(storage, options());
  const tone = save(library, { kind: 'rootsound.timbre', owner: 'timbre', schemaVersion: 1, name: '柔和',
    body: { model: 'basic-synth', version: 1, character: 'warm', attackSeconds: 0.01, releaseSeconds: 0.3, level: 0.6 } });
  const phrase = save(library, { kind: 'rootsound.phrase', owner: 'phrase', schemaVersion: 1, name: '旋律', dependencies: [tone.id],
    body: { model: 'note-phrase', version: 1, timeUnit: 'beat', tempoBpm: 120, lengthBeats: 4,
      parts: [{ id: 'voice', name: '主旋律', timbreId: tone.id, notes: [{ id: 'note', startBeat: 0, durationBeats: 1, frequencyHz: 440, velocity: 0.8 }] }] } });
  const editor = createSongEditor(library, createPhrasePlayback(library, createTimbrePlayback(library)), { defaultTempoMode: 'source' });
  editor.createFromPhrase(phrase.id); const root = editor.read().draft!; const track = readSongBody(root.body).tracks[0]!;
  if (repeated) editor.addClip(track.id, phrase.id, 4);
  const stored = saved(editor.save('new')); const localPhrase = library.readContent(stored.draft.dependencies[0]!)!;
  const localTone = library.readContent(localPhrase.dependencies[0]!)!;
  const clip = readSongBody(stored.draft.body).tracks[0]!.clips[0]!;
  const refs = createReferenceEditing(library, adapters()); const context = { root: { type: 'draft' as const, id: root.id }, path: [clip.id, 'voice'] };
  return { library, storage, refs, context, editor, localPhrase, localTone, stored, raw: () => raw, writes: () => writes,
    break() { broken = true; }, reopen: () => createMaterialLibrary(storage, options()) };
}
function change(library: MaterialLibrary, id: string, level: number) {
  const draft = library.readDraft(id)!; library.updateDraft(id, { body: { ...(draft.body as TimbreBody), level } }, { remember: true, expected: draft });
}
function level(record: ContentRecord) { return (record.body as TimbreBody).level; }

test('one song position counts once across the saved song, working view, and nested shadow editors', () => {
  const f = fixture();
  const outer = f.refs.begin({ root: f.context.root, path: [f.context.path[0]!] });
  f.refs.begin({ root: { type: 'draft', id: outer.draftId }, path: ['voice'] });
  const uses = countUsagePositions(f.library.listContent(), f.library.listDrafts(), adapters());
  assert.equal(uses.get(f.localTone.id), 1); assert.equal(uses.get(f.localPhrase.id), 1);
});

test('a singly used timbre and its singly used phrase retain identities through a direct occurrence save', () => {
  const f = fixture(); const edit = f.refs.begin(f.context); change(f.library, edit.draftId, 0.2); const writes = f.writes();
  const result = applied(f.refs.apply(edit.draftId)); assert.equal(f.writes(), writes + 1);
  assert.equal(result.content.id, f.localTone.id); assert.equal(result.content.revision, 2);
  assert.equal(f.library.readDraft(f.context.root.id)!.dependencies[0], f.localPhrase.id);
  assert.equal(f.library.readContent(f.localPhrase.id)!.revision, 2); assert.equal(level(result.content), 0.2);
  assert.equal(f.library.listContent().length, 5);
});

test('repeated uses fork the edited occurrence and leave all unselected content exact', () => {
  const f = fixture(true); const edit = f.refs.begin(f.context); change(f.library, edit.draftId, 0.15);
  const result = applied(f.refs.apply(edit.draftId)); assert.notEqual(result.content.id, f.localTone.id);
  const clips = readSongBody(f.library.readDraft(f.context.root.id)!.body).tracks[0]!.clips;
  assert.notEqual(clips[0]!.phraseId, f.localPhrase.id); assert.equal(clips[1]!.phraseId, f.localPhrase.id);
  assert.deepEqual(f.library.readContent(f.localTone.id), f.localTone); assert.deepEqual(f.library.readContent(f.localPhrase.id), f.localPhrase);
});

test('the next edit of an isolated occurrence overwrites its new identity without a second fork', () => {
  const f = fixture(true); let edit = f.refs.begin(f.context); change(f.library, edit.draftId, 0.2);
  const first = applied(f.refs.apply(edit.draftId)); const count = f.library.listContent().length;
  edit = f.refs.begin(f.context); change(f.library, edit.draftId, 0.1); const second = applied(f.refs.apply(edit.draftId));
  assert.equal(second.content.id, first.content.id); assert.equal(second.content.revision, 2); assert.equal(f.library.listContent().length, count);
});

test('nested singleton saves stay private until outer commit, then reuse both original identities after restart', () => {
  const f = fixture(); const before = f.library.listContent();
  const outer = f.refs.begin({ root: f.context.root, path: [f.context.path[0]!] });
  const inner = f.refs.begin({ root: { type: 'draft', id: outer.draftId }, path: ['voice'] }); change(f.library, inner.draftId, 0.17);
  const staged = applied(f.refs.apply(inner.draftId)); assert.notEqual(staged.content.id, f.localTone.id);
  assert.deepEqual(f.library.readContent(f.localTone.id), f.localTone); assert.deepEqual(f.library.readDraft(f.context.root.id), f.stored.draft);
  const reopened = f.reopen(); const manager = createReferenceEditing(reopened, adapters());
  const result = applied(manager.apply(outer.draftId)); assert.equal(result.content.id, f.localPhrase.id);
  assert.equal(readPhraseBody(result.content.body).parts[0]!.timbreId, f.localTone.id); assert.equal(level(reopened.readContent(f.localTone.id)!), 0.17);
  assert.equal(reopened.listContent().length, before.length); assert.equal(reopened.readContent(staged.content.id), undefined);
});

test('repeated nested singleton adjustments still converge to the original identity', () => {
  const f = fixture(); const outer = f.refs.begin({ root: f.context.root, path: [f.context.path[0]!] });
  for (const value of [0.25, 0.1]) {
    const inner = f.refs.begin({ root: { type: 'draft', id: outer.draftId }, path: ['voice'] }); change(f.library, inner.draftId, value); applied(f.refs.apply(inner.draftId));
  }
  const result = applied(f.refs.apply(outer.draftId));
  assert.equal(readPhraseBody(result.content.body).parts[0]!.timbreId, f.localTone.id); assert.equal(level(f.library.readContent(f.localTone.id)!), 0.1);
});

test('two voices using one timbre fork only the selected voice while the singly used phrase stays in place', () => {
  const f = fixture(); const phraseDraft = f.library.createDraft({ sourceId: f.localPhrase.id }); const body = readPhraseBody(phraseDraft.body);
  body.parts.push({ ...body.parts[0]!, id: 'second-voice', name: '伴奏', notes: body.parts[0]!.notes.map(note => ({ ...note, id: 'second-note' })) }); f.library.updateDraft(phraseDraft.id, { body });
  saved(f.library.saveDraft(phraseDraft.id, 'overwrite')); const edit = f.refs.begin(f.context); change(f.library, edit.draftId, 0.16);
  const result = applied(f.refs.apply(edit.draftId)); assert.notEqual(result.content.id, f.localTone.id);
  const now = readPhraseBody(f.library.readContent(f.localPhrase.id)!.body);
  assert.equal(now.parts[0]!.timbreId, result.content.id); assert.equal(now.parts[1]!.timbreId, f.localTone.id);
  assert.equal(f.library.readDraft(f.context.root.id)!.dependencies[0], f.localPhrase.id); assert.deepEqual(f.library.readContent(f.localTone.id), f.localTone);
});

test('nested singleton commits undo and redo their private forks and source revisions together', () => {
  const f = fixture(); const outer = f.refs.begin({ root: f.context.root, path: [f.context.path[0]!] });
  const inner = f.refs.begin({ root: { type: 'draft', id: outer.draftId }, path: ['voice'] }); change(f.library, inner.draftId, 0.19);
  const staged = applied(f.refs.apply(inner.draftId)); applied(f.refs.apply(outer.draftId));
  let library = f.reopen(); library.travelDraft(f.context.root.id, 'undo', library.readDraft(f.context.root.id)!);
  assert.deepEqual(library.readContent(f.localTone.id), f.localTone); assert.ok(library.readContent(staged.content.id)); assert.ok(library.readDraft(outer.draftId));
  library = f.reopen(); library.travelDraft(f.context.root.id, 'redo', library.readDraft(f.context.root.id)!);
  assert.equal(level(library.readContent(f.localTone.id)!), 0.19); assert.equal(library.readContent(staged.content.id), undefined);
  assert.equal(library.readDraft(outer.draftId), undefined);
});

test('cancelling nested singleton changes restores the original graph without touching its saved sound', () => {
  const f = fixture(); const before = f.library.listContent(); const outer = f.refs.begin({ root: f.context.root, path: [f.context.path[0]!] });
  const inner = f.refs.begin({ root: { type: 'draft', id: outer.draftId }, path: ['voice'] }); change(f.library, inner.draftId, 0.2); applied(f.refs.apply(inner.draftId));
  assert.equal(f.refs.cancel(outer.draftId).status, 'done'); assert.deepEqual(f.library.listContent(), before);
});

test('singleton replacement undo and redo restore exact source records durably', () => {
  const f = fixture(); const edit = f.refs.begin(f.context); change(f.library, edit.draftId, 0.12); applied(f.refs.apply(edit.draftId));
  let library = f.reopen(); library.travelDraft(f.context.root.id, 'undo', library.readDraft(f.context.root.id)!);
  assert.deepEqual(library.readContent(f.localTone.id), f.localTone); assert.deepEqual(library.readContent(f.localPhrase.id), f.localPhrase);
  library = f.reopen(); library.travelDraft(f.context.root.id, 'redo', library.readDraft(f.context.root.id)!); assert.equal(level(library.readContent(f.localTone.id)!), 0.12);
});

test('failed singleton save cannot overwrite source bytes or discard its working draft', () => {
  const f = fixture(); const edit = f.refs.begin(f.context); change(f.library, edit.draftId, 0.22); const before = f.raw(); f.break();
  assert.equal(f.refs.apply(edit.draftId).status, 'storage-error'); assert.equal(f.raw(), before); assert.deepEqual(f.library.readContent(f.localTone.id), f.localTone);
  assert.ok(f.library.readDraft(edit.draftId));
});

test('a newer saved song is protected from an older in-place undo', () => {
  const f = fixture(); const edit = f.refs.begin(f.context); change(f.library, edit.draftId, 0.2); applied(f.refs.apply(edit.draftId));
  saved(f.editor.save('overwrite')); const afterSave = f.raw(); const library = f.reopen();
  assert.throws(() => library.travelDraft(f.context.root.id, 'undo', library.readDraft(f.context.root.id)!), /已另行保存/);
  assert.equal(f.raw(), afterSave); assert.equal(level(library.readContent(f.localTone.id)!), 0.2);
});

test('direct library editing overwrites zero or one use, while multiple uses save an independent copy', () => {
  const f = fixture(); const edit = f.refs.beginLibrary(f.localTone.id); change(f.library, edit.draftId, 0.16);
  assert.equal(applied(f.refs.apply(edit.draftId)).content.id, f.localTone.id);
  const g = fixture(true); const shared = g.refs.beginLibrary(g.localTone.id); change(g.library, shared.draftId, 0.18);
  const result = applied(g.refs.apply(shared.draftId)); assert.notEqual(result.content.id, g.localTone.id); assert.deepEqual(g.library.readContent(g.localTone.id), g.localTone);
  const unused = g.refs.beginLibrary(result.content.id); change(g.library, unused.draftId, 0.11);
  assert.equal(applied(g.refs.apply(unused.draftId)).content.id, result.content.id);
});

test('production ordinary save follows the same rule and explicit save-as always creates a copy', () => {
  const f = fixture(); let draft = f.library.createDraft({ sourceId: f.localTone.id }); change(f.library, draft.id, 0.21);
  const overwrite = saved(f.library.saveDraft(draft.id, 'overwrite')); assert.equal(overwrite.content.id, f.localTone.id);
  const copy = saved(f.library.saveDraft(draft.id, 'new')); assert.notEqual(copy.content.id, f.localTone.id);
  const g = fixture(true); draft = g.library.createDraft({ sourceId: g.localTone.id }); change(g.library, draft.id, 0.14);
  const split = saved(g.library.saveDraft(draft.id, 'overwrite')); assert.notEqual(split.content.id, g.localTone.id); assert.deepEqual(g.library.readContent(g.localTone.id), g.localTone);
});

test('new uses in ordinary phrase drafts protect a sound shared by multiple unfinished edits', () => {
  const f = fixture();
  const start = save(f.library, { kind: 'rootsound.timbre', owner: 'timbre', schemaVersion: 1, name: '新的声音',
    body: { model: 'basic-synth', version: 1, character: 'clear', attackSeconds: 0.01, releaseSeconds: 0.2, level: 0.5 } });
  const drafts = [0, 1].map(() => {
    const draft = f.library.createDraft({ sourceId: f.localPhrase.id }); const body = readPhraseBody(draft.body);
    body.parts[0]!.timbreId = start.id;
    return f.library.updateDraft(draft.id, { body, dependencies: [start.id] });
  });
  const sharedId = drafts[0]!.dependencies[0]!; assert.equal(drafts[1]!.dependencies[0], sharedId);
  const shared = f.library.readContent(sharedId)!;
  const uses = countUsagePositions(f.library.listContent(), f.library.listDrafts(), adapters());
  assert.equal(uses.get(sharedId), 2, 'two unpublished ordinary edits contain two new uses');
  assert.equal(uses.get(f.localTone.id), 1, 'unchanged saved/working views still represent one original use');
  const edit = f.refs.beginLibrary(sharedId); change(f.library, edit.draftId, 0.1);
  const result = applied(f.refs.apply(edit.draftId)); assert.notEqual(result.content.id, sharedId);
  assert.deepEqual(f.library.readContent(sharedId), shared);
  for (const draft of drafts) assert.deepEqual(f.library.readDraft(draft.id), draft);
  assert.deepEqual(f.library.readContent(f.localPhrase.id), f.localPhrase);
});
