import type { SoundRuntimePort, PlaybackSession } from '../../contracts/sound.ts';
import type { SaveResult } from '../../contracts/content.ts';
import type { TimbreEditorPort } from '../../contracts/timbre.ts';
import type { SoundFilesPort, AudioFilesPort, ProjectFilesPort } from '../../contracts/files.ts';
import type { ProjectPackagesPort } from '../../contracts/project.ts';
import type { ProjectSetupPort } from '../../contracts/project-directory.ts';
import type { PhraseEditorPort, PhraseSection } from '../../contracts/phrase.ts';
import type { SongClipRef, SongEditorPort } from '../../contracts/song.ts';
import type { MaterialCatalogPort } from '../../contracts/catalog.ts';
import type { ProjectEntitiesPort } from '../../contracts/entities.ts';
import type { CoCreationPort } from '../../contracts/co-creation.ts';
import type { SamplingPort } from '../../contracts/sampling.ts';
import type { MelodyRecognitionPort } from '../../contracts/melody-recognition.ts';
import type { WorkspaceId, WorkspacePreferencesPort, MusicWorkspaceStatePort } from '../../contracts/workspace.ts';
import type { ReferenceEditingPort } from '../../contracts/references.ts';
import type { LearningSettingsPort } from '../../contracts/guidance.ts';
import { showLearningSettings, showFeatureGate } from './settings.ts';
import { needsTempoRolls } from './guidance-flow.ts';
import { mountPhraseComposition } from './phrase-composition.ts';
import { mountMusicGuide, type MusicGuideFactory } from './music-guide.ts';
import { createProjectWelcome } from './project-welcome.ts';
import { mountProjectStart } from './project-start.ts';
import { mountProjectLibrary } from './project-library.ts';
import { showProjectSaveAs } from './project-save-as.ts';
import { showProjectExit } from './project-exit.ts';
import { showAudioExport } from './audio-export.ts';
import './studio.css';
import './theme.css';
export { confirmFormatSave } from './format-save-warning.ts';
export type { MusicGuideDocument } from './music-guide.ts';
export { showLearningSettings, showFeatureGate, needsTempoRolls, mountMusicGuide };

export interface StudioOptions {
  timbre?: TimbreEditorPort;
  sound: SoundRuntimePort;
  hasPrevious: boolean;
  files?: SoundFilesPort;
  audioFiles?: AudioFilesPort;
  projectFiles?: ProjectFilesPort;
  projects?: ProjectPackagesPort;
  projectSetup?: ProjectSetupPort;
  projectName?: string;
  doubleClickIntervalMs?: number;
  onNewPhrase?(timbreId?: string, tempoBpm?: number): void;
  onCopyPhrase?(): void;
  onSavePhraseDraft?(draftId: string, mode: 'new' | 'overwrite'): SaveResult;
  onDiscardPhraseDraft?(draftId: string): void;
  projectTimbres?(): Array<{ id: string; name: string; requiresDeleteConfirmation?: boolean }>;
  onImportTimbre?(): Promise<boolean>;
  onAddPhraseTimbre?(id: string, section?: PhraseSection): string;
  onCreateNoteGroup?(id: string): string;
  onChangeNoteGroupTimbre?(partId: string, timbreId: string): void;
  onRemovePhraseTimbre?(id: string, section?: PhraseSection | 'all'): void;
  onReorderTimbres?(id: string, targetIndex: number): void;
  onKeepPhrases?(ids: string[]): void;
  phraseInfo?(id: string): { id: string; name: string; tempoBpm: number; durationSeconds: number };
  projectPhrases?(): Array<{ id: string; name: string; tempoBpm: number; durationSeconds: number }>;
  onDeletePhrase?(id: string): void | Promise<void>;
  onRenamePhrase?(id: string, name: string, ref?: SongClipRef): { id: string } | void;
  onRenameProject?(name: string): void;
  phrase?: PhraseEditorPort;
  song?: SongEditorPort;
  catalog?: MaterialCatalogPort;
  entities?: ProjectEntitiesPort;
  coCreation?: CoCreationPort;
  sampling?: SamplingPort;
  recognition?: MelodyRecognitionPort;
  preferences?: WorkspacePreferencesPort;
  learning?: LearningSettingsPort;
  musicGuide?: MusicGuideFactory;
  workspaceState?: MusicWorkspaceStatePort;
  references?: ReferenceEditingPort;
  previewContent?(contentId: string, signal?: AbortSignal): Promise<PlaybackSession>;
  initialWorkspace?: WorkspaceId;
  initialEntry?: 'welcome' | WorkspaceId;
  onWorkspaceChange?(workspace: WorkspaceId): void;
}


