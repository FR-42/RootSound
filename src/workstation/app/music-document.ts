import type { MaterialLibrary } from '../contracts/content.ts';
import type { PhraseBody, PhraseEditorPort, PhraseGainPoint, PhraseNote } from '../contracts/phrase.ts';
import { PERFORMANCE_CURVES, type CurveKind } from '../contracts/gain-curve.ts';
import type { SongEditorPort } from '../contracts/song.ts';
import { readPhraseBody } from '../modules/phrase/public.ts';
import { readSongBody } from '../modules/song/public.ts';
import { phraseBeatSeconds, phraseDurationSeconds, phraseHeldSeconds, phraseTempoSpans } from '../contracts/phrase-time.ts';
import { MAX_PHRASE_BEATS, MIN_NOTE_BEATS, MIN_NOTE_SECONDS } from '../contracts/phrase-limits.ts';

function localClocks(body: PhraseBody) {
  const clocks = new Map(phraseTempoSpans(body).map(span => [span.id ?? 'first', span]));
  return (sectionId: string, beat: number) => {
    const span = clocks.get(sectionId)!;
    return span.startSeconds + beat * 60 / span.tempoBpm;
  };
}

function singleTempoNote(note: PhraseNote, startBeat: number, endBeat: number, heldSeconds: number): PhraseNote {
  const durationBeats = endBeat - startBeat;
  if (durationBeats < MIN_NOTE_BEATS && (heldSeconds < MIN_NOTE_SECONDS || heldSeconds > 96))
    throw new Error('转换后有音符超出可保留的时值范围，原文件未改动。');
  return { ...note, startBeat, durationBeats: Math.max(durationBeats, MIN_NOTE_BEATS),
    durationSeconds: note.durationSeconds ?? (durationBeats < MIN_NOTE_BEATS ? heldSeconds : undefined) };
}

