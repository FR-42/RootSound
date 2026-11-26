export const MAX_HUM_SECONDS = 8;
const ANALYSIS_RATE = 8000;
const WINDOW = 320;
const MIN_LAG = 5;
const MAX_LAG = 132;
const SPECTRAL_WINDOW = Float32Array.from({ length: WINDOW }, (_, index) => .5 - .5 * Math.cos(2 * Math.PI * index / WINDOW));
const MAJOR_CHORD_STEPS = [4, 7];
const MAJOR_FIRST_FIVE_STEPS = [2, 4, 5, 7];

export function frequencyPitchClass(hz: number): number {
  const midi = Math.round(69 + 12 * Math.log2(hz / 440));
  return ((midi % 12) + 12) % 12;
}

export function majorGuidePitchRole(pitch: number, tonic: number, firstFiveDegrees = false): 'tonic' | 'scale' | undefined {
  const interval = (pitch - tonic + 12) % 12;
  const steps = firstFiveDegrees ? MAJOR_FIRST_FIVE_STEPS : MAJOR_CHORD_STEPS;
  return interval === 0 ? 'tonic' : steps.includes(interval) ? 'scale' : undefined;
}

function pitchMinimum(differences: Float32Array, lag: number) {
  const middle = differences[lag]!, left = differences[lag - 1]!, right = differences[lag + 1]!;
  const curvature = left + right - 2 * middle;
  if (curvature <= 0) return { period: lag, error: middle };
  const offset = (left - right) / (2 * curvature);
  return { period: lag + offset, error: Math.max(0, middle - curvature * offset * offset / 2) };
}

function harmonicPower(samples: Float32Array, at: number, period: number): number {
  const factor = 2 * Math.cos(2 * Math.PI / period);
  let previous = 0, older = 0;
  for (let i = 0; i < WINDOW; i++) {
    const value = samples[at + i]! * SPECTRAL_WINDOW[i]! + factor * previous - older;
    older = previous;
    previous = value;
  }
  return (previous ** 2 + older ** 2 - factor * previous * older) * (4 / WINDOW) ** 2;
}

function detectPitch(samples: Float32Array, at: number, differences: Float32Array, threshold = .22) {
  let mean = 0, energy = 0;
  for (let i = 0; i < WINDOW; i++) {
    const sample = samples[at + i]!;
    mean += sample;
    energy += sample * sample;
  }
  const power = energy / WINDOW - (mean / WINDOW) ** 2;
  if (power < .0012 ** 2) return;
  let cumulative = 0;
  for (let lag = 1; lag <= MAX_LAG; lag++) {
    let error = 0;
    for (let i = 0; i < WINDOW; i++) {
      const delta = samples[at + i]! - samples[at + i + lag]!;
      error += delta * delta;
    }
    cumulative += error;
    differences[lag] = cumulative > 0 ? error * lag / cumulative : 1;
  }
  let best = 0;
  for (let lag = MIN_LAG; lag < MAX_LAG; lag++) {
    const value = differences[lag]!;
    if (value < threshold && value <= differences[lag - 1]! && value <= differences[lag + 1]!) { best = lag; break; }
  }
  if (!best) return;
  const first = pitchMinimum(differences, best);
  let selected = first;
  for (let multiplier = 2; multiplier <= 4; multiplier++) {
    const centre = Math.round(first.period * multiplier);
    if (centre > MAX_LAG + 2) break;
    for (let lag = centre - 2; lag <= Math.min(centre + 2, MAX_LAG - 1); lag++) {
      const value = differences[lag]!;
      if (value > differences[lag - 1]! || value > differences[lag + 1]!) continue;
      const candidate = pitchMinimum(differences, lag);
      const ratio = candidate.period / selected.period;
      const multiple = Math.round(ratio);
      if (multiple < 2 || Math.abs(ratio - multiple) > .06 || candidate.error > selected.error + .006) continue;
      const minimumHarmonicPower = power * .0016;
      for (let harmonic = 1; harmonic <= 3; harmonic++) {
        if (harmonic % multiple === 0) continue;
        if (harmonicPower(samples, at, candidate.period / harmonic) >= minimumHarmonicPower) {
          selected = candidate;
          break;
        }
      }
    }
  }
  return { frequency: ANALYSIS_RATE / selected.period, period: selected.period, error: selected.error };
}

