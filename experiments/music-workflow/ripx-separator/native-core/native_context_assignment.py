"""Recovered fresh-note assignment at 370a00 -> 384830.

This is the original context selector, not a timbre classifier. The source
reads analysis context bytes; it does not inspect pitch or harmonic arrays.
Transient type/21c flags are deliberately separate from instrument identity.
"""
from dataclasses import dataclass


@dataclass(frozen=True)
class NativeInstrumentAssignment:
    instrument_id_20: int | None
    source: str
    complete: bool
    limitation: str | None = None


def transient_instrument_id(native_kind: int | None, *, context_mode_14: int | None):
    """382b40's exact type switch; context-dependent cases remain unknown."""
    if native_kind is None:return None
    if type(native_kind) is not int or not 0<=native_kind<=255:
        raise ValueError('Native expanded group kind must be a byte or unknown')
    fixed={2:34,3:34,0x10:31,0x11:32,0x12:33,0x40:1}
    if native_kind in fixed:return fixed[native_kind]
    if native_kind in (0x7e,0x7f,0x80):
        if context_mode_14 is None:return None
        if type(context_mode_14) is not int or not -32768<=context_mode_14<=65535:
            raise ValueError('Original native context14 must be a short or unknown')
        return 33 if context_mode_14 == 0 else {0x7e:0,0x7f:20,0x80:19}[native_kind]
    return 0


def context_instrument_id(context, *, setting_9399f8: int | None) -> int | None:
    """384830, preserving its branch priority and unknown context bytes.

    ``context`` is an offset -> byte mapping owned by the analysis-context
    producer. Missing entries remain unknown; omitted values are never zero.
    """
    def value(offset):
        raw = context.get(offset)
        if raw is not None and (type(raw) is not int or not 0 <= raw <= 255):
            raise ValueError('Native context flags must be bytes or unknown')
        return raw

    enabled = value(0x96)
    if enabled is None:
        return None
    if enabled == 0:
        return 0
    for offset, instrument in ((0x93, 30), (0x92, 1), (0x91, 7),
                               (0x94, 3), (0x99, 46), (0x95, 4)):
        flag = value(offset)
        if flag is None:
            return None
        if flag:
            return instrument
    if setting_9399f8 is None:
        return None
    if type(setting_9399f8) is not int or not 0 <= setting_9399f8 <= 65535:
        raise ValueError('Native 9399f8 setting must be uint16 or unknown')
    return 1 if setting_9399f8 == 2 else 0


def fresh_note_assignment(context, *, setting_9399f8: int | None,
                          override_939660: int | None,
                          normal_analysis_mode: bool | None) -> NativeInstrumentAssignment:
    """370a00's new-note assignment in its normal, non-editing branch.

    ``override_939660`` uses source -1 for no override. None means its actual
    value is unknown. This function cannot certify later acoustic grouping.
    """
    selected = context_instrument_id(context, setting_9399f8=setting_9399f8)
    if normal_analysis_mode is not True:
        return NativeInstrumentAssignment(None, 'native-370a00-editing-boundary', False,
                                          '407c60/40d5b0 editing assignment is not recovered')
    if override_939660 is None:
        return NativeInstrumentAssignment(None, 'native-370a00-override-boundary', False,
                                          'DAT_140939660 has not been supplied')
    if type(override_939660) is not int or not -1 <= override_939660 <= 65535:
        raise ValueError('Native instrument override must be -1 or uint16')
    if override_939660 != -1:
        return NativeInstrumentAssignment(override_939660, 'native-DAT_140939660', True)
    if selected is None:
        return NativeInstrumentAssignment(None, 'native-384830-context', False,
                                          'Required native context choice is unknown')
    return NativeInstrumentAssignment(selected, 'native-384830-context', True)
