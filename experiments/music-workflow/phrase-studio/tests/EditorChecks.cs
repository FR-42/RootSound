using System.Drawing.Imaging;
using RootSound.PhraseStudio.Controls;
using RootSound.PhraseStudio.Core;
using RootSound.PhraseStudio.Editing;

namespace RootSound.PhraseStudio.Tests;

internal static class EditorChecks
{
    internal static int Run(string directory)
    {
        Directory.CreateDirectory(directory);
        int count = 0;
        Check("step toggles preserve other pitches and off-grid neighbouring notes", () =>
        {
            PhraseNote a = Note(60, 17, 500), b = Note(64, 240, 800), c = Note(60, 720, 120);
            IReadOnlyList<PhraseNote> initial = [a, b, c];
            var on = NoteEditMath.ToggleStep(initial, 60, 1, 3840);
            Require(on.Count == 4 && on.Any(note => note.Id == a.Id) && on.Any(note => note.Id == b.Id), "Adding one step keeps existing notes.");
            var off = NoteEditMath.ToggleStep(on, 60, 1, 3840);
            Require(off.Count == 3 && initial.All(note => off.Any(value => value == note)), "Removing that step restores all original notes.");
        });
        Check("a full-step hit is a toggle and does not produce ghost notes", () =>
        {
            var on = NoteEditMath.ToggleStep([], 36, 0, 3840);
            Require(on.Count == 1 && on[0].Pitch == 36 && on[0].StartTick == 0 && on[0].LengthTick == 240, "A kick step is a real note.");
            Require(NoteEditMath.ToggleStep(on, 36, 0, 3840).Count == 0, "The entire step toggles off.");
            Require(NoteEditMath.ToggleStep(on, 36, -1, 3840).Count == 1 && NoteEditMath.ToggleStep(on, 36, 16, 3840).Count == 1, "Outside cells have no effect.");
        });
        Check("editing step velocity preserves pitch, timing and neighbouring notes", () =>
        {
            var target = Note(36, 240, 240); var other = Note(42, 240, 240); var next = Note(36, 480, 500);
            var updated = NoteEditMath.SetStepVelocity([target, other, next], 36, 1, .35);
            Require(updated[0] == (target with { Velocity = .35 }) && updated[1] == other && updated[2] == next, "Velocity editing affects only the selected pitch and cell.");
        });
        Check("switching modes and selected step pitch retains every note", () =>
        {
            var notes = new[] { Note(36, 0, 240), Note(60, 120, 700), Note(127, 3000, 99) };
            using var preview = new ChannelPreview { Size = new Size(760, 66) };
            preview.SetNotes(notes, 3840, 36);
            preview.Mode = EditorMode.StepSequencer; preview.StepPitch = 50; preview.Mode = EditorMode.PianoRoll;
            using var step = new StepEditor { Size = new Size(950, 420) };
            step.SetNotes(notes, 3840, 36); step.StepPitch = 45;
            using var piano = new PianoRollEditor { Size = new Size(950, 520) };
            piano.SetNotes(step.Notes, 3840);
            Require(preview.Notes.SequenceEqual(notes) && step.Notes.SequenceEqual(notes) && piano.Notes.SequenceEqual(notes), "Modes display the same immutable note list.");
            Require(!preview.IsHandleCreated && !step.IsHandleCreated && !piano.IsHandleCreated, "No window is opened.");
        });
        Check("move and resize obey phrase boundaries and retain identity and velocity", () =>
        {
            var note = Note(65, 960, 480, .42);
            var moved = NoteEditMath.Move(note, 99999, 140, 3840, 240);
            Require(moved.StartTick == 3360 && moved.Pitch == 127 && moved.Id == note.Id && moved.Velocity == .42, "Moving cannot push past the phrase.");
            var shortened = NoteEditMath.Resize(note, -50, 3840, 240);
            var stretched = NoteEditMath.Resize(note, 9000, 3840, 240);
            Require(shortened.LengthTick == 240 && stretched.LengthTick == 2880, "Resizing maintains a non-empty note within the phrase.");
            Require(NoteEditMath.Move(note, -900, -3, 3840, 240).StartTick == 0 && NoteEditMath.Move(note, -900, -3, 3840, 240).Pitch == 0, "Lower bounds clamp safely.");
        });
        Check("fractional drag stays smooth and only snaps at commit", () =>
        {
            var note = Note(60, 960, 240);
            var drag = new NoteDrag(note, false);
            drag.Advance(2, -2, 10, 20, false, 3840);
            Require(drag.Tick == 980 && Math.Abs(drag.Pitch - 60.1) < .00001, "Preview uses continuous coordinates.");
            drag.Advance(3, 0, 10, 20, false, 3840);
            Require(drag.Tick == 1010 && drag.Commit(3840, 240, false).StartTick == 960, "The musical grid is applied only at release.");
            Require(drag.Moved, "Movement distinguishes dragging from click-to-delete.");
        });
        Check("Shift precision accumulates small movements without a jump", () =>
        {
            var drag = new NoteDrag(Note(60, 960, 240), false);
            drag.Advance(5, 0, 10, 20, false, 3840);
            double before = drag.Tick;
            drag.Advance(1, 0, 10, 20, true, 3840);
            Require(drag.Tick == before + 1, "Turning on precision changes only subsequent motion.");
            for (int i = 0; i < 10; i++) drag.Advance(.1, 0, 1, 20, true, 3840);
            Require(Math.Abs(drag.Tick - before - 1.1) < .00001, "Tiny increments are retained.");
            Require(drag.Commit(3840, 240, true).StartTick == 1011, "Precision release is accurate to one tick.");
        });
        Check("resizing has a smooth preview and preserves pitch and start", () =>
        {
            var note = Note(64, 480, 480);
            var drag = new NoteDrag(note, true);
            drag.Advance(7, -80, 10, 20, false, 3840);
            Require(drag.Length == 550 && drag.Tick == 480 && drag.Pitch == 64, "Only the right edge changes.");
            Require(drag.Commit(3840, 120, false).LengthTick == 600, "The selected finer grid applies on release.");
        });
        Check("piano note hit box covers the full visible body", () =>
        {
            using var piano = new PianoRollEditor { Size = new Size(1050, 560) };
            var note = Note(60, 960, 1920);
            piano.SetNotes([note], 3840); piano.ScrollToPitch(60);
            var rect = piano.BoundsFor(note);
            Require(piano.HitNote(new Point((int)rect.Left + 3, (int)rect.Top + 3))?.Id == note.Id, "Left body is clickable.");
            Require(piano.HitNote(new Point((int)(rect.Left + rect.Width / 2), (int)(rect.Top + rect.Height / 2)))?.Id == note.Id, "Middle body is clickable.");
            Require(piano.HitNote(new Point((int)rect.Right - 2, (int)rect.Bottom - 2))?.Id == note.Id, "The right body is clickable too.");
        });
        Check("one continuous piano canvas reaches both ends of the MIDI range", () =>
        {
            using var piano = new PianoRollEditor { Size = new Size(1050, 560) };
            var low = Note(0, 0, 480); var high = Note(127, 960, 480);
            piano.SetNotes([low, high], 3840);
            piano.ScrollToPitch(0); Require(piano.BoundsFor(low).IntersectsWith(piano.GridBounds), "C-1 is available by scrolling.");
            piano.ScrollToPitch(127); Require(piano.BoundsFor(high).IntersectsWith(piano.GridBounds), "G9 is available in the same editor.");
            Require(piano.Notes.Count == 2 && !piano.IsHandleCreated, "Scrolling neither drops notes nor opens a window.");
        });
        Check("anchored time zoom and fitting preserve note coordinates", () =>
        {
            using var piano = new PianoRollEditor { Size = new Size(1050, 560) };
            var note = Note(60, 18000, 960); piano.SetNotes([note], 61440);
            double before = piano.ViewStartTick + piano.VisibleTicks * .7;
            piano.ZoomTime(2, .7);
            Require(Math.Abs(before - (piano.ViewStartTick + piano.VisibleTicks * .7)) < .01, "The musical time under the cursor remains anchored.");
            piano.FitTime(); Require(piano.ViewStartTick == 0 && piano.VisibleTicks == 61440 && piano.Notes[0] == note, "Fit shows all sixteen bars without moving notes.");
        });
        Check("generated piano, step and compact preview images render offscreen", () =>
        {
            var melody = new[] { Note(60, 0, 480), Note(64, 720, 480), Note(67, 1440, 960), Note(72, 2880, 720) };
            using var piano = new PianoRollEditor { Size = new Size(1050, 560), PlayheadTick = 1800 };
            piano.SetNotes(melody, 3840); piano.ScrollToPitch(65);
            using var pianoImage = Render(piano.Size, graphics => piano.RenderCanvas(graphics, piano.ClientRectangle));
            pianoImage.Save(Path.Combine(directory, "piano-roll.png"), ImageFormat.Png);
            using var step = new StepEditor { Size = new Size(1050, 420), PlayheadTick = 1800 };
            step.SetNotes([Note(36, 0, 240), Note(36, 960, 240), Note(36, 1920, 240), Note(36, 2880, 240), .. melody], 7680, 36);
            using var stepImage = Render(step.Size, graphics => step.RenderCanvas(graphics, step.ClientRectangle));
            stepImage.Save(Path.Combine(directory, "step-sequencer.png"), ImageFormat.Png);
            using var preview = new ChannelPreview { Size = new Size(760, 66) };
            preview.SetNotes(melody, 3840);
            using var overview = Render(preview.Size, graphics => preview.RenderCanvas(graphics, preview.ClientRectangle));
            overview.Save(Path.Combine(directory, "channel-preview.png"), ImageFormat.Png);
            Require(!piano.IsHandleCreated && !step.IsHandleCreated && !preview.IsHandleCreated, "All three were drawn to bitmaps without showing a Form.");
            Require(CountColor(pianoImage, Color.FromArgb(85, 185, 200)) > 1000 && CountColor(stepImage, Color.FromArgb(89, 195, 198)) > 1000, "Actual notes are visible in both editors.");
        });
        return count;
        void Check(string name, Action action) { action(); count++; Console.WriteLine("PASS editor: " + name); }
    }
    private static PhraseNote Note(int pitch, long tick, long length, double velocity = .8) => new(Guid.NewGuid(), pitch, tick, length, velocity);
    private static Bitmap Render(Size size, Action<Graphics> draw)
    { var image = new Bitmap(size.Width, size.Height); using var graphics = Graphics.FromImage(image); draw(graphics); return image; }
    private static int CountColor(Bitmap image, Color color)
    { int count = 0; for (int y = 0; y < image.Height; y += 2) for (int x = 0; x < image.Width; x += 2) if (image.GetPixel(x, y).ToArgb() == color.ToArgb()) count++; return count; }
    private static void Require(bool condition, string message) { if (!condition) throw new InvalidOperationException(message); }
}
