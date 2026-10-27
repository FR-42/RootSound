using RootSound.PhraseStudio.Core;

namespace RootSound.PhraseStudio.Editing;

/// <summary>Editing rules shared by the detailed editors and compact previews.</summary>
internal static class NoteEditMath
{
    internal const long StepTicks = 240;
    internal static long Snap(double value, long division) => checked((long)Math.Round(value / Math.Max(1, division), MidpointRounding.AwayFromZero) * Math.Max(1, division));
    internal static PhraseNote Move(PhraseNote note, double tick, double pitch, long totalTicks, long division)
    {
        long length = Math.Clamp(note.LengthTick, 1, totalTicks);
        long start = Math.Clamp(Snap(tick, division), 0, totalTicks - length);
        return note with { StartTick = start, LengthTick = length, Pitch = Math.Clamp((int)Math.Round(pitch), 0, 127) };
    }
    internal static PhraseNote Resize(PhraseNote note, double length, long totalTicks, long division)
    {
        long room = Math.Max(1, totalTicks - note.StartTick);
        return note with { LengthTick = Math.Clamp(Snap(length, division), Math.Min(division, room), room) };
    }
    internal static IReadOnlyList<PhraseNote> Replace(IReadOnlyList<PhraseNote> notes, PhraseNote updated) =>
        notes.Select(note => note.Id == updated.Id ? updated : note).OrderBy(note => note.StartTick).ThenBy(note => note.Pitch).ToArray();
    internal static IReadOnlyList<PhraseNote> Remove(IReadOnlyList<PhraseNote> notes, Guid id) => notes.Where(note => note.Id != id).ToArray();
    internal static IReadOnlyList<PhraseNote> Add(IReadOnlyList<PhraseNote> notes, int pitch, double tick, long totalTicks, long division)
    {
        long start = Math.Clamp(Snap(tick, division), 0, Math.Max(0, totalTicks - Math.Min(division, totalTicks)));
        var note = new PhraseNote(Guid.NewGuid(), Math.Clamp(pitch, 0, 127), start, Math.Min(Math.Max(1, division), totalTicks - start), .8);
        return notes.Append(note).OrderBy(value => value.StartTick).ThenBy(value => value.Pitch).ToArray();
    }
    internal static bool IsStepOn(IReadOnlyList<PhraseNote> notes, int pitch, long stepStart) => notes.Any(note => note.Pitch == pitch && note.StartTick >= stepStart && note.StartTick < stepStart + StepTicks);
    internal static IReadOnlyList<PhraseNote> ToggleStep(IReadOnlyList<PhraseNote> notes, int pitch, int step, long totalTicks)
    {
        long tick = step * StepTicks;
        if (tick < 0 || tick >= totalTicks || pitch is < 0 or > 127) return notes;
        if (IsStepOn(notes, pitch, tick))
            return notes.Where(note => note.Pitch != pitch || note.StartTick < tick || note.StartTick >= tick + StepTicks).ToArray();
        return notes.Append(new PhraseNote(Guid.NewGuid(), pitch, tick, Math.Min(StepTicks, totalTicks - tick), .85))
            .OrderBy(note => note.StartTick).ThenBy(note => note.Pitch).ToArray();
    }
    internal static IReadOnlyList<PhraseNote> SetStepVelocity(IReadOnlyList<PhraseNote> notes, int pitch, int step, double velocity)
    {
        long start = step * StepTicks;
        return notes.Select(note => note.Pitch == pitch && note.StartTick >= start && note.StartTick < start + StepTicks
            ? note with { Velocity = Math.Clamp(velocity, .01, 1) } : note).ToArray();
    }
    internal static string PitchName(int pitch)
    {
        string[] names = ["C", "C♯", "D", "D♯", "E", "F", "F♯", "G", "G♯", "A", "A♯", "B"];
        return names[Math.Clamp(pitch, 0, 127) % 12] + (pitch / 12 - 1);
    }
    internal static bool IsBlackKey(int pitch) => pitch % 12 is 1 or 3 or 6 or 8 or 10;
}

/// <summary>Fractional motion is retained during a gesture; grid rounding happens only on release.</summary>
internal sealed class NoteDrag
{
    internal PhraseNote Original { get; }
    internal double Tick { get; private set; }
    internal double Pitch { get; private set; }
    internal double Length { get; private set; }
    internal bool Resizing { get; }
    internal bool Moved { get; private set; }
    private double distance;
    internal NoteDrag(PhraseNote note, bool resizing)
    { Original = note; Tick = note.StartTick; Pitch = note.Pitch; Length = note.LengthTick; Resizing = resizing; }
    internal void Advance(double dx, double dy, double ticksPerPixel, double rowHeight, bool precise, long totalTicks)
    {
        distance += Math.Abs(dx) + Math.Abs(dy);
        Moved |= distance >= 3;
        double factor = precise ? .1 : 1;
        if (Resizing) Length = Math.Clamp(Length + dx * ticksPerPixel * factor, 1, Math.Max(1, totalTicks - Tick));
        else
        {
            Tick = Math.Clamp(Tick + dx * ticksPerPixel * factor, 0, Math.Max(0, totalTicks - Length));
            Pitch = Math.Clamp(Pitch - dy / rowHeight * factor, 0, 127);
        }
    }
    internal PhraseNote Commit(long totalTicks, long division, bool precise) => Resizing
        ? NoteEditMath.Resize(Original, Length, totalTicks, precise ? 1 : division)
        : NoteEditMath.Move(Original, Tick, Pitch, totalTicks, precise ? 1 : division);
}
