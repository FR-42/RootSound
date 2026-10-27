using System.Drawing.Imaging;
using RootSound.PhraseStudio.Controls;
using RootSound.PhraseStudio.Core;
using RootSound.ReferenceStudio.Controls;
using RootSound.ReferenceStudio.Core;
using RootSound.TimbreLab.Core;

namespace RootSound.ReferenceStudio.Tests;

internal static class UiChecks
{
    internal static int Run(string directory)
    {
        Directory.CreateDirectory(directory); int count = 0;
        void Check(string name, Action test) { test(); count++; Console.WriteLine("PASS UI: " + name); }
        var project = Fixture();
        Check("constructor remains unshown and performs no private-directory IO", () =>
        {
            string root = Path.Combine(directory, "unshown-private");
            using var form = new MainForm(privateRoot: root);
            Require(!Directory.Exists(root) && !form.Visible && !form.IsHandleCreated && form.Project is null, "constructor opened a window or read/wrote a project");
            InspectUnshown(form);
        });
        Check("loaded case exposes every layer and keeps bundled source read-only", () =>
        {
            using var form = new MainForm(privateRoot: Path.Combine(directory, "case")); form.LoadForChecks(project);
            Require(form.LayerRowCount == 2 && form.Project is not null && !form.IsDirty && form.SavedPath is null, "initial case state is wrong");
            Require(form.SelectedLayer == project.Phrase.Channels[1].Id, "melody should be directly editable on loading");
            InspectUnshown(form);
        });
        Check("note edits are undoable and preserve the reference and other layer", () =>
        {
            using var form = new MainForm(privateRoot: Path.Combine(directory, "notes")); form.LoadForChecks(project);
            var lead = project.Phrase.Channels[1]; var added = new PhraseNote(Guid.NewGuid(), 72, 1920, 480, .6);
            form.EditNotesForChecks(lead.Id, [.. lead.Notes, added]);
            Require(form.IsDirty && form.CanUndo && form.Project!.Phrase.Channels[1].Notes.Count == 2, "note edit was lost");
            Require(ReferenceEquals(form.Project!.Reference, project.Reference) && form.Project.Phrase.Channels[0].Notes.SequenceEqual(project.Phrase.Channels[0].Notes), "edit changed original or another layer");
            form.UndoForChecks(); Require(!form.IsDirty && form.Project!.Phrase.Channels[1].Notes.Count == 1 && form.CanRedo, "undo did not restore the saved snapshot");
            form.RedoForChecks(); Require(form.IsDirty && form.Project!.Phrase.Channels[1].Notes.Last() == added, "redo failed");
        });
        Check("sound controls participate in the same history as notes", () =>
        {
            using var form = new MainForm(privateRoot: Path.Combine(directory, "sound")); form.LoadForChecks(project);
            var original = project.Sounds[1]; var modified = original with { BrightnessHz = 1800, Sweep = .4, EchoMix = .3 };
            form.EditSoundForChecks(original.ChannelId, modified);
            Require(form.Project!.Sounds[1] == modified && form.IsDirty, "sound edit was not stored");
            form.UndoForChecks(); Require(form.Project!.Sounds[1] == original && !form.IsDirty, "sound undo failed");
        });
        Check("solo is an audition setting without modifying or muting the project", () =>
        {
            using var form = new MainForm(privateRoot: Path.Combine(directory, "solo")); form.LoadForChecks(project);
            Guid first = project.Phrase.Channels[0].Id, second = project.Phrase.Channels[1].Id;
            form.SoloForChecks(first, true); Require(form.SoloLayer == first && !form.IsDirty, "solo changed the project");
            form.SoloForChecks(second, true); Require(form.SoloLayer == second, "solo did not follow the selected layer");
            form.SoloForChecks(second, false); Require(form.SoloLayer is null && form.Project!.Phrase.Channels.All(c => !c.Muted), "solo permanently muted another layer");
            InspectUnshown(form);
        });
        Check("invalid replacement leaves the current project intact", () =>
        {
            using var form = new MainForm(privateRoot: Path.Combine(directory, "invalid")); form.LoadForChecks(project);
            var before = form.Project;
            try { form.LoadForChecks(project with { Sounds = [] }); throw new Exception("invalid replacement accepted"); }
            catch (InvalidDataException) { }
            Require(ReferenceEquals(form.Project, before), "failed replacement discarded current edits");
        });
        Check("timeline maps both endpoints and draws only to an offscreen image", () =>
        {
            using var timeline = new ReferenceTimeline { Size = new Size(1200, 86) };
            timeline.SetReference(project.Reference, project.Info.SourceStartSeconds); timeline.PositionSeconds = 1;
            Require(timeline.SecondsAt(-300) == 0 && timeline.SecondsAt(5000) == 2 && Math.Abs(timeline.SecondsAt(600) - 1) < .001, "timeline coordinates are wrong");
            using var image = new Bitmap(timeline.Width, timeline.Height);
            using (var graphics = Graphics.FromImage(image)) timeline.RenderCanvas(graphics);
            image.Save(Path.Combine(directory, "reference-timeline.png"), ImageFormat.Png);
            Require(!timeline.IsHandleCreated, "timeline test created a real window");
        });
        Check("both editing modes reuse the full note list without opening windows", () =>
        {
            var notes = project.Phrase.Channels[1].Notes;
            using var piano = new PianoRollEditor { Size = new Size(1000, 450) };
            using var steps = new StepEditor { Size = new Size(1000, 450) };
            piano.SetNotes(notes, 3840, 60); steps.SetNotes(piano.Notes, 3840, 60);
            Require(steps.Notes.SequenceEqual(notes) && !piano.IsHandleCreated && !steps.IsHandleCreated, "changing modes lost notes or showed the app");
        });
        Check("piano strength lane follows time zoom and renders existing note velocity", () =>
        {
            var note = project.Phrase.Channels[1].Notes[0];
            using var lane = new VelocityLane { Size = new Size(1000, 86) };
            lane.SetNotes([note]); lane.SetView(0, 3840, new Rectangle(72, 0, 900, 400));
            var initial = lane.BarBounds(note); lane.SetView(960, 1920, new Rectangle(72, 0, 900, 400));
            var zoomed = lane.BarBounds(note);
            Require(Math.Abs(initial.X - 294) < .01 && zoomed.X == 69 && Math.Abs(zoomed.Height - note.Velocity * 58) < .01, "strength lane is misaligned or ignores note velocity");
            using var image = new Bitmap(1000, 86); using (var graphics = Graphics.FromImage(image)) lane.RenderCanvas(graphics);
            image.Save(Path.Combine(directory, "note-strength.png"), ImageFormat.Png);
            Require(!lane.IsHandleCreated, "strength rendering opened a desktop window");
        });
        return count + RunRecoveryChecks(Path.Combine(directory, "recovery")) + RunTransactionChecks(Path.Combine(directory, "polyphony")) + RunSoundControlChecks(Path.Combine(directory, "sound-sliders")) + RunNavigationChecks();
    }
    internal static int RunNavigationChecks()
    {
        string main = Path.Combine("D:\\example", "Cases", BundledCaseNavigation.FileName(false));
        string observation = Path.Combine("D:\\example", "Cases", BundledCaseNavigation.FileName(true));
        Require(BundledCaseNavigation.Caption(false) == "听原曲分层" && BundledCaseNavigation.Caption(true) == "回到重建", "bundled navigation labels are reversed");
        Require(BundledCaseNavigation.Target(false, main, observation) == observation && BundledCaseNavigation.Target(true, main, observation) == main, "case switch points to the wrong bundled file");
        Require(BundledCaseNavigation.Target(false, main, null) is null && BundledCaseNavigation.Target(true, null, observation) is null, "missing bundled files did not disable the switch");
        Require(BundledCaseNavigation.Position(7.25, 12) == 7.25 && BundledCaseNavigation.Position(99, 12) == 12 && BundledCaseNavigation.Position(double.NaN, 12) == 0, "case switch changes valid shared seconds or exceeds its duration");
        Console.WriteLine("PASS UI: bundled observation navigation preserves shared seconds and handles missing cases"); return 1;
    }
    internal static int RunSoundControlChecks(string directory)
    {
        Require(Math.Abs(SoundSlider.BrightnessHz(0) - 80) < .001 && Math.Abs(SoundSlider.BrightnessHz(100) - 20000) < .001, "brightness slider endpoints are wrong");
        Require(SoundSlider.BrightnessPosition(80) == 0 && SoundSlider.BrightnessPosition(20000) == 100 && SoundSlider.BrightnessHz(50) < 2000, "brightness mapping is not logarithmic");
        using var slider = new SoundSlider { Minimum = 0, Maximum = 100 };
        int previews = 0, commits = 0; slider.PreviewRequested += _ => previews++; slider.CommitRequested += _ => commits++;
        slider.BeginForChecks(); slider.MoveForChecks(20); slider.MoveForChecks(30); slider.MoveForChecks(40); slider.FinishGesture();
        Require(previews == 3 && commits == 1, "one continuous slider gesture did not produce exactly one commit");
        slider.BeginForChecks(); slider.MoveForChecks(70); slider.CancelForChecks(); Require(slider.Value == 40 && commits == 1, "cancelled gesture was committed");
        var project = Fixture(); using var form = new MainForm(privateRoot: directory); form.LoadForChecks(project);
        form.BrightnessGestureForChecks(project.Phrase.Channels[1].Id, [20, 40, 60]);
        Require(form.IsDirty && Math.Abs(form.Project!.Sounds[1].BrightnessHz - SoundSlider.BrightnessHz(60)) < .001, "slider gesture did not update the project");
        form.UndoForChecks(); Require(!form.IsDirty && !form.CanUndo, "one undo did not reverse the whole slider gesture");
        InspectUnshown(form); Require(!slider.IsHandleCreated, "sound control checks created a desktop window");
        Console.WriteLine("PASS UI: logarithmic sound sliders preview continuously and commit one undoable edit"); return 1;
    }
    internal static int RunTransactionChecks(string directory)
    {
        var project = Fixture();
        using var form = new MainForm(privateRoot: directory); form.LoadForChecks(project);
        var before = form.Project; Guid id = project.Phrase.Channels[1].Id;
        var excessive = Enumerable.Range(0, 129).Select(i => new PhraseNote(Guid.NewGuid(), 60 + i % 12, 0, 960, .7)).ToArray();
        form.EditNotesForChecks(id, excessive);
        Require(ReferenceEquals(form.Project, before) && !form.IsDirty && !form.CanUndo, "rejected edit changed the visible project or history");
        try { form.LoadForChecks(project with { Phrase = project.Phrase with { Channels = project.Phrase.Channels.Select(c => c.Id == id ? c with { Notes = excessive } : c).ToArray() } }); throw new Exception("excessive replacement accepted"); }
        catch (InvalidOperationException) { }
        Require(ReferenceEquals(form.Project, before) && !form.IsDirty, "rejected replacement changed the visible project");
        InspectUnshown(form);
        Console.WriteLine("PASS UI: audio-plan rejection preserves the visible project and undo state"); return 1;
    }
    internal static int RunRecoveryChecks(string directory)
    {
        using var first = new MainForm(privateRoot: directory);
        using var second = new MainForm(privateRoot: directory);
        Require(first.AcquireRecoveryForChecks(), "first window could not own isolated recovery");
        Require(!second.AcquireRecoveryForChecks(), "two windows can overwrite the same recovery");
        first.Dispose();
        Require(second.AcquireRecoveryForChecks(), "recovery lock was not released on disposal");
        Require(!first.Visible && !second.Visible, "recovery protection displayed a window");
        Console.WriteLine("PASS UI: recovery writer is exclusive and releases its private lock"); return 1;
    }
    internal static int RunLayoutChecks(string directory)
    {
        Directory.CreateDirectory(directory);
        foreach (var size in new[] { new Size(1450, 870), new Size(1060, 650) })
        {
            using var form = new MainForm(privateRoot: Path.Combine(directory, "private-unused"));
            form.LoadForChecks(Fixture()); form.ClientSize = size;
            // Native window stays hidden. The managed bit alone enables WinForms' normal flow-layout rules.
            nint hiddenHandle = form.Handle;
            Require(!IsWindowVisible(hiddenHandle), "offscreen native window unexpectedly became visible");
            SetLogicalVisibility(form, true);
            try
            {
                LayoutTree(form);
                using var bitmap = new Bitmap(size.Width, size.Height);
                using (var graphics = Graphics.FromImage(bitmap))
                {
                    graphics.Clear(form.BackColor);
                    foreach (Control child in form.Controls.Cast<Control>().Reverse()) DrawChild(graphics, child, Point.Empty);
                }
                Require(!IsWindowVisible(hiddenHandle), "offscreen drawing displayed the application");
                LayoutTree(form); InspectBounds(form);
                bitmap.Save(Path.Combine(directory, $"workspace-{size.Width}x{size.Height}.png"), ImageFormat.Png);
            }
            finally { SetLogicalVisibility(form, false); }
            Console.WriteLine($"PASS UI layout: {size.Width}x{size.Height}; unshown offscreen form only");
        }
        return 2;
    }
    private static void LayoutTree(Control parent)
    { parent.PerformLayout(); foreach (Control child in parent.Controls) LayoutTree(child); }
    private static bool LocallyVisible(Control control)
    {
        // The parent Form intentionally stays hidden. Inspect the child's own visibility bit for compositing.
        var method = typeof(Control).GetMethod("GetState", System.Reflection.BindingFlags.Instance | System.Reflection.BindingFlags.NonPublic)!;
        var flag = Enum.Parse(method.GetParameters()[0].ParameterType, "Visible");
        return (bool)method.Invoke(control, [flag])!;
    }
    private static void SetLogicalVisibility(Control control, bool value)
    {
        var method = typeof(Control).GetMethod("SetState", System.Reflection.BindingFlags.Instance | System.Reflection.BindingFlags.NonPublic)!;
        var flag = Enum.Parse(method.GetParameters()[0].ParameterType, "Visible");
        method.Invoke(control, [flag, value]);
    }
    [System.Runtime.InteropServices.DllImport("user32.dll")]
    [return: System.Runtime.InteropServices.MarshalAs(System.Runtime.InteropServices.UnmanagedType.Bool)]
    private static extern bool IsWindowVisible(nint handle);
    private static void DrawChild(Graphics target, Control control, Point parentOrigin)
    {
        if (!LocallyVisible(control) || control.Width <= 0 || control.Height <= 0) return;
        Point at = new(parentOrigin.X + control.Left, parentOrigin.Y + control.Top);
        using var image = new Bitmap(control.Width, control.Height);
        using (var graphics = Graphics.FromImage(image))
        {
            switch (control)
            {
                case PianoRollEditor piano: piano.RenderCanvas(graphics, piano.ClientRectangle); break;
                case StepEditor steps: steps.RenderCanvas(graphics, steps.ClientRectangle); break;
                case ReferenceTimeline timeline: timeline.RenderCanvas(graphics); break;
                case VelocityLane strength: strength.RenderCanvas(graphics); break;
                default: control.DrawToBitmap(image, new Rectangle(Point.Empty, control.Size)); break;
            }
        }
        target.DrawImageUnscaled(image, at);
        var state = target.Save(); target.SetClip(new Rectangle(at, control.Size), System.Drawing.Drawing2D.CombineMode.Intersect);
        foreach (Control child in control.Controls.Cast<Control>().Reverse()) DrawChild(target, child, at);
        target.Restore(state);
    }
    private static void InspectBounds(Control parent)
    {
        if (parent is FlowLayoutPanel panel && !panel.AutoScroll)
        {
            foreach (Control child in panel.Controls)
                Require(child.Left >= 0 && child.Top >= 0 && child.Right <= panel.ClientSize.Width + 1 && child.Bottom <= panel.ClientSize.Height + 1,
                    $"control '{child.Text}' clipped in {panel.Name}: {child.Bounds} outside {panel.ClientSize}");
            var visible = panel.Controls.Cast<Control>().Where(LocallyVisible).ToArray();
            for (int a = 0; a < visible.Length; a++)
                for (int b = a + 1; b < visible.Length; b++)
                    Require(!visible[a].Bounds.IntersectsWith(visible[b].Bounds), "overlapping controls: " + visible[a].Text + " / " + visible[b].Text);
        }
        if (parent is ToolStrip strip && strip is not StatusStrip)
            foreach (ToolStripItem item in strip.Items)
                if (item.Available && item.Placement == ToolStripItemPlacement.Main)
                    Require(item.Bounds.Right <= strip.ClientSize.Width + 1, "toolbar item clipped: " + item.Text);
        foreach (Control child in parent.Controls) InspectBounds(child);
    }
    private static void InspectUnshown(Control control)
    { Require(!control.IsHandleCreated && !control.Visible, "an unshown control created a desktop handle"); foreach (Control child in control.Controls) { Require(!child.IsHandleCreated, "child created a desktop handle"); InspectUnshown(child); } }
    private static void Require(bool condition, string message) { if (!condition) throw new InvalidOperationException(message); }
    internal static ReferenceProject Fixture()
    {
        const int rate = 48000;
        var source = new float[rate * 2 * 2];
        for (int frame = 0; frame < rate * 2; frame++) source[frame * 2] = source[frame * 2 + 1] = (float)(.2 * Math.Sin(2 * Math.PI * 220 * frame / rate));
        var sample = new float[rate / 5];
        for (int frame = 0; frame < sample.Length; frame++) sample[frame] = (float)(.3 * Math.Sin(2 * Math.PI * 261.63 * frame / rate));
        var patch = new InstrumentPatch(new PcmClip(rate, 1, sample, "合成音色"), new InstrumentSettings(), "合成音色");
        Guid kick = Guid.NewGuid(), lead = Guid.NewGuid();
        var phrase = new PhraseDocument(Guid.NewGuid(), "测试片段", 120, 1,
        [new PhraseChannel(kick, "鼓点", patch, EditorMode.StepSequencer, 60, -6, false, [new PhraseNote(Guid.NewGuid(), 60, 0, 240, .8)]),
            new PhraseChannel(lead, "旋律", patch, EditorMode.PianoRoll, 60, -3, false, [new PhraseNote(Guid.NewGuid(), 67, 960, 960, .7)])]);
        return new ReferenceProject(phrase, new PcmClip(rate, 2, source, "原曲片段"),
            new CaseInfo("测试案例", "test.wav", 10, 30, new string('A', 64), "供对照的案例", "按听感构造，非官方分轨"),
            [new LayerDescription(kick, "节奏", "形成基础律动", "重新合成"), new LayerDescription(lead, "旋律", "形成主要音高线条", "重新合成")],
            [new LayerSound(kick), new LayerSound(lead)]);
    }
}
