/** Memoryless peak guard: no detector, makeup gain, attack or release pumping. */
export function outputPeakSample(value: number): number {
  const magnitude = Math.abs(value);
  return magnitude <= .95 ? value : Math.sign(value) * (.95 + .05 * Math.tanh((magnitude - .95) / .05));
}
let curve: Float32Array<ArrayBuffer> | undefined;
export function createOutputLimiter(audio: BaseAudioContext, destination: AudioNode) {
  // WaveShaper curves cover [-1,1]. Scale into a wider range so an overloaded
  // sample is bounded while every ordinary sample still has exactly unit gain.
  const input = audio.createGain(); input.gain.setValueAtTime(1 / 16, audio.currentTime);
  const shape = audio.createWaveShaper();
  curve ??= Float32Array.from({ length: 131073 }, (_, i) => outputPeakSample((i / 131072 * 2 - 1) * 16));
  shape.curve = curve; shape.oversample = 'none'; input.connect(shape); shape.connect(destination);
  return { input, dispose() { input.disconnect(); shape.disconnect(); } };
}
