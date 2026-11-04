import { createMaterialLibrary, createProjectPackages } from '../modules/materials/public.ts';
import { createTimbrePlayback, createTimbreReferenceAdapter } from '../modules/timbre/public.ts';
import { createSampleBankAudio } from '../modules/timbre/sample-bank.ts';
import { defaultInstrumentInfo } from '../modules/timbre/instrument-catalog.ts';
import { createPhraseEditor, createPhrasePlayback, createPhraseReferenceAdapter } from '../modules/phrase/public.ts';
import { createSongEditor, createSongReferenceAdapter } from '../modules/song/public.ts';
import { createSampleReferenceAdapter, createSampleAudio, createBrowserSampleDecoder } from '../modules/sampling/public.ts';
import { createInitialProjectLibrary, projectName } from './project-setup.ts';
import { openMusicDocument, commitMusicDocument } from './music-document.ts';
import { ensureProjectMelodyTimbres, listProjectTimbres, createProjectPhraseNoteGroup, changeProjectPhraseNoteGroupTimbre } from './project-timbres.ts';
import type { PhraseBody } from '../contracts/phrase.ts';
import { phraseBeatSeconds, phraseHeldSeconds } from '../contracts/phrase-time.ts';

export const WEB_TONES = ['piano', 'flute', 'string-ensemble', 'electric-bass', 'bell-pluck', 'acoustic-kick', 'snare', 'closed-hat'] as const;
export const WEB_MAX_BEATS = 64;
export const WEB_MAX_NOTES = 2048;
export const WEB_MAX_FILE_BYTES = 16 * 1024 * 1024;

export function checkWebScore(body: PhraseBody): void {
  const beatLimit = Math.min(WEB_MAX_BEATS, 16 * (body.beatsPerBar ?? 4));
  if (body.lengthBeats > beatLimit + 1e-8) throw new Error('网页版最多支持 16 小节（4/4 下为 64 拍）。请在桌面版打开更长的音乐。');
  if (body.parts.length > 16) throw new Error('网页版最多支持 16 个音符组，请在桌面版继续编辑。');
  if (body.parts.reduce((n, part) => n + part.notes.length + (part.hiddenNotes?.length ?? 0), 0) > WEB_MAX_NOTES) throw new Error('网页版最多支持 2048 个音符，请在桌面版继续编辑。');
  if (body.parts.some(part => part.notes.some(note => note.startBeat + note.durationBeats > beatLimit + 1e-8)))
    throw new Error('部分音符超出网页版的 16 小节范围，请在桌面版打开。');
  const end = phraseBeatSeconds(body, beatLimit);
  if (body.parts.some(part => part.notes.some(note => phraseBeatSeconds(body, note.startBeat) + phraseHeldSeconds(body, note) > end + 1e-8)))
    throw new Error('音符的持续时间超出网页版的 16 小节范围。');
}

