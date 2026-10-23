using System.Drawing.Imaging;
using RootSound.SampleEditor.Analysis;
using RootSound.SampleEditor.Controls;
using RootSound.SampleEditor.Core;

namespace RootSound.SampleEditor.Tests;

/// <summary>Renders generated audio to in-memory bitmaps only. No Form, window handle, screen or device is used.</summary>
internal static class PlotRenderChecks
{
    internal static int Run(string directory)
    {
        Directory.CreateDirectory(directory);
        int count = 0;
        Check("empty plot stays empty without acquiring a window handle", () =>
        {
            using AudioPlot plot = new() { Size = new Size(960, 360) };
            using Bitmap image = Render(plot);
            Require(!plot.IsHandleCreated && image.GetPixel(400, 180).ToArgb() == plot.BackColor.ToArgb(), "No audio means a blank plotting area.");
            image.Save(Path.Combine(directory, "empty.png"), ImageFormat.Png);
        });
        Check("red playhead and both blue selection markers retain original time coordinates", () =>
        {
            using AudioPlot plot = Prepare();
            plot.Timeline.Move(TimelineMarker.SelectionStart, 2048);
            plot.Timeline.Move(TimelineMarker.SelectionEnd, 14336);
            plot.Timeline.Move(TimelineMarker.Playhead, 8192);
            using Bitmap image = Render(plot);
            Rectangle area = plot.PlotBounds;
            Require(FindVertical(image, X(plot, 2048), area, Blue), "The left blue line is at the selection start.");
            Require(FindVertical(image, X(plot, 14336), area, Blue), "The right blue line is at the selection end.");
            Require(FindVertical(image, X(plot, 8192), area, Red), "The red line is at the playback time.");
            Require(!plot.IsHandleCreated, "Offscreen paint never creates a window handle.");
            image.Save(Path.Combine(directory, "spectrum-markers.png"), ImageFormat.Png);
        });
        Check("time-frequency image separates the generated first and second notes", () =>
        {
            using AudioPlot plot = Prepare();
            plot.Timeline.Move(TimelineMarker.Playhead, 0);
            using Bitmap image = Render(plot);
            Rectangle area = plot.PlotBounds;
            int firstX = X(plot, 4096), secondX = X(plot, 12288);
            int firstY = area.Top + (int)Math.Round(AudioAnalysis.RowForHz(1000, area.Height, 8192));
            int secondY = area.Top + (int)Math.Round(AudioAnalysis.RowForHz(2000, area.Height, 8192));
            Require(Brightness(image, firstX, firstY) > Brightness(image, firstX, secondY) + 100,
                "The first half contains the 1000 Hz band at its actual time.");
            Require(Brightness(image, secondX, secondY) > Brightness(image, secondX, firstY) + 100,
                "The second half contains the 2000 Hz band at its actual time.");
            image.Save(Path.Combine(directory, "spectrum-two-notes.png"), ImageFormat.Png);
        });
        Check("waveform drawing keeps all three markers aligned at the same times", () =>
        {
            using AudioPlot plot = Prepare();
            plot.ShowSpectrum = false;
            plot.Timeline.Move(TimelineMarker.SelectionStart, 2048);
            plot.Timeline.Move(TimelineMarker.SelectionEnd, 14336);
            plot.Timeline.Move(TimelineMarker.Playhead, 8192);
            using Bitmap image = Render(plot);
            Require(FindVertical(image, X(plot, 2048), plot.PlotBounds, Blue)
                && FindVertical(image, X(plot, 14336), plot.PlotBounds, Blue)
                && FindVertical(image, X(plot, 8192), plot.PlotBounds, Red), "Changing display modes does not move playback or selection markers.");
            image.Save(Path.Combine(directory, "waveform-markers.png"), ImageFormat.Png);
        });
        Check("old analysis remains time aligned during extreme zoom and after fresh analysis", () =>
        {
            using AudioPlot plot = Prepare();
            plot.Timeline.Zoom(1_000_000, 0.5);
            plot.Timeline.Move(TimelineMarker.Playhead, 8192);
            using Bitmap oldImage = Render(plot);
            Require(plot.Timeline.ViewLength == 16 && FindVertical(oldImage, X(plot, 8192), plot.PlotBounds, Red), "Cached analysis and red line stay aligned during zoom.");
            plot.SetAnalysis(AudioAnalysis.Analyze(new TwoNoteSource(), (long)Math.Floor(plot.Timeline.ViewStart),
                (long)Math.Ceiling(plot.Timeline.ViewEnd), 256, 96));
            using Bitmap newImage = Render(plot);
            Require(FindVertical(newImage, X(plot, 8192), plot.PlotBounds, Red), "Replacing the visible analysis retains the red line position.");
            plot.ShowSpectrum = false;
            using Bitmap waveImage = Render(plot);
            Require(!plot.IsHandleCreated && FindVertical(waveImage, X(plot, 8192), plot.PlotBounds, Red), "Sub-frame waveform rendering remains bounded and handle-free.");
            newImage.Save(Path.Combine(directory, "spectrum-extreme-zoom.png"), ImageFormat.Png);
            waveImage.Save(Path.Combine(directory, "waveform-extreme-zoom.png"), ImageFormat.Png);
        });
        Check("close or collapsed blue handles can each be selected and dragged apart", () =>
        {
            using AudioPlot plot = Prepare();
            plot.Timeline.Move(TimelineMarker.SelectionStart, 8192);
            plot.Timeline.Move(TimelineMarker.SelectionEnd, 8192);
            int x = X(plot, 8192), y = plot.PlotBounds.Bottom + 3;
            Require(plot.HitMarker(new Point(x - 4, y)) == TimelineMarker.SelectionStart, "left half chooses start");
            Require(plot.HitMarker(new Point(x + 4, y)) == TimelineMarker.SelectionEnd, "right half chooses end");
            plot.Timeline.Move(TimelineMarker.SelectionEnd, 8300);
            Require(plot.HitMarker(new Point(X(plot, 8300), y)) == TimelineMarker.SelectionEnd, "nearest end wins over list order");
            plot.Timeline.Move(TimelineMarker.Playhead, 8192);
            Require(plot.HitMarker(new Point(x, plot.PlotBounds.Top - 5)) == TimelineMarker.Playhead, "top red handle remains accessible over blue start");
            Require(!plot.IsHandleCreated, "hit tests do not create native UI");
        });
        return count;

        void Check(string label, Action action)
        {
            try { action(); count++; }
            catch (Exception ex) { throw new InvalidOperationException($"Offscreen plot check failed: {label}", ex); }
        }
    }

