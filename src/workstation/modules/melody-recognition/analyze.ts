import { MAX_MELODY_INPUT_SECONDS, type MelodyAnalysis, type MelodyAnalysisOptions, type RecognizedNote } from '../../contracts/melody-recognition.ts';
import { MAX_PCM_AUDIO_BYTES, type PcmAudio } from '../../contracts/sound.ts';

// Offline single-voice working range, not a tuning system or a note grid.
const MIN_HZ = 55;
const MAX_HZ = 1400;
const HOP_SECONDS = 0.01;
const MIN_NOTE_SECONDS = 0.06;
const CHANGE_CENTS = 85;
const MAX_NOTES = 512;

type Frame = { hz: number; confidence: number; rms: number };
type Segment = { first: number; last: number; runFirst: boolean; runLast: boolean };

function cancelled(options: MelodyAnalysisOptions): void {
  if (!options.signal?.aborted) return;
  const error = new Error('旋律分析已取消。'); error.name = 'AbortError'; throw error;
}
function report(options: MelodyAnalysisOptions, value: number): void {
  cancelled(options);
  try { options.onProgress?.(Math.max(0, Math.min(1, value))); } catch { /* A display observer cannot interrupt the analysis. */ }
  cancelled(options);
}
async function yieldAnalysis(options: MelodyAnalysisOptions): Promise<void> {
  await new Promise<void>(resolve => setTimeout(resolve, 0)); cancelled(options);
}
function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b); const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle]! : (sorted[middle - 1]! + sorted[middle]!) / 2;
}
function cents(a: number, b: number): number { return 1200 * Math.log2(a / b); }
function noMelody(): never { throw new Error('没有找到稳定的单人旋律，请使用较清晰的哼唱后重试。'); }

async function snapshotChannel(audio: PcmAudio, options: MelodyAnalysisOptions): Promise<{ data: Float32Array; sampleRate: number; channelCount: number; channelIndex: number; duration: number }> {
  if (!audio || typeof audio !== 'object' || !Number.isInteger(audio.sampleRate) || audio.sampleRate < 8000 || audio.sampleRate > 192000
    || !Array.isArray(audio.channels) || !audio.channels.length || audio.channels.length > 8) throw new Error('旋律识别需要 8–192 kHz、1–8 声道的有效声音。');
  const sampleRate = audio.sampleRate; const channelCount = audio.channels.length;
  const length = audio.channels[0]?.length ?? 0;
  if (!length || length * audio.channels.length * 4 > MAX_PCM_AUDIO_BYTES) throw new Error('这份声音为空或超出当前分析容量。');
  const duration = length / sampleRate;
  if (duration > MAX_MELODY_INPUT_SECONDS) throw new Error('当前一次可识别 30 秒以内的旋律，请先选取较短片段。');
  for (const channel of audio.channels) if (!(channel instanceof Float32Array) || channel.length !== length) throw new Error('声音的各声道需要相同长度的 Float32 音频。');
  // Take ownership before the first await: subsequent caller changes cannot alter a run.
  const channels = audio.channels.map(channel => new Float32Array(channel));
  let strongest = 0; let strongestEnergy = -1; let selectedMean = 0;
  for (let index = 0; index < channels.length; index++) {
    const channel = channels[index]!; let mean = 0; let energy = 0;
    for (let sample = 0; sample < length; sample++) {
      const value = channel[sample]!;
      if (!Number.isFinite(value)) throw new Error('声音包含无效数据，尚未开始旋律识别。');
      // AC energy avoids selecting a silent channel just because it has a DC offset.
      const difference = value - mean; mean += difference / (sample + 1); energy += difference * (value - mean);
      if ((sample + 1) % 262144 === 0) { report(options, 0.04 * (index + (sample + 1) / length) / channels.length); await yieldAnalysis(options); }
    }
    if (energy > strongestEnergy) { strongest = index; strongestEnergy = energy; selectedMean = mean; }
  }
  if (strongestEnergy / length < 1e-16) noMelody();
  const data = channels[strongest]!; let peak = 0;
  for (const value of data) peak = Math.max(peak, Math.abs(value - selectedMean));
  if (!peak) noMelody();
  for (let index = 0; index < length; index++) data[index] = (data[index]! - selectedMean) / peak;
  report(options, 0.04);
  return { data, sampleRate, channelCount, channelIndex: strongest, duration };
}