/** A new isolated memory store per document. No draft is saved to browser storage. */
export function createWebDemoModel(input?: string, fallbackName = '我的音乐', fetcher: typeof fetch = globalThis.fetch) {
  let text: string | null = input ?? createInitialProjectLibrary(fallbackName);
  let workspaceId = crypto.randomUUID();
  let portable: string | undefined;
  if (input) {
    const envelope = JSON.parse(input);
    if (envelope.format === 'RootSoundWorkspace') {
      if (envelope.version !== 2 || typeof envelope.libraryText !== 'string') throw new Error('这份工程使用了网页版暂不支持的素材封装，请在桌面版打开。');
      text = envelope.libraryText;
      if (typeof envelope.id === 'string' && /^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i.test(envelope.id)) workspaceId = envelope.id;
    } else if (envelope.format === 'RootSoundProject') { portable = input; text = null; }
    else if (envelope.format !== 'RootSoundMaterialLibrary') throw new Error('请选择简乐工程或 MIDI 文件。');
  }
  let enforceLimits = false;
  let onEdit: (() => void) | undefined;
  const adapters = [createTimbreReferenceAdapter(), createPhraseReferenceAdapter(), createSongReferenceAdapter(), createSampleReferenceAdapter()];
  const library = createMaterialLibrary({ read: () => text, write(value) {
    if (enforceLimits) {
      const candidate = JSON.parse(value);
      for (const draft of candidate.drafts) if (draft.kind === 'rootsound.phrase') checkWebScore(draft.body);
    }
    text = value;
    if (enforceLimits) onEdit?.();
  } }, { project: { rootKind: 'rootsound.song', adapters } });
  let importedId: string | undefined;
  if (portable) {
    const imported = createProjectPackages(library, adapters, { rootKind: 'rootsound.song' }).importProject(portable);
    if (imported.status !== 'imported') throw new Error(imported.status === 'storage-error' ? imported.message : imported.reason);
    importedId = imported.draft.id;
  }
  const samples = createSampleAudio(library, createBrowserSampleDecoder());
  const bank = createSampleBankAudio(library, samples, fetcher);
  const tones = createTimbrePlayback(library, samples, undefined, bank);
  const score = createPhraseEditor(library, tones);
  const song = createSongEditor(library, createPhrasePlayback(library, tones), { defaultTempoMode: 'source', initialTrackCount: 1 });
  if (importedId) song.openDraft(importedId);
  if (!song.read().draft) throw new Error('工程没有可编辑的音乐。');
  openMusicDocument(library, song, score);
  checkWebScore(score.read().body!);
  const projectId = song.read().draft!.id;
  ensureProjectMelodyTimbres(library, projectId);
  const palette = listProjectTimbres(library, projectId).flatMap(record => {
    const info = defaultInstrumentInfo(record.id, record.body);
    return info && WEB_TONES.includes(info.key as typeof WEB_TONES[number]) ? [{ id: record.id, name: record.name, key: info.key }] : [];
  }).sort((a, b) => WEB_TONES.indexOf(a.key as typeof WEB_TONES[number]) - WEB_TONES.indexOf(b.key as typeof WEB_TONES[number]));
  const uniquePalette = palette.filter((tone, index) => palette.findIndex(item => item.key === tone.key) === index);
  let replaced = 0;
  for (const part of score.read().body!.parts) {
    const original = library.readContent(part.timbreId);
    const info = defaultInstrumentInfo(part.timbreId, original?.body);
    const available = uniquePalette.find(tone => tone.key === info?.key);
    if (available?.id === part.timbreId || part.unassigned) continue;
    const fallback = info?.category === '弦乐' || info?.category === '人声' ? 'string-ensemble'
      : info?.category === '低音' ? 'electric-bass' : info?.category === '木管' || info?.category === '铜管' ? 'flute'
      : info && 'drum' in info ? info.drum! >= 42 ? 'closed-hat' : info.drum! >= 38 ? 'snare' : 'acoustic-kick' : 'piano';
    const replacement = available ?? uniquePalette.find(tone => tone.key === fallback)!;
    changeProjectPhraseNoteGroupTimbre(library, projectId, score.read().draft!.id, part.id, replacement.id);
    if (!available) replaced++;
  }
  if (!input) score.addPart(uniquePalette[0]!.id);
  enforceLimits = true;
  return {
    library, score, song, bank, palette: uniquePalette, replaced,
    subscribeEdit(listener: () => void) { onEdit = listener; },
    addGroup(id: string) {
      if (!uniquePalette.some(tone => tone.id === id)) throw new Error('请选择网页版音色库里的音色。');
      return createProjectPhraseNoteGroup(library, projectId, score.read().draft!.id, id);
    },
    changeTone(partId: string, id: string) {
      if (!uniquePalette.some(tone => tone.id === id)) throw new Error('请选择网页版音色库里的音色。');
      changeProjectPhraseNoteGroupTimbre(library, projectId, score.read().draft!.id, partId, id);
    },
    rename(name: string) { const value = projectName(name); score.rename(value); song.rename(value); },
    async save() {
      const used = score.read().body!.parts.filter(part => !part.unassigned).map(part => part.timbreId);
      await bank.materialize(used);
      commitMusicDocument(library, song, score);
      const clean = JSON.parse(text!);
      delete clean.editHistory; delete clean.transactionHistory;
      return JSON.stringify({ format: 'RootSoundWorkspace', version: 2, id: workspaceId,
        name: score.read().draft!.name, createdAtUtc: new Date().toISOString(), libraryText: JSON.stringify(clean) });
    },
  };
}
