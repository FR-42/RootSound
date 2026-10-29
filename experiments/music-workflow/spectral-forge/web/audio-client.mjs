/** UI/device boundary. Construction, patch editing and export open no device. */
export function createAudioClient({ onError = () => {}, onStatus = () => {},
  contextFactory = () => new AudioContext({ latencyHint: 'interactive', sampleRate: 48000 }),
  workerFactory = () => new Worker(new URL('./render-worker.mjs', import.meta.url), { type: 'module' }),
  nodeFactory = context => new AudioWorkletNode(context, 'rootsound-spectral-synth', { numberOfInputs: 0, numberOfOutputs: 1, outputChannelCount: [2] }),
} = {}) {
  let patch, version = 0, context, node, analyser, initializing, disposed = false, lastNote, noteSerial = 0;
  let previewWorker, renderWorker, workerSerial = 0, patchTimer, refreshing = false, refreshPending = false, appliedVersion = -1;
  const pending = new Map();
  const held = new Map(); const recent = [];
  const preparations = new Map();
  function failWorker(worker, error) {
    for (const [id, request] of pending) if (request.worker === worker) {
      pending.delete(id); clearTimeout(request.timeout); request.detach?.(); request.reject(error);
    }
    if (worker === previewWorker) previewWorker = undefined;
    if (worker === renderWorker) renderWorker = undefined;
    worker.terminate();
  }
  function makeWorker(kind) {
    const worker = workerFactory(kind);
    worker.onmessage = event => {
      const response = event.data;
      const request = pending.get(response?.id); if (!request || request.worker !== worker) return;
      pending.delete(response.id); clearTimeout(request.timeout); request.detach?.();
      if (response.type === 'error' || response.error) request.reject(new Error(response.message || response.error || '声音计算失败'));
      else request.resolve(response);
    };
    worker.onerror = error => {
      failWorker(worker, new Error(error.message || '声音计算器未能运行'));
    };
    return worker;
  }
  function callWorker(kind, type, payload, signal) {
    if (disposed) return Promise.reject(new Error('音色工具已关闭'));
    if (signal?.aborted) return Promise.reject(new DOMException('已取消', 'AbortError'));
    const worker = kind === 'render' ? renderWorker ??= makeWorker(kind) : previewWorker ??= makeWorker(kind);
    return new Promise((resolve, reject) => {
      const id = `audio-${++workerSerial}`;
      const timeout = setTimeout(() => {
        failWorker(worker, new Error('声音计算超时，请缩短时长或减少叠加'));
      }, 120000);
      const abort = () => {
        // A render owns its dedicated worker, never the live preview worker.
        failWorker(worker, new DOMException('已取消', 'AbortError'));
      };
      const detach = signal ? () => signal.removeEventListener('abort', abort) : undefined;
      signal?.addEventListener('abort', abort, { once: true });
      pending.set(id, { resolve, reject, timeout, worker, detach });
      try { worker.postMessage({ type, id, ...payload }); }
      catch (error) { pending.delete(id); clearTimeout(timeout); detach?.(); reject(error); }
    });
  }
  function midis() { return [...new Set([...held.values()].map(note => note.midi).concat(recent))].slice(0, 24); }
  function prepareCurrent() {
    if (!node || !patch || disposed) return Promise.resolve(false);
    const requested = version; const snapshot = patch; const expectedNode = node;
    if (requested === appliedVersion) return Promise.resolve(true);
    if (preparations.has(requested)) return preparations.get(requested);
    const preparation = (async () => {
      const response = await callWorker('preview', 'prepare', { patch: snapshot, sampleRate: context.sampleRate, midis: midis() });
      if (disposed || requested < appliedVersion || node !== expectedNode) return false;
      // An in-flight frame may trail the UI slightly, but must not be starved by
      // continuous dragging or replace a newer frame that was already installed.
      node.port.postMessage({ type: 'patch', patch: snapshot, prepared: response.prepared });
      appliedVersion = requested;
      return true;
    })().finally(() => preparations.delete(requested));
    preparations.set(requested, preparation); return preparation;
  }
  function scheduleRefresh() {
    if (patchTimer !== undefined || refreshing || disposed) return;
    patchTimer = setTimeout(async () => {
      patchTimer = undefined; refreshing = true; refreshPending = false;
      try { await prepareCurrent(); } catch (error) { if (!disposed) onError(error); }
      finally { refreshing = false; if (refreshPending && !disposed) scheduleRefresh(); }
    }, 18);
  }
  async function ensure() {
    if (disposed) throw new Error('音色工具已关闭');
    if (!initializing) initializing = (async () => {
      onStatus('准备声音…');
      const created = contextFactory(); context = created;
      try {
        await created.audioWorklet.addModule(new URL('./synth-worklet.mjs', import.meta.url));
        if (disposed || context !== created) throw new Error('声音准备已取消');
        node = nodeFactory(created);
        analyser = created.createAnalyser(); analyser.fftSize = 8192; analyser.smoothingTimeConstant = .25;
        node.port.onmessage = event => { if (event.data?.type === 'error') onError(new Error(event.data.message)); };
        node.connect(analyser); analyser.connect(created.destination);
        onStatus('就绪');
      } catch (error) { await created.close().catch(() => {}); context = node = analyser = undefined; initializing = undefined; throw error; }
    })();
    const attempt = initializing;
    try { await attempt; }
    catch (error) { if (initializing === attempt) initializing = undefined; throw error; }
    if (context?.state === 'suspended') await context.resume();
  }
  async function noteOn(id, midi, velocity = .85) {
    if (disposed || !patch) return;
    const note = { midi, velocity }; held.set(id, note);
    recent.unshift(midi); recent.splice(16);
    try {
      await ensure();
      if (disposed || held.get(id) !== note) return;
      await prepareCurrent();
      if (disposed || held.get(id) !== note || !node) return;
      node.port.postMessage({ type: 'noteOn', id, midi, velocity });
      lastNote = { id, serial: ++noteSerial, midi, polyphonic: held.size > 1, started: context.currentTime, released: null };
    } catch (error) { if (!disposed && held.get(id) === note) { held.delete(id); onError(error); } }
  }
  function noteOff(id) {
    const note = held.get(id); held.delete(id);
    node?.port.postMessage({ type: 'noteOff', id });
    if (note && lastNote?.id === id && context && lastNote.released === null) lastNote.released = context.currentTime;
  }
  function stop(immediate = true) {
    held.clear(); lastNote = undefined;
    node?.port.postMessage({ type: 'allNotesOff', immediate });
  }
  function setPatch(next) {
    patch = structuredClone(next); version++;
    if (!node || disposed) return;
    refreshPending = true; scheduleRefresh();
  }
  return {
    setPatch, noteOn, noteOff, stop,
    render(snapshot, options, signal) { return callWorker('render', 'render', { patch: structuredClone(snapshot), options }, signal); },
    get analyser() { return analyser; },
    get activeKeys() { return new Set([...held.values()].map(note => note.midi)); },
    get noteClock() { return context && lastNote ? { ...lastNote, age: context.currentTime - lastNote.started } : undefined; },
    get sampleRate() { return context?.sampleRate; },
    async dispose() {
      if (disposed) return; stop(); disposed = true; clearTimeout(patchTimer);
      for (const request of pending.values()) { clearTimeout(request.timeout); request.detach?.(); request.reject(new DOMException('已关闭', 'AbortError')); }
      pending.clear(); previewWorker?.terminate(); renderWorker?.terminate(); node?.disconnect(); analyser?.disconnect();
      await context?.close().catch(() => {});
    },
  };
}
