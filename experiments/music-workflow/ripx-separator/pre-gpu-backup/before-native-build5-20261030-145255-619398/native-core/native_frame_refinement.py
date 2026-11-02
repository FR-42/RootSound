"""Concrete native spectral-frame→refined0x13c peak pipeline.

Owns32c560 preparation/search/finalization and335480 fresh peak conversion.
The band-buffer owner performs the real native filter/cache path; passing no
band data never switches this default route to unfiltered audio.
"""
from dataclasses import dataclass

from native_peak_windows import prepare_peak_window, native_frequency_record_index
from native_frequency_search import search_peak_candidate, finish_native_peak_record
from native_fundamental_seeds import native_fundamental_peak_record


def native_component_type(stereo_balance, analysis_channels):
    """3459a0:its meaningful result is the returned low byte."""
    if analysis_channels < 3:
        return 0
    if not isinstance(stereo_balance, int) or not -32768 <= stereo_balance <= 32767:
        raise ValueError('Native spectral peak stereo-balance word required')
    return 1 if stereo_balance < -0x4800 else 2 if stereo_balance > 0x4800 else 0


@dataclass(frozen=True)
class NativeRefinedFrame:
    frame_index: int
    peak_records_13c: tuple[bytes, ...]
    component_records_230: tuple[bytes, ...]
    source_slots: tuple[int, ...]
    stage: str = 'native-fresh-refined-peak-table-before-cross-frame-corrections'


def refine_native_frame(pcm, frame, window_context, band_buffers, *,
                        analysis_rate, channel, analysis_channels, flag_92=False):
    """Run actual native frequency searches for every retained spectral peak.

    band_buffers exposes the native record upper_frequencies,bandwidth_989fe0,
    and prepare(channel,band_index,begin,end,energy_begin,end,frame_index,
    preweighted=False). This is the implemented native cache owner's API,
    rather than a user-supplied score/recognition callback.
    """
    if flag_92:
        raise NotImplementedError('335480 flag92 reference-energy subtraction branch is not reconstructed here')
    frame_index = frame['frame_index']
    records, components, slots = [], [], []
    for peak in frame['peaks']:
        descriptor = prepare_peak_window(peak, frame_index, window_context)
        if descriptor is None:
            continue
        balance = getattr(peak, 'stereo_balance', None)
        component_type = native_component_type(balance, analysis_channels)
        band_index = native_frequency_record_index(descriptor.frequency_hz,
            band_buffers.upper_frequencies, band_buffers.bandwidth_989fe0, search=True)
        source = band_buffers.prepare(channel, band_index, descriptor.begin,
            descriptor.end, descriptor.begin, descriptor.end, frame_index,
            preweighted=False)
        prepared = search_peak_candidate(pcm, peak, frame_index, window_context,
            analysis_rate=analysis_rate, frequency_record_index=band_index,
            component_type=component_type, prepared_source=source)
        if prepared is None:
            continue
        descriptor, result = prepared
        record = finish_native_peak_record(descriptor, result,
            frequency_record_index=band_index, component_type=component_type)
        if record == bytes(0x230):
            continue
        components.append(record)
        records.append(native_fundamental_peak_record(record))
        slots.append(peak.slot)
    return NativeRefinedFrame(frame_index, tuple(records), tuple(components), tuple(slots))
