import type { MaterialLibrary } from '../contracts/content.ts';
import type { PhraseBody, PhraseEditorPort } from '../contracts/phrase.ts';
import type { SongEditorPort } from '../contracts/song.ts';
import { readPhraseBody } from '../modules/phrase/public.ts';
import { readSongBody } from '../modules/song/public.ts';

/** File compatibility boundary: one editable score, with no arrangement in the product. */
export function openMusicDocument(library: MaterialLibrary, song: SongEditorPort, score: PhraseEditorPort): void {
  const root = song.read().draft;
  if (!root) return;
  const body = readSongBody(root.body);
  const clips = body.tracks.flatMap(track => track.clips.map(clip => ({ track, clip })));
  const only = clips.length === 1 ? clips[0] : undefined;
  if (body.tracks.length === 1 && only && only.clip.startBeat === 0 && (only.clip.level ?? 1) === 1 && (only.clip.pan ?? 0) === 0
    && only.track.level === 1 && only.track.pan === 0 && !only.track.panOffset && !only.track.muted
    && (body.masterLevel ?? 1) === 1 && body.tempoMode === 'source') {
    const pending = library.listDrafts().find(draft => draft.sourceId === only.clip.phraseId && !draft.editingContext);
    if (pending) score.openDraft(pending.id); else score.open(only.clip.phraseId);
    if (score.read().draft?.name !== root.name) score.rename(root.name);
    return;
  }
  const bpm = body.tempoBpm;
  const parts: PhraseBody['parts'] = [];
  const groups = new Map<string, PhraseBody['parts'][number]>();
  let end = Math.max(16, body.lengthBeats * bpm / body.tempoBpm);
  const solo = body.tracks.some(track => track.solo);
  for (const { track, clip } of clips) {
    const saved = library.readContent(clip.phraseId);
    if (!saved) throw new Error('工程缺少音符数据。');
    const source = readPhraseBody(saved.body);
    const sourceBpm = body.tempoMode === 'song' ? body.tempoBpm : source.tempoBpm;
    const start = clip.startBeat * bpm / body.tempoBpm;
    const scale = bpm / sourceBpm;
    const silent = track.muted || solo && !track.solo;
    for (const part of source.parts) {
      const key = JSON.stringify([part.timbreId, !!part.unassigned]);
      let target = groups.get(key);
      if (!target) { target = { ...part, id: crypto.randomUUID(), section: 'melody', notes: [] }; groups.set(key, target); parts.push(target); }
      target.notes.push(...part.notes.map(note => {
        const startBeat = start + note.startBeat * scale;
        const durationBeats = note.durationBeats * scale;
        end = Math.max(end, startBeat + durationBeats);
        return { ...note, id: crypto.randomUUID(), startBeat, durationBeats,
          durationSeconds: note.durationSeconds ?? note.durationBeats * 60 / sourceBpm,
          level: silent ? 0 : (note.level ?? 1) * (source.masterLevel ?? 1) * track.level * (clip.level ?? 1) * (body.masterLevel ?? 1),
          pan: Math.max(-1, Math.min(1, (note.pan ?? 0) + (clip.pan ?? track.pan) + (track.panOffset ?? 0))) };
      }));
    }
  }
  const music = readPhraseBody({ model: 'note-phrase', version: 1, timeUnit: 'beat', tempoBpm: bpm,
    lengthBeats: end, parts });
  const draft = library.createDraft({ kind: 'rootsound.phrase', owner: 'phrase', schemaVersion: 1,
    projectRootId: root.id, name: root.name, dependencies: [...new Set(parts.map(part => part.timbreId))],
    body: music });
  score.openDraft(draft.id);
}

/** Confirm the sole score into the working document; only the platform Save writes a file. */
export function commitMusicDocument(library: MaterialLibrary, song: SongEditorPort, score: PhraseEditorPort): void {
  const view = score.read();
  if (!view.draft || !view.body) return;
  const existing = view.draft.sourceId && !view.changed ? library.readContent(view.draft.sourceId) : undefined;
  let saved = existing ? { status: 'saved' as const, content: existing, draft: view.draft }
    : library.saveDraft(view.draft.id, view.draft.sourceId ? 'overwrite' : 'new');
  if (saved.status === 'needs-confirmation') saved = library.saveDraft(view.draft.id, 'overwrite', saved.confirmation);
  if (saved.status !== 'saved') throw new Error(saved.status === 'storage-error' ? saved.message
    : saved.status === 'conflict' ? saved.reason : '音乐尚未保存。');
  const root = song.read().draft!;
  const previous = readSongBody(root.body);
  const body = { ...previous, tempoBpm: view.body.tempoBpm, gridTempoBpm: view.body.tempoBpm,
    gridTempoChanges: [], gridOffsetSeconds: 0, tempoMode: 'source' as const, masterLevel: 1,
    lengthBeats: Math.max(16, view.body.lengthBeats), hiddenPhraseIds: [], phraseShelfOrder: [],
    tracks: [{ id: previous.tracks[0]?.id ?? crypto.randomUUID(), name: '音乐', level: 1, pan: 0, muted: false, solo: false,
      clips: [{ id: previous.tracks[0]?.clips[0]?.id ?? crypto.randomUUID(), phraseId: saved.content.id, startBeat: 0 }] }] };
  const dependencies = [saved.content.id];
  if (root.name !== saved.content.name || JSON.stringify(root.body) !== JSON.stringify(body)
    || JSON.stringify(root.dependencies) !== JSON.stringify(dependencies))
    library.updateDraft(root.id, { name: saved.content.name, body, dependencies });
}
