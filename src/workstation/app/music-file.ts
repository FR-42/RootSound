import type { ContentRecord, Draft, MaterialLibrary } from '../contracts/content.ts';
import type { EditableFileFormat } from '../contracts/project-directory.ts';
import type { PhraseBody } from '../contracts/phrase.ts';
import { phraseBarBeats, phraseBeatSeconds, phraseHeldSeconds, phraseSecondsBeat } from '../contracts/phrase-time.ts';
import { MAX_PHRASE_BEATS } from '../contracts/phrase-limits.ts';
import { MIN_TEMPO_BPM, MAX_TEMPO_BPM } from '../contracts/music-limits.ts';
import { createMaterialLibrary, createProjectPackages } from '../modules/materials/public.ts';
import { createTimbrePlayback, createTimbreReferenceAdapter, defaultInstrumentInfo } from '../modules/timbre/public.ts';
import { createPhraseEditor, createPhrasePlayback, createPhraseReferenceAdapter, readPhraseBody } from '../modules/phrase/public.ts';
import { createSongEditor, createSongReferenceAdapter, readSongBody } from '../modules/song/public.ts';
import { createSampleReferenceAdapter } from '../modules/sampling/public.ts';
import { studioBank, studioInstrumentForMidi } from '../modules/timbre/instrument-catalog.ts';
import generalMidi from '../modules/timbre/general-midi.json' with { type: 'json' };
import { openMusicDocument, commitMusicDocument } from './music-document.ts';
import { readExchangeMidi, writeExchangeMidi, createMidiPatcher } from './music-interchange-midi.ts';
import { readExchangeXml, writeExchangeXml } from './music-interchange-xml.ts';
import { exchangeSignature, type ExchangeScore } from './music-interchange-model.ts';
export { musicFileFormat } from './music-interchange-model.ts';

