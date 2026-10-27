namespace RootSound.PhraseStudio.Core;

/// <summary>Immutable edit snapshots. PCM arrays are shared and must never be mutated.</summary>
public sealed class DocumentHistory
{
    private const int MaximumHistory = 100;
    private readonly List<PhraseDocument> undo = new();
    private readonly Stack<PhraseDocument> redo = new();
    public DocumentHistory(PhraseDocument document) { PhraseValidation.Validate(document); Current = Freeze(document); }
    public PhraseDocument Current { get; private set; }
    public bool CanUndo => undo.Count > 0;
    public bool CanRedo => redo.Count > 0;

    public void Apply(PhraseDocument document)
    {
        PhraseValidation.Validate(document);
        if (ReferenceEquals(document, Current)) return;
        undo.Add(Current);
        if (undo.Count > MaximumHistory) undo.RemoveAt(0);
        Current = Freeze(document); redo.Clear();
    }

    public PhraseDocument Undo()
    {
        if (CanUndo) { redo.Push(Current); Current = undo[^1]; undo.RemoveAt(undo.Count - 1); }
        return Current;
    }
    public PhraseDocument Redo()
    {
        if (CanRedo) { undo.Add(Current); Current = redo.Pop(); }
        return Current;
    }

    private static PhraseDocument Freeze(PhraseDocument document) => document with
    {
        Channels = Array.AsReadOnly(document.Channels.Select(channel => channel with
        { Notes = Array.AsReadOnly(channel.Notes.ToArray()) }).ToArray())
    };
}
