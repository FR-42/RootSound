import type { SoundRuntimePort, PlaybackSession } from '../../contracts/sound.ts';
import type { SaveConfirmation, SaveResult } from '../../contracts/content.ts';
import type { TimbreEditorPort } from '../../contracts/timbre.ts';
import type { SoundFilesPort, AudioFilesPort, ProjectFilesPort } from '../../contracts/files.ts';
import type { ProjectPackagesPort } from '../../contracts/project.ts';
import type { PhraseEditorPort } from '../../contracts/phrase.ts';
import type { SongEditorPort } from '../../contracts/song.ts';
import type { MaterialCatalogPort } from '../../contracts/catalog.ts';
import type { CreativeEntity, ProjectEntitiesPort } from '../../contracts/entities.ts';
import type { CoCreationPort } from '../../contracts/co-creation.ts';
import type { SamplingPort } from '../../contracts/sampling.ts';
import type { MelodyRecognitionPort } from '../../contracts/melody-recognition.ts';
import type { ContentRecord, Draft } from '../../contracts/content.ts';
import type { WorkspaceId, WorkspacePreferencesPort } from '../../contracts/workspace.ts';
import type { ReferenceApplyResult, ReferenceEditingPort, ReferenceSession } from '../../contracts/references.ts';
import { mountPhraseWorkspace } from './phrase-workspace.ts';
import { mountSongWorkspace } from './song-workspace.ts';
import { mountCatalogWorkspace } from './catalog-workspace.ts';
import { mountCoCreationWorkspace } from './co-creation-workspace.ts';
import { mountSamplingWorkspace } from './sampling-workspace.ts';
import { mountSampleTimbreWorkspace } from './sample-timbre-workspace.ts';
import { showWorkspaceSettings } from './settings.ts';
import { showAudioExport } from './audio-export.ts';
import { showReferenceLocations, type ReferenceEditorContext } from './reference-ui.ts';
import { createProjectTransfer } from './project-transfer.ts';
import { beginOrResumeReferenceEdit, pendingReferenceEdits } from './reference-activity.ts';
import { createEntityRail } from './entity-rail.ts';
import { mountSynthWorkspace } from './synth-workspace.ts';
import { timbrePresets, previewTimbrePreset } from '../timbre/public.ts';
import { visibleWorkspace } from './visible-workspaces.ts';
import './studio.css';

export interface StudioOptions {
  timbre: TimbreEditorPort;
  sound: SoundRuntimePort;
  hasPrevious: boolean;
  files?: SoundFilesPort;
  audioFiles?: AudioFilesPort;
  projectFiles?: ProjectFilesPort;
  projects?: ProjectPackagesPort;
  phrase?: PhraseEditorPort;
  song?: SongEditorPort;
  catalog?: MaterialCatalogPort;
  entities?: ProjectEntitiesPort;
  coCreation?: CoCreationPort;
  sampling?: SamplingPort;
  recognition?: MelodyRecognitionPort;
  preferences?: WorkspacePreferencesPort;
  references?: ReferenceEditingPort;
  previewContent?(contentId: string, signal?: AbortSignal): Promise<PlaybackSession>;
  initialWorkspace?: WorkspaceId;
  onWorkspaceChange?(workspace: WorkspaceId): void;
}

function element<K extends keyof HTMLElementTagNameMap>(tag: K, className = '', text = ''): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  node.className = className;
  node.textContent = text;
  return node;
}
function button(text: string, className: string, action: () => void): HTMLButtonElement {
  const node = element('button', className, text);
  node.type = 'button';
  node.addEventListener('click', action);
  return node;
}