const adapters = () => [createTimbreReferenceAdapter(), createPhraseReferenceAdapter(), createSongReferenceAdapter(), createSampleReferenceAdapter()];
const decoder = () => new TextDecoder('utf-8', { fatal: true });
function memory(text: string | null = null) {
  let snapshot = text;
  const library = createMaterialLibrary({ read: () => snapshot, write: value => { snapshot = value; } },
    { project: { rootKind: 'rootsound.song', adapters: adapters() } });
  return { library, text: () => { if (!snapshot) throw new Error('没有可编辑的音乐。'); return snapshot; } };
}
function libraryFromScore(score: ExchangeScore): string {
  if (score.length > MAX_PHRASE_BEATS) throw new Error(`音乐超过当前 ${MAX_PHRASE_BEATS} 拍范围，源文件未改动。`);
  if (score.tempos.some(point => point.bpm < MIN_TEMPO_BPM || point.bpm > MAX_TEMPO_BPM)) throw new Error(`这份音乐的速度超出当前 ${MIN_TEMPO_BPM}～${MAX_TEMPO_BPM} BPM 编辑范围，源文件未改动。`);
  const palette = new Map<string, ContentRecord>(), names = new Set<string>();
  const parts = score.parts.map((part, index) => {
    const key = part.drum === undefined ? `gm-${part.program}` : `gm-drum-${part.drum}`;
    let tone = palette.get(key);
    if (!tone) {
      const proposed = part.drum === undefined ? generalMidi.programs[part.program]! : (generalMidi.drums as Record<number, string>)[part.drum] ?? `鼓 ${part.drum}`;
      let name = proposed, suffix = 2; while (names.has(name)) name = `${proposed} ${suffix++}`; names.add(name);
      tone = { id: crypto.randomUUID(), kind: 'rootsound.timbre', owner: 'timbre', schemaVersion: 1, revision: 1,
        name, dependencies: [], body: { model: 'sample-bank', version: 1, bank: studioBank, instrument: studioInstrumentForMidi(part.program, part.drum).key,
          attackSeconds: 0, releaseSeconds: .03, level: .7, ...(part.drum === undefined ? { midiProgram: part.program } : { midiDrum: part.drum }) } };
      palette.set(key, tone);
    }
    return { id: crypto.randomUUID(), name: `${part.name || '声部'} ${index + 1}`, timbreId: tone.id, section: 'melody' as const,
      ...(part.midiChannelId ? { midiChannelId: part.midiChannelId } : {}),
      notes: part.notes.map(note => ({ id: crypto.randomUUID(), startBeat: note.beat, durationBeats: note.duration,
        frequencyHz: 440 * 2 ** (((part.drum ?? note.pitch) - 69) / 12), velocity: note.velocity, level: note.level, pan: note.pan,
        ...(note.midiOnOrder === undefined ? {} : { midiOnOrder: note.midiOnOrder }), ...(note.midiOffOrder === undefined ? {} : { midiOffOrder: note.midiOffOrder }) })) };
  });
  const first = score.tempos[0]?.bpm ?? 120;
  const meter = score.meter ? { beatsPerBar: score.meter.numerator, beatUnit: score.meter.denominator } : {};
  const bar = phraseBarBeats(meter);
  const body = readPhraseBody({ model: 'note-phrase', version: 1, timeUnit: 'beat', tempoBpm: first,
    lengthBeats: Math.max(.25, score.length), stepsPerBeat: 4, ...meter, ...(score.midiExpression?.length ? { midiExpression: score.midiExpression } : {}),
    tempoSections: score.tempos.filter(point => point.beat > 0 && point.beat < score.length).map(point => {
      const offset = point.beat % bar;
      return { id: crypto.randomUUID(), startBeat: point.beat, tempoBpm: point.bpm, ...(offset > 1e-8 && bar - offset > 1e-8 ? { gridOffsetBeats: offset } : {}) };
    }), parts });
  const phrase: ContentRecord = { id: crypto.randomUUID(), kind: 'rootsound.phrase', owner: 'phrase', schemaVersion: 1,
    revision: 1, name: score.name, dependencies: [...palette.values()].map(tone => tone.id), body };
  const song: Draft = { id: crypto.randomUUID(), kind: 'rootsound.song', owner: 'song', schemaVersion: 1, name: score.name,
    dependencies: [phrase.id], body: readSongBody({ model: 'phrase-arrangement', version: 1, timeUnit: 'beat', tempoBpm: first,
      tempoMode: 'source', lengthBeats: Math.max(16, score.length), tracks: [{ id: crypto.randomUUID(), name: '音乐', level: 1, pan: 0,
        muted: false, solo: false, clips: [{ id: crypto.randomUUID(), phraseId: phrase.id, startBeat: 0 }] }] }) };
  const stored = memory(), contents = [...palette.values(), phrase];
  const result = stored.library.commitTransaction({ expectedToken: stored.library.currentToken(), label: '打开音乐文件',
    createContents: contents, createDrafts: [song], projectMembers: [{ rootId: song.id, contentIds: contents.map(item => item.id) }] });
  if (result.status !== 'committed') throw new Error(result.status === 'storage-error' ? result.message : result.reason);
  return stored.text();
}
export function readMusicFile(bytes: Uint8Array, fileName: string, format: EditableFileFormat) {
  const name = fileName.replace(/\.[^.]+$/u, '').slice(0, 80) || '我的音乐';
  if (format === 'rsproject') {
    const stored = memory(), imported = createProjectPackages(stored.library, adapters(), { rootKind: 'rootsound.song' }).importProject(decoder().decode(bytes));
    if (imported.status !== 'imported') throw new Error(imported.status === 'storage-error' ? imported.message : imported.reason);
    return { libraryText: stored.text(), warnings: [], trackCount: 0, noteCount: 0 };
  }
  const imported = format === 'midi' ? readExchangeMidi(bytes, name) : readExchangeXml(bytes, name, format === 'mxl');
  return { libraryText: libraryFromScore(imported.score), warnings: imported.warnings,
    trackCount: imported.score.parts.length, noteCount: imported.score.parts.reduce((sum, part) => sum + part.notes.length, 0) };
}

