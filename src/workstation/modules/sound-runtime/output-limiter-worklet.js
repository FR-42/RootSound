export const OUTPUT_CEILING = 10 ** (-1 / 20);
export const OUTPUT_LOOKAHEAD_SECONDS = .004;

export class OutputPeakLimiter {
  left = 0;
  right = 0;
  #frame = 0;
  #peakHead = 0;
  #peakTail = 0;
  #gain = 1;

  constructor(rate) {
    this.delayFrames = Math.max(1, Math.round(rate * OUTPUT_LOOKAHEAD_SECONDS));
    this.windowFrames = this.delayFrames + Math.round(rate * .045);
    this.peakFrames = new Float64Array(this.windowFrames + 2);
    this.peaks = new Float32Array(this.peakFrames.length);
    this.leftDelay = new Float32Array(this.delayFrames);
    this.rightDelay = new Float32Array(this.delayFrames);
    this.gains = new Float64Array(this.delayFrames + 1).fill(1);
    this.gainSum = this.gains.length;
    this.release = Math.exp(-1 / (rate * .12));
  }

  push(left, right) {
    if (!Number.isFinite(left)) left = 0;
    if (!Number.isFinite(right)) right = 0;
    const frame = this.#frame++;
    const peak = Math.max(Math.abs(left), Math.abs(right));
    const size = this.peaks.length;
    while (this.#peakHead < this.#peakTail && this.peakFrames[this.#peakHead % size] < frame - this.windowFrames)
      this.#peakHead++;
    while (this.#peakTail > this.#peakHead && this.peaks[(this.#peakTail - 1) % size] <= peak)
      this.#peakTail--;
    const peakSlot = this.#peakTail++ % size;
    this.peakFrames[peakSlot] = frame;
    this.peaks[peakSlot] = peak;

    const target = Math.min(1, OUTPUT_CEILING / this.peaks[this.#peakHead % size]);
    this.#gain = target < this.#gain ? target : target - (target - this.#gain) * this.release;
    const gainSlot = frame % this.gains.length;
    this.gainSum += this.#gain - this.gains[gainSlot];
    this.gains[gainSlot] = this.#gain;
    const gain = Math.min(1, this.gainSum / this.gains.length);

    const slot = frame % this.delayFrames;
    this.left = this.leftDelay[slot] * gain;
    this.right = this.rightDelay[slot] * gain;
    this.leftDelay[slot] = left;
    this.rightDelay[slot] = right;
  }
}

if (typeof registerProcessor === 'function') {
  class RootSoundOutputLimiter extends AudioWorkletProcessor {
    limiter = new OutputPeakLimiter(sampleRate);

    process(inputs, outputs) {
      const input = inputs[0];
      const left = input?.[0], right = input?.[1] ?? left;
      const [outLeft, outRight] = outputs[0];
      for (let frame = 0; frame < outLeft.length; frame++) {
        this.limiter.push(left?.[frame] ?? 0, right?.[frame] ?? 0);
        outLeft[frame] = this.limiter.left;
        outRight[frame] = this.limiter.right;
      }
      return true;
    }
  }
  registerProcessor('rootsound-output-limiter', RootSoundOutputLimiter);
}
