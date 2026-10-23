namespace RootSound.SampleEditor.Analysis;

/// <summary>A bounded, immutable analysis of one visible interval of the original file.</summary>
public sealed record AnalysisFrame(
    long StartFrame,
    long EndFrame,
    int Width,
    int Height,
    byte[] Intensities,
    float[] Minimum,
    float[] Maximum,
    float[] Rms)
{
    // Intensities are row-major: the highest frequency is at row zero.
    public bool WaveformApproximate => false;
}
