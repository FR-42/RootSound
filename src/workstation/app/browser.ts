import { createMaterialLibrary, createMaterialCatalog, createReferenceEditing, createProjectPackages } from '../modules/materials/public.ts';
import { createBrowserSoundRuntime } from '../modules/sound-runtime/public.ts';
import { createTimbreEditor, createTimbrePlayback, createTimbreReferenceAdapter, createSpectralAudio } from '../modules/timbre/public.ts';
import { createPhraseEditor, createPhrasePlayback, createPhraseReferenceAdapter } from '../modules/phrase/public.ts';
import { createSongEditor, createSongPlayback, createSongReferenceAdapter } from '../modules/song/public.ts';
import { createCoCreationReferenceAdapter } from '../modules/co-creation/public.ts';
import { createPostProduction } from '../modules/post-production/public.ts';
import { createProjectAssets } from '../modules/project-assets/public.ts';
import { createSampling, createSampleAudio, createBrowserSampleDecoder, createBrowserSampleCapture, createSampleReferenceAdapter } from '../modules/sampling/public.ts';
import { createMelodyRecognition, createBrowserMelodyAnalyzer } from '../modules/melody-recognition/public.ts';
import { mountStudio, showMidiImportNotice } from '../modules/ui-rendering/public.ts';
import { createDesktopPlatform, isDesktopOrigin } from './platform/desktop.ts';
import { createBrowserSoundFiles, createBrowserAudioFiles, createBrowserProjectFiles } from './platform/browser-files.ts';
import { createWorkspacePreferences } from './platform/preferences.ts';
import { createBrowserSampleFiles } from './platform/sample-files.ts';
import { previewSavedSample } from './sample-preview.ts';
import { createProjectSetup, projectName } from './project-setup.ts';
import { beginProjectPhraseDraft, discardProjectPhraseDraft, assertProjectPhraseSaveReady, copyProjectPhrase, retainProjectPhrases, readProjectPhraseInfo, readProjectPhrases, renameProjectPhrase, deleteProjectPhrase } from './project-phrases.ts';
import { ensureProjectMelodyTimbres, listProjectTimbres, addProjectPhraseTimbre, createProjectPhraseNoteGroup, changeProjectPhraseNoteGroupTimbre, removeProjectPhraseTimbre, reorderProjectTimbres, tryRemoveUnusedProjectTimbre, requiresTimbreDeleteConfirmation } from './project-timbres.ts';
import type { ProjectDirectoriesPort } from '../contracts/project-directory.ts';
import { rememberMidiImportNotice, takeMidiImportNotice } from './platform/midi-notice.ts';
import { createBrowserTimbreFiles } from './platform/timbre-files.ts';
import { importProjectTimbre } from './project-timbre-import.ts';
import { readTimbreImport } from './timbre-file-import.ts';
import { createProjectClosePreparation } from './project-close.ts';

