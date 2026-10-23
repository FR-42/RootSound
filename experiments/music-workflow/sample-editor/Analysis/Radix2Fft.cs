namespace RootSound.SampleEditor.Analysis;

internal static class Radix2Fft
{
    /// <summary>In-place, unnormalised forward transform. The inputs have a power-of-two length.</summary>
    internal static void Transform(Span<double> real, Span<double> imaginary)
    {
        int length = real.Length;
        if (length < 2 || (length & (length - 1)) != 0 || imaginary.Length != length)
            throw new ArgumentException("FFT arrays must have equal power-of-two lengths.");

        for (int index = 1, reverse = 0; index < length; index++)
        {
            int bit = length >> 1;
            for (; (reverse & bit) != 0; bit >>= 1) reverse ^= bit;
            reverse ^= bit;
            if (index >= reverse) continue;
            (real[index], real[reverse]) = (real[reverse], real[index]);
            (imaginary[index], imaginary[reverse]) = (imaginary[reverse], imaginary[index]);
        }

        for (int size = 2; size <= length; size <<= 1)
        {
            double angle = -2 * Math.PI / size;
            double stepReal = Math.Cos(angle), stepImaginary = Math.Sin(angle);
            int half = size >> 1;
            for (int offset = 0; offset < length; offset += size)
            {
                double phaseReal = 1, phaseImaginary = 0;
                for (int index = 0; index < half; index++)
                {
                    int even = offset + index, odd = even + half;
                    double transformedReal = phaseReal * real[odd] - phaseImaginary * imaginary[odd];
                    double transformedImaginary = phaseReal * imaginary[odd] + phaseImaginary * real[odd];
                    real[odd] = real[even] - transformedReal;
                    imaginary[odd] = imaginary[even] - transformedImaginary;
                    real[even] += transformedReal;
                    imaginary[even] += transformedImaginary;
                    double nextReal = phaseReal * stepReal - phaseImaginary * stepImaginary;
                    phaseImaginary = phaseReal * stepImaginary + phaseImaginary * stepReal;
                    phaseReal = nextReal;
                }
            }
        }
    }
}