/** Centred Blackman-windowed sinc before decimation; no phase/group-delay shift. */
async function decimate(input: Float32Array, sampleRate: number, options: MelodyAnalysisOptions): Promise<{ data: Float32Array; rate: number }> {
  const factor = Math.max(1, Math.floor(sampleRate / 8000));
  if (factor === 1) { report(options, 0.14); return { data: input, rate: sampleRate }; }
  const radius = 12 * factor; const cutoff = 0.42 / factor;
  const kernel = new Float64Array(2 * radius + 1); let sum = 0;
  for (let index = -radius; index <= radius; index++) {
    const sinc = index === 0 ? 2 * cutoff : Math.sin(2 * Math.PI * cutoff * index) / (Math.PI * index);
    const window = 0.42 + 0.5 * Math.cos(Math.PI * index / radius) + 0.08 * Math.cos(2 * Math.PI * index / radius);
    kernel[index + radius] = sinc * window; sum += kernel[index + radius]!;
  }
  for (let index = 0; index < kernel.length; index++) kernel[index] = kernel[index]! / sum;
  const data = new Float32Array(Math.ceil(input.length / factor));
  for (let index = 0; index < data.length; index++) {
    const at = index * factor; const first = Math.max(-radius, -at); const last = Math.min(radius, input.length - 1 - at); let value = 0;
    for (let tap = first; tap <= last; tap++) value += input[at + tap]! * kernel[tap + radius]!;
    data[index] = value;
    if ((index + 1) % 8192 === 0) { report(options, 0.04 + 0.1 * (index + 1) / data.length); await yieldAnalysis(options); }
  }
  report(options, 0.14); return { data, rate: sampleRate / factor };
}

function parabola(values: Float64Array, index: number): { at: number; value: number } {
  const left = values[index - 1]!; const middle = values[index]!; const right = values[index + 1]!;
  const curve = left - 2 * middle + right;
  const delta = curve > 1e-20 ? Math.max(-1, Math.min(1, 0.5 * (left - right) / curve)) : 0;
  return { at: index + delta, value: Math.max(0, middle - 0.25 * (left - right) * delta) };
}

function fractionalDifference(window: Float64Array, width: number, period: number): number {
  // At short periods, cubic interpolation attenuates strong upper harmonics and
  // biases the residual minimum. A small bandlimited interpolator keeps the
  // high end of the declared voice range on its original physical frequency.
  let kernel: Float64Array | undefined;
  const integer = Math.floor(period); const fraction = period - integer;
  if (period < 16) {
    kernel = new Float64Array(16); let sum = 0;
    for (let tap = -7; tap <= 8; tap++) {
      const distance = tap - fraction;
      const sinc = Math.abs(distance) < 1e-12 ? 1 : Math.sin(Math.PI * distance) / (Math.PI * distance);
      const taper = 0.42 + 0.5 * Math.cos(Math.PI * distance / 8) + 0.08 * Math.cos(2 * Math.PI * distance / 8);
      kernel[tap + 7] = sinc * taper; sum += kernel[tap + 7]!;
    }
    for (let index = 0; index < kernel.length; index++) kernel[index] = kernel[index]! / sum;
  }
  let difference = 0; let energy = 0;
  const margin = kernel ? 8 : 2;
  for (let index = margin; index < width - margin; index++) {
    const base = index + integer; let delayed: number;
    if (kernel) {
      delayed = 0; for (let tap = -7; tap <= 8; tap++) delayed += window[base + tap]! * kernel[tap + 7]!;
    } else {
      const a = window[base - 1]!; const b = window[base]!; const c = window[base + 1]!; const d = window[base + 2]!;
      delayed = b + 0.5 * fraction * (c - a + fraction * (2 * a - 5 * b + 4 * c - d + fraction * (3 * (b - c) + d - a)));
    }
    const original = window[index]!; const delta = original - delayed;
    difference += delta * delta; energy += original * original + delayed * delayed;
  }
  return energy > 1e-20 ? difference / energy : 1;
}