export function scoreForFile(library: MaterialLibrary, body: PhraseBody, name: string): { score: ExchangeScore; warnings: string[] } {
  const warnings = new Set<string>();
  const exportParts = body.parts.flatMap(part => {
    const groups = new Map<string | undefined, typeof part.notes>();
    for (const note of part.notes) {
      const channel = note.midiChannelId === undefined ? part.midiChannelId : note.midiChannelId ?? undefined;
      const notes = groups.get(channel) ?? []; notes.push(note); groups.set(channel, notes);
    }
    if (!groups.size) groups.set(part.midiChannelId, []);
    return [...groups].map(([midiChannelId, notes], index) => ({ ...part, id: index ? `${part.id}:lane:${index}` : part.id, midiChannelId, notes }));
  });
  const parts = exportParts.filter(part => !part.unassigned).map(part => {
    const record = library.readContent(part.timbreId), info = record && defaultInstrumentInfo(record.id, record.body);
    if (!info) warnings.add('原格式不能携带自定义音色采样；这些音符将使用 GM 钢琴。另存为 .rootsound 可保留实际音色。');
    const voice = record?.body;
    const source = voice && typeof voice === 'object' && !Array.isArray(voice) ? voice : undefined;
    const drum = typeof source?.midiDrum === 'number' ? source.midiDrum : info?.drum;
    if (info && voice && typeof voice === 'object' && !Array.isArray(voice) && voice.bank === 'rootsound-studio-v1')
      warnings.add('原格式只记录对应的 GM 编号，不能携带录音音色。另存为 .rootsound 可保留音色选择。');
    else if (info && voice && typeof voice === 'object' && !Array.isArray(voice)
      && (voice.model !== 'sample-bank' || voice.attackSeconds !== 0 || voice.releaseSeconds !== .03 || voice.level !== .7
        || (voice.tuningSemitones ?? 0) !== (drum === undefined ? 0 : 60 - drum)))
      warnings.add('原格式只记录 GM 乐器编号，不能保留自定义音色的包络和调音设置；另存为 .rootsound 可完整保留。');
    if (part.hiddenNotes?.length) warnings.add('隐藏音符只保存在 .rootsound 工程中；原格式只写入当前可播放的音符。');
    return { id: part.id, name: part.name, program: typeof source?.midiProgram === 'number' ? source.midiProgram : info?.program ?? 0, ...(drum === undefined ? {} : { drum }),
      ...(part.midiChannelId ? { midiChannelId: part.midiChannelId } : {}),
      notes: part.notes.map(note => ({ id: note.id, beat: note.startBeat,
        duration: phraseSecondsBeat(body, phraseBeatSeconds(body, note.startBeat) + phraseHeldSeconds(body, note)) - note.startBeat,
        pitch: drum ?? 69 + 12 * Math.log2(note.frequencyHz / 440), velocity: note.velocity,
        level: (note.level ?? 1) * (body.masterLevel ?? 1) * (part.level ?? 1), pan: Math.max(-1, Math.min(1, (note.pan ?? 0) + (part.pan ?? 0))),
        ...(note.midiOnOrder === undefined ? {} : { midiOnOrder: note.midiOnOrder }), ...(note.midiOffOrder === undefined ? {} : { midiOffOrder: note.midiOffOrder }) })) };
  });
  if (body.parts.some(part => part.unassigned && part.notes.length)) warnings.add('未定义音色的静默音符不写入原格式；.rootsound 可以保留。');
  const numerator = body.beatsPerBar ?? 4, denominator = body.beatUnit ?? 4;
  const meter = numerator !== 4 || denominator !== 4 ? { numerator, denominator } : undefined;
  return { score: { name, length: body.lengthBeats, ...(meter ? { meter } : {}), ...(body.midiExpression?.length ? { midiExpression: structuredClone(body.midiExpression) } : {}), tempos: [{ beat: 0, bpm: body.tempoBpm },
    ...(body.tempoSections ?? []).map(point => ({ beat: point.startBeat, bpm: point.tempoBpm }))], parts }, warnings: [...warnings] };
}

