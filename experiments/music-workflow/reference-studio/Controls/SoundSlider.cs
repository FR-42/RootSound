namespace RootSound.ReferenceStudio.Controls;

/// <summary>A continuous preview is one edit when the pointer or key gesture ends.</summary>
internal sealed class SoundSlider : TrackBar
{
    private bool silent, gesture;
    private int initialValue;
    internal event Action<int>? PreviewRequested;
    internal event Action<int>? CommitRequested;
    internal event Action? PreviewCancelled;
    internal SoundSlider()
    {
        AutoSize = false; Width = 148; Height = 30; TickStyle = TickStyle.None;
        BackColor = ReferenceTheme.Panel; Margin = new Padding(2, 6, 10, 0);
        SmallChange = 1; LargeChange = 5;
    }
    internal static double BrightnessHz(int value) => 80 * Math.Pow(250, Math.Clamp(value, 0, 100) / 100d);
    internal static int BrightnessPosition(double hz) => Math.Clamp((int)Math.Round(Math.Log(Math.Clamp(hz, 80, 20000) / 80) / Math.Log(250) * 100), 0, 100);
    internal void SetValueSilently(int value)
    { silent = true; try { Value = Math.Clamp(value, Minimum, Maximum); } finally { silent = false; } }
    private void BeginGesture() { if (!gesture) { gesture = true; initialValue = Value; } }
    internal void FinishGesture()
    {
        if (!gesture) return; gesture = false;
        if (Value != initialValue) CommitRequested?.Invoke(Value);
        else PreviewCancelled?.Invoke();
    }
    private void CancelGesture()
    { if (!gesture) return; gesture = false; SetValueSilently(initialValue); PreviewCancelled?.Invoke(); }
    protected override void OnValueChanged(EventArgs e)
    {
        base.OnValueChanged(e); if (silent) return;
        PreviewRequested?.Invoke(Value); if (!gesture) CommitRequested?.Invoke(Value);
    }
    protected override void OnMouseDown(MouseEventArgs e) { if (e.Button == MouseButtons.Left) BeginGesture(); base.OnMouseDown(e); }
    protected override void OnMouseUp(MouseEventArgs e) { base.OnMouseUp(e); if (e.Button == MouseButtons.Left) FinishGesture(); }
    protected override void OnMouseCaptureChanged(EventArgs e) { base.OnMouseCaptureChanged(e); if (!Capture) FinishGesture(); }
    protected override void OnKeyDown(KeyEventArgs e)
    {
        if (e.KeyCode == Keys.Escape) { CancelGesture(); e.Handled = true; return; }
        if (e.KeyCode is Keys.Left or Keys.Right or Keys.Up or Keys.Down or Keys.Home or Keys.End or Keys.PageUp or Keys.PageDown) BeginGesture();
        base.OnKeyDown(e);
    }
    protected override void OnKeyUp(KeyEventArgs e) { base.OnKeyUp(e); FinishGesture(); }
    protected override void OnLostFocus(EventArgs e) { base.OnLostFocus(e); FinishGesture(); }
    internal void BeginForChecks() => BeginGesture();
    internal void MoveForChecks(int value) => Value = value;
    internal void CancelForChecks() => CancelGesture();
}
