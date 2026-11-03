/** Public desktop entry: only the current project library and music canvas. */
import { createMaterialLibrary } from '../modules/materials/public.ts';
import { createBrowserSoundRuntime } from '../modules/sound-runtime/public.ts';
import { createTimbreEditor, createTimbrePlayback, createTimbreReferenceAdapter, createSpectralAudio } from '../modules/timbre/public.ts';
import { createSampleBankAudio } from '../modules/timbre/sample-bank.ts';
import { createPhraseEditor, createPhrasePlayback, createPhraseReferenceAdapter } from '../modules/phrase/public.ts';
import { createSongEditor, createSongReferenceAdapter } from '../modules/song/public.ts';
import { createSampleAudio, createBrowserSampleDecoder, createSampleReferenceAdapter } from '../modules/sampling/public.ts';
import { mountStudio, showMidiImportNotice } from '../modules/ui-rendering/public.ts';
import { createDesktopPlatform } from './platform/desktop.ts';
import { createWorkspacePreferences } from './platform/preferences.ts';
import { createMusicWorkspaceState } from './platform/music-workspace-state.ts';
import { createProjectSetup, projectName } from './project-setup.ts';
import { openMusicDocument, commitMusicDocument } from './music-document.ts';
import { ensureProjectMelodyTimbres, listProjectTimbres, addProjectPhraseTimbre, createProjectPhraseNoteGroup, changeProjectPhraseNoteGroupTimbre,
  removeProjectTimbre, reorderProjectTimbres, requiresTimbreDeleteConfirmation } from './project-timbres.ts';
import { rememberMidiImportNotice, takeMidiImportNotice } from './platform/midi-notice.ts';
import { readTimbreImport } from './timbre-file-import.ts';
import { importProjectTimbre } from './project-timbre-import.ts';
import { createProjectClosePreparation } from './project-close.ts';

const root = document.getElementById('app')!, runtime = createBrowserSoundRuntime();
async function start() {
  try {
    const platform = createDesktopPlatform(), directories = platform.projectDirectories;
    if (!directories) throw new Error('未连接音乐工程服务。');
    const state = await directories.read();
    const library = createMaterialLibrary(platform.storage, { project: { rootKind: 'rootsound.song',
      adapters: [createTimbreReferenceAdapter(), createPhraseReferenceAdapter(), createSongReferenceAdapter(), createSampleReferenceAdapter()] } });
    const sampleAudio = createSampleAudio(library, createBrowserSampleDecoder(), platform.samplePayloads);
    const bank = createSampleBankAudio(library, sampleAudio), spectral = createSpectralAudio();
    const tones = createTimbrePlayback(library, sampleAudio, spectral, bank), timbre = createTimbreEditor(library, sampleAudio, spectral, bank);
    const phrase = createPhraseEditor(library, tones);
    // The song adapter is retained solely as the .rootsound compatibility boundary.
    // The former arrangement UI and its workspace are not mounted or imported.
    const song = createSongEditor(library, createPhrasePlayback(library, tones), { defaultTempoMode: 'source', initialTrackCount: 1 });
    if (state.current) { openMusicDocument(library, song, phrase, state.current.name); await directories.finishLoading?.(); }
    const preferences = createWorkspacePreferences(localStorage);
    const projectId = () => { const id = song.read().draft?.id; if (!id) throw new Error('先打开一个音乐项目。'); return id; };
    const studio = mountStudio(root, { timbre, phrase, song, sound: runtime, hasPrevious: !!state.current,
      projectName: state.current?.name, doubleClickIntervalMs: state.doubleClickIntervalMs, preferences,
      workspaceState: state.current ? createMusicWorkspaceState(localStorage, state.current.id) : undefined,
      initialEntry: state.current ? 'song' : 'welcome', audioFiles: platform.audioFiles,
      projectSetup: createProjectSetup(directories, notice => {
        runtime.stopAll();
        if (notice) rememberMidiImportNotice(sessionStorage, notice);
        location.reload();
      }, {
        read() { const value = platform.storage.read(); if (value === null) throw new Error('当前没有项目。'); return value; },
        songDraftId: () => song.read().draft!.id, name: () => song.read().draft!.name,
        async prepareSave() {
          await studio.prepareClose({ allowProjectDialog: true });
          await bank.materialize(phrase.read().body?.parts.filter(part => !part.unassigned).map(part => part.timbreId) ?? []);
          commitMusicDocument(library, song, phrase);
        },
      }),
      onPrepareMelody() { ensureProjectMelodyTimbres(library, projectId()); },
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
      onRemovePhraseTimbre: id => {
        removeProjectTimbre(library, projectId(), id);
        try { timbre.read(); } catch {
          const remaining = listProjectTimbres(library, projectId());
          if (remaining.length) timbre.open(remaining[0]!.id); else timbre.create();
        }
      },
      onReorderTimbres: (id, index) => reorderProjectTimbres(library, projectId(), id, index),
      onRenameProject: name => { song.rename(projectName(name)); },
    });
    const prepareClose = createProjectClosePreparation({ flush: () => studio.prepareClose(),
      async assertSaveReady() {
        if (song.read().draft) {
          if ((await directories.read()).hasUnsavedChanges) await bank.materialize(phrase.read().body?.parts.filter(part => !part.unassigned).map(part => part.timbreId) ?? []);
          commitMusicDocument(library, song, phrase);
        }
      }, name: () => song.read().draft?.name });
    const closeHost = globalThis as typeof globalThis & { __rootSoundPrepareClose?: typeof prepareClose };
    closeHost.__rootSoundPrepareClose = prepareClose;
    const notice = takeMidiImportNotice(sessionStorage, state.current?.id);
    const imported = notice ? showMidiImportNotice(root, notice) : undefined;
    window.addEventListener('pagehide', () => { delete closeHost.__rootSoundPrepareClose; imported?.dispose(); studio.dispose(); void runtime.dispose(); });
  } catch (error) {
    const message = document.createElement('main'); message.className = 'startup-error';
    const title = document.createElement('h1'); title.textContent = '暂时无法打开 RootSound';
    const detail = document.createElement('p'); detail.textContent = error instanceof Error ? error.message : String(error);
    message.append(title, detail); root.replaceChildren(message); void runtime.dispose();
  }
}
void start();