export async function recognizeHum(samples: Float32Array, sampleRate: number, signal?: AbortSignal): Promise<number | undefined> {
  if (!Number.isFinite(sampleRate) || sampleRate < ANALYSIS_RATE || signal?.aborted) return;
  const stride = sampleRate / ANALYSIS_RATE;
  const inputLength = Math.min(samples.length, Math.floor(sampleRate * MAX_HUM_SECONDS));
  const reduced = new Float32Array(Math.floor(inputLength / stride));
  for (let i = 0; i < reduced.length; i++) {
    const start = Math.floor(i * stride), end = Math.floor((i + 1) * stride);
    let sum = 0;
    for (let j = start; j < end; j++) sum += samples[j]!;
    reduced[i] = sum / (end - start);
  }
  const sustained = new Uint16Array(12), differences = new Float32Array(MAX_LAG + 1);
  let frames = 0, run = 0, previous: number | undefined;
  function keepRun(): void {
    if (previous !== undefined && run >= 6) sustained[previous] = sustained[previous]! + run;
  }
  for (let at = 0; at + WINDOW + MAX_LAG < reduced.length; at += 160) {
    if (signal?.aborted) return;
    const frequency = detectPitch(reduced, at, differences)?.frequency;
    const pitch = frequency === undefined ? undefined : frequencyPitchClass(frequency);
    if (pitch !== previous) { keepRun(); previous = pitch; run = 0; }
    if (pitch !== undefined) run++;
    if (++frames % 24 === 0) await new Promise<void>(resolve => setTimeout(resolve, 0));
  }
  if (signal?.aborted) return;
  keepRun();
  let tonic = 0, total = 0;
  for (const [pitch, count] of sustained.entries()) {
    total += count;
    if (count > sustained[tonic]!) tonic = pitch;
  }
  return sustained[tonic]! >= 6 && sustained[tonic]! >= total * .70 ? tonic : undefined;
}


export function createHumPitchTracker(onPitch: (midi: number) => void) {
  const samples = new Float32Array(WINDOW + MAX_LAG);
  const differences = new Float32Array(MAX_LAG + 1);
  const octaveResidual = new Float32Array(WINDOW);
  let write = 0, sum = 0, count = 0, phase = 0;
  let candidate: number | undefined, confirmed: number | undefined, frames = 0;
  let noiseFloor = .00045;

  function recentSamplesAgree(period: number): boolean {
    const lag = Math.floor(period), fraction = period - lag;
    let error = 0, energy = 0;
    for (let i = samples.length - 80; i < samples.length; i++) {
      const value = samples[i]!;
      const earlier = samples[i - lag]! * (1 - fraction) + samples[i - lag - 1]! * fraction;
      error += (value - earlier) ** 2;
      energy += value * value + earlier * earlier;
    }
    return energy > 0 && error < energy * .16;
  }

  function supportsLowerOctave(upperPeriod: number, power: number): boolean {
    const lag = Math.floor(upperPeriod), fraction = upperPeriod - lag;
    for (let i = 0; i < WINDOW; i++) {
      const shifted = samples[i + lag]! * (1 - fraction) + samples[i + lag + 1]! * fraction;
      octaveResidual[i] = (samples[i]! - shifted) * .5;
    }
    return harmonicPower(octaveResidual, 0, upperPeriod * 2) >= power * .00022;
  }

  function analyze(): void {
    let energy = 0, mean = 0;
    for (let i = 0; i < WINDOW; i++) { const value = samples[i]!; energy += value * value; mean += value; }
    const rms = Math.sqrt(Math.max(0, energy / WINDOW - (mean / WINDOW) ** 2));
    const estimate = rms >= Math.max(.0018, noiseFloor * 1.5)
      ? detectPitch(samples, 0, differences, .17) : undefined;
    if (!estimate) {
      candidate = undefined;
      frames = 0;
      noiseFloor += (Math.min(rms, .015) - noiseFloor) * (rms > noiseFloor ? .035 : .1);
      return;
    }
    const note = 69 + 12 * Math.log2(estimate.frequency / 440);
    let midi = Math.round(note);
    let octaveChange = false;
    if (confirmed !== undefined) {
      const distance = note - confirmed;
      if (Math.abs(distance) < .70) midi = confirmed;
      if (Math.abs(Math.abs(distance) - 12) < .75) {
        const rising = distance > 0;
        const lowerSupported = supportsLowerOctave(estimate.period / (rising ? 1 : 2), rms ** 2);
        octaveChange = rising ? !lowerSupported : lowerSupported;
        if (!octaveChange) midi = confirmed;
      }
    }
    if (midi !== candidate) { candidate = midi; frames = 0; }
    const clear = estimate.error < .055 && recentSamplesAgree(estimate.period);
    const requiredFrames = octaveChange ? (clear ? 6 : 8) : (clear ? 3 : 5);
    if (++frames >= requiredFrames && confirmed !== midi) { confirmed = midi; onPitch(midi); }
  }

  return {
    push(chunk: Float32Array, rate: number): void {
      if (!Number.isFinite(rate) || rate < ANALYSIS_RATE) return;
      for (const sample of chunk) {
        sum += sample;
        count++;
        phase += ANALYSIS_RATE;
        if (phase < rate) continue;
        phase -= rate;
        samples[write++] = sum / count;
        sum = count = 0;
        if (write !== samples.length) continue;
        analyze();
        samples.copyWithin(0, 160);
        write -= 160;
      }
    },
  };
}
