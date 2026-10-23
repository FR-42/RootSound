import { MAX_SAMPLE_FILE_BYTES } from '../../contracts/files.ts';
import { MAX_RECORDING_SECONDS, type SampleCapturePort, type SampleDecoderPort, type SampleRecording } from '../../contracts/sampling.ts';
import type { PcmAudio } from '../../contracts/sound.ts';
import { checkSampleBytes, copyPcm, decodePcmWav, validatePcm } from './audio.ts';

/** Decode without opening a playback device; original file bytes remain untouched. */
export function createBrowserSampleDecoder(): SampleDecoderPort {
  return { async decode(bytes) {
    checkSampleBytes(bytes); const wav = decodePcmWav(bytes); if (wav) return wav;
    if (typeof globalThis.OfflineAudioContext !== 'function') throw new Error('当前环境无法解码这种音频，请先尝试未压缩 WAV 文件。');
    try {
      const decoder = new OfflineAudioContext(1, 1, 48000);
      const decoded = await decoder.decodeAudioData(new Uint8Array(bytes).buffer);
      const pcm = { sampleRate: decoded.sampleRate,
        channels: Array.from({ length: decoded.numberOfChannels }, (_, index) => decoded.getChannelData(index)) };
      return copyPcm(pcm);
    } catch (error) {
      throw new Error(`这份音频暂时无法读取，原文件未改动。${error instanceof Error ? error.message : String(error)}`);
    }
  } };
}

function captureError(error: unknown): Error {
  if (error instanceof Error) {
    if (error.name === 'NotAllowedError' || error.name === 'SecurityError') return new Error('麦克风尚未获准使用，请在权限提示或 Windows 隐私设置中允许 RootSound 使用麦克风。');
    if (error.name === 'NotFoundError') return new Error('没有找到可用的麦克风，请连接后重试。');
    if (error.name === 'NotReadableError') return new Error('麦克风暂时无法读取，可能正被其他程序独占。');
    return error;
  }
  return new Error(String(error));
}

