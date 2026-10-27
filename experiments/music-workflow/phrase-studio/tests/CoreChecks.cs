using RootSound.PhraseStudio.Core;
using RootSound.TimbreLab.Core;

namespace RootSound.PhraseStudio.Tests;

internal static class CoreChecks
{
    internal static int Run(string directory)
    {
        Directory.CreateDirectory(directory); int checks = 0;
        var empty = PhraseFactory.New("节拍");
        Assert(empty.Channels.Count == 0 && Timing.DurationTicks(empty) == 3840 && !PhraseValidation.CanSave(empty), "new empty"); checks++;
        var first = PhraseFactory.Channel(empty.Channels);
        var second = PhraseFactory.Channel(new[] { first });
        Assert(first.Name == "通道" && second.Name == "通道 (2)", "channel suffix");
        Assert(PhraseFactory.UniqueName("KICK", new[] { "kick", "KICK (2)" }) == "KICK (3)", "case suffix"); checks++;
        var document = empty with { Channels = new[] { first } };
        Assert(!PhraseValidation.CanSave(document), "missing sound cannot save"); checks++;
        var patch = Patch(); var note = new PhraseNote(Guid.NewGuid(), 60, 0, 240, .8);
        document = document with { Channels = new[] { first with { Timbre = patch, Notes = new[] { note } } } };
        Assert(PhraseValidation.CanSave(document), "complete can save"); checks++;
        Reject(document with { Channels = new[] { document.Channels[0], document.Channels[0] with { Id = Guid.NewGuid() } } });
        Reject(document with { Channels = new[] { document.Channels[0], second with { Notes = new[] { note } } } }); checks++;
        foreach (var invalid in new[] { note with { Pitch = 128 }, note with { StartTick = -1 }, note with { LengthTick = 0 },
            note with { StartTick = 3839, LengthTick = 2 }, note with { Velocity = double.NaN }, note with { Velocity = 0 } })
            Reject(document with { Channels = new[] { document.Channels[0] with { Notes = new[] { invalid } } } }); checks++;
        foreach (var invalid in new[] { empty with { Tempo = double.NaN }, empty with { Bars = 0 }, empty with { Tempo = 301 },
            empty with { Name = " x " }, empty with { Id = Guid.Empty } }) Reject(invalid); checks++;
        var history = new DocumentHistory(document);
        var changed = history.Current with { Channels = history.Current.Channels.Select(channel => channel with { Mode = EditorMode.PianoRoll }).ToArray() };
        history.Apply(changed); Assert(history.Current.Channels[0].Notes.Single() == note, "mode retains notes");
        Assert(history.CanUndo && history.Undo().Channels[0].Mode == EditorMode.StepSequencer && history.CanRedo, "undo");
        Assert(history.Redo().Channels[0].Mode == EditorMode.PianoRoll, "redo"); checks++;
        history.Undo(); history.Apply(history.Current with { Name = "分支" }); Assert(!history.CanRedo, "new edit clears redo"); checks++;
        var mutableNotes = new List<PhraseNote> { note };
        var freeze = new DocumentHistory(document with { Channels = new[] { document.Channels[0] with { Notes = mutableNotes } } });
        mutableNotes.Clear(); Assert(freeze.Current.Channels[0].Notes.Count == 1 && ReferenceEquals(freeze.Current.Channels[0].Timbre, patch), "snapshot owns list shares readonly PCM"); checks++;
        var notes = Enumerable.Range(0, PhraseValidation.MaximumNotes + 1).Select(_ => note with { Id = Guid.NewGuid() }).ToArray();
        Reject(document with { Channels = new[] { document.Channels[0] with { Notes = notes } } }); checks++;
        Console.WriteLine($"Core: {checks} groups passed"); return checks;
    }

    internal static InstrumentPatch Patch(string name = "测试音色") => new(new PcmClip(8000, 1,
        Enumerable.Range(0, 800).Select(i => (float)(.2 * Math.Sin(2 * Math.PI * 440 * i / 8000))).ToArray(), name),
        new InstrumentSettings(69, .01, .1, .7, .15, true, 100, 700, .01, -3), name);
    internal static PhraseDocument Document()
    {
        var patch = Patch(); var first = PhraseFactory.Channel(Array.Empty<PhraseChannel>(), "旋律", EditorMode.PianoRoll) with
        { Timbre = patch, Notes = new[] { new PhraseNote(Guid.NewGuid(), 69, 0, 960, .8), new PhraseNote(Guid.NewGuid(), 72, 960, 480, .6) } };
        return PhraseFactory.New("测试乐句", 110, 2) with { Channels = new[] { first, PhraseFactory.Channel(new[] { first }, "节奏") with { Timbre = patch } } };
    }
    internal static void Assert(bool value, string message) { if (!value) throw new InvalidOperationException(message); }
    private static void Reject(PhraseDocument document)
    {
        try { PhraseValidation.Validate(document); } catch (InvalidDataException) { return; }
        throw new InvalidOperationException("invalid document was accepted");
    }
}