// Platform adapters share the same musical units and never silently switch stores.
const STORAGE_KEY = 'rootsound.workstation.materials.v1';
const root = document.getElementById('app')!;
const runtime = createBrowserSoundRuntime();
async function start(): Promise<void> {
try {
  const platform = isDesktopOrigin() ? createDesktopPlatform() : {
    storage: { read: () => localStorage.getItem(STORAGE_KEY), write: (value: string) => localStorage.setItem(STORAGE_KEY, value) },
    files: createBrowserSoundFiles(),
    audioFiles: createBrowserAudioFiles(),
    projectFiles: createBrowserProjectFiles(),
    sampleFiles: createBrowserSampleFiles(),
    timbreFiles: createBrowserTimbreFiles(),
  };
  const directories = 'projectDirectories' in platform ? platform.projectDirectories as ProjectDirectoriesPort | undefined : undefined;
  const directoryState = await directories?.read();
  const previous = platform.storage.read();
  const contentAdapters = [createTimbreReferenceAdapter(), createPhraseReferenceAdapter(), createSongReferenceAdapter(), createCoCreationReferenceAdapter(), createSampleReferenceAdapter()];
  const library = createMaterialLibrary(platform.storage, { project: { rootKind: 'rootsound.song', adapters: contentAdapters } });
  const decoder = createBrowserSampleDecoder();
  const sampleAudio = createSampleAudio(library, decoder);
  const spectralAudio = createSpectralAudio();
  const timbre = createTimbreEditor(library, sampleAudio, spectralAudio);
  const timbrePlayback = createTimbrePlayback(library, sampleAudio, spectralAudio);
  const phrasePlayback = createPhrasePlayback(library, timbrePlayback);
  const phrase = createPhraseEditor(library, timbrePlayback);
  const postProduction = createPostProduction();
  const song = createSongEditor(library, phrasePlayback, { defaultTempoMode: 'source', postProduction, initialTrackCount: 7 });
  const songPlayback = createSongPlayback(library, phrasePlayback, postProduction);
  const sampling = createSampling(library, { files: platform.sampleFiles, decoder, capture: createBrowserSampleCapture() });
  const recognition = createMelodyRecognition(library, { analyzer: createBrowserMelodyAnalyzer(), currentSourceToken() {
    const source = sampling.read(); return source.phase === 'idle' ? source.audioToken : undefined;
  } });
  const references = createReferenceEditing(library, contentAdapters);
  const projects = createProjectPackages(library, contentAdapters, { rootKind: 'rootsound.song' });
  const preferences = createWorkspacePreferences({ getItem: key => localStorage.getItem(key), setItem: (key, value) => localStorage.setItem(key, value) });
  // Creating dormant editors can add their initial drafts. Finish this one-time
  // loading phase before the user can edit; subsequent reloads cannot clear dirty state.
  if (directoryState?.current) {
    if (song.read().body?.tempoMode === 'song') song.setTempoMode('source');
    await directories?.finishLoading?.();
  }
  const studio = mountStudio(root, { timbre, phrase, song, sampling, recognition, references,
    projectName: directoryState?.current?.name,
    doubleClickIntervalMs: directoryState?.doubleClickIntervalMs,
    projectSetup: directories ? createProjectSetup(directories, notice => {
      runtime.stopAll();
      if (notice) {
        let stored = false;
        try { stored = rememberMidiImportNotice(sessionStorage, notice); } catch { /* Status storage may be blocked independently of the project file. */ }
        if (!stored && notice.warnings.length) alert(`MIDI 已导入\n${notice.warnings.join('\n')}`);
      }
      location.reload();
    }, {
      read() { const text = platform.storage.read(); if (text === null) throw new Error('当前没有可以另存的项目。'); return text; },
      songDraftId() { const id = song.read().draft?.id; if (!id) throw new Error('当前没有打开的歌曲。'); return id; },
      name() { return song.read().draft?.name ?? directoryState?.current?.name ?? '我的歌曲'; },
      async prepareSave() {
        await studio.prepareClose({ allowProjectDialog: true });
        const id = song.read().draft?.id; if (!id) throw new Error('当前没有打开的歌曲。');
        assertProjectPhraseSaveReady(library, id);
      },
    }) : undefined,
    onNewPhrase(timbreId, tempoBpm) {
      const id = song.read().draft?.id; if (!id) throw new Error('先创建或打开一个歌曲项目。');
      phrase.openDraft(beginProjectPhraseDraft(library, id, timbreId, tempoBpm).draftId);
    },
    onSavePhraseDraft: (id, mode) => library.saveDraft(id, mode),
    onDiscardPhraseDraft(id) {
      const songId = song.read().draft?.id; if (!songId) throw new Error('当前没有打开的歌曲。');
      discardProjectPhraseDraft(library, songId, id);
    },
    onCopyPhrase() {
      const songId = song.read().draft?.id; const draftId = phrase.read().draft?.id;
      if (!songId || !draftId) throw new Error('先打开一个歌曲和乐句。');
      phrase.openDraft(copyProjectPhrase(library, songId, draftId).draftId);
    },
    async onPrepareMelody() {
      const songId = song.read().draft?.id; if (!songId) throw new Error('先打开一首歌曲。');
      ensureProjectMelodyTimbres(library, songId);
      await platform.timbreFiles.sync?.(songId);
    },
    projectTimbres() {
      const songId = song.read().draft?.id;
      if (!songId) return [];
      const workingDrafts = library.listDrafts();
      return listProjectTimbres(library, songId).map(record => ({ id: record.id, name: record.name, requiresDeleteConfirmation: requiresTimbreDeleteConfirmation(record, workingDrafts) }));
    },
    async onImportTimbre() {
      const songId = song.read().draft?.id;
      if (!songId) throw new Error('先打开一首歌曲，再导入音色。');
      await platform.timbreFiles.sync?.(songId);
      const opened = await platform.timbreFiles.open(); if (opened.status === 'cancelled') return false;
      if (song.read().draft?.id !== songId) throw new Error('歌曲已切换，这次没有导入音色，请在当前歌曲中重新选择。');
      const imported = readTimbreImport(opened.text, opened.name);
      importProjectTimbre(library, songId, imported.timbre, imported.dependencies);
      const mirrored = await platform.timbreFiles.sync?.(songId);
      if (mirrored?.status === 'warning') throw new Error(`音色已加入本曲并保存在工程中，但目录副本暂未写入：${mirrored.message}。请检查目录权限后重试保存。`);
      return true;
    },
    onAddPhraseTimbre(id, section) {
      const songId = song.read().draft?.id; const draftId = phrase.read().draft?.id;
      if (!songId || !draftId) throw new Error('先打开一个歌曲和乐句。');
      return addProjectPhraseTimbre(library, songId, draftId, id, section);
    },
    onCreateNoteGroup(id) {
      const songId = song.read().draft?.id; const draftId = phrase.read().draft?.id;
      if (!songId || !draftId) throw new Error('先打开一个歌曲和乐句。');
      return createProjectPhraseNoteGroup(library, songId, draftId, id);
    },
    onChangeNoteGroupTimbre(partId, timbreId) {
      const songId = song.read().draft?.id; const draftId = phrase.read().draft?.id;
      if (!songId || !draftId) throw new Error('先打开一个歌曲和乐句。');
      changeProjectPhraseNoteGroupTimbre(library, songId, draftId, partId, timbreId);
    },
    onRemovePhraseTimbre(id, section) {
      const songId = song.read().draft?.id; const draftId = phrase.read().draft?.id;
      if (!songId || !draftId) throw new Error('先打开一个歌曲和乐句。');
      if (tryRemoveUnusedProjectTimbre(library, songId, id)) {
        try { timbre.read(); }
        catch {
          const remaining = listProjectTimbres(library, songId);
          if (remaining.length) timbre.open(remaining[0]!.id); else timbre.create();
        }
      } else removeProjectPhraseTimbre(library, songId, draftId, id, section);
    },
    onReorderTimbres(id, targetIndex) {
      const songId = song.read().draft?.id; if (!songId) throw new Error('先打开一首歌曲。');
      reorderProjectTimbres(library, songId, id, targetIndex);
    },
    onKeepPhrases(ids) {
      const id = song.read().draft?.id; if (!id) throw new Error('当前没有打开的歌曲。');
      retainProjectPhrases(library, id, ids);
    },
    phraseInfo(id) {
      const songId = song.read().draft?.id; if (!songId) throw new Error('先打开一个歌曲项目。');
      return readProjectPhraseInfo(library, songId, id);
    },
    projectPhrases() {
      const songId = song.read().draft?.id; if (!songId) return [];
      return readProjectPhrases(library, songId);
    },
    onDeletePhrase(id) {
      const songId = song.read().draft?.id; if (!songId) throw new Error('当前没有打开的歌曲。');
      deleteProjectPhrase(library, songId, id);
    },
    onRenamePhrase(id, name, ref) {
      const songId = song.read().draft?.id; if (!songId) throw new Error('先打开一个歌曲项目。');
      return renameProjectPhrase(library, songId, id, name, ref);
    },
    onRenameProject(name) { song.rename(projectName(name)); },
    initialEntry: directoryState ? directoryState.current ? 'song' : 'welcome' : undefined,
    catalog: createMaterialCatalog(library, { currentProject: () => song.read().draft }), preferences,
    entities: createProjectAssets(library, () => song.read().draft),
    sound: runtime, hasPrevious: previous !== null, files: platform.files, audioFiles: platform.audioFiles,
    projects, projectFiles: platform.projectFiles,
    async previewContent(contentId, signal) {
      if (signal?.aborted) throw new Error('这次试听已取消。');
      const content = library.readContentInfo(contentId);
      if (!content) throw new Error('找不到要试听的素材。');
      if (content.kind === 'rootsound.sample') return previewSavedSample(sampling, runtime, contentId, signal);
      if (content.kind === 'rootsound.timbre') await timbrePlayback.prepareForSaved(contentId, [{ frequencyHz: 220, holdSeconds: 1, velocity: .7 }]);
      else if (content.kind === 'rootsound.phrase') await phrasePlayback.prepareForSaved(contentId);
      else if (content.kind === 'rootsound.song') await songPlayback.prepareForSaved(contentId);
      if (signal?.aborted) throw new Error('这次试听已取消。');
      if (library.readContentInfo(contentId)?.revision !== content.revision) throw new Error('这份素材刚刚改变，请重新试听。');
      const plan = content.kind === 'rootsound.timbre' ? timbrePlayback.planForSaved(contentId, { frequencyHz: 220, holdSeconds: 1, velocity: 0.7 })
        : content.kind === 'rootsound.phrase' ? phrasePlayback.planForSaved(contentId)
          : content.kind === 'rootsound.song' ? songPlayback.planForSaved(contentId) : undefined;
      if (!plan) throw new Error('当前版本尚不能试听这类素材，原内容已保留。');
      return runtime.preview(plan);
    },
  });
  const closeHost = globalThis as typeof globalThis & { __rootSoundPrepareClose?: () => Promise<{ ready: boolean; name?: string; canSave?: boolean; saveMessage?: string }> };
  const prepareClose = createProjectClosePreparation({
    flush: () => studio.prepareClose(),
    assertSaveReady() {
      const id = song.read().draft?.id;
      if (id) assertProjectPhraseSaveReady(library, id);
    },
    name: () => song.read().draft?.name,
  });
  closeHost.__rootSoundPrepareClose = prepareClose;
  let importNotice: ReturnType<typeof showMidiImportNotice> | undefined;
  try {
    const imported = takeMidiImportNotice(sessionStorage, directoryState?.current?.id);
    if (imported) importNotice = showMidiImportNotice(root, imported);
  } catch { /* A missing one-shot status never prevents opening the saved project. */ }
  window.addEventListener('pagehide', event => {
    if (event.persisted) { recognition.cancel(); sampling.leave(); runtime.stopAll(); return; }
    if (closeHost.__rootSoundPrepareClose === prepareClose) delete closeHost.__rootSoundPrepareClose;
    importNotice?.dispose(); recognition.dispose(); sampling.dispose(); studio.dispose(); void runtime.dispose();
  });
} catch (error) {
  const message = document.createElement('main'); message.className = 'startup-error';
  const title = document.createElement('h1'); title.textContent = '暂时无法打开你的声音';
  const explanation = document.createElement('p'); explanation.textContent = error instanceof Error ? error.message : String(error);
  const detail = document.createElement('p'); detail.textContent = '原有保存数据已保留。请保留此窗口中的错误信息，解决后重新打开。';
  message.append(title, explanation, detail); root.replaceChildren(message);
  void runtime.dispose();
}
}
void start();
