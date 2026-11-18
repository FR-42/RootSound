import { OUTPUT_CEILING } from './output-limiter-worklet.js';

let fallbackCurve: Float32Array<ArrayBuffer> | undefined;

function connectNativeLimiter(audio: BaseAudioContext, input: AudioNode, destination: AudioNode): () => void {
  const compressor = audio.createDynamicsCompressor();
  const threshold = -3;
  const ratio = 20;
  compressor.threshold.value = threshold;
  compressor.knee.value = 0;
  compressor.ratio.value = ratio;
  compressor.attack.value = .001;
  compressor.release.value = .16;

  const headroom = audio.createGain();
  const makeupCompensation = 10 ** (threshold * (1 - 1 / ratio) * .6 / 20);
  headroom.gain.setValueAtTime(makeupCompensation / 16, audio.currentTime);
  const shape = audio.createWaveShaper();
  fallbackCurve ??= Float32Array.from({ length: 16385 }, (_, index) => {
    const value = (index / 8192 - 1) * 16;
    return Math.max(-OUTPUT_CEILING, Math.min(OUTPUT_CEILING, value));
  });
  shape.curve = fallbackCurve;
  input.connect(compressor); compressor.connect(headroom); headroom.connect(shape); shape.connect(destination);

  return () => { input.disconnect(); compressor.disconnect(); headroom.disconnect(); shape.disconnect(); };
}

export function createOutputLimiter(audio: BaseAudioContext, input: AudioNode, destination: AudioNode) {
  let disposed = false;
  let detach = () => {};
  function useNativeLimiter(): void {
    if (!disposed) detach = connectNativeLimiter(audio, input, destination);
  }
  async function loadWorklet(): Promise<void> {
    let timer: ReturnType<typeof setTimeout> | undefined;
    try {
      const url = new URL('./output-limiter-worklet.js?no-inline', import.meta.url);
      await Promise.race([
        audio.audioWorklet.addModule(url.href),
        new Promise<never>((_resolve, reject) => {
          timer = setTimeout(() => reject(new Error('AudioWorklet initialization timed out')), 500);
        }),
      ]);
      if (disposed) return;
      const processor = new AudioWorkletNode(audio, 'rootsound-output-limiter', {
        numberOfInputs: 1, numberOfOutputs: 1, outputChannelCount: [2],
        channelCount: 2, channelCountMode: 'explicit', channelInterpretation: 'speakers',
      });
      input.connect(processor); processor.connect(destination);
      detach = () => {
        processor.onprocessorerror = null; processor.port.close(); input.disconnect(); processor.disconnect();
      };
      processor.onprocessorerror = () => { detach(); useNativeLimiter(); };
    } catch {
      useNativeLimiter();
    } finally {
      if (timer !== undefined) clearTimeout(timer);
    }
  }

  const ready = typeof globalThis.AudioWorkletNode === 'function' && audio.audioWorklet ? loadWorklet() : undefined;
  if (!ready) useNativeLimiter();

  return { ready, dispose() { disposed = true; detach(); } };
}
