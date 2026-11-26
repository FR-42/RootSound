import type { SoundRuntimePort, PlaybackSession, SoundPlan, PlayableNotePlan } from '../../contracts/sound.ts';
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
import { showLearningSettings } from './settings.ts';
import { applyRollAppearance } from './roll-appearance.ts';
import { mountPhraseComposition } from './phrase-composition.ts';
import { mountRoundPointer } from './round-pointer.ts';
import { createProjectWelcome } from './project-welcome.ts';
import { mountProjectStart } from './project-start.ts';
import { mountProjectLibrary } from './project-library.ts';
import { mountWelcomeGuide, takeCanvasGuide, rememberGuideProject, returnGuideToWelcome } from './welcome-guide.ts';
import { createCanvasGuide } from './canvas-guide.ts';
import { showProjectExit, showWorkspaceProjectExit } from './project-exit.ts';
import './studio.css';
import './theme.css';
export { confirmFormatSave } from './format-save-warning.ts';
export type { MusicGuideDocument } from './music-guide.ts';
export { showLearningSettings };
export { mountRoundPointer };

export interface StudioOptions {
  timbre?: TimbreEditorPort;
  sound: SoundRuntimePort;
  previewWelcomePiano?(note: SoundPlan['note']): Promise<PlayableNotePlan>;
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
  mobileWeb?: boolean;
  humPitch?: boolean;
  demo?: boolean;
  desktopPointerUx?: boolean;
  pointerMounted?: boolean;
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
  saveForClose(signal?: AbortSignal): Promise<ProjectSaveChoice>;
  awaitingCloseChoice(): boolean;
  prepareClose(options?: { allowProjectDialog?: boolean }): Promise<void>;
} {
  let disposed = false;
  let frameNotes = options.demo === true;
  let editor: ReturnType<typeof mountPhraseComposition> | undefined;
  let page: { dispose(): void } | undefined;
  let closeSaveLibrary: ((choice?: ProjectSaveChoice) => void) | undefined;
  let saveLibraryAwaitingInput: (() => boolean) | undefined;
  let exitChoice: ReturnType<typeof showWorkspaceProjectExit> | undefined;
  let closeSettings: (() => void) | undefined;
  const appearance = options.preferences;
  const canGuide = options.desktopPointerUx && !options.demo && document.documentElement?.classList.contains('windows-desktop-colors');
  let pendingCanvasGuide = canGuide && takeCanvasGuide();
  const disposePointer = options.desktopPointerUx && !options.pointerMounted ? mountRoundPointer(root) : undefined;
  const savedAppearance = appearance?.read().rollAppearance;
  if (!options.desktopPointerUx && savedAppearance) applyRollAppearance(root, savedAppearance);
  function leave(): void { closeSettings?.(); closeSettings = undefined; editor?.dispose(); editor = undefined; page?.dispose(); page = undefined; options.sound.stopAll(); }
  function settings(): void {
    if (!options.learning && !options.demo) return;
    closeSettings = showLearningSettings(root, options.demo ? undefined : options.learning, {
      appearance,
      inline: options.desktopPointerUx,
      onChange: () => editor?.refresh(),
    }) ?? closeSettings;
  }
  async function saveInLibrary(mode: 'edit' | 'exit' | 'close' | 'details' = 'edit', forceCopy = false, signal?: AbortSignal): Promise<ProjectSaveChoice> {
    if (signal?.aborted) return 'cancelled';
    const service = options.projectSetup!;
    if (!service.readSaveSource || !service.saveAs) {
      if (forceCopy || !service.save) return 'cancelled';
      await service.save();
      return 'saved';
    }
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
    const { desktopPointerUx } = options;
    const { page: welcome, start } = createProjectWelcome(!desktopPointerUx, !desktopPointerUx, desktopPointerUx, async frequencyHz => {
      if (!options.previewWelcomePiano) return;
      try {
        const [plan] = await Promise.all([
          options.previewWelcomePiano({ frequencyHz, holdSeconds: .35, velocity: .75 }),
          options.sound.activate?.(),
        ]);
        if (!disposed && welcome.isConnected && !welcome.inert) await options.sound.audition(plan, { keepAttack: true });
      } catch {}
    });
    root.replaceChildren(welcome);
    if (desktopPointerUx) {
      welcome.tabIndex = -1;
      let refreshLibrary = () => {};
      const guide = canGuide ? mountWelcomeGuide(root, welcome, () => refreshLibrary()) : undefined;
      const library = mountProjectLibrary(root, welcome, service, startProject, undefined, true, guide);
      refreshLibrary = library.refreshGuide;
      page = { dispose() { guide?.dispose(); library.dispose(); } };
      return;
    }
    if (options.learning) {
      const button = element('button', 'welcome-settings', '设置'); button.type = 'button';
      button.addEventListener('click', settings);
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
    const phrase = options.phrase!;
    const guide = pendingCanvasGuide ? createCanvasGuide(root, {
      commitName: () => editor?.commitTitle() ?? Promise.resolve(false),
      setTempoOpen: open => editor?.setTempoOpen(open),
      async onComplete() {
        await returnGuideToWelcome(root, async () => {
          if (options.projectSetup?.exit) await options.projectSetup.exit('discard');
          else showWelcome();
        });
      },
    }) : undefined;
    pendingCanvasGuide = false;
    if (guide) page = { dispose: guide.dispose };
    let tempoRollsEnabled = options.learning?.read().multipleTempoRolls === true;
    editor = mountPhraseComposition(root, { phrase, initialView, sound: options.sound, directMusic: true,
      workspaceState: options.workspaceState, frameNotesOnMount: frameNotes,
      onSectionChange: guide ? section => { if (section === 'melody') guide.ready(); } : undefined,
      onLearningAction: guide?.action,
      blockSideEdges: guide?.blocksSideEdges,
      desktopPointerUx: options.desktopPointerUx,
      mobileWeb: options.demo && options.mobileWeb,
      humPitch: options.humPitch,
      readWorkbench: () => !options.desktopPointerUx && !options.demo && options.learning?.read().workbench === true,
      enableGainCurve: !options.demo,
      readMultipleTempoRolls: body => !options.demo && (tempoRollsEnabled || !!body?.tempoSections?.length),
      onSettings: !options.desktopPointerUx && (options.demo || options.learning) ? settings : undefined,
      readEditorSettings: options.desktopPointerUx ? body => ({
        preferences: options.learning,
        options: {
          appearance, onChange: () => editor?.refresh(),
          tempoRolls: !options.demo && options.learning ? {
            enabled: tempoRollsEnabled || !!body?.tempoSections?.length,
            required: !!body?.tempoSections?.length,
            set(enabled) {
              options.learning!.setMultipleTempoRolls(enabled);
              tempoRollsEnabled = enabled;
            },
          } : undefined,
        },
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
        if (guide) {
          const project = await options.projectSetup?.readSaveSource?.();
          if (project) rememberGuideProject(project);
        }
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
  const initialView = options.initialEntry && options.initialEntry !== 'welcome' ? showMusic : showWelcome;
  initialView();
  return { saveForClose: signal => options.desktopPointerUx ? chooseDesktopExit('close', signal) : saveInLibrary('close', false, signal),
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
