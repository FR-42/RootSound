"""6132a0's name -> GeneralMIDI.txt program lookup, without DSP guesses.

The shipped resource is caller selected and retained by digest. Program
numbers in that resource are one based; 304bb0 writes the result minus one.
The ASCII boundary here matches recovered English resource/name semantics;
the original locale-dependent wide/narrow conversion remains out of scope.
"""
from dataclasses import dataclass
import hashlib
from pathlib import Path
import re


@dataclass(frozen=True)
class NativeProgramAlias:
    program_1based: int
    name: str
    source_line: int


@dataclass(frozen=True)
class NativeProgramMap:
    aliases: tuple[NativeProgramAlias, ...]
    source_path: str
    source_sha256: str


@dataclass(frozen=True)
class NativeProgramMatch:
    program_1based: int
    program_0based: int
    matched_alias: str | None
    source_line: int | None
    fallback: bool
    source_sha256: str


def load_native_program_map(path) -> NativeProgramMap:
    """Parse the original resource once; never substitute a public GM table."""
    source = Path(path)
    raw = source.read_bytes()
    # The recovered source uses char comparisons/atoi and quoted aliases.
    # Reject broader encodings instead of silently changing matching rules.
    text = raw.decode('ascii')
    aliases = []
    for ordinal, line in enumerate(text.splitlines(), 1):
        if line.startswith('//'):
            continue
        token = re.match(r'^[^\x00-\x20]*', line).group()
        numeric = re.match(r'^[+-]?\d+', token)
        program = int(numeric.group()) if numeric else 0
        if program == 0:
            continue
        if not 1 <= program <= 128:
            raise ValueError('Native program resource contains non-SMF program value')
        for match in re.finditer(r'"([^"\r\n]*)"', line[len(token):]):
            alias = match.group(1)
            if len(alias) > 255:
                raise ValueError('Native quoted program alias exceeds source buffer')
            aliases.append(NativeProgramAlias(program, alias, ordinal))
    return NativeProgramMap(tuple(aliases), str(source.resolve()), hashlib.sha256(raw).hexdigest())


def native_program_for_name(name: str, program_map: NativeProgramMap) -> NativeProgramMatch:
    """Original longest matching alias at an alphanumeric word start.

    This is not an exact-name dictionary: e.g. a longer instrument alias wins
    over a shorter alias embedded at the beginning of an instrument word.
    Source tie handling keeps the first partial match and permits its exact
    full-name early return. Failure returns source program1 / MIDI program0.
    """
    if not isinstance(name, str) or '\0' in name or not name.isascii():
        raise ValueError('Recovered GM matching requires an ASCII instrument name')
    name = name[:255]
    folded = name.lower()
    best = None
    best_length = 0
    for alias in program_map.aliases:
        length = len(alias.name)
        if length > best_length:
            maximum = max(0, len(name) - length)
            start = 0
            while start <= maximum:
                if folded[start:start + length] == alias.name.lower():
                    best, best_length = alias, length
                    break
                while start <= maximum and start < len(name) and name[start].isalnum():
                    start += 1
                while start <= maximum and (start >= len(name) or not name[start].isalnum()):
                    start += 1
        elif length == len(name) and alias.name.lower() == folded:
            best = alias
            break
    program = 1 if best is None else best.program_1based
    return NativeProgramMatch(program, program - 1, None if best is None else best.name,
                              None if best is None else best.source_line, best is None,
                              program_map.source_sha256)


def native_midi_track_name(instrument_name: str) -> str:
    """304bb0's observed Bass -> Bass guitar track/program name rewrite."""
    return 'Bass guitar' if instrument_name.lower() == 'bass' else instrument_name