export function flattenMusicTempo(body: PhraseBody): PhraseBody {
  if (!body.tempoSections?.length) return body;
  const beatsPerSecond = body.tempoBpm / 60;
  const beatAt = (beat: number) => phraseBeatSeconds(body, beat) * beatsPerSecond;
  const local = localClocks(body);
  const lengthBeats = Math.max(.25, phraseDurationSeconds(body) * beatsPerSecond);
  if (lengthBeats > MAX_PHRASE_BEATS) throw new Error('按开头 BPM 换算后超出当前音乐长度范围，原文件未改动。');
  const curveAt = (points: PhraseGainPoint[]) => points.map(point => ({ ...point, beat: beatAt(point.beat) }));
  return readPhraseBody({
    ...body, tempoSections: undefined, lengthBeats,
    parts: body.parts.map(part => ({
      ...part,
      notes: part.notes.map(note => singleTempoNote(note, beatAt(note.startBeat), beatAt(note.startBeat + note.durationBeats), phraseHeldSeconds(body, note))),
      gainCurve: part.gainCurve?.length ? curveAt(part.gainCurve) : undefined,
      performanceCurves: part.performanceCurves && Object.fromEntries(Object.entries(part.performanceCurves)
        .map(([kind, points]) => [kind, curveAt(points)])),
      hiddenNotes: part.hiddenNotes?.map(({ sectionId, note }) => ({ sectionId: 'first',
        note: singleTempoNote(note, local(sectionId, note.startBeat) * beatsPerSecond,
          local(sectionId, note.startBeat + note.durationBeats) * beatsPerSecond, note.durationSeconds!) })),
    })),
    midiExpression: body.midiExpression?.map(lane => ({
      ...lane,
      events: lane.events.map(event => ({ ...event, beat: beatAt(event.beat) })),
      hiddenEvents: lane.hiddenEvents?.map(({ sectionId, event }) => ({ sectionId: 'first',
        event: { ...event, beat: local(sectionId, event.beat) * beatsPerSecond } })),
    })),
  });
}

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
    && (body.masterLevel ?? 1) === 1 && body.tempoMode === 'source' && !body.gridTempoChanges?.length) {
    const pending = library.listDrafts().find(draft => draft.sourceId === only.clip.phraseId && !draft.editingContext);
    if (pending) score.openDraft(pending.id); else score.open(only.clip.phraseId);
    if ((pending?.name ?? library.readContentInfo(only.clip.phraseId)?.name) !== root.name) score.rename(root.name);
    return root.id;
  }
  const soleSource = only && only.clip.startBeat === 0 ? library.readContent(only.clip.phraseId) : undefined;
  const soleClock = soleSource ? readPhraseBody(soleSource.body) : undefined;
  const clockRate = soleClock && body.tempoMode === 'song' ? body.tempoBpm / soleClock.tempoBpm : 1;
  const bpm = body.gridTempoChanges?.length ? body.gridTempoBpm ?? body.tempoBpm
    : soleClock?.tempoSections?.length ? soleClock.tempoBpm * clockRate : body.tempoBpm;
  const parts: PhraseBody['parts'] = [];
  const midiExpression: NonNullable<PhraseBody['midiExpression']> = [];
  const groups = new Map<string, PhraseBody['parts'][number]>();
  const curvePositions: { part: PhraseBody['parts'][number]; kind: CurveKind; points: (Omit<PhraseGainPoint, 'beat'> & { seconds: number })[] }[] = [];
  let endSeconds = Math.max(16, body.lengthBeats) * 60 / body.tempoBpm;
  const solo = body.tracks.some(track => track.solo);
  for (const { track, clip } of clips) {
    const saved = library.readContent(clip.phraseId);
    if (!saved) throw new Error('工程缺少音符数据。');
    const source = readPhraseBody(saved.body);
    const sourceBpm = body.tempoMode === 'song' ? body.tempoBpm : source.tempoBpm;
    const start = clip.startBeat * 60 / body.tempoBpm;
    const sourceBeat = (beat: number) => start + phraseBeatSeconds(source, beat) * source.tempoBpm / sourceBpm;
    const local = localClocks(source);
    const localBeat = (sectionId: string, beat: number) => start + local(sectionId, beat) * source.tempoBpm / sourceBpm;
    for (const lane of source.midiExpression ?? []) midiExpression.push({ id: `${clip.id}:${lane.id}`,
      events: lane.events.map(event => ({ ...event, beat: sourceBeat(event.beat) })),
      hiddenEvents: lane.hiddenEvents?.map(({ sectionId, event }) => ({ sectionId: 'first',
        event: { ...event, beat: localBeat(sectionId, event.beat) } })) });
    const silent = track.muted || solo && !track.solo;
    for (const part of source.parts) {
      const key = JSON.stringify([part.timbreId, !!part.unassigned,part.level,part.pan,part.midiChannelId?`${clip.id}:${part.midiChannelId}`:undefined, part.gainCurve?.length || part.performanceCurves ? [clip.id, part.id] : undefined]);
      let target = groups.get(key);
      if (!target) { target = { ...part, id: crypto.randomUUID(), section: 'melody', ...(part.midiChannelId?{midiChannelId:`${clip.id}:${part.midiChannelId}`} : {}), notes: [], hiddenNotes: undefined }; groups.set(key, target); parts.push(target); }
      for (const kind of ['gain', ...PERFORMANCE_CURVES] as const) {
        const points = kind === 'gain' ? part.gainCurve : part.performanceCurves?.[kind];
        if (points?.length) curvePositions.push({ part: target, kind, points: points.map(({ beat, ...point }) => ({ ...point, seconds: sourceBeat(beat) })) });
      }
      function mixNote(note: PhraseNote, startBeat: number, durationBeats: number, heldSeconds: number): PhraseNote {
        return { ...note, ...(note.midiChannelId ? { midiChannelId: `${clip.id}:${note.midiChannelId}` } : {}), id: crypto.randomUUID(), startBeat, durationBeats,
          durationSeconds: note.durationSeconds ?? (heldSeconds >= MIN_NOTE_SECONDS && heldSeconds <= 96 ? heldSeconds : undefined),
          level: silent ? 0 : (note.level ?? 1) * (source.masterLevel ?? 1) * track.level * (clip.level ?? 1) * (body.masterLevel ?? 1),
          pan: Math.max(-1, Math.min(1, (note.pan ?? 0) + (clip.pan ?? track.pan) + (track.panOffset ?? 0))) };
      }
      for (const note of part.notes) {
        const startSeconds = sourceBeat(note.startBeat);
        const heldSeconds = note.durationSeconds ?? phraseHeldSeconds(source, note) * source.tempoBpm / sourceBpm;
        const end = sourceBeat(note.startBeat + note.durationBeats);
        endSeconds = Math.max(endSeconds, end, startSeconds + heldSeconds);
        const scale = bpm / 60;
        const mixed = mixNote(note, startSeconds * scale, (end - startSeconds) * scale, heldSeconds);
        target.notes.push(singleTempoNote(mixed, mixed.startBeat, end * scale, heldSeconds));
      }
      if (part.hiddenNotes?.length) {
        const scale = bpm / 60;
        target.hiddenNotes ??= [];
        for (const { sectionId, note } of part.hiddenNotes) {
          const startBeat = localBeat(sectionId, note.startBeat) * scale;
          const endBeat = localBeat(sectionId, note.startBeat + note.durationBeats) * scale;
          const mixed = mixNote(note, startBeat, endBeat - startBeat, note.durationSeconds!);
          target.hiddenNotes.push({ sectionId: 'first', note: singleTempoNote(mixed, startBeat, endBeat, note.durationSeconds!) });
        }
      }
    }
  }
  const beatsPerSecond = bpm / 60;
  const lengthBeats = endSeconds * beatsPerSecond;
  if (lengthBeats > MAX_PHRASE_BEATS) throw new Error('按开头 BPM 换算后超出当前音乐长度范围，原文件未改动。');
  for (const lane of midiExpression) {
    for (const event of lane.events) event.beat *= beatsPerSecond;
    for (const { event } of lane.hiddenEvents ?? []) event.beat *= beatsPerSecond;
  }
  for (const { part, kind, points } of curvePositions) {
    const remapped = points.map(({ seconds, ...point }) => ({ ...point, beat: seconds * beatsPerSecond }));
    if (kind === 'gain') part.gainCurve = remapped;
    else part.performanceCurves = { ...part.performanceCurves, [kind]: remapped };
  }
  const music = readPhraseBody({ model: 'note-phrase', version: 1, timeUnit: 'beat', tempoBpm: bpm,
    lengthBeats, parts, ...(midiExpression.length ? { midiExpression } : {}) });
  const draft = library.createDraft({ kind: 'rootsound.phrase', owner: 'phrase', schemaVersion: 1,
    projectRootId: root.id, name: root.name, dependencies: [...new Set(parts.map(part => part.timbreId))],
    body: music });
  score.openDraft(draft.id);
  return root.id;
}

/** Confirm the sole score into the working document; only the platform Save writes a file. */
export function commitMusicDocument(library: MaterialLibrary, song: SongEditorPort, score: PhraseEditorPort): void {
  const commit = () => commitScore(library, song, score);
  if (library.batchWrites) library.batchWrites(commit);
  else commit();
}

function commitScore(library: MaterialLibrary, song: SongEditorPort, score: PhraseEditorPort): void {
  const view = score.read({ includeCatalog: false, sharedDraft: true });
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
