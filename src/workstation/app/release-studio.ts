import { createMaterialLibrary } from '../modules/materials/public.ts';
import { createBrowserSoundRuntime } from '../modules/sound-runtime/public.ts';
import { createTimbrePlayback, createTimbreReferenceAdapter, createSpectralAudio } from '../modules/timbre/public.ts';
import { createSampleBankAudio } from '../modules/timbre/sample-bank.ts';
import { createPhraseEditor, createPhrasePlayback, createPhraseReferenceAdapter } from '../modules/phrase/public.ts';
import { createSongEditor, createSongReferenceAdapter } from '../modules/song/public.ts';
import { createSampleAudio, createBrowserSampleDecoder, createSampleReferenceAdapter } from '../modules/sampling/public.ts';
import { mountStudio, confirmFormatSave } from '../modules/ui-rendering/public.ts';
import type { MaterialStorage } from '../contracts/content.ts';
import type { AudioFilesPort } from '../contracts/files.ts';
import type { ProjectDirectoriesPort } from '../contracts/project-directory.ts';
import type { SamplePayloadPort } from '../contracts/sampling.ts';
import type { TimbreFilesPort } from '../contracts/timbre-files.ts';
import { createWorkspacePreferences } from './platform/preferences.ts';
import { createMusicGuideDocument } from './music-guide-document.ts';
import { createLearningSettings } from './platform/learning-settings.ts';
import { createMusicWorkspaceState } from './platform/music-workspace-state.ts';
import { createProjectSetup, projectName } from './project-setup.ts';
import { openMusicDocument, commitMusicDocument } from './music-document.ts';
import { prepareProjectMelodyTimbres, listProjectTimbres, addProjectPhraseTimbre, createProjectPhraseNoteGroup, changeProjectPhraseNoteGroupTimbre,
  removeProjectTimbre, reorderProjectTimbres, requiresTimbreDeleteConfirmation } from './project-timbres.ts';
import { readTimbreImport } from './timbre-file-import.ts';
import { importProjectTimbre } from './project-timbre-import.ts';
import { createProjectClosePreparation } from './project-close.ts';
import { stageMaterialStorage } from './material-library-session.ts';

export interface ReleasePlatform {
  storage: MaterialStorage;
  projectDirectories?: ProjectDirectoriesPort;
  audioFiles?: AudioFilesPort;
  demoProject?: { id: string; name: string; format?: never; startWithGuide?: boolean; mobileGuide?: boolean };
  timbreFiles: TimbreFilesPort;
  samplePayloads?: SamplePayloadPort;
}

const desktopGuideChoiceKey = 'rootsound.desktop-guide-choice.v1';

function firstDesktopGuideChoice(storage: Storage, previousStatus: string) {
  if (previousStatus !== 'new') return undefined;
  try {
    const choice = storage.getItem(desktopGuideChoiceKey);
    if (choice === 'yes' || choice === 'no') return undefined;
  } catch {}
  return (watch: boolean) => {
    try { storage.setItem(desktopGuideChoiceKey, watch ? 'yes' : 'no'); } catch {}
  };
}