/** Rendering owns DOM and pointer feedback; musical mutations use the domain port. */
export function mountStudio(root: HTMLElement, options: StudioOptions): { dispose(): void } {
  const { timbre, sound } = options;
  let disposed = false;
  let notice: HTMLElement | undefined;
  let fileBusy = false;
  let phraseWorkspace: { dispose(): void; refresh?(context?: ReferenceEditorContext, onApplyElsewhere?: () => void): void; notify?(message: string, error?: boolean): void } | undefined;
  let renderedSoundDraft: string | undefined;
  let timbreEditorMounted = false; let workspaceGeneration = 0;
  const preference = options.preferences?.read();
  let workspace: WorkspaceId = visibleWorkspace(preference?.lastWorkspace ?? options.initialWorkspace ?? 'sound');
  let hasEnteredWorkspace = false;
  type CreativeWorkspace = 'sound' | 'phrase' | 'song';
  const scopes = new Map<string, { ids: string[]; token: string }>();
  const projectTransfer = options.projects && options.projectFiles && options.song
    ? createProjectTransfer(options.projects, options.projectFiles, options.references) : undefined;

  function editorFor(target: CreativeWorkspace): TimbreEditorPort | PhraseEditorPort | SongEditorPort {
    const editor = target === 'sound' ? timbre : target === 'phrase' ? options.phrase : options.song;
    if (!editor) throw new Error('当前版本还不能编辑这类内容。');
    return editor;
  }
  function workspaceFor(kind: string): CreativeWorkspace {
    if (kind === 'rootsound.timbre') return 'sound';
    if (kind === 'rootsound.phrase') return 'phrase';
    if (kind === 'rootsound.song') return 'song';
    throw new Error('当前版本还不能编辑这类内容，原素材已保留。');
  }
  function currentSession(target: CreativeWorkspace): ReferenceSession | undefined {
    const id = editorFor(target).read().draft?.id;
    return id ? options.references?.resume(id) : undefined;
  }
  function ensureSession(target: CreativeWorkspace): ReferenceSession {
    if (!options.references) throw new Error('暂时没有可用的位置编辑能力。');
    const view = editorFor(target).read();
    if (!view.draft?.sourceId) throw new Error('这份新内容还没有其他使用位置，先保存下来吧。');
    return options.references.resume(view.draft.id) ?? options.references.beginLibrary(view.draft.sourceId, view.draft.id);
  }
  function ensureOriginalEditor(session: ReferenceSession): void {
    const editor = editorFor(workspaceFor(session.targetKind));
    // Context application/cancellation removes its isolated draft. Keep the
    // underlying editor usable when this workspace is visited again.
    let exists = false;
    try { exists = !!editor.read().draft; } catch { /* The temporary draft may have been removed. */ }
    if (!exists) editor.open(session.targetId);
  }
  function activeReferenceEditors(): Array<{ session: ReferenceSession; fallbackIds: string[] }> {
    if (!options.references) return [];
    const captured: Array<{ session: ReferenceSession; fallbackIds: string[] }> = [];
    for (const target of ['sound', 'phrase', 'song'] as const) {
      if (target === 'phrase' && !options.phrase || target === 'song' && !options.song) continue;
      const view = editorFor(target).read();
      const session = view.draft ? options.references.resume(view.draft.id) : undefined;
      if (!session) continue;
      const saved = 'savedSounds' in view ? view.savedSounds : 'savedPhrases' in view ? view.savedPhrases : view.savedSongs;
      captured.push({ session, fallbackIds: saved.map(item => item.id) });
    }
    return captured;
  }
  function repairReferenceEditors(captured: ReturnType<typeof activeReferenceEditors>): void {
    for (const { session, fallbackIds } of captured) {
      const target = workspaceFor(session.targetKind); const editor = editorFor(target);
      let exists = false; try { exists = !!editor.read().draft; } catch { /* Deleted context. */ }
      if (!exists) {
        let restored = false;
        for (const id of [session.targetId, ...fallbackIds]) {
          try { editor.open(id); restored = true; break; } catch { /* A parent cancellation may have collected this temporary material. */ }
        }
        if (!restored && target === 'sound') timbre.create();
      }
      if (!options.references?.resume(session.draftId)) scopes.delete(session.draftId);
    }
  }
  function returnFromSession(session: ReferenceSession, result?: Extract<ReferenceApplyResult, { status: 'applied' }>): void {
    scopes.delete(session.draftId);
    if (result?.workingDraftId) {
      const target = workspaceFor(session.targetKind); editorFor(target).openDraft(result.workingDraftId); refreshWorkspace(target); return;
    }
    ensureOriginalEditor(session);
    if (session.context) {
      if (session.rootKind === 'rootsound.co-creation') {
        if (options.coCreation) { options.coCreation.openDraft(session.context.root.id); showCoCreation(); }
        else { options.phrase?.open(result?.content.id ?? session.targetId); showPhrase(); }
        return;
      }
      const target = workspaceFor(session.rootKind!); const editor = editorFor(target);
      if (session.context.root.type === 'draft') editor.openDraft(session.context.root.id); else editor.open(session.context.root.id);
      showWorkspace(target);
    } else if (options.catalog) showCatalog(); else showWorkspace(workspaceFor(session.targetKind));
  }
  function applySession(target: CreativeWorkspace, selected?: { ids: string[]; token: string }, deferNavigation = false): void {
    const session = ensureSession(target);
    const captured = activeReferenceEditors();
    const selection = selected ?? scopes.get(session.draftId);
    const result = options.references!.apply(session.draftId, selection ? { locationIds: selection.ids, expectedToken: selection.token } : undefined);
    if (result.status !== 'applied') throw new Error(result.status === 'conflict' ? result.reason : result.message);
    repairReferenceEditors(captured);
    const finish = () => returnFromSession(session, result);
    if (deferNavigation) window.setTimeout(finish, 0); else finish();
  }
  function cancelSession(target: CreativeWorkspace): boolean {
    try {
      const session = currentSession(target); if (!session || !options.references) return true;
      const captured = activeReferenceEditors();
      const result = options.references.cancel(session.draftId);
      if (result.status !== 'done') throw new Error(result.status === 'conflict' ? result.reason : result.message);
      repairReferenceEditors(captured);
      returnFromSession(session);
      return true;
    } catch (error) { problem(error instanceof Error ? error.message : String(error)); return false; }
  }
  function sessionLabels(session: ReferenceSession): string[] {
    let labels = session.labels ?? ['当前素材'];
    let parent = session.context?.root.type === 'draft' ? options.references?.resume(session.context.root.id) : undefined;
    const visited = new Set([session.draftId]);
    while (parent && !visited.has(parent.draftId)) {
      visited.add(parent.draftId); labels = [...(parent.labels ?? []), ...labels.slice(1)];
      parent = parent.context?.root.type === 'draft' ? options.references?.resume(parent.context.root.id) : undefined;
    }
    return labels.filter((label, index) => index === 0 || label !== labels[index - 1]);
  }
  function referenceContext(target: CreativeWorkspace): ReferenceEditorContext | undefined {
    const session = currentSession(target); if (!session) return;
    const selection = scopes.get(session.draftId);
    return {
      label: sessionLabels(session).join(' › '),
      hint: session.pendingApplyCount ? `${session.pendingApplyCount} 处修改待应用`
        : selection ? `将应用到 ${selection.ids.length} 处` : undefined,
      backLabel: session.context ? `取消并返回${session.rootKind === 'rootsound.song' ? '歌曲' : session.rootKind === 'rootsound.co-creation' && options.coCreation ? '灵感共创' : '乐句'}` : '取消编辑',
      onBack: () => cancelSession(target),
      onSave: () => applySession(target),
      onApplyElsewhere: () => chooseLocations(target),
    };
  }
  function chooseLocations(target: CreativeWorkspace, selectBeforeEditing = false): void {
    try {
      const wasSession = currentSession(target);
      const session = ensureSession(target); const available = options.references!.locations(session.draftId);
      const releaseAdoption = () => {
        if (!wasSession) {
          const result = options.references!.cancel(session.draftId);
          if (result.status !== 'done') problem(result.status === 'conflict' ? result.reason : result.message);
        }
      };
      if (!available.locations.length) {
        releaseAdoption(); problem('这份内容目前没有其他使用位置。可以继续修改并正常保存。'); return;
      }
      const selected = new Set(scopes.get(session.draftId)?.ids ?? []);
      showReferenceLocations(root, {
        title: selectBeforeEditing ? '一起修改哪些位置？' : '应用到哪些位置？',
        description: selectBeforeEditing ? '先选好范围，再继续调整。只有保存时才会应用修改。' : '只有选中的位置会采用修改，其他位置保持原样。',
        confirmLabel: selectBeforeEditing ? '选好，开始修改' : '应用修改',
        locations: available.locations.map(location => {
          const labels = location.current ? sessionLabels(session)
            : location.labels.filter((label, index) => index === 0 || label !== location.labels[index - 1]);
          return {
            id: location.id, label: labels.slice(1).join(' › ') || labels[0] || '使用位置', group: labels[0] ?? '使用位置',
            detail: location.current ? '当前这一处' : location.root.type === 'draft' ? '未保存编辑' : '已保存作品',
            selected: location.current || selected.has(location.id), disabled: location.current,
          };
        }),
        onApply(ids) {
          if (selectBeforeEditing) {
            scopes.set(session.draftId, { ids, token: available.token });
            window.setTimeout(() => showWorkspace(target), 0);
          } else applySession(target, { ids, token: available.token }, true);
        },
        onCancel: releaseAdoption,
      });
    } catch (error) { problem(error instanceof Error ? error.message : String(error)); }
  }
  function saveStandalone(target: CreativeWorkspace): void {
    const editor = editorFor(target); const view = editor.read();
    if (!view.draft) throw new Error('先写下一个想法，再保存吧。');
    if (currentSession(target)) { applySession(target); return; }
    if (view.draft.sourceId && !view.changed) return;
    // Opening a library sound/phrase gives no occurrence to replace. Its safe
    // default is a new material, while saving a song updates that current work.
    if (target !== 'song' && view.draft.sourceId && options.references) { ensureSession(target); applySession(target); return; }
    const result = editor.save(view.draft.sourceId ? 'overwrite' : 'new');
    if (result.status !== 'saved') throw new Error(result.status === 'conflict' ? result.reason : result.status === 'storage-error' ? result.message : '这份内容还有其他使用位置，请选择应用范围。');
    refreshWorkspace(target);
  }
  function refreshWorkspace(target: CreativeWorkspace): void {
    if (workspace === target && (target !== 'sound' || timbreEditorMounted && renderedSoundDraft === timbre.read().draft.id) && phraseWorkspace?.refresh) {
      phraseWorkspace.refresh(options.references ? referenceContext(target) : undefined,
        options.references && (target === 'phrase' && options.phrase?.read().draft?.sourceId || target === 'sound' && timbre.read().draft.sourceId) ? () => chooseLocations(target) : undefined);
    } else showWorkspace(target);
  }
  function beginReference(parent: 'phrase' | 'song', path: string[], target: 'sound' | 'phrase', choose = false): void {
    if (!options.references) return;
    const parentId = editorFor(parent).read().draft?.id;
    if (!parentId) throw new Error('先打开要调整的作品。');
    const session = beginOrResumeReferenceEdit(options.references, { root: { type: 'draft', id: parentId }, path });
    editorFor(target).openDraft(session.draftId); showWorkspace(target);
    if (choose) chooseLocations(target, true);
  }

  function renderEntities(): HTMLElement {
    const focus = workspace === 'sound' ? timbre.read().draft : workspace === 'phrase' ? options.phrase?.read().draft : options.song?.read().draft;
    const entities: ProjectEntitiesPort = { read: () => options.entities!.read(workspace === 'phrase'
      ? { draftId: focus?.id ?? '' } : focus ? { draftId: focus.id } : undefined) };
    return createEntityRail(entities, (entity: CreativeEntity) => safely(() => {
      const editor = entity.kind === 'rootsound.timbre' ? timbre : options.phrase;
      if (!editor) throw new Error('编辑器暂不可用。');
      if (entity.draftId) editor.openDraft(entity.draftId);
      else if (options.references) editor.openDraft(options.references.beginLibrary(entity.id).draftId);
      else editor.open(entity.id);
      if (entity.kind === 'rootsound.timbre') showEditor(); else showPhrase();
    }));
  }

  function showProjectPhrase(): void {
    if (!options.phrase) { showEditor(); return; }
    const project = options.song?.read(); const phrase = options.phrase?.read();
    const clip = project?.body?.tracks.flatMap(track => track.clips)[0];
    const session = currentSession('phrase');
    const currentSource = phrase?.draft?.sourceId;
    const inProject = currentSource && options.entities?.read().current.some(item => item.id === currentSource)
      || session?.context?.root.id === project?.draft?.id;
    if (clip && project?.draft && options.references && !inProject) {
      beginReference('song', [clip.id], 'phrase'); return;
    }
    showPhrase();
  }

  function configuredEntry(): WorkspaceId {
    const current = options.preferences?.read();
    return visibleWorkspace(current && current.startWorkspace !== 'last' ? current.startWorkspace : workspace);
  }

  function stopSound(): void { sound.stopAll(); }
  function remember(target: WorkspaceId): void {
    workspace = target;
    hasEnteredWorkspace = true;
    try { options.preferences?.update({ lastWorkspace: target }); } catch { /* Entry preferences must not interrupt musical editing. */ }
    options.onWorkspaceChange?.(target);
  }
  function showWorkspace(target: WorkspaceId): void {
    target = visibleWorkspace(target);
    if (target === 'phrase' && options.phrase) showProjectPhrase();
    else if (target === 'song' && options.song) showSong();
    else if (target === 'library' && options.catalog) showCatalog();
    else if (target === 'co-creation' && options.coCreation) showCoCreation();
    else if (target === 'sampling' && options.sampling) showSampling();
    else showEditor();
  }
  function settings(): void { if (options.preferences) showWorkspaceSettings(root, options.preferences); }
  function problem(message: string): void {
    showMessage('暂时无法完成这个操作', message);
  }
  function showMessage(title: string, message: string): void {
    if (disposed) return;
    const dialog = element('dialog'); dialog.append(element('h2', '', title), element('p', '', message));
    dialog.append(button('返回创作', 'secondary', () => dialog.close())); dialog.addEventListener('close', () => dialog.remove(), { once: true }); root.append(dialog); dialog.showModal();
  }
  async function openProjectFile(): Promise<void> {
    if (!projectTransfer || !options.song || fileBusy) return;
    fileBusy = true;
    try {
      const result = await projectTransfer.open();
      if (disposed || result.status === 'cancelled' || result.status === 'busy') return;
      if (result.status !== 'imported') throw new Error(result.status === 'conflict' ? result.reason : result.message);
      options.song.openDraft(result.draft.id); showSong();
      phraseWorkspace?.notify?.(`已打开“${result.fileName}”，歌曲和用到的声音都已带入，可以继续编辑。`);
    } catch (error) { problem(error instanceof Error ? error.message : String(error)); }
    finally { fileBusy = false; }
  }
  async function saveProjectFile(): Promise<void> {
    if (!projectTransfer || !options.song || fileBusy) return;
    fileBusy = true;
    const mounted = phraseWorkspace;
    try {
      const draft = options.song.read().draft;
      if (!draft) throw new Error('先打开或创作一首歌曲，再保存工程文件吧。');
      const result = await projectTransfer.save(draft.id);
      if (disposed || result.status === 'cancelled' || result.status === 'busy') return;
      const text = result.status === 'saved' ? `已保存工程“${result.name}”。`
        : '已发起工程文件下载，请在浏览器中确认保存位置。';
      if (mounted === phraseWorkspace) mounted?.notify?.(text); else showMessage('工程文件', text);
    } catch (error) { problem(error instanceof Error ? error.message : String(error)); }
    finally { fileBusy = false; }
  }
  function exportAudio(): void {
    if (!options.audioFiles) return;
    try {
      stopSound();
      const editor = workspace === 'song' ? options.song : workspace === 'phrase' ? options.phrase : timbre;
      if (!editor) throw new Error('请先打开要导出的声音或作品。');
      const snapshot = JSON.stringify(editor.read().draft); const name = editor.read().draft?.name;
      if (!name) throw new Error('先写下一个想法，再把它导出为音频吧。');
      showAudioExport(root, { name, prepare: () => editor.preparePreview(), plan: () => {
        if (JSON.stringify(editor.read().draft) !== snapshot) throw new Error('作品已改变，请重新打开导出并确认当前版本。');
        return editor.previewPlan();
      }, sound, files: options.audioFiles });
    } catch (error) { problem(error instanceof Error ? error.message : String(error)); }
  }

  function leavePhrase(): void { workspaceGeneration++; phraseWorkspace?.dispose(); phraseWorkspace = undefined; timbreEditorMounted = false; }
  function useRecognizedPhrase(result: { content: ContentRecord; draft: Draft }, edit: boolean): void {
    if (!options.phrase) throw new Error('乐句编辑暂不可用。');
    if (!options.coCreation) {
      const session = options.references?.beginLibrary(result.content.id, result.draft.id);
      options.phrase.openDraft(session?.draftId ?? result.draft.id); showPhrase(); return;
    }
    if (!options.references) throw new Error('乐句编辑暂不可用。');
    const coCreation = options.coCreation;
    // Retry a failed navigation without recreating a journey or replacing fine edits.
    if (coCreation.read().body?.sourcePhraseId !== result.content.id) coCreation.start(result.content.id);
    if (edit) {
      const session = beginOrResumeReferenceEdit(options.references,
        { root: { type: 'draft', id: coCreation.read().draft.id }, path: ['current'] });
      options.phrase.openDraft(session.draftId); showPhrase();
    } else showCoCreation();
  }
  function showSampling(initialSampleId?: string): void {
    if (!options.sampling) return;
    remember('sampling'); stopSound(); leavePhrase(); notice = undefined;
    const mountedGeneration = workspaceGeneration;
    const creation = new AbortController();
    const mounted = mountSamplingWorkspace(root, { sampling: options.sampling, sound, initialSampleId, recognition: options.recognition,
      onEditRecognizedPhrase: result => useRecognizedPhrase(result, true),
      onCoCreateRecognizedPhrase: options.coCreation ? result => useRecognizedPhrase(result, false) : undefined,
      async onCreateSampleTimbre(id) {
        await timbre.createFromSample(id, creation.signal);
        if (!disposed && workspaceGeneration === mountedGeneration && workspace === 'sampling') showEditor();
      },
      onWelcome: showWelcome, onCoCreation: options.coCreation ? showCoCreation : undefined, onSound: showEditor,
      onPhrase: options.phrase ? showProjectPhrase : undefined, onSong: options.song ? showSong : undefined,
      onLibrary: options.catalog ? showCatalog : undefined, onSettings: options.preferences ? settings : undefined });
    phraseWorkspace = { ...mounted, dispose() { creation.abort(); mounted.dispose(); } };
  }
  function showCoCreation(): void {
    const coCreation = options.coCreation; if (!coCreation) return;
    remember('co-creation'); stopSound(); leavePhrase(); notice = undefined;
    const ready = () => {
      if (pendingReferenceEdits(options.references, coCreation.read().draft.id).length)
        throw new Error('先完成或取消正在细调的乐句，再继续探索。点击“细调这段旋律”可以返回未完成的编辑。');
    };
    phraseWorkspace = mountCoCreationWorkspace(root, { coCreation, sound, onSound: showEditor,
      onSampling: options.sampling ? () => showSampling() : undefined,
      onPhrase: options.phrase ? showPhrase : undefined, onSong: options.song ? showSong : undefined,
      onWelcome: showWelcome, onLibrary: options.catalog ? showCatalog : undefined,
      onSettings: options.preferences ? settings : undefined, beforeChange: ready,
      onEditPhrase() {
        if (!options.references || !options.phrase) throw new Error('当前版本暂时无法细调这段乐句。');
        const rootId = coCreation.read().draft.id;
        const session = beginOrResumeReferenceEdit(options.references, { root: { type: 'draft', id: rootId }, path: ['current'] });
        options.phrase.openDraft(session.draftId); showPhrase();
      },
      onUsePhrase(id) {
        ready(); if (!options.song) throw new Error('当前版本暂时无法编排歌曲。');
        options.song.createFromPhrase(id); showSong();
      },
    });
  }
  function showPhrase(): void {
    if (!options.phrase) return;
    remember('phrase');
    stopSound(); leavePhrase();
    notice = undefined;
    phraseWorkspace = mountPhraseWorkspace(root, { phrase: options.phrase, sound, onSound: showEditor, onWelcome: showWelcome,
      renderEntities: options.entities ? renderEntities : undefined,
      onSampling: options.sampling ? () => showSampling() : undefined,
      onCoCreation: options.coCreation ? showCoCreation : undefined,
      onSong: options.song ? showSong : undefined, onLibrary: options.catalog ? showCatalog : undefined,
      onSettings: options.preferences ? settings : undefined, onExport: options.audioFiles ? exportAudio : undefined,
      referenceContext: options.references ? referenceContext('phrase') : undefined,
      onSave: options.references ? () => saveStandalone('phrase') : undefined,
      onApplyElsewhere: options.references && options.phrase.read().draft?.sourceId ? () => chooseLocations('phrase') : undefined,
      onEditSound: options.references ? (partId, choose) => beginReference('phrase', [partId], 'sound', choose) : undefined });
  }
  function showSong(): void {
    if (!options.song) return;
    remember('song'); stopSound(); leavePhrase(); notice = undefined;
    phraseWorkspace = mountSongWorkspace(root, { song: options.song, sound, onSound: showEditor, onPhrase: showProjectPhrase, onWelcome: showWelcome,
      renderEntities: options.entities ? renderEntities : undefined,
      onSampling: options.sampling ? () => showSampling() : undefined,
      onCoCreation: options.coCreation ? showCoCreation : undefined,
      onLibrary: options.catalog ? showCatalog : undefined, onSettings: options.preferences ? settings : undefined,
      onExport: options.audioFiles ? exportAudio : undefined,
      onOpenProject: projectTransfer ? openProjectFile : undefined,
      onSaveProject: projectTransfer ? saveProjectFile : undefined,
      referenceContext: options.references ? referenceContext('song') : undefined,
      onSave: options.references ? () => saveStandalone('song') : undefined,
      onEditPhrase: options.references ? (ref, choose) => beginReference('song', [ref.clipId], 'phrase', choose) : undefined });
  }
  function showCatalog(): void {
    if (!options.catalog) return;
    remember('library'); stopSound(); leavePhrase(); notice = undefined;
    phraseWorkspace = mountCatalogWorkspace(root, { catalog: options.catalog, sound, onSound: showEditor, onPhrase: showProjectPhrase,
      onSampling: options.sampling ? () => showSampling() : undefined,
      onCoCreation: options.coCreation ? showCoCreation : undefined,
      onSong: showSong, onWelcome: showWelcome, onSettings: settings,
      onOpen(id, kind, draft) {
        if (kind === 'rootsound.sample' && !draft && options.sampling) { showSampling(id); return; }
        if (kind === 'rootsound.co-creation' && draft && options.coCreation) {
          options.coCreation.openDraft(id); showCoCreation(); return;
        }
        const editor = kind === 'rootsound.timbre' ? timbre : kind === 'rootsound.phrase' ? options.phrase : kind === 'rootsound.song' ? options.song : undefined;
        if (!editor) throw new Error('这类内容目前没有可用的编辑工作区，原内容仍然保留。');
        if (draft) editor.openDraft(id);
        else if (options.references && kind !== 'rootsound.song') editor.openDraft(options.references.beginLibrary(id).draftId);
        else editor.open(id);
        if (kind === 'rootsound.phrase') showPhrase();
        else showWorkspace(kind === 'rootsound.timbre' ? 'sound' : 'song');
      },
      async onPreview(id, signal) { if (!options.previewContent) throw new Error('暂时没有可用的试听能力。'); return options.previewContent(id, signal); },
    });
  }

  async function openSoundFile(): Promise<void> {
    if (!options.files || fileBusy) return;
    fileBusy = true;
    stopSound();
    try {
      const result = await options.files.open();
      if (result.status === 'cancelled') return;
      timbre.importSound(result.text);
      showEditor();
      report(`已打开“${result.name}”，可以继续修改。原来的声音仍然保留。`);
    } catch (error) { report(error instanceof Error ? error.message : String(error), true); }
    finally { fileBusy = false; }
  }
  async function saveSoundFile(): Promise<void> {
    if (!options.files || fileBusy) return;
    fileBusy = true;
    try {
      const result = await options.files.save(timbre.exportSound(), timbre.read().draft.name + '.rssound');
      if (result.status === 'saved') report(`声音文件“${result.name}”已保存。`);
      else if (result.status === 'download-started') report('已发起声音文件下载，请在浏览器中确认保存位置。');
    } catch (error) { report(error instanceof Error ? error.message : String(error), true); }
    finally { fileBusy = false; }
  }

  function report(message: string, error = false): void {
    if (notice) { notice.textContent = message; notice.classList.toggle('is-error', error); }
    else phraseWorkspace?.notify?.(message, error);
  }
  function safely(action: () => void): void {
    try { action(); } catch (error) {
      // Reload the authoritative draft so rejected edits cannot remain on screen.
      try { showEditor(); } catch { /* Keep the last visible error surface. */ }
      report(error instanceof Error ? error.message : String(error), true);
    }
  }
  function showWelcome(): void {
    leavePhrase();
    stopSound();
    root.replaceChildren();
    const page = element('main', 'welcome');
    page.append(element('div', 'wordmark', 'RootSound'));
    const invitation = element('section', 'invitation');
    invitation.append(element('h1', '', '你好，\n你想创作什么？'));
    invitation.append(button('开始创作', 'primary journey', showEditor));
    if (options.hasPrevious || hasEnteredWorkspace) invitation.append(button('继续创作', 'quiet continue', () => showWorkspace(workspace)));
    if (projectTransfer) invitation.append(button('打开工程…', 'quiet welcome-open-project', () => { void openProjectFile(); }));
    page.append(invitation);
    page.append(button('直接进入创作  →', 'quiet skip', () => showWorkspace(configuredEntry())));
    if (options.preferences) page.append(button('设置', 'quiet welcome-settings', settings));
    root.append(page);
  }

  function save(mode: 'overwrite' | 'new', confirmation?: SaveConfirmation): void {
    safely(() => {
      const result = timbre.save(mode, confirmation);
      if (result.status === 'saved') { showEditor(); report(`“${result.content.name}”已保存，可以随时回来继续。`); }
      else if (result.status === 'needs-confirmation') showSaveChoice(result);
      else report(result.status === 'conflict' ? result.reason : result.message, true);
    });
  }
  function showSaveChoice(result: Extract<SaveResult, { status: 'needs-confirmation' }>): void {
    const modal = element('dialog', 'save-dialog');
    modal.append(element('h2', '', '这个声音正在被使用'));
    modal.append(element('p', '', '覆盖后，以下内容会使用修改后的声音：'));
    const list = element('ul');
    for (const content of result.affectedContent) list.append(element('li', '', content.name));
    for (const draft of result.affectedDrafts) list.append(element('li', '', `${draft.name} · 未完成编辑`));
    modal.append(list);
    const actions = element('div', 'dialog-actions');
    const close = () => { modal.close(); modal.remove(); };
    actions.append(button('返回编辑', 'secondary', close), button('保存为新声音', 'secondary', () => { close(); save('new'); }),
      button('确认覆盖', 'primary', () => { close(); save('overwrite', result.confirmation); }));
    modal.append(actions);
    modal.addEventListener('cancel', () => modal.remove(), { once: true });
    root.append(modal);
    modal.showModal();
  }
  function showLibrary(): void {
    const modal = element('dialog', 'library-dialog');
    const heading = element('div', 'library-heading');
    heading.append(element('h2', '', '我的声音'), button('关闭', 'quiet', () => modal.close()));
    modal.append(heading);
    const view = timbre.read();
    const sounds = view.savedSounds;
    if (view.unfinishedDrafts.length) {
      modal.append(element('p', 'control-caption', '继续未完成的编辑'));
      for (const draft of view.unfinishedDrafts) modal.append(button(draft.name + ' · 编辑稿  ↗', 'library-sound', () => safely(() => {
        stopSound(); timbre.openDraft(draft.id); modal.close(); showEditor();
      })));
    }
    if (!sounds.length) modal.append(element('p', 'muted', '保存后的声音也会出现在这里。'));
    else modal.append(element('p', 'control-caption library-group', '已保存的声音'));
    for (const content of sounds) modal.append(button(content.name + '  ↗', 'library-sound', () => safely(() => {
      stopSound();
      if (options.references) timbre.openDraft(options.references.beginLibrary(content.id).draftId); else timbre.open(content.id);
      modal.close(); showEditor();
    })));
    modal.addEventListener('close', () => modal.remove(), { once: true });
    root.append(modal);
    modal.showModal();
  }

  function showTimbreStarts(): void {
    const modal = element('dialog', 'timbre-start-dialog');
    const heading = element('div', 'library-heading'); heading.append(element('h2', '', '新建音色'), button('关闭', 'quiet', () => modal.close())); modal.append(heading);
    const grid = element('div', 'timbre-start-grid');
    for (const preset of timbrePresets()) {
      const item = element('div', 'timbre-start-item');
      item.append(element('span', 'timbre-start-category', preset.category), button(preset.name, 'quiet', () => safely(() => {
        modal.close(); newTimbre(() => { timbre.createFromPreset(preset.id); showEditor(); });
      })), button('▷ 试听', 'quiet', () => { void sound.audition(previewTimbrePreset(preset.id)).catch(error => problem(String(error))); })); grid.append(item);
    }
    if (options.sampling) { const item = element('div', 'timbre-start-item'); item.append(element('span', 'timbre-start-category', '采样'), button('使用录音或音频…', 'quiet', () => { modal.close(); newTimbre(showSampling); })); grid.append(item); }
    modal.append(grid); modal.addEventListener('close', () => { sound.cancelAudition(); modal.remove(); }, { once: true }); root.append(modal); modal.showModal();
  }
  function newTimbre(create?: () => void): void {
    // Browsing or cancelling the chooser must not end an occurrence edit.
    if (!create) { showTimbreStarts(); return; }
    const session = currentSession('sound');
    if (!session) { safely(create); return; }
    if (!timbre.read().changed) { if (cancelSession('sound')) safely(create); return; }
    const dialog = element('dialog', 'save-dialog'); dialog.append(element('h2', '', '先处理当前修改'), element('p', '', '新建前，是否保存当前音色的修改？'));
    const actions = element('div', 'dialog-actions');
    actions.append(button('返回', 'quiet', () => dialog.close()),
      button('放弃修改并新建', 'secondary', () => { dialog.close(); if (cancelSession('sound')) safely(create); }),
      button('保存后新建', 'primary', () => safely(() => { dialog.close(); applySession('sound'); create(); })));
    dialog.append(actions); dialog.addEventListener('close', () => dialog.remove(), { once: true }); root.append(dialog); dialog.showModal();
  }
  function showEditor(): void {
    const view = timbre.read(); remember('sound'); leavePhrase(); stopSound(); notice = undefined; renderedSoundDraft = view.draft.id;
    if (view.body.model === 'sample-instrument') {
      phraseWorkspace = mountSampleTimbreWorkspace(root, { timbre, sound, onWelcome: showWelcome, onSound: showEditor,
        renderEntities: options.entities ? renderEntities : undefined,
        onSampling: options.sampling ? () => showSampling() : undefined,
        onPhrase: options.phrase ? showProjectPhrase : undefined, onSong: options.song ? showSong : undefined,
        onLibrary: options.catalog ? showCatalog : undefined, onMySounds: showLibrary,
        onNewSound: newTimbre, onSettings: options.preferences ? settings : undefined,
        onExport: options.audioFiles ? exportAudio : undefined,
        referenceContext: options.references ? referenceContext('sound') : undefined,
        onSave: () => saveStandalone('sound'),
        onApplyElsewhere: options.references && view.draft.sourceId ? () => chooseLocations('sound') : undefined });
    } else {
      const context = options.references ? referenceContext('sound') : undefined;
      phraseWorkspace = mountSynthWorkspace(root, { timbre, sound, onWelcome: showWelcome, onNew: newTimbre,
        onSave: () => saveStandalone('sound'), onSaveCopy: () => save('new'),
        onPhrase: options.phrase ? showProjectPhrase : undefined, onSong: options.song ? showSong : undefined,
        onSampling: options.sampling ? () => showSampling() : undefined, onLibrary: options.catalog ? showCatalog : undefined,
        onMySounds: !context ? showLibrary : undefined, onSettings: options.preferences ? settings : undefined,
        onImport: options.files && !context ? () => { void openSoundFile(); } : undefined,
        onExportSound: options.files ? () => { void saveSoundFile(); } : undefined,
        onExportAudio: options.audioFiles ? exportAudio : undefined,
        referenceContext: context,
        onApplyElsewhere: options.references && view.draft.sourceId ? () => chooseLocations('sound') : undefined,
        renderEntities: options.entities ? renderEntities : undefined });
    }
    timbreEditorMounted = true;
  }

  if (preference?.welcomeEnabled === false) showWorkspace(configuredEntry()); else showWelcome();
  return { dispose() { disposed = true; stopSound(); leavePhrase(); root.replaceChildren(); } };
}
