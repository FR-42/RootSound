import { createMaterialLibrary } from '../modules/materials/public.ts';
import { createBrowserSoundRuntime } from '../modules/sound-runtime/public.ts';
import { createTimbrePlayback, createTimbreReferenceAdapter, createSpectralAudio } from '../modules/timbre/public.ts';
import { createSampleBankAudio } from '../modules/timbre/sample-bank.ts';
import { createPhraseEditor, createPhrasePlayback, createPhraseReferenceAdapter } from '../modules/phrase/public.ts';
import { createSongEditor, createSongReferenceAdapter } from '../modules/song/public.ts';
import { createSampleAudio, createBrowserSampleDecoder, createSampleReferenceAdapter } from '../modules/sampling/public.ts';
import { mountStudio } from '../modules/ui-rendering/public.ts';
import type { MaterialStorage } from '../contracts/content.ts';
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
      if (!platform.demoProject) prepareProjectMelodyTimbres(library, songId);
      if (current.format) commitMusicDocument(library, song, phrase);
      staged!.publish();
      await directories?.finishLoading?.();
    }
    function prepareFile() {
      if (songId) commitMusicDocument(library, song, phrase);
    }
    const preferences = createWorkspacePreferences(localStorage, platform.demoProject ? 30 : undefined);
    const learning = createLearningSettings(localStorage);
    const projectId = () => { if (!songId) throw new Error('先打开一个音乐项目。'); return songId; };
    const studio = mountStudio(root, { phrase, song, sound: runtime, hasPrevious: !!current,
      projectName: current?.name, doubleClickIntervalMs: state?.doubleClickIntervalMs, preferences, learning,
      workspaceState: current ? createMusicWorkspaceState(localStorage, current.id) : undefined,
      musicGuide: { createDocument: name => createMusicGuideDocument(name, !!platform.demoProject),
        createSound: createBrowserSoundRuntime, mobileWeb: platform.demoProject?.mobileGuide },
      initialEntry: current ? 'song' : 'welcome', demo: !!platform.demoProject,
      startWithGuide: platform.demoProject?.startWithGuide,
      onFirstGuideChoice: directories && firstDesktopGuideChoice(localStorage, learning.read().guides.basics.status),
      projectSetup: directories && createProjectSetup(directories, () => {
        runtime.stopAll();
        navigate?.();
      }, {
        read() { const value = platform.storage.read(); if (value === null) throw new Error('当前没有项目。'); return value; },
        songDraftId: projectId, name: () => song.readDraft()!.name,
        async prepareSave() {
          await studio.prepareClose({ allowProjectDialog: true });
          prepareFile();
        },
      }),
      projectTimbres() { return listProjectTimbres(library, projectId()).map(record => ({ id: record.id, name: record.name,
        requiresDeleteConfirmation: requiresTimbreDeleteConfirmation(record, library.listDrafts()) })); },
      onImportTimbre: platform.demoProject ? undefined : async () => {
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
    const prepareClose = createProjectClosePreparation({ flush: () => studio.prepareClose(), chooseSave: directories?.browse ? studio.saveForClose : undefined,
      prepareSave: () => { if (current?.format) throw new Error('请先保存为 .rootsound 文件。'); prepareFile(); }, name: () => song.readDraft()?.name });
    const warmup = platform.demoProject && !platform.demoProject.startWithGuide
      ? requestAnimationFrame(() => { void phrase.preparePreview().catch(() => {}); }) : undefined;
    return { openGuide: studio.openGuide, prepareClose, dispose() {
      if (warmup !== undefined) cancelAnimationFrame(warmup);
      studio.dispose(); void runtime.dispose();
    } };
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