export async function mountReleaseStudio(root: HTMLElement, platform: ReleasePlatform, navigate?: () => void) {
  const runtime = createBrowserSoundRuntime(), directories = platform.projectDirectories;
  try {
    const state = await directories?.read();
    const current = state?.current ?? platform.demoProject;
    const staged = current ? stageMaterialStorage(platform.storage) : undefined;
    const library = createMaterialLibrary(staged?.storage, { project: { rootKind: 'rootsound.song',
      adapters: [createTimbreReferenceAdapter(), createPhraseReferenceAdapter(), createSongReferenceAdapter(), createSampleReferenceAdapter()] } });
    const sampleAudio = createSampleAudio(library, createBrowserSampleDecoder(), platform.samplePayloads);
    const bank = createSampleBankAudio(library, sampleAudio), spectral = createSpectralAudio();
    const tones = createTimbrePlayback(library, sampleAudio, spectral, bank);
    const phrase = createPhraseEditor(library, tones);
    // The song adapter is retained solely as the .rootsound compatibility boundary.
    // The former arrangement UI and its workspace are not mounted or imported.
    const song = createSongEditor(library, createPhrasePlayback(library, tones), { defaultTempoMode: 'source', initialTrackCount: 1 });
    const songId = current && openMusicDocument(library, song, phrase, current.name);
    if (current) {
      if (!songId) throw new Error('工程缺少可编辑的歌曲。');
      prepareProjectMelodyTimbres(library, songId);
      if (current.format) commitMusicDocument(library, song, phrase);
      staged!.publish();
      await directories?.finishLoading?.();
    }
    const sourceFormat = current?.format;
    let fileSession: ReturnType<typeof import('./music-file.ts')['createMusicFileSession']> | undefined;
    async function prepareFile(target: 'source' | 'rootsound' = 'source') {
      if (!songId) return;
      if (sourceFormat && target === 'source' && !fileSession) {
        const sourceFile = await directories!.readDocument?.();
        if (!sourceFile?.libraryText) throw new Error('无法读取原始音乐，请重新打开后保存。');
        const { createMusicFileSession } = await import('./music-file.ts');
        const view = phrase.read();
        fileSession = createMusicFileSession(sourceFile.format, sourceFile.bytes, library, view.body!, view.draft!.name, sourceFile.libraryText);
      }
      commitMusicDocument(library, song, phrase);
      if (fileSession && target === 'source') {
        const result = fileSession.serialize(library, phrase.read().body!, song.read().draft!.name, platform.storage.read()!);
        if (!await confirmFormatSave(root, result.warnings)) throw new Error('已取消保存，原文件未改动。');
        if (!directories!.prepareDocumentSave) throw new Error('请重新打开更新后的简乐。');
        await directories!.prepareDocumentSave(result.bytes);
      }
    }
    const preferences = createWorkspacePreferences(localStorage);
    const learning = createLearningSettings(localStorage);
    const projectId = () => { if (!songId) throw new Error('先打开一个音乐项目。'); return songId; };
    const studio = mountStudio(root, { phrase, song, sound: runtime, hasPrevious: !!current,
      projectName: current?.name, doubleClickIntervalMs: state?.doubleClickIntervalMs, preferences, learning,
      workspaceState: current ? createMusicWorkspaceState(localStorage, current.id) : undefined,
      musicGuide: { createDocument: createMusicGuideDocument, createSound: createBrowserSoundRuntime, mobileWeb: platform.demoProject?.mobileGuide },
      initialEntry: current ? 'song' : 'welcome', audioFiles: platform.audioFiles, demo: !!platform.demoProject,
      startWithGuide: platform.demoProject?.startWithGuide,
      onFirstGuideChoice: directories && firstDesktopGuideChoice(localStorage, learning.read().guides.basics.status),
      projectSetup: directories && createProjectSetup(directories, () => {
        runtime.stopAll();
        navigate?.();
      }, {
        read() { const value = platform.storage.read(); if (value === null) throw new Error('当前没有项目。'); return value; },
        songDraftId: projectId, name: () => song.readDraft()!.name,
        async prepareSave(target) {
          await studio.prepareClose({ allowProjectDialog: true });
          await prepareFile(target);
        },
      }),
      projectTimbres() { return listProjectTimbres(library, projectId()).map(record => ({ id: record.id, name: record.name,
        requiresDeleteConfirmation: requiresTimbreDeleteConfirmation(record, library.listDrafts()) })); },
      async onImportTimbre() {
        const id = projectId(); await platform.timbreFiles.sync?.(id);
        const opened = await platform.timbreFiles.open(); if (opened.status === 'cancelled') return false;
        if (id !== projectId()) throw new Error('项目已切换，请重新导入。');
        const data = readTimbreImport(opened.text, opened.name); importProjectTimbre(library, id, data.timbre, data.dependencies);
        const mirrored = await platform.timbreFiles.sync?.(id);
        if (mirrored?.status === 'warning') throw new Error(mirrored.message);
        return true;
      },
      onAddPhraseTimbre: (id, section) => addProjectPhraseTimbre(library, projectId(), phrase.read().draft!.id, id, section),
      onCreateNoteGroup: id => createProjectPhraseNoteGroup(library, projectId(), phrase.read().draft!.id, id),
      onChangeNoteGroupTimbre: (part, tone) => changeProjectPhraseNoteGroupTimbre(library, projectId(), phrase.read().draft!.id, part, tone),
      onRemovePhraseTimbre: id => removeProjectTimbre(library, projectId(), id),
      onReorderTimbres: (id, index) => reorderProjectTimbres(library, projectId(), id, index),
      onRenameProject: name => { song.rename(projectName(name)); },
    });
    const prepareClose = createProjectClosePreparation({ flush: () => studio.prepareClose(),
      prepareSave: () => prepareFile(), name: () => song.readDraft()?.name });
    return { openGuide: studio.openGuide, prepareClose, dispose() { studio.dispose(); void runtime.dispose(); } };
  } catch (error) {
    void runtime.dispose();
    throw error;
  }
}

export function showReleaseStartupError(root: HTMLElement, error: unknown) {
  const message = document.createElement('main'); message.className = 'startup-error';
  const title = document.createElement('h1'); title.textContent = '暂时无法打开 RootSound';
  const detail = document.createElement('p'); detail.textContent = error instanceof Error ? error.message : String(error);
  message.append(title, detail); root.replaceChildren(message);
}