function refinePeriod(window: Float64Array, width: number, initial: number, maximum: number): { period: number; error: number } {
  // Short periods are poorly represented by integer-lag parabolas. Check the
  // original waveform at fractional lags before interpreting a deeper multiple
  // as evidence of a missing fundamental. This avoids octave drops near 1400 Hz.
  let low = Math.max(2, initial - 0.5); let high = Math.min(maximum, initial + 0.5);
  const ratio = (Math.sqrt(5) - 1) / 2;
  let left = high - ratio * (high - low); let right = low + ratio * (high - low);
  let leftError = fractionalDifference(window, width, left); let rightError = fractionalDifference(window, width, right);
  for (let iteration = 0; iteration < 9; iteration++) {
    if (leftError < rightError) {
      high = right; right = left; rightError = leftError; left = high - ratio * (high - low); leftError = fractionalDifference(window, width, left);
    } else {
      low = left; left = right; leftError = rightError; right = low + ratio * (high - low); rightError = fractionalDifference(window, width, right);
    }
  }
  return leftError < rightError ? { period: left, error: leftError } : { period: right, error: rightError };
}

/** YIN difference / CMNDF / first suitable dip, with sub-sample interpolation.
 * Reference: de Cheveigné & Kawahara (2002), https://doi.org/10.1121/1.1458024.
 * This estimates periodicity, not the probability that a recording contains a voice.
 */
function pitch(data: Float32Array, centre: number, rate: number, difference: Float64Array, normalized: Float64Array, window: Float64Array): { hz: number; confidence: number } {
  const maximum = difference.length - 2; const minimum = Math.max(2, Math.floor(rate / MAX_HZ));
  const width = window.length - maximum - 1;
  const begin = Math.round(centre - window.length / 2);
  for (let index = 0; index < window.length; index++) window[index] = data[begin + index] ?? 0;
  difference[0] = 0; normalized[0] = 1; let total = 0;
  for (let lag = 1; lag <= maximum + 1; lag++) {
    let value = 0;
    for (let index = 0; index < width; index++) { const delta = window[index]! - window[index + lag]!; value += delta * delta; }
    difference[lag] = value; total += value; normalized[lag] = total > 1e-20 ? value * lag / total : 1;
  }
  let selected = -1; let best = -1; let bestValue = 1;
  for (let lag = minimum; lag <= maximum; lag++) {
    if (normalized[lag]! > normalized[lag - 1]! || normalized[lag]! > normalized[lag + 1]!) continue;
    const candidate = parabola(normalized, lag);
    // These are approximate candidate positions; the raw/fractional estimate is
    // checked below. Rounding at an endpoint must not discard the true first dip.
    if (candidate.at < rate / MAX_HZ - 0.5 || candidate.at > rate / MIN_HZ + 0.5) continue;
    if (candidate.value < bestValue) { bestValue = candidate.value; best = lag; }
    if (candidate.value < 0.16) { selected = lag; break; }
  }
  if (selected < 0) { if (best < 0 || bestValue > 0.28) return { hz: 0, confidence: 0 }; selected = best; }
  // A weak fundamental with stronger even harmonics can make the first dip an
  // octave too high. Only accept a longer period when its periodicity is markedly
  // better; exact sine waves must not become arbitrary subharmonics.
  let score = parabola(normalized, selected).value;
  let refined = refinePeriod(window, width, parabola(difference, selected).at, maximum + 0.5);
  for (const multiple of [2, 3]) {
    if (refined.error < 0.008) break;
    const around = Math.round(refined.period * multiple);
    if (around < minimum + 1 || around > maximum - 1) continue;
    let alternative = around;
    for (let lag = Math.max(minimum, around - 2); lag <= Math.min(maximum, around + 2); lag++) if (normalized[lag]! < normalized[alternative]!) alternative = lag;
    const lower = parabola(normalized, alternative);
    const alternativeRefined = refinePeriod(window, width, parabola(difference, alternative).at, maximum + 0.5);
    if (alternativeRefined.error < refined.error * 0.22 && lower.value <= 0.28 && alternativeRefined.period <= rate / MIN_HZ + 0.5) {
      selected = alternative; score = lower.value; refined = alternativeRefined;
    }
  }
  const hz = rate / refined.period;
  // Small endpoint tolerance reflects the finite analysis window, not quantizing
  // to a boundary frequency. The measured continuous Hz value is retained.
  return hz >= MIN_HZ * 0.998 && hz <= MAX_HZ * 1.002 && score <= 0.28 ? { hz, confidence: Math.max(0, Math.min(1, 1 - score)) } : { hz: 0, confidence: 0 };
}

