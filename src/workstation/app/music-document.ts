import type { MaterialLibrary } from '../contracts/content.ts';
import type { PhraseBody, PhraseEditorPort } from '../contracts/phrase.ts';
import type { SongEditorPort } from '../contracts/song.ts';
import { readPhraseBody } from '../modules/phrase/public.ts';
import { readSongBody } from '../modules/song/public.ts';
import { phraseBeatSeconds, phraseHeldSeconds, phraseSecondsBeat } from '../contracts/phrase-time.ts';

/** File compatibility boundary: one editable score, with no arrangement in the product. */
export function openMusicDocument(library: MaterialLibrary, song: SongEditorPort, score: PhraseEditorPort, fileName?: string): string | undefined {
  let root = song.readDraft();
  if (!root) return;
  if (fileName && fileName !== root.name) {
    song.rename(fileName);
    root = song.readDraft()!;
  }
  const body = readSongBody(root.body);
  const clips = body.tracks.flatMap(track => track.clips.map(clip => ({ track, clip })));
  const only = clips.length === 1 ? clips[0] : undefined;
  if (body.tracks.length === 1 && only && only.clip.startBeat === 0 && (only.clip.level ?? 1) === 1 && (only.clip.pan ?? 0) === 0
    && only.track.level === 1 && only.track.pan === 0 && !only.track.panOffset && !only.track.muted
    && (body.masterLevel ?? 1) === 1 && body.tempoMode === 'source') {
    const pending = library.listDrafts().find(draft => draft.sourceId === only.clip.phraseId && !draft.editingContext);
    if (pending) score.openDraft(pending.id); else score.open(only.clip.phraseId);
    if ((pending?.name ?? library.readContentInfo(only.clip.phraseId)?.name) !== root.name) score.rename(root.name);
    return root.id;
  }
  const soleSource = only && only.clip.startBeat === 0 ? library.readContent(only.clip.phraseId) : undefined;
  const soleClock = soleSource ? readPhraseBody(soleSource.body) : undefined;
  const clockRate = soleClock && body.tempoMode === 'song' ? body.tempoBpm / soleClock.tempoBpm : 1;
  const changes = body.gridTempoChanges?.length ? body.gridTempoChanges
    : soleClock?.tempoSections?.map(section => ({ atSeconds: phraseBeatSeconds(soleClock, section.startBeat) / clockRate,
      tempoBpm: section.tempoBpm * clockRate })) ?? [];
  const bpm = body.gridTempoChanges?.length ? body.gridTempoBpm ?? body.tempoBpm
    : soleClock?.tempoSections?.length ? soleClock.tempoBpm * clockRate : body.tempoBpm;
  const parts: PhraseBody['parts'] = [];
  const midiExpression: NonNullable<PhraseBody['midiExpression']> = [];
  const groups = new Map<string, PhraseBody['parts'][number]>();
  // Collect on the original song clock first. A legacy MIDI import's grid tempo
  // map becomes sequential BPM rolls, rather than flattening every note to bpm.
  let endSeconds = Math.max(16, body.lengthBeats) * 60 / body.tempoBpm;
  const solo = body.tracks.some(track => track.solo);
  for (const { track, clip } of clips) {
    const saved = library.readContent(clip.phraseId);
    if (!saved) throw new Error('工程缺少音符数据。');
    const source = readPhraseBody(saved.body);
    const sourceBpm = body.tempoMode === 'song' ? body.tempoBpm : source.tempoBpm;
    const start = clip.startBeat * 60 / body.tempoBpm;
    for(const lane of source.midiExpression??[])midiExpression.push({id:`${clip.id}:${lane.id}`,events:lane.events.map(event=>({...event,
      beat:start+phraseBeatSeconds(source,event.beat)*source.tempoBpm/sourceBpm}))});
    const silent = track.muted || solo && !track.solo;
    for (const part of source.parts) {
      const key = JSON.stringify([part.timbreId, !!part.unassigned,part.level,part.pan,part.midiChannelId?`${clip.id}:${part.midiChannelId}`:undefined]);
      let target = groups.get(key);
      if (!target) { target = { ...part, id: crypto.randomUUID(), section: 'melody', ...(part.midiChannelId?{midiChannelId:`${clip.id}:${part.midiChannelId}`} : {}),notes: [] }; groups.set(key, target); parts.push(target); }
      target.notes.push(...part.notes.map(note => {
        const startBeat = start + phraseBeatSeconds(source, note.startBeat) * source.tempoBpm / sourceBpm;
        const durationBeats = (phraseBeatSeconds(source, note.startBeat + note.durationBeats) - phraseBeatSeconds(source, note.startBeat)) * source.tempoBpm / sourceBpm;
        const heldSeconds = note.durationSeconds ?? phraseHeldSeconds(source, note) * source.tempoBpm / sourceBpm;
        endSeconds = Math.max(endSeconds, startBeat + durationBeats, startBeat + heldSeconds);
        return { ...note, ...(note.midiChannelId ? { midiChannelId: `${clip.id}:${note.midiChannelId}` } : {}), id: crypto.randomUUID(), startBeat, durationBeats,
          durationSeconds: heldSeconds,
          level: silent ? 0 : (note.level ?? 1) * (source.masterLevel ?? 1) * track.level * (clip.level ?? 1) * (body.masterLevel ?? 1),
          pan: Math.max(-1, Math.min(1, (note.pan ?? 0) + (clip.pan ?? track.pan) + (track.panOffset ?? 0))) };
      }));
    }
  }
  let previousSeconds = 0, previousBeat = 0, previousBpm = bpm;
  const tempoSections: NonNullable<PhraseBody['tempoSections']> = [];
  for (const change of changes) {
    if (change.atSeconds >= endSeconds) break;
    if (change.tempoBpm === previousBpm) continue;
    const startBeat = previousBeat + (change.atSeconds - previousSeconds) * previousBpm / 60;
    tempoSections.push({ id: crypto.randomUUID(), startBeat, tempoBpm: change.tempoBpm });
    previousBeat = startBeat; previousSeconds = change.atSeconds; previousBpm = change.tempoBpm;
  }
  const clock: PhraseBody = { model: 'note-phrase', version: 1, timeUnit: 'beat', tempoBpm: bpm,
    lengthBeats: previousBeat + (endSeconds - previousSeconds) * previousBpm / 60, tempoSections, parts: [] };
  for (const part of parts) for (const note of part.notes) {
    const start = note.startBeat;
    note.startBeat = phraseSecondsBeat(clock, start);
    note.durationBeats = phraseSecondsBeat(clock, start + note.durationBeats) - note.startBeat;
  }
  for(const lane of midiExpression)for(const event of lane.events)event.beat=phraseSecondsBeat(clock,event.beat);
  const music = readPhraseBody({ model: 'note-phrase', version: 1, timeUnit: 'beat', tempoBpm: bpm,
    ...(tempoSections.length ? { tempoSections } : {}), lengthBeats: clock.lengthBeats, parts, ...(midiExpression.length?{midiExpression}: {}) });
  const draft = library.createDraft({ kind: 'rootsound.phrase', owner: 'phrase', schemaVersion: 1,
    projectRootId: root.id, name: root.name, dependencies: [...new Set(parts.map(part => part.timbreId))],
    body: music });
  score.openDraft(draft.id);
  return root.id;
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
  const root = song.readDraft()!;
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
