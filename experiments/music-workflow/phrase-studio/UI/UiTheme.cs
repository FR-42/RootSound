using RootSound.SampleEditor.Audio;

namespace RootSound.PhraseStudio.UI;

internal static class UiTheme
{
    internal static Color Background => Color.FromArgb(19, 24, 31);
    internal static Color Panel => Color.FromArgb(29, 36, 46);
    internal static Color Foreground => Color.FromArgb(222, 229, 238);
    internal static Color Muted => Color.FromArgb(147, 161, 181);
    internal static Button Button(string text) => new()
    {
        Text = text, AutoSize = true, MinimumSize = new Size(0, 31), FlatStyle = FlatStyle.Flat,
        BackColor = Panel, ForeColor = Foreground, Padding = new Padding(7, 0, 7, 0),
        Margin = new Padding(3)
    };
    internal static void Apply(Control root)
    {
        foreach (Control control in root.Controls)
        {
            if (control is TextBoxBase or NumericUpDown or ComboBox)
            { control.BackColor = Panel; control.ForeColor = Foreground; }
            else if (control is Label or CheckBox) control.ForeColor = Foreground;
            Apply(control);
        }
    }
}

internal static class NamePrompt
{
    internal static string? Ask(IWin32Window owner, string title, string initial)
    {
        using var dialog = new Form
        {
            Text = title, ClientSize = new Size(420, 132), FormBorderStyle = FormBorderStyle.FixedDialog,
            MaximizeBox = false, MinimizeBox = false, StartPosition = FormStartPosition.CenterParent,
            BackColor = UiTheme.Background, Font = new Font("Microsoft YaHei UI", 9)
        };
        var field = new TextBox { Text = initial, MaxLength = 240, Left = 18, Top = 20, Width = 384 };
        var ok = UiTheme.Button("确定"); ok.SetBounds(222, 75, 84, 32);
        var cancel = UiTheme.Button("取消"); cancel.SetBounds(318, 75, 84, 32); cancel.DialogResult = DialogResult.Cancel;
        ok.Click += (_, _) =>
        {
            string value = field.Text.Trim();
            if (value.Length == 0 || value.Any(char.IsControl)) { field.Focus(); return; }
            dialog.DialogResult = DialogResult.OK;
        };
        dialog.Controls.AddRange([field, ok, cancel]); UiTheme.Apply(dialog);
        dialog.AcceptButton = ok; dialog.CancelButton = cancel;
        dialog.Shown += (_, _) => { field.Focus(); field.SelectAll(); };
        return dialog.ShowDialog(owner) == DialogResult.OK ? field.Text.Trim() : null;
    }
}

/// <summary>Protect imported timbre originals even when another pathname aliases the same file.</summary>
internal sealed class InstrumentSources
{
    private readonly List<(string Path, FileIdentity? Identity)> sources = [];
    internal void Remember(string path)
    {
        string full = Path.GetFullPath(path);
        using var handle = File.OpenHandle(full, FileMode.Open, FileAccess.Read, FileShare.ReadWrite | FileShare.Delete);
        sources.Add((full, FileIdentity.Read(handle)));
    }
    internal void CheckDestination(string path)
    {
        string full = Path.GetFullPath(path);
        if (sources.Any(x => string.Equals(x.Path, full, StringComparison.OrdinalIgnoreCase)))
            throw new IOException("这是导入的音色文件，请为乐句选择另一个文件名。");
        if (!File.Exists(full) || sources.Count == 0) return;
        using var handle = File.OpenHandle(full, FileMode.Open, FileAccess.Read, FileShare.ReadWrite | FileShare.Delete);
        var target = FileIdentity.Read(handle);
        if (target is null || sources.Any(x => x.Identity is null))
            throw new IOException("无法核实目标文件是否是原音色，请使用新的文件名。");
        if (sources.Any(x => x.Identity == target))
            throw new IOException("目标位置指向导入的音色，请使用新的文件名。");
    }
}
