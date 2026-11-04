/** Fixed gain: preserve quiet passages; compress only near-full-scale peaks. */
export function createOutputLimiter(audio: BaseAudioContext, destination: AudioNode): DynamicsCompressorNode {
  const limiter = audio.createDynamicsCompressor();
  for (const [parameter, value] of [[limiter.threshold, -1], [limiter.knee, 0], [limiter.ratio, 20], [limiter.attack, .003], [limiter.release, .1]] as const)
    parameter.setValueAtTime(value, audio.currentTime);
  limiter.connect(destination); return limiter;
}