function smooth(frames: Frame[], gate: number): void {
  const original = frames.map(frame => frame.hz);
  for (let index = 0; index < frames.length; index++) {
    if (!original[index]) continue;
    const nearby = original.slice(Math.max(0, index - 1), index + 2).filter(value => value > 0);
    if (nearby.length === 3) frames[index]!.hz = Math.pow(2, median(nearby.map(value => Math.log2(value))));
  }
  // Bridge brief confidence dropouts, never an actual energy rest or a pitch jump.
  for (let index = 1; index < frames.length - 1; index++) {
    if (frames[index]!.hz) continue;
    let end = index;
    while (end < frames.length && !frames[end]!.hz && end - index < 3) end++;
    if (end - index > 2 || end >= frames.length || !frames[end]!.hz || !frames[index - 1]!.hz
      || Math.abs(cents(frames[end]!.hz, frames[index - 1]!.hz)) > 65
      || frames.slice(index, end).some(frame => frame.rms < gate)) continue;
    for (let fill = index; fill < end; fill++) {
      frames[fill]!.hz = Math.sqrt(frames[index - 1]!.hz * frames[end]!.hz);
      frames[fill]!.confidence = Math.min(frames[index - 1]!.confidence, frames[end]!.confidence) * 0.9;
    }
    index = end - 1;
  }
}

function segments(frames: Frame[], gate: number): Segment[] {
  const output: Segment[] = [];
  for (let run = 0; run < frames.length;) {
    if (!frames[run]!.hz) { run++; continue; }
    let end = run + 1; while (end < frames.length && frames[end]!.hz) end++;
    let first = run; let sum = Math.log2(frames[run]!.hz); let count = 1; let changing = -1; let sign = 0;
    function append(last: number): void { if (last >= first) output.push({ first, last, runFirst: first === run, runLast: last === end - 1 }); }
    for (let index = run + 1; index < end; index++) {
      // A marked envelope valley followed by a new attack distinguishes repeated
      // notes at the same pitch, even when the singer leaves no full silent gap.
      const level = frames[index]!.rms;
      const before = Math.max(...frames.slice(Math.max(run, index - 8), index).map(frame => frame.rms));
      const after = Math.max(...frames.slice(index + 1, Math.min(end, index + 9)).map(frame => frame.rms), 0);
      const onset = index - first >= 9 && end - index >= 5 && level < before * 0.48 && level < after * 0.48
        && before > gate * 2 && after > gate * 2 && level <= frames[index - 1]!.rms && level < (frames[index + 1]?.rms ?? Infinity);
      if (onset) {
        append(index - 1); first = index; sum = Math.log2(frames[index]!.hz); count = 1; changing = -1; sign = 0; continue;
      }
      const log = Math.log2(frames[index]!.hz); const movement = (log - sum / count) * 1200;
      if (Math.abs(movement) > CHANGE_CENTS) {
        const direction = Math.sign(movement);
        if (changing < 0 || sign !== direction) { changing = index; sign = direction; }
        if (index - changing >= 3) {
          append(changing - 1); first = changing; sum = 0; count = 0;
          for (let at = first; at <= index; at++) { sum += Math.log2(frames[at]!.hz); count++; }
          changing = -1; sign = 0; continue;
        }
      } else { changing = -1; sign = 0; }
      sum += log; count++;
    }
    append(end - 1); run = end;
  }
  return output;
}