function element<K extends keyof HTMLElementTagNameMap>(tag: K, className = '', text = ''): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag); node.className = className; node.textContent = text; return node;
}
/** A project opens directly into its sole editable music score. */
export function mountStudio(root: HTMLElement, options: StudioOptions): { dispose(): void; prepareClose(options?: { allowProjectDialog?: boolean }): Promise<void> } {
  let disposed = false;
  let editor: ReturnType<typeof mountPhraseComposition> | undefined;
  let page: { dispose(): void } | undefined;
  function leave(): void { editor?.dispose(); editor = undefined; page?.dispose(); page = undefined; options.sound.stopAll(); }
  function settings(inMusic: boolean): void {
    if (!options.learning) return;
    showLearningSettings(root, options.learning, {
      requiresTempoRolls: inMusic && needsTempoRolls(options.phrase?.read().body),
      onChange: () => editor?.refresh(),
    });
  }
  function showWelcome(): void {
    leave();
    const { page: welcome, start } = createProjectWelcome(); root.replaceChildren(welcome);
    if (options.musicGuide) {
      const guide = element('button', 'music-guide-launch', '操作引导'); guide.type = 'button';
      guide.addEventListener('click', () => {
        leave();
        page = mountMusicGuide(root, options.musicGuide!, showWelcome);
      });
      welcome.append(guide);
    }
    if (options.learning) {
      const button = element('button', 'welcome-settings', '设置'); button.type = 'button';
      button.addEventListener('click', () => settings(false)); welcome.append(button);
    }
    const library = mountProjectLibrary(root, start, options.projectSetup ?? { list: async () => [], open: async () => { throw new Error('请使用桌面版打开音乐项目。'); } }, () => {
      leave(); page = mountProjectStart(root, options.projectSetup, () => options.sound.stopAll(), showWelcome);
    }, options.doubleClickIntervalMs);
    start.addEventListener('click', () => library.open()); page = library;
  }
  function showMusic(): void {
    leave();
    const initialView = options.phrase?.read();
    if (!initialView?.draft) { showWelcome(); return; }
    if (options.learning && needsTempoRolls(initialView.body) && !options.learning.read().multipleTempoRolls) {
      showWelcome();
      showFeatureGate(root, {
        onEnable() {
          options.learning!.setMultipleTempoRolls(true);
          showMusic();
        },
        async onCancel() { if (options.projectSetup?.exit) await options.projectSetup.exit('discard'); else showWelcome(); },
      });
      return;
    }
    const phrase = options.phrase!;
    editor = mountPhraseComposition(root, { phrase, initialView, sound: options.sound, directMusic: true,
      workspaceState: options.workspaceState,
      readMultipleTempoRolls: options.learning ? () => options.learning!.read().multipleTempoRolls : undefined,
      onSettings: options.learning ? () => settings(true) : undefined,
      // Retired mode cannot reactivate from a previously saved preference.
      readPerformanceMode: () => false,
      listTimbres: options.projectTimbres, onImportTimbre: options.onImportTimbre,
      onAddTimbre: options.onAddPhraseTimbre, onCreateNoteGroup: options.onCreateNoteGroup,
      onChangeNoteGroupTimbre: options.onChangeNoteGroupTimbre,
      onRemoveTimbre: options.onRemovePhraseTimbre, onReorderTimbres: options.onReorderTimbres,
      onRename(name) { options.onRenameProject?.(name); phrase.rename(name); },
      readUnsavedChanges: options.projectSetup?.hasUnsavedChanges ? () => options.projectSetup!.hasUnsavedChanges!() : undefined,
      async onSave() { if (options.projectSetup?.save) await options.projectSetup.save(); },
      onSaveAs: options.projectSetup?.saveAs ? () => showProjectSaveAs(root, options.projectSetup!, phrase.read().draft!.name) : undefined,
      onExit: options.projectSetup ? () => showProjectExit(root, options.projectSetup!) : showWelcome,
      onExport: options.audioFiles ? () => showAudioExport(root, { name: phrase.read().draft!.name,
        sound: options.sound, files: options.audioFiles!, prepare: () => phrase.preparePreview(), plan: () => phrase.previewPlan() }) : undefined,
    });
  }
  if (options.initialEntry && options.initialEntry !== 'welcome') showMusic();
  else showWelcome();
  return { async prepareClose(closeOptions = {}) {
    if (disposed) throw new Error('当前页面已关闭。');
    // Toolbar actions have already flushed their edits before invoking the project service.
    if (!closeOptions.allowProjectDialog) {
      if (root.querySelector('dialog[open]')) throw new Error('请先完成当前窗口中的操作。');
      await editor?.flush();
    }
  }, dispose() { disposed = true; leave(); root.replaceChildren(); } };
}
