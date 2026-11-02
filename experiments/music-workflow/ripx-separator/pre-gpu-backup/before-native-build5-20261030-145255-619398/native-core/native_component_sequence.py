"""Application-facing sequence boundary for the recovered raw PCM estimator.

This composes the native 3293f0/-1 raw-buffer branch, 32a1b0 phase statistics,
3297a0 amplitude objective, 31b830 consumers and 3190b0 subtraction kernel.
It does not manufacture frequencies, windows, note boundaries or chirp data.
The owning native candidate stage must supply all of those known coordinates.
"""
from dataclasses import asdict, dataclass
import math
from typing import Iterable, Mapping, MutableSequence, Sequence

from native_pcm_estimate import NativeEstimate, estimate_constant_component
from native_pcm_component import add_component_inplace

REFERENCE_SHA256 = '5f088fa4fbbe1759ef75d8034c79f33c846e3bf5f13d5048dd95a6614d2ad441'
SUPPORTED_BRANCH = 'raw-pcm-constant-frequency-unweighted-energy'


@dataclass(frozen=True)
class NativeComponentRequest:
    """Native coordinates, not coordinates inferred by this adapter.

    fit_begin/fit_end originate in the candidate component's sample interval.
    energy_begin/energy_end originate in task+0x488/+0x48c. Keeping these
    independent prevents the adapter from silently guessing an energy range.
    """
    channel: int
    frame_index: int
    fit_begin: int
    fit_end: int
    energy_begin: int
    energy_end: int
    frequency: float
    branch: str = SUPPORTED_BRANCH
    candidate_id: str | None = None

    @classmethod
    def from_mapping(cls, value: Mapping):
        required = ('channel', 'frame_index', 'fit_begin', 'fit_end',
                    'energy_begin', 'energy_end', 'frequency')
        missing = [key for key in required if key not in value]
        if missing:
            raise ValueError('Missing native component fields: ' + ', '.join(missing))
        optional = ('branch', 'candidate_id')
        unknown = set(value).difference(required + optional)
        if unknown:
            raise ValueError('Unsupported component fields: ' + ', '.join(sorted(unknown)))
        return cls(**{key: value[key] for key in required + optional if key in value})


@dataclass(frozen=True)
class NativeComponentResult:
    index: int
    candidate_id: str | None
    channel: int
    estimate: NativeEstimate
    written_range: tuple[int, int] | None
    stage: str = 'native-constant-component-estimation'
    reference_binary_sha256: str = REFERENCE_SHA256
    original_runtime_equivalence_verified: bool = False
    public_model_used: bool = False

    def as_record(self):
        """Finite JSON-ready intermediate record; it is not a MIDI note."""
        return asdict(self)


def _validate_request(request, pcm_channels, hop, *, subtract):
    integer_fields = ('channel', 'frame_index', 'fit_begin', 'fit_end',
                      'energy_begin', 'energy_end')
    if any(type(getattr(request, key)) is not int for key in integer_fields):
        raise ValueError('Native channel, frame and sample coordinates must be integers')
    if request.branch != SUPPORTED_BRANCH:
        raise NotImplementedError('Chirp, filtered-band and preweighted PCM branches remain unrecovered')
    if not 0 <= request.channel < len(pcm_channels):
        raise ValueError('Native component channel is outside supplied PCM')
    if request.candidate_id is not None and not isinstance(request.candidate_id, str):
        raise ValueError('candidate_id must preserve a string identity or remain absent')
    if type(request.frequency) not in (int, float) or not math.isfinite(request.frequency) or request.frequency <= 0:
        raise ValueError('Native candidate frequency must be a finite positive scalar')
    count = len(pcm_channels[request.channel])
    if not (0 <= request.fit_begin < request.fit_end <= count
            and 0 <= request.energy_begin < request.energy_end <= count):
        raise ValueError('Fit and energy ranges must lie within the native PCM channel')
    start = request.frame_index * hop
    if request.frame_index < 0 or not request.fit_begin // hop <= request.frame_index <= (request.fit_end - 1) // hop:
        raise ValueError('Native analysis frame must lie within the fit interval')
    if subtract and start + hop > count:
        raise ValueError('The subtraction kernel requires one complete native hop')


