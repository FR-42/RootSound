"""Portable initial-note handoff for already refined native harmonic frames.

This entry never consumes spectral peaks or raw audio as if they were final
harmonic records. It serializes actual recovered objects and cache readiness
so the application can connect later native stages without fabricating notes.
"""
from dataclasses import asdict, replace
import math
from native_frame_groups import assemble_frame_groups, expand_frame_groups
from native_initial_payload import build_fresh_initial_payloads, InitialNativePayload
from native_merge_candidate import MergeCandidate, eligible_default_merge, note_frequency_at_frame
from native_note_cache import build_note_cache
from native_object_merge import merge_default_objects
from native_minimum_frames import f32


def build_initial_notes_document(record_frames, *, rate_98a1ac: float,
                                 timestep_9c3720: float, component_slots: int,
                                 representative_frequency_provider=None):
    """Connect 0x4c records -> native initial payloads -> portable document.

    record_frames retains EMPTY frames because the native time clock cannot
    skip them. This first-block entry assumes no earlier notes or editing.
    """
    expanded = []
    for records in record_frames:
        packed = assemble_frame_groups(records)
        if packed.remaining_unmarked:
            raise NotImplementedError('Native frame group capacity exceeded; no truncated document emitted')
        expanded.append(expand_frame_groups(packed.groups, packed.marked_records, component_slots))
    payloads = build_fresh_initial_payloads(tuple(expanded), context_start=0,
        rate_98a1ac=rate_98a1ac, timestep_9c3720=timestep_9c3720,
        component_slots=component_slots, existing_notes=(), editing_mode=False)
    return document_from_payloads(payloads,
        representative_frequency_provider=representative_frequency_provider)


def document_from_payloads(payloads, *, representative_frequency_provider=None):
    entries = []
    for index, payload in enumerate(payloads):
        frequency = (None if representative_frequency_provider is None else
                     representative_frequency_provider(payload.harmonic_object))
        cache = build_note_cache(payload, representative_frequency=frequency)
        entries.append({'index': index, 'stage': payload.stage,
            'start_seconds': payload.time_fields[0x10], 'end_seconds': payload.time_fields[0x14],
            'time_fields': {f'0x{offset:02x}': value for offset, value in payload.time_fields.items()},
            'timestep_27c': payload.time_step_27c, 'cache': asdict(cache),
            'harmonic_object': asdict(payload.harmonic_object),
            'frame_group_references': [list(reference) for reference in payload.references]})
    return {'format': 'RipXNativeInitialNotes', 'version': 1,
        'stage': 'native-initial-note-before-final-cleanup',
        'upstream_required': 'refined-native-0x4c-harmonic-records',
        'full_transcription_complete': False,
        'public_model_used': False,
        'representative_frequency_complete': representative_frequency_provider is not None,
        'notes': entries,
        'unavailable_stages': ['full spectral-peak-to-refined-harmonic pipeline',
            '36ad30/36b460 representative-frequency producer' if representative_frequency_provider is None else
            'original-runtime equivalence of supplied native frequency producer',
            '373670 final note cleanup and all editing/variable-timestep paths',
            'native MIDI velocity/program/expression mapping']}


def continue_default_payload(old: InitialNativePayload, incoming_object, *,
                             run_start: int, current_rip_timestep: float,
                             pitch_tolerance_9399e0: float) -> InitialNativePayload | None:
    """Apply one eligible normal cross-block continuation; no editor branch.

    incoming_object uses global native frame coordinates. old's attached
    object uses note-relative coordinates, matching 3723f9. Return None for
    an ineligible candidate so the owner may scan the remaining earlier notes.
    """
    step = f32(current_rip_timestep)
    if not math.isfinite(step) or step <= 0:
        raise ValueError('Positive constant current-rip timestep required')
    old_start = int((f32(old.time_fields[0x08])+.0005)/step)
    old_end = int((f32(old.time_fields[0x0c])+.0005)/step)
    boundary = note_frequency_at_frame(old, old_end-1, current_rip_timestep=step)
    candidate = MergeCandidate(old.time_fields[0x08], old.time_fields[0x0c],
        old.harmonic_object.flags_21c, old.harmonic_object.group_id_220, boundary)
    if not eligible_default_merge(candidate, incoming_object, timestep=step,
            pitch_tolerance_9399e0=pitch_tolerance_9399e0, run_start=run_start):
        return None
    relative_new = replace(incoming_object, start=incoming_object.start-old_start,
                           end=incoming_object.end-old_start)
    merged = merge_default_objects(old.harmonic_object, relative_new)
    fields = dict(old.time_fields)
    ending = f32(f32(f32(old.time_step_27c)*f32(merged.end)) + f32(fields[0x08]))
    for offset in (0x04, 0x0c, 0x14, 0x1c): fields[offset] = ending
    return replace(old, time_fields=fields, harmonic_object=merged,
                   stage='native-default-continuation-before-cache-and-final-cleanup')
