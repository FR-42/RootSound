import { createMaterialLibrary, createMaterialCatalog, createReferenceEditing, createProjectPackages } from '../modules/materials/public.ts';
import { createBrowserSoundRuntime } from '../modules/sound-runtime/public.ts';
import { createTimbreEditor, createTimbrePlayback, createTimbreReferenceAdapter } from '../modules/timbre/public.ts';
import { createPhraseEditor, createPhrasePlayback, createPhraseReferenceAdapter } from '../modules/phrase/public.ts';
import { createSongEditor, createSongPlayback, createSongReferenceAdapter } from '../modules/song/public.ts';
import { createCoCreationReferenceAdapter } from '../modules/co-creation/public.ts';
import { createPostProduction } from '../modules/post-production/public.ts';
import { createProjectAssets } from '../modules/project-assets/public.ts';
import { createSampling, createSampleAudio, createBrowserSampleDecoder, createBrowserSampleCapture, createSampleReferenceAdapter } from '../modules/sampling/public.ts';
import { createMelodyRecognition, createBrowserMelodyAnalyzer } from '../modules/melody-recognition/public.ts';
import { mountStudio } from '../modules/ui-rendering/public.ts';
import { createDesktopPlatform, isDesktopOrigin } from './platform/desktop.ts';
import { createBrowserSoundFiles, createBrowserAudioFiles, createBrowserProjectFiles } from './platform/browser-files.ts';
import { createWorkspacePreferences } from './platform/preferences.ts';
import { createBrowserSampleFiles } from './platform/sample-files.ts';
import { previewSavedSample } from './sample-preview.ts';

// Platform adapters share the same musical units and never silently switch stores.
const STORAGE_KEY = 'rootsound.workstation.materials.v1';
const root = document.getElementById('app')!;
const runtime = createBrowserSoundRuntime();
try {
  const platform = isDesktopOrigin() ? createDesktopPlatform() : {
    storage: { read: () => localStorage.getItem(STORAGE_KEY), write: (value: string) => localStorage.setItem(STORAGE_KEY, value) },
    files: createBrowserSoundFiles(),
    audioFiles: createBrowserAudioFiles(),
    projectFiles: createBrowserProjectFiles(),
    sampleFiles: createBrowserSampleFiles(),
  };
  const previous = platform.storage.read();
  const contentAdapters = [createTimbreReferenceAdapter(), createPhraseReferenceAdapter(), createSongReferenceAdapter(), createCoCreationReferenceAdapter(), createSampleReferenceAdapter()];
  const library = createMaterialLibrary(platform.storage, { project: { rootKind: 'rootsound.song', adapters: contentAdapters } });
  const decoder = createBrowserSampleDecoder();
  const sampleAudio = createSampleAudio(library, decoder);
  const timbre = createTimbreEditor(library, sampleAudio);
  const timbrePlayback = createTimbrePlayback(library, sampleAudio);
  const phrasePlayback = createPhrasePlayback(library, timbrePlayback);
  const phrase = createPhraseEditor(library, timbrePlayback);
  const postProduction = createPostProduction();
  const song = createSongEditor(library, phrasePlayback, { defaultTempoMode: 'source', postProduction });
  const songPlayback = createSongPlayback(library, phrasePlayback, postProduction);
  const sampling = createSampling(library, { files: platform.sampleFiles, decoder, capture: createBrowserSampleCapture() });
  const recognition = createMelodyRecognition(library, { analyzer: createBrowserMelodyAnalyzer(), currentSourceToken() {
    const source = sampling.read(); return source.phase === 'idle' ? source.audioToken : undefined;
  } });
  const references = createReferenceEditing(library, contentAdapters);
  const projects = createProjectPackages(library, contentAdapters, { rootKind: 'rootsound.song' });
  const preferences = createWorkspacePreferences({ getItem: key => localStorage.getItem(key), setItem: (key, value) => localStorage.setItem(key, value) });
  const studio = mountStudio(root, { timbre, phrase, song, sampling, recognition, references,
    catalog: createMaterialCatalog(library, { currentProject: () => song.read().draft }), preferences,
    entities: createProjectAssets(library, () => song.read().draft),
    sound: runtime, hasPrevious: previous !== null, files: platform.files, audioFiles: platform.audioFiles,
    projects, projectFiles: platform.projectFiles,
    async previewContent(contentId, signal) {
      if (signal?.aborted) throw new Error('这次试听已取消。');
      const content = library.readContentInfo(contentId);
      if (!content) throw new Error('找不到要试听的素材。');
      if (content.kind === 'rootsound.sample') return previewSavedSample(sampling, runtime, contentId, signal);
      if (content.kind === 'rootsound.timbre') await timbrePlayback.prepareForSaved(contentId);
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
  window.addEventListener('pagehide', event => {
    if (event.persisted) { recognition.cancel(); sampling.leave(); runtime.stopAll(); return; }
    recognition.dispose(); sampling.dispose(); studio.dispose(); void runtime.dispose();
  });
} catch (error) {
  const message = document.createElement('main'); message.className = 'startup-error';
  const title = document.createElement('h1'); title.textContent = '暂时无法打开你的声音';
  const explanation = document.createElement('p'); explanation.textContent = error instanceof Error ? error.message : String(error);
  const detail = document.createElement('p'); detail.textContent = '原有保存数据已保留。请保留此窗口中的错误信息，解决后重新打开。';
  message.append(title, explanation, detail); root.replaceChildren(message);
  void runtime.dispose();
}