/** Keeps exact source bytes for an unchanged document; conversion is performed only on Save. */
export function createMusicFileSession(format: EditableFileFormat, bytes: Uint8Array, library: MaterialLibrary, body: PhraseBody, name: string, savedLibraryText?: string) {
  if (savedLibraryText) {
    const saved = memory(savedLibraryText), tones = createTimbrePlayback(saved.library);
    const song = createSongEditor(saved.library, createPhrasePlayback(saved.library, tones), { defaultTempoMode: 'source' });
    const score = createPhraseEditor(saved.library, tones); openMusicDocument(saved.library, song, score);
    library = saved.library; body = score.read().body!; name = score.read().draft!.name;
  }
  const initial = scoreForFile(library, body, name).score, baseline = exchangeSignature(initial);
  const richSignature = (library: MaterialLibrary, body: PhraseBody, name: string) => JSON.stringify([name, body,
    (format === 'rsproject' ? library.listContentInfo().filter(item => item.kind === 'rootsound.timbre').map(item => item.id) : body.parts.map(part => part.timbreId))
      .map(id => { const content = library.readContent(id); return [content?.name, content?.body]; })]);
  const nativeBaseline = richSignature(library, body, name);
  const grid = (body: PhraseBody) => JSON.stringify([body.stepsPerBeat, body.tempoSections?.map(point => point.stepsPerBeat)]);
  const baselineGrid = grid(body);
  const gridOffsets = (body: PhraseBody) => JSON.stringify(body.tempoSections?.map(point => point.gridOffsetBeats) ?? []);
  const baselineGridOffsets = gridOffsets(body);
  const patchMidi = format === 'midi' ? createMidiPatcher(bytes, initial) : undefined;
  return { format, serialize(library: MaterialLibrary, body: PhraseBody, name: string, libraryText: string): { bytes: Uint8Array; warnings: string[] } {
    const current = scoreForFile(library, body, name);
    if (exchangeSignature(current.score) === baseline && richSignature(library, body, name) === nativeBaseline) return { bytes: bytes.slice(), warnings: [] };
    if (format === 'rsproject') {
      const stored = memory(libraryText), tones = createTimbrePlayback(stored.library);
      const song = createSongEditor(stored.library, createPhrasePlayback(stored.library, tones), { defaultTempoMode: 'source' });
      const score = createPhraseEditor(stored.library, tones); openMusicDocument(stored.library, song, score); commitMusicDocument(stored.library, song, score);
      const drafts = stored.library.listDrafts().filter(draft => draft.kind === 'rootsound.phrase');
      const result = stored.library.commitTransaction({ expectedToken: stored.library.currentToken(), label: '准备工程导出', deleteDrafts: drafts });
      if (result.status !== 'committed') throw new Error(result.status === 'storage-error' ? result.message : result.reason);
      return { bytes: new TextEncoder().encode(createProjectPackages(stored.library, adapters(), { rootKind: 'rootsound.song' }).exportDraft(song.read().draft!.id).text), warnings: [] };
    }
    if (grid(body) !== baselineGrid) current.warnings.push('每拍细分属于简乐的编辑设置，不写入这种通用格式。音符的位置与长度会保留。');
    if (body.parts.some(part => part.gainCurve?.length)) current.warnings.push('这种格式无法保留音色卡的音量增益曲线。另存为 .rootsound 可以保留。');
    if (body.parts.some(part => part.performanceCurves)) current.warnings.push('另存为 .rootsound 可保留音高、力度和踏板曲线。');
    if (body.tempoSections?.some(point => point.gridOffsetBeats) && gridOffsets(body) !== baselineGridOffsets)
      current.warnings.push('这种通用格式无法保留卷帘分界处的半拍网格。另存为 .rootsound 可以保留。');
    if (format === 'midi') {
      const result = patchMidi?.(current.score) ?? writeExchangeMidi(current.score, bytes);
      return { bytes: result.bytes, warnings: [...new Set([...current.warnings, ...result.warnings])] };
    }
    return { bytes: writeExchangeXml(current.score, format === 'mxl'), warnings: [...current.warnings,
      ...(body.midiExpression?.length?['MusicXML 写回尚不包含 MIDI 踏板、弯音及连续表情；另存为 .rootsound 可以完整保留。']:[]),
      'MusicXML 将保存当前音符、乐器和速度；原谱的排版、反复、歌词及演奏法记号会重新生成或省略。需要保留原谱时，请取消并另存为 .rootsound。'] };
  } };
}
