using RootSound.SampleEditor.Core;

namespace RootSound.SampleEditor.Tests;

internal static class TimelineChecks
{
    internal static int Run()
    {
        int count = 0;
        Check("initial timeline selects the full file and keeps empty state inert", () =>
        {
            Timeline t = new(); t.Zoom(2, .5); t.Pan(1); Require(!t.HasAudio && !t.HasSelection, "empty inert");
            t.Load(480000, 48000); Require(t.Playhead == 0 && t.SelectionStart == 0 && t.SelectionEnd == 480000 && t.ViewEnd == 480000, "full source selected");
        });
        Check("mouse anchored zoom preserves the original time beneath the pointer", () =>
        {
            Timeline t = Loaded(); double anchor = t.FrameAt(.37); t.Zoom(4, .37);
            Near(t.FrameAt(.37), anchor); Near(t.ViewLength, 120000);
            t.Pan(.5); Require(t.ViewStart >= 0 && t.ViewEnd <= t.FrameCount, "panning stays inside audio");
        });
        Check("pan and extreme zoom stay finite at both source boundaries", () =>
        {
            Timeline t = Loaded(); t.Zoom(1e30, 1); Near(t.ViewLength, 16); Near(t.ViewEnd, t.FrameCount);
            t.Pan(1e30); Near(t.ViewEnd, t.FrameCount); t.Pan(-1e30); Near(t.ViewStart, 0);
            t.Zoom(1e-30, 0); Near(t.ViewLength, t.FrameCount); Near(t.ViewStart, 0);
            t.Zoom(double.NaN, .5); t.SetViewStart(double.NaN); Near(t.ViewStart, 0);
        });
        Check("Shift dragging moves one tenth as far without a modifier-toggle jump", () =>
        {
            Timeline normal = Loaded(), precise = Loaded();
            normal.BeginDrag(TimelineMarker.Playhead, 100); normal.Drag(200, 1000, false);
            precise.BeginDrag(TimelineMarker.Playhead, 100); precise.Drag(200, 1000, true);
            Near(precise.Playhead * 10, normal.Playhead);
            double before = precise.Playhead; precise.Drag(200, 1000, false); Near(precise.Playhead, before);
            precise.Drag(201, 1000, false); Near(precise.Playhead - before, 480);
        });
        Check("fractional precise deltas accumulate to exact selection sample positions", () =>
        {
            Timeline t = new(); t.Load(1000, 8000); t.BeginDrag(TimelineMarker.SelectionStart, 0);
            for (int x = 1; x <= 10; x++) t.Drag(x, 1000, true);
            Require(t.SelectionStart == 1, "fractional delta not discarded");
            t.Nudge(TimelineMarker.SelectionStart, 1, true); Require(t.SelectionStart == 2, "one sample keyboard precision");
        });
        Check("both selection edges clamp in order and allow a collapsed selection to reopen", () =>
        {
            Timeline t = Loaded(); t.Move(TimelineMarker.SelectionStart, 200000); t.Move(TimelineMarker.SelectionEnd, 100000);
            Require(!t.HasSelection && t.SelectionStart == t.SelectionEnd, "no inverted or negative interval");
            t.BeginDrag(TimelineMarker.SelectionEnd, 0); t.Drag(10, 1000, false); t.EndDrag();
            Require(t.HasSelection && t.SelectionEnd > t.SelectionStart, "end can move right from collapsed selection");
            t.Move(TimelineMarker.Playhead, 1e30); Near(t.Playhead, t.FrameCount);
        });
        Check("zoom changes neither playhead nor export selection", () =>
        {
            Timeline t = Loaded(); t.Move(TimelineMarker.Playhead, 100000.25); t.Move(TimelineMarker.SelectionStart, 1234); t.Move(TimelineMarker.SelectionEnd, 345678);
            t.Zoom(1000, .2); t.Pan(.7); t.Fit();
            Near(t.Playhead, 100000.25); Require(t.SelectionStart == 1234 && t.SelectionEnd == 345678, "source frame selection unchanged");
        });
        Check("ended drag ignores later pointer motion and a new import resets all markers", () =>
        {
            Timeline t = Loaded(); t.BeginDrag(TimelineMarker.Playhead, 0); t.Drag(20, 100, false); t.EndDrag();
            double old = t.Playhead; t.Drag(100, 100, false); Near(t.Playhead, old);
            t.Load(1, 8000); t.Zoom(1000, .5); Near(t.ViewLength, 1); Near(t.Playhead, 0);
            Require(t.SelectionStart == 0 && t.SelectionEnd == 1, "single sample valid");
        });
        return count;
        void Check(string label, Action action) { action(); count++; Console.WriteLine("PASS timeline: " + label); }
    }
    private static Timeline Loaded() { Timeline t = new(); t.Load(480000, 48000); return t; }
    private static void Require(bool okay, string reason) { if (!okay) throw new InvalidOperationException(reason); }
    private static void Near(double a, double b) => Require(Math.Abs(a - b) < .00001, $"Expected {b}, got {a}.");
}