    private static AudioPlot Prepare()
    {
        AudioPlot plot = new() { Size = new Size(960, 360) };
        TwoNoteSource source = new();
        plot.Timeline.Load(source.FrameCount, source.SampleRate);
        plot.SetAnalysis(AudioAnalysis.Analyze(source, 0, source.FrameCount, 256, 96));
        return plot;
    }

    private static Bitmap Render(AudioPlot plot)
    {
        Bitmap image = new(plot.Width, plot.Height, PixelFormat.Format32bppArgb);
        using Graphics graphics = Graphics.FromImage(image);
        graphics.Clear(plot.BackColor);
        plot.PaintGraph(graphics);
        return image;
    }

    private static int X(AudioPlot plot, long frame) => plot.PlotBounds.Left + (int)Math.Round(plot.Timeline.FractionAt(frame) * plot.PlotBounds.Width);
    private static bool Red(Color color) => color.R > 225 && color.G < 120 && color.B < 140;
    private static bool Blue(Color color) => color.B > 220 && color.G > 125 && color.R < 130;

    private static bool FindVertical(Bitmap image, int expectedX, Rectangle area, Func<Color, bool> matches)
    {
        for (int x = Math.Max(0, expectedX - 2); x <= Math.Min(image.Width - 1, expectedX + 2); x++)
        {
            int found = 0;
            for (int y = area.Top + 15; y < area.Bottom - 15; y++) if (matches(image.GetPixel(x, y))) found++;
            if (found > area.Height / 2) return true;
        }
        return false;
    }

    private static int Brightness(Bitmap image, int x, int y)
    {
        int maximum = 0;
        for (int dx = -2; dx <= 2; dx++)
            for (int dy = -5; dy <= 5; dy++)
            {
                Color color = image.GetPixel(Math.Clamp(x + dx, 0, image.Width - 1), Math.Clamp(y + dy, 0, image.Height - 1));
                maximum = Math.Max(maximum, color.R + color.G + color.B);
            }
        return maximum;
    }

    private static void Require(bool condition, string message)
    { if (!condition) throw new InvalidOperationException(message); }

    private sealed class TwoNoteSource : IAudioFrameSource
    {
        public int SampleRate => 8192;
        public int Channels => 1;
        public long FrameCount => 16384;
        public int ReadFrames(long startFrame, Span<float> interleaved)
        {
            interleaved.Clear();
            int count = (int)Math.Min(interleaved.Length, FrameCount - startFrame);
            for (int index = 0; index < count; index++)
            {
                long frame = startFrame + index;
                double frequency = frame < 8192 ? 1000 : 2000;
                interleaved[index] = (float)(0.8 * Math.Sin(2 * Math.PI * frequency * frame / SampleRate));
            }
            return count;
        }
    }
}