/** Pure offline analysis: no microphone, player, material store, tuning or time grid. */
export async function analyzeMelody(audio: PcmAudio, options: MelodyAnalysisOptions = {}): Promise<MelodyAnalysis> {
  report(options, 0);
  const selected = await snapshotChannel(audio, options);
  const { data, rate } = await decimate(selected.data, selected.sampleRate, options);
  const hop = Math.max(1, Math.round(rate * HOP_SECONDS)); const step = hop / rate;
  const frames: Frame[] = [];
  for (let first = 0; first < data.length; first += hop) {
    const end = Math.min(data.length, first + hop); let energy = 0;
    for (let at = first; at < end; at++) energy += data[at]! * data[at]!;
    frames.push({ hz: 0, confidence: 0, rms: Math.sqrt(energy / (end - first)) });
  }
  const loudest = Math.max(...frames.map(frame => frame.rms));
  if (loudest < 0.0005) noMelody();
  const gate = Math.max(0.0001, loudest * 0.055);
  const maximum = Math.ceil(rate / MIN_HZ); const width = Math.round(rate * 0.025);
  const difference = new Float64Array(maximum + 2); const normalized = new Float64Array(maximum + 2);
  const window = new Float64Array(width + maximum + 1);
  for (let index = 0; index < frames.length; index++) {
    const frame = frames[index]!;
    if (frame.rms >= gate) Object.assign(frame, pitch(data, (index + 0.5) * hop, rate, difference, normalized, window));
    if ((index + 1) % 16 === 0) { report(options, 0.14 + 0.8 * (index + 1) / frames.length); await yieldAnalysis(options); }
  }
  smooth(frames, gate); report(options, 0.95);
  const regions = segments(frames, gate); const notes: RecognizedNote[] = []; let hasContour = false;
  const bounds = regions.map(region => {
    let first = region.first; let end = region.last + 1;
    if (region.runFirst) for (let extra = 0; extra < 3 && first > 0 && frames[first - 1]!.rms >= gate; extra++) first--;
    if (region.runLast) for (let extra = 0; extra < 3 && end < frames.length && frames[end]!.rms >= gate; extra++) end++;
    return { start: first * step, end: Math.min(selected.duration, end * step) };
  });
  for (let index = 1; index < bounds.length; index++) {
    if (bounds[index - 1]!.end <= bounds[index]!.start) continue;
    const boundary = (regions[index - 1]!.last + 1 + regions[index]!.first) * step / 2;
    bounds[index - 1]!.end = boundary; bounds[index]!.start = boundary;
  }
  for (let index = 0; index < regions.length; index++) {
    const region = regions[index]!; const bound = bounds[index]!;
    if (bound.end - bound.start < MIN_NOTE_SECONDS) continue;
    const voiced = frames.slice(region.first, region.last + 1);
    const logs = voiced.map(frame => Math.log2(frame.hz)); const frequencyHz = Math.pow(2, median(logs));
    const ordered = [...logs].sort((a, b) => a - b);
    if ((ordered[Math.floor((ordered.length - 1) * 0.9)]! - ordered[Math.floor((ordered.length - 1) * 0.1)]!) * 1200 > 95) hasContour = true;
    const amplitude = Math.sqrt(voiced.reduce((sum, frame) => sum + frame.rms * frame.rms, 0) / voiced.length);
    notes.push({ startSeconds: bound.start, durationSeconds: bound.end - bound.start, frequencyHz,
      velocity: Math.max(0.12, Math.min(1, Math.sqrt(amplitude / loudest) * 0.9)),
      confidence: voiced.reduce((sum, frame) => sum + frame.confidence, 0) / voiced.length });
  }
  if (!notes.length || notes.reduce((sum, note) => sum + note.durationSeconds, 0) < MIN_NOTE_SECONDS) noMelody();
  if (notes.length > MAX_NOTES) throw new Error('识别出的音符超过当前 512 个的编辑范围，请先选取较短片段。');
  const coverage = Math.min(1, notes.reduce((sum, note) => sum + note.durationSeconds, 0) / selected.duration);
  const warnings: string[] = [];
  if (selected.channelCount > 1) warnings.push(`已使用音量最强的第 ${selected.channelIndex + 1} 声道识别，避免不同声道相互抵消。`);
  if (coverage < 0.45) warnings.push('只整理出声音中较稳定的旋律片段；其余部分保留为空白，可继续调整。');
  if (notes.some(note => note.confidence < 0.85)) warnings.push('部分音符的识别把握较低，建议先试听再微调。');
  if (hasContour) warnings.push('连续滑音已整理为可编辑音符，音高变化的细节可以继续微调。');
  report(options, 1);
  return { durationSeconds: selected.duration, channelIndex: selected.channelIndex, notes, coverage, warnings };
}
