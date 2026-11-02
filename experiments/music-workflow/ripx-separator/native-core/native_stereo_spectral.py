"""335480 native left/right spectral-table fusion for analysis mode3.

326880 runs on actual channels1/2.335a50 first relocates each side's
16-byte slots in place;335bd0 combines only co-located frequencies within
one Hz. The retained Ghidra335480 pseudocode incorrectly deletes the blend
branch as unreachable; stereo-fusion-direct.asm preserves its instructions.
Target SHA256:5f088fa4fbbe1759ef75d8034c79f33c846e3bf5f13d5048dd95a6614d2ad441.
Static construction only; original execution/audio equivalence is unverified.
"""
from dataclasses import dataclass, replace
import math

from native_spectral import SpectralPeak, f32, native_configuration, iter_pcm_spectral_frames


@dataclass(frozen=True)
class NativeStereoSpectralPeak(SpectralPeak):
    """Fused native slot with its separate source peaks retained as evidence.

    stereo_balance is the native slot+8 signed word used by3459a0 to choose
    the frequency-search channel. It is NOT a final note/trajectory pan.
    The blend creates no FFT phase; source phases stay on left/right_peak.
    """
    stereo_balance: int = 0
    left_peak: SpectralPeak | None = None
    right_peak: SpectralPeak | None = None


def _relocate_native_slots(peaks, *, sample_rate, base_window, slot_count):
    """335a50..335ab9:ascending in-place relocation; strict strength wins."""
    slots = {}
    for peak in peaks:
        if (not isinstance(peak, SpectralPeak) or type(peak.slot) is not int
                or not 0 <= peak.slot < base_window or peak.slot in slots):
            raise ValueError('Unique native spectral slots within the base window required')
        if any(not math.isfinite(value) or value < 0 for value in (peak.frequency_hz, peak.strength)):
            raise ValueError('Finite nonnegative native spectral fields required')
        if peak.slot < slot_count:
            slots[peak.slot] = peak
    width = f32(f32(f32(sample_rate) * f32(.5)) / f32(base_window))
    for source in range(slot_count):
        peak = slots.get(source)
        if peak is None or peak.frequency_hz == 0 or peak.strength == 0:
            continue
        destination = int(f32(f32(f32(peak.frequency_hz / width) - f32(1)) + f32(.5001)))
        if destination == source or not 0 <= destination < slot_count:
            continue
        occupied = slots.get(destination)
        if occupied is None or occupied.frequency_hz == 0 or occupied.strength < peak.strength:
            slots[destination] = replace(peak, slot=destination)
            del slots[source]
    return slots


def _native_slot_balance(left, right):
    """335c51..335c8d, float32 ratio/round-away-from-zero/clamp."""
    total = f32(right + left)
    word = f32(f32(f32(right / total) * f32(65534)) - f32(32767))
    word = f32(word + f32(.5001)) if word >= 0 else f32(word - f32(.5001))
    return int(min(f32(32767), max(f32(-32767), word)))


def fuse_native_stereo_peaks(left_peaks, right_peaks, *, sample_rate, base_window,
                             slot_count=None):
    """Return original mode3 fused slots without averaging stereo PCM.

    Nonmatching/one-sided slots copy the stronger source (ties choose right)
    and native pan0. Matching positive slots within1Hz receive the native
    strength-weighted frequency, (L²+R²)/(L+R) strength, and stereo word.
    """
    if native_configuration(sample_rate)['base_window'] != base_window:
        raise ValueError('Actual native source sample rate/base window required')
    slot_count = base_window if slot_count is None else slot_count
    if type(slot_count) is not int or not 0 < slot_count <= base_window:
        raise ValueError('Native spectral slot count must fit its base window')
    options = dict(sample_rate=sample_rate, base_window=base_window, slot_count=slot_count)
    left = _relocate_native_slots(left_peaks, **options)
    right = _relocate_native_slots(right_peaks, **options)
    result = []
    for slot in range(slot_count):
        left_peak, right_peak = left.get(slot), right.get(slot)
        left_strength = f32(left_peak.strength) if left_peak is not None and left_peak.frequency_hz != 0 and left_peak.strength > 0 else 0.
        right_strength = f32(right_peak.strength) if right_peak is not None and right_peak.frequency_hz != 0 and right_peak.strength > 0 else 0.
        if left_strength == 0 and right_strength == 0:
            continue
        strongest = left_peak if left_strength > right_strength else right_peak
        balance = 0
        frequency, strength = f32(strongest.frequency_hz), f32(strongest.strength)
        if (left_strength != 0 and right_strength != 0
                and f32(right_peak.frequency_hz - left_peak.frequency_hz) <= 1.
                and f32(left_peak.frequency_hz - right_peak.frequency_hz) <= 1.):
            total = f32(right_strength + left_strength)
            frequency = f32(f32(f32(right_strength * right_peak.frequency_hz)
                + f32(left_strength * left_peak.frequency_hz)) / total)
            strength = f32(f32(f32(right_strength * right_strength)
                + f32(left_strength * left_strength)) / total)
            balance = _native_slot_balance(left_strength, right_strength)
        result.append(NativeStereoSpectralPeak(slot, strength, frequency,
            strongest.level, strongest.center_bin, None, balance, left_peak, right_peak))
    return tuple(result)


def iter_native_stereo_spectral_frames(pcm_channels, *, sample_rate,
        start_frame=0, stop_frame=None, slot_count=None, fft=None):
    """Actual(mean,left,right) task→separate326880 transforms→335480 fusion.

    Mean is the separately owned native channel0 used only when3459a0
    selects it during refinement. FFT discovery always consumes trueL/R.
    """
    if len(pcm_channels) != 3 or any(len(channel) != len(pcm_channels[0]) for channel in pcm_channels):
        raise ValueError('Mode3 requires aligned real(mean,left,right) PCM sources')
    options = dict(sample_count=len(pcm_channels[0]), sample_rate=sample_rate,
        start_frame=start_frame, stop_frame=stop_frame)
    if fft is not None:
        options['fft'] = fft
    left = iter_pcm_spectral_frames(lambda first, count: pcm_channels[1][first:first+count], **options)
    right = iter_pcm_spectral_frames(lambda first, count: pcm_channels[2][first:first+count], **options)
    base_window = native_configuration(sample_rate)['base_window']
    for left_frame, right_frame in zip(left, right, strict=True):
        if left_frame['frame_index'] != right_frame['frame_index']:
            raise ValueError('Native stereo spectral frames lost their shared task clock')
        frame = dict(left_frame)
        frame['peaks'] = fuse_native_stereo_peaks(left_frame['peaks'], right_frame['peaks'],
            sample_rate=sample_rate, base_window=base_window, slot_count=slot_count)
        frame['analysis_channels'] = 3
        frame['stage'] = 'native335480-mode3-fused-spectral-slots'
        yield frame