/** Captures input only. Audible playback always belongs to the global sound runtime. */
export function createBrowserSampleCapture(): SampleCapturePort {
  let cancelCurrent: (() => void) | undefined;
  return {
    cancel() { cancelCurrent?.(); },
    async start(onProgress): Promise<SampleRecording> {
      if (cancelCurrent) throw new Error('已有录音或麦克风请求，请先停止或取消。');
      if (!globalThis.navigator?.mediaDevices?.getUserMedia || typeof globalThis.AudioContext !== 'function'
        || typeof globalThis.AudioWorkletNode !== 'function') throw new Error('当前环境不支持麦克风录音，请使用新版 RootSound 桌面窗口或安全的浏览器页面。');
      let cancelled = false; let settled = false; let stopping = false; let released = false; let frames = 0;
      let stream: MediaStream | undefined; let context: AudioContext | undefined;
      let input: MediaStreamAudioSourceNode | undefined; let worklet: AudioWorkletNode | undefined;
      let stopTimer: ReturnType<typeof setTimeout> | undefined;
      const chunks: Float32Array[] = [];
      let resolveResult: ((audio: PcmAudio) => void) | undefined;
      let rejectResult: ((error: Error) => void) | undefined;
      let rejectPending!: (error: Error) => void;
      const cancellation = new Promise<never>((_, reject) => { rejectPending = reject; });
      // Cancellation may happen after start resolved, when only the result is awaited.
      void cancellation.catch(() => {});
      const releaseTracks = () => { for (const track of stream?.getTracks() ?? []) track.stop(); };
      const trackEnded = () => {
        if (!stopping && !settled) {
          const error = new Error('麦克风已断开，这次录音没有完成。'); rejectPending(error); finish(error);
        }
      };
      function cleanup(): void {
        if (released) return; released = true;
        if (stopTimer) clearTimeout(stopTimer);
        for (const track of stream?.getTracks() ?? []) track.removeEventListener('ended', trackEnded);
        releaseTracks();
        input?.disconnect();
        if (worklet) { worklet.onprocessorerror = null; worklet.port.onmessage = null; worklet.port.close(); worklet.disconnect(); }
        if (context) { context.onstatechange = null; if (context.state !== 'closed') void context.close().catch(() => {}); }
        if (cancelCurrent === cancel) cancelCurrent = undefined;
      }
      function finish(error?: Error): void {
        if (settled) return; settled = true;
        let audio: PcmAudio | undefined;
        try {
          if (!error) {
            if (!frames || !context) throw new Error('还没有录到声音，请稍等片刻再停止。');
            const channel = new Float32Array(frames); let offset = 0;
            for (const chunk of chunks) { channel.set(chunk, offset); offset += chunk.length; }
            audio = validatePcm({ sampleRate: context.sampleRate, channels: [channel] });
          }
        } catch (caught) { error = captureError(caught); }
        cleanup(); chunks.length = 0;
        if (error) rejectResult?.(error); else resolveResult?.(audio!);
      }
      function cancel(): void {
        if (cancelled || settled) return; cancelled = true;
        const error = new Error('录音已取消。'); rejectPending(error); finish(error);
      }
      cancelCurrent = cancel;
      try {
        const permission = navigator.mediaDevices.getUserMedia({ video: false,
          audio: { channelCount: 1, echoCancellation: false, noiseSuppression: false, autoGainControl: false } });
        const incoming = permission.then(value => {
          if (cancelled) { for (const track of value.getTracks()) track.stop(); throw new Error('录音已取消。'); }
          return value;
        });
        stream = await Promise.race([incoming, cancellation]);
        const tracks = stream.getTracks();
        for (const track of tracks) track.addEventListener('ended', trackEnded);
        if (!tracks.length || tracks.some(track => track.readyState === 'ended')) throw new Error('麦克风已断开，请连接后重试。');
        context = new AudioContext({ latencyHint: 'interactive' });
        if (!context.audioWorklet || context.sampleRate < 8000 || context.sampleRate > 192000) throw new Error('当前声音设备不支持这次录音。');
        let preparationTimer: ReturnType<typeof setTimeout> | undefined;
        try {
          await Promise.race([
            Promise.all([context.audioWorklet.addModule(new URL('./capture-worklet.js', import.meta.url).href), context.resume()]), cancellation,
            new Promise<never>((_, reject) => { preparationTimer = setTimeout(() => reject(new Error('录音设备未能及时启动，请检查设备后重试。')), 5000); }),
          ]);
        } finally { if (preparationTimer) clearTimeout(preparationTimer); }
        if (cancelled || context.state !== 'running') throw new Error('录音未能开始，请重新点击录音。');
        const rate = context.sampleRate;
        const maxFrames = Math.min(Math.floor(rate * MAX_RECORDING_SECONDS), Math.floor((MAX_SAMPLE_FILE_BYTES - 58) / 4));
        const result = new Promise<PcmAudio>((resolve, reject) => { resolveResult = resolve; rejectResult = reject; });
        void result.catch(() => {});
        worklet = new AudioWorkletNode(context, 'rootsound-capture', { numberOfInputs: 1, numberOfOutputs: 1,
          outputChannelCount: [1], channelCount: 1, channelCountMode: 'explicit', processorOptions: { maxFrames } });
        worklet.port.onmessage = event => {
          if (settled || cancelled) return;
          if (event.data?.type === 'done') { finish(); return; }
          if (event.data?.type !== 'chunk' || !(event.data.data instanceof Float32Array)) { finish(new Error('录音数据无效，请重新录制。')); return; }
          const data: Float32Array = event.data.data;
          if (!data.length || frames + data.length > maxFrames) { finish(new Error('录音数据超出当前容量范围。')); return; }
          let level = 0;
          for (const value of data) { if (!Number.isFinite(value)) { finish(new Error('麦克风返回了无效声音。')); return; } level = Math.max(level, Math.abs(value)); }
          chunks.push(data); frames += data.length;
          try { onProgress(frames / rate, Math.min(1, level)); } catch { /* A display observer cannot interrupt recording. */ }
        };
        worklet.onprocessorerror = () => finish(new Error('录音处理意外结束，请重新录制。'));
        context.onstatechange = () => { if (!settled && context?.state !== 'running') finish(new Error('声音设备已暂停，这次录音没有完成。')); };
        input = context.createMediaStreamSource(stream); input.connect(worklet); worklet.connect(context.destination);
        return { result, cancel,
          stop() {
            if (settled || stopping) return; stopping = true;
            // Release the microphone immediately, then flush the worklet's final partial block.
            releaseTracks(); worklet!.port.postMessage({ type: 'stop' });
            if (!settled) stopTimer = setTimeout(() => finish(new Error('录音未能完成最后一段声音，请重新录制。')), 2000);
          },
        };
      } catch (error) { cleanup(); throw captureError(error); }
    },
  };
}