def iter_native_component_results(
    pcm_channels: Sequence[MutableSequence[float]],
    requests: Iterable[NativeComponentRequest | Mapping], *,
    sample_rate: int, hop: int, subtract_inplace: bool = False,
):
    """Estimate explicit native candidates, optionally updating caller-owned PCM.

    PCM values are float32 in the confirmed signed-int16 amplitude scale. This
    adapter does no normalization, codec conversion, threshold pruning or public
    model fallback. With subtract_inplace=False the channels are only borrowed.
    With True each yielded result follows its explicit write to that channel;
    later records are estimated from that updated residual. Previous writes
    are retained if the caller stops iteration or a later request fails.

    This ordering is an explicit engine operation, not a claim that RipX's full
    candidate scheduler, interference correction or 31c500 filtering is restored.
    """
    if type(sample_rate) is not int or sample_rate <= 0 or type(hop) is not int or hop <= 0:
        raise ValueError('Positive native integer sample rate and hop are required')
    if type(subtract_inplace) is not bool:
        raise ValueError('subtract_inplace must be an explicit boolean')
    if not pcm_channels or len(pcm_channels) > 8:
        raise ValueError('Supply between one and eight native PCM channels')
    for index, value in enumerate(requests):
        request = value if isinstance(value, NativeComponentRequest) else NativeComponentRequest.from_mapping(value)
        _validate_request(request, pcm_channels, hop, subtract=subtract_inplace)
        pcm = pcm_channels[request.channel]
        estimate = estimate_constant_component(
            pcm, request.fit_begin, request.fit_end, request.frequency,
            sample_rate, hop, request.frame_index,
            energy_begin=request.energy_begin, energy_end=request.energy_end,
        )
        written = None
        if subtract_inplace:
            written = add_component_inplace(
                pcm, request.frame_index * hop, hop, sample_rate,
                -estimate.amplitude, estimate.frequency, estimate.phase_at_frame,
            )
        yield NativeComponentResult(index, request.candidate_id, request.channel, estimate, written)


class _AbsolutePCMWindow:
    """Retain absolute sample coordinates while owning one requested block."""
    def __init__(self, values, start, sample_count):
        self.values = list(values)
        self.start = start
        self.sample_count = sample_count

    def __len__(self):
        return self.sample_count

    def __getitem__(self, index):
        offset = index - self.start
        if not 0 <= offset < len(self.values):
            raise IndexError('Estimator accessed PCM outside its declared block')
        return self.values[offset]

    def __setitem__(self, index, value):
        offset = index - self.start
        if not 0 <= offset < len(self.values):
            raise IndexError('PCM kernel wrote outside its declared block')
        self.values[offset] = value


def iter_native_window_results(read_pcm, requests, *, sample_counts, sample_rate, hop,
                               write_pcm=None):
    """The same chain through bounded file-backed PCM callbacks.

    read_pcm(channel, start, count) supplies native-amplitude samples at exact
    requested coordinates. Optional write_pcm(channel, start, values) commits
    only the kernel's written range. The owner decides which file or residual
    buffer these callbacks access; this module opens no files and decodes none.
    Later estimates read the owner's latest PCM, including earlier committed
    residuals. No whole-song PCM copy or retained per-song statistic cache is
    introduced here. The explicit energy interval still affects block size.
    """
    if not callable(read_pcm) or write_pcm is not None and not callable(write_pcm):
        raise ValueError('Native PCM callbacks must be callable')
    if type(sample_rate) is not int or sample_rate <= 0 or type(hop) is not int or hop <= 0:
        raise ValueError('Positive native integer sample rate and hop are required')
    if not sample_counts or len(sample_counts) > 8 or any(type(n) is not int or n < 1 for n in sample_counts):
        raise ValueError('Explicit positive sample counts for one to eight channels required')
    # Length-only channel objects let validation precede any I/O.
    lengths = [range(count) for count in sample_counts]
    for index, value in enumerate(requests):
        request = value if isinstance(value, NativeComponentRequest) else NativeComponentRequest.from_mapping(value)
        _validate_request(request, lengths, hop, subtract=write_pcm is not None)
        start = min(request.fit_begin, request.energy_begin)
        end = max(request.fit_end, request.energy_end)
        if write_pcm is not None:
            target = request.frame_index * hop
            start = min(start, target - min(hop // 2, target) + 1)
            end = max(end, target + hop + min(hop // 2, sample_counts[request.channel] - target - hop))
        values = read_pcm(request.channel, start, end - start)
        if len(values) != end - start:
            raise ValueError('Native PCM callback returned an incomplete block')
        pcm = _AbsolutePCMWindow(values, start, sample_counts[request.channel])
        estimate = estimate_constant_component(
            pcm, request.fit_begin, request.fit_end, request.frequency,
            sample_rate, hop, request.frame_index,
            energy_begin=request.energy_begin, energy_end=request.energy_end,
        )
        written = None
        if write_pcm is not None:
            written = add_component_inplace(
                pcm, request.frame_index * hop, hop, sample_rate,
                -estimate.amplitude, estimate.frequency, estimate.phase_at_frame,
            )
            first, stop = written
            if stop > first:
                write_pcm(request.channel, first, pcm.values[first-start:stop-start])
        yield NativeComponentResult(index, request.candidate_id, request.channel, estimate, written)
