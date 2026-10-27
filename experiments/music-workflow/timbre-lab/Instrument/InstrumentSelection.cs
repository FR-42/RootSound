using RootSound.TimbreLab.Core;

namespace RootSound.TimbreLab.Instrument;

public static class InstrumentSelection
{
    // Crop actual PCM, rather than keeping hidden audio in the saved instrument.
    // Loop coordinates belong to the full displayed sample and must be rebased.
    public static InstrumentPatch Crop(InstrumentPatch patch, long start, long end)
    {
        InstrumentValidation.Clip(patch.Audio);
        var audio = ClipPreparation.Trim(patch.Audio, start, end);
        long loopStart = Math.Clamp(patch.Settings.LoopStart, start, end) - start;
        long loopEnd = Math.Clamp(patch.Settings.LoopEnd, start, end) - start;
        bool enabled = patch.Settings.LoopEnabled && loopEnd - loopStart >= 4;
        var settings = patch.Settings with
        {
            LoopStart = loopStart, LoopEnd = Math.Max(loopStart, loopEnd), LoopEnabled = enabled,
            LoopCrossfadeSeconds = Math.Min(patch.Settings.LoopCrossfadeSeconds,
                Math.Max(0, loopEnd - loopStart) / (double)audio.SampleRate * .45)
        };
        InstrumentValidation.Settings(settings, audio.FrameCount, audio.SampleRate);
        return new(audio, settings, patch.Name);
    }
}
