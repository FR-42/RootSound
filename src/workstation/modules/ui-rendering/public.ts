import type { SoundRuntimePort, PlaybackSession } from '../../contracts/sound.ts';
import type { SaveResult } from '../../contracts/content.ts';
import type { TimbreEditorPort } from '../../contracts/timbre.ts';
import type { SoundFilesPort, ProjectFilesPort } from '../../contracts/files.ts';
import type { ProjectPackagesPort } from '../../contracts/project.ts';
import type { ProjectSaveChoice, ProjectSetupPort } from '../../contracts/project-directory.ts';
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
import { applyRollAppearance } from './roll-appearance.ts';
import { needsTempoRolls } from './guidance-flow.ts';
import { mountPhraseComposition } from './phrase-composition.ts';
import { mountMusicGuide, type MusicGuideFactory } from './music-guide.ts';
import { mountGuidanceInvitation } from './guidance-invitation.ts';
import { mountRoundPointer } from './round-pointer.ts';
import { attachEdgeGesture } from './pointer-gestures.ts';
import { createProjectWelcome } from './project-welcome.ts';
import { mountProjectStart } from './project-start.ts';
import { mountProjectLibrary } from './project-library.ts';
import { showProjectExit, showWorkspaceProjectExit } from './project-exit.ts';
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
  onCreateNoteGroup?(id: string, draftId: string): string;
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
  demo?: boolean;
  desktopPointerUx?: boolean;
  startWithGuide?: boolean;
  onFirstGuideChoice?(watch: boolean): void;
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
export function mountStudio(root: HTMLElement, options: StudioOptions): {
  dispose(): void;
  openGuide(): Promise<void>;
  saveForClose(signal?: AbortSignal): Promise<ProjectSaveChoice>;
  awaitingCloseChoice(): boolean;
  prepareClose(options?: { allowProjectDialog?: boolean }): Promise<void>;
} {
  let disposed = false, guideOpen = false;
  let frameNotes = options.demo === true;
  let editor: ReturnType<typeof mountPhraseComposition> | undefined;
  let page: { dispose(): void } | undefined;
  let closeSaveLibrary: ((choice?: ProjectSaveChoice) => void) | undefined;
  let saveLibraryAwaitingInput: (() => boolean) | undefined;
  let exitChoice: ReturnType<typeof showWorkspaceProjectExit> | undefined;
  let closeSettings: (() => void) | undefined;
  const appearance = options.preferences;
  const disposePointer = options.desktopPointerUx ? mountRoundPointer(root) : undefined;
  const readPointerSensitivity = () => (appearance?.read().pointerSensitivity ?? 65) / 100;
  const savedAppearance = appearance?.read().rollAppearance;
  if (savedAppearance) applyRollAppearance(root, savedAppearance);
  function leave(): void { closeSettings?.(); closeSettings = undefined; editor?.dispose(); editor = undefined; page?.dispose(); page = undefined; options.sound.stopAll(); }
  function settings(inMusic: boolean): void {
    if (!options.learning && !options.demo) return;
    closeSettings = showLearningSettings(root, options.demo ? undefined : options.learning, {
      appearance,
      inline: options.desktopPointerUx,
      requiresTempoRolls: !options.demo && inMusic && needsTempoRolls(options.phrase?.read().body),
      onChange: () => editor?.refresh(),
      onReplayGuide: options.demo ? () => { void openGuide(); } : undefined,
    }) ?? closeSettings;
  }
  async function saveInLibrary(mode: 'edit' | 'exit' | 'close' | 'details' = 'edit', forceCopy = false, signal?: AbortSignal): Promise<ProjectSaveChoice> {
    if (signal?.aborted) return 'cancelled';
    const service = options.projectSetup!;
    if (!service.readSaveSource || !service.saveAs) { await service.save?.(); return service.save ? 'saved' : 'cancelled'; }
    const source = await service.readSaveSource();
    if (disposed || closeSaveLibrary || signal?.aborted) return 'cancelled';
    const writable = source && !source.format && !source.pendingSave && /\.rootsound$/iu.test(source.path);
    const original = writable ? () => mode === 'exit' ? service.exit!('save') : service.save!() : undefined;
    if (options.desktopPointerUx && original && !forceCopy) { await original(); return 'saved'; }
    if (options.desktopPointerUx) editor?.hideControls();
    const trigger = root.querySelector<HTMLButtonElement>('.song-save-project') ?? document.createElement('button');
    return new Promise<ProjectSaveChoice>(resolve => {
      const library = mountProjectLibrary(root, trigger, service, () => {}, {
        source, name: options.desktopPointerUx ? options.phrase!.read({ includeCatalog: false }).draft!.name : source?.name ?? options.phrase!.read().draft!.name,
        original,
        discard: mode === 'close' ? async () => {} : mode === 'exit' && service.exit ? () => service.exit!('discard') : undefined,
        copy: (name, path) => service.saveAs!(name, path, mode),
        finish: choice => closeSaveLibrary?.(choice),
      }, options.desktopPointerUx);
      const cancel = () => closeSaveLibrary?.();
      closeSaveLibrary = (choice = 'cancelled') => {
        signal?.removeEventListener('abort', cancel);
        closeSaveLibrary = undefined; saveLibraryAwaitingInput = undefined; library.dispose();
        if (options.desktopPointerUx && !exitChoice) {
          if (mode === 'details') editor?.showControls();
          else root.querySelector<HTMLElement>('.melody-scroll')?.focus({ preventScroll: true });
        }
        resolve(choice);
      };
      saveLibraryAwaitingInput = library.awaitingInput;
      signal?.addEventListener('abort', cancel, { once: true });
      library.open();
    });
  }
  async function chooseDesktopExit(mode: 'exit' | 'close', signal?: AbortSignal, preparationError?: unknown): Promise<ProjectSaveChoice> {
    if (signal?.aborted) return 'cancelled';
    if (exitChoice) return exitChoice.result;
    const service = options.projectSetup!;
    const stage = root.querySelector<HTMLElement>('.music-editor');
    if (!stage) return 'cancelled';
    editor?.hideControls();
    const save = async (copy = false) => {
      if (preparationError !== undefined) throw preparationError;
      return saveInLibrary(mode, copy, signal);
    };
    const choice = showWorkspaceProjectExit(stage, {
      discard: async () => { if (mode === 'exit') await service.exit!('discard'); },
      copy: () => save(true),
      save,
    });
    exitChoice = choice;
    signal?.addEventListener('abort', choice.cancel, { once: true });
    try { return await choice.result; }
    finally {
      signal?.removeEventListener('abort', choice.cancel);
      if (exitChoice === choice) exitChoice = undefined;
    }
  }
  function showWelcome(): void {
    leave();
    const startProject = () => {
      leave(); page = mountProjectStart(root, options.projectSetup, () => options.sound.stopAll(), showWelcome);
    };
    const service = options.projectSetup ?? { list: async () => [], open: async () => { throw new Error('请使用桌面版打开音乐项目。'); } };
    const { page: welcome, start } = createProjectWelcome(!options.desktopPointerUx, !options.desktopPointerUx); root.replaceChildren(welcome);
    if (options.desktopPointerUx) {
      welcome.classList.add('is-desktop-welcome');
      welcome.tabIndex = -1;
      const library = mountProjectLibrary(root, welcome, service, startProject, undefined, true);
      const edge = attachEdgeGesture(welcome, 'bottom', {
        enabled: () => !root.querySelector('.project-library-overlay:not([hidden]), dialog[open], .workspace-inline-panel[open], .guidance-invitation'),
        open: () => library.open(),
      });
      page = { dispose() { edge.dispose(); library.dispose(); } };
      return;
    }
    if (options.musicGuide) {
      const guide = element('button', 'music-guide-launch', '操作引导'); guide.type = 'button';
      guide.addEventListener('click', () => { void openGuide(); });
      welcome.append(guide);
    }
    if (options.learning) {
      const button = element('button', 'welcome-settings', '设置'); button.type = 'button';
      button.addEventListener('click', () => settings(false));
      welcome.append(button);
    }
    const library = mountProjectLibrary(root, start, service, startProject);
    start.addEventListener('click', () => library.open());
    page = library;
  }
  function showMusic(): void {
    leave();
    const initialView = options.phrase?.read();
    if (!initialView?.draft) { showWelcome(); return; }
    if (options.learning && needsTempoRolls(initialView.body) && !options.learning.read().multipleTempoRolls) {
      showWelcome();
      showFeatureGate(root, {
        inline: options.desktopPointerUx,
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
      workspaceState: options.workspaceState, frameNotesOnMount: frameNotes,
      desktopPointerUx: options.desktopPointerUx,
      readPointerSensitivity: options.desktopPointerUx ? readPointerSensitivity : undefined,
      mobileWeb: options.demo && options.musicGuide?.mobileWeb,
      readWorkbench: () => !options.desktopPointerUx && !options.demo && options.learning?.read().workbench === true,
      enableGainCurve: !options.demo,
      readMultipleTempoRolls: options.demo ? () => false : options.learning ? () => options.learning!.read().multipleTempoRolls : undefined,
      readDrumLanes: () => !options.desktopPointerUx && !options.demo && options.learning?.read().drumLanes === true,
      onSettings: !options.desktopPointerUx && (options.demo || options.learning) ? () => settings(true) : undefined,
      readEditorSettings: options.desktopPointerUx ? body => ({
        preferences: options.learning,
        options: { appearance, requiresTempoRolls: needsTempoRolls(body), onChange: () => editor?.refresh() },
      }) : undefined,
      // Retired mode cannot reactivate from a previously saved preference.
      readPerformanceMode: () => false,
      listTimbres: options.projectTimbres, onImportTimbre: options.onImportTimbre,
      onAddTimbre: options.onAddPhraseTimbre, onCreateNoteGroup: options.onCreateNoteGroup,
      onChangeNoteGroupTimbre: options.onChangeNoteGroupTimbre,
      onRemoveTimbre: options.onRemovePhraseTimbre, onReorderTimbres: options.onReorderTimbres,
      async onRename(name) {
        await options.projectSetup?.renameCurrent?.(name);
        options.onRenameProject?.(name); phrase.rename(name);
      },
      readUnsavedChanges: options.projectSetup?.hasUnsavedChanges ? () => options.projectSetup!.hasUnsavedChanges!() : undefined,
      onSave: options.projectSetup?.save ? () => saveInLibrary(options.desktopPointerUx ? 'details' : 'edit') : undefined,
      onSaveAs: options.projectSetup?.saveAs ? () => saveInLibrary(options.desktopPointerUx ? 'details' : 'edit', true) : undefined,
      onExit: options.demo ? undefined : options.projectSetup ? options.desktopPointerUx ? () => options.projectSetup!.exit!('discard') : () =>
        showProjectExit(root, options.projectSetup!, options.projectSetup?.readSaveSource ? async () => { await saveInLibrary('exit'); } : undefined) : showWelcome,
    });
    if (options.desktopPointerUx && sessionStorage.getItem('rootsound.saved-details.v1') === 'true') {
      sessionStorage.removeItem('rootsound.saved-details.v1');
      editor.showControls(true);
    }
    frameNotes = false;
  }
  function showGuide(resume: () => void) {
    leave();
    guideOpen = true;
    page = mountMusicGuide(root, options.musicGuide!, () => { guideOpen = false; resume(); });
  }
  async function openGuide() {
    if (disposed || guideOpen || !options.musicGuide || root.querySelector('dialog[open], .workspace-inline-panel[open]')) return;
    guideOpen = true;
    const resume = editor ? showMusic : showWelcome;
    try {
      await editor?.flush();
      if (disposed) return;
      showGuide(resume);
    } catch (error) {
      guideOpen = false;
      editor?.notify(error instanceof Error ? error.message : String(error), true);
    }
  }
  const initialView = options.initialEntry && options.initialEntry !== 'welcome' ? showMusic : showWelcome;
  if (options.startWithGuide && options.musicGuide) showGuide(initialView);
  else if (options.onFirstGuideChoice && options.musicGuide) {
    const remember = options.onFirstGuideChoice;
    root.replaceChildren();
    function choose(watch: boolean) {
      remember(watch);
      if (watch) showGuide(initialView);
      else initialView();
    }
    page = mountGuidanceInvitation(root, { onWatch: () => choose(true), onSkip: () => choose(false) });
  } else initialView();
  return { openGuide, saveForClose: signal => options.desktopPointerUx ? chooseDesktopExit('close', signal) : saveInLibrary('close', false, signal),
    awaitingCloseChoice: () => saveLibraryAwaitingInput?.() || exitChoice?.awaitingChoice() || false, async prepareClose(closeOptions = {}) {
    if (disposed) throw new Error('当前页面已关闭。');
    // Toolbar actions have already flushed their edits before invoking the project service.
    if (!closeOptions.allowProjectDialog) {
      const inlinePanels = options.desktopPointerUx ? '.workspace-inline-panel[open]:not(.melody-tone-library, .song-editor-controls)' : '.workspace-inline-panel[open]';
      if (closeSaveLibrary || root.querySelector(`dialog[open], ${inlinePanels}`)) throw new Error('请先完成当前窗口中的操作。');
      await editor?.flush();
    }
  }, dispose() { disposed = true; closeSaveLibrary?.(); exitChoice?.cancel(); leave(); disposePointer?.(); root.replaceChildren(); } };
}
