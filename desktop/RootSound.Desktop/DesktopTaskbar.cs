using System.Runtime.InteropServices;

namespace RootSound.Desktop;

internal static class DesktopTaskbar
{
    private const uint GetState = 4;
    private const uint AutoHide = 1;

    [StructLayout(LayoutKind.Sequential)]
    private struct AppBarData
    {
        public uint Size;
        public IntPtr Window;
        public uint CallbackMessage;
        public uint Edge;
        public int Left, Top, Right, Bottom;
        public IntPtr Parameter;
    }

    [DllImport("shell32.dll", ExactSpelling = true)]
    private static extern nuint SHAppBarMessage(uint message, ref AppBarData data);

    [ComImport, Guid("56FDF344-FD6D-11D0-958A-006097C9A090")]
    private class TaskbarList { }

    [ComImport, Guid("602D4995-B13A-429B-A66E-1935E44F4317"), InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]
    private interface ITaskbarList2
    {
        [PreserveSig] int HrInit();
        [PreserveSig] int AddTab(IntPtr window);
        [PreserveSig] int DeleteTab(IntPtr window);
        [PreserveSig] int ActivateTab(IntPtr window);
        [PreserveSig] int SetActiveAlt(IntPtr window);
        [PreserveSig] int MarkFullscreenWindow(IntPtr window, [MarshalAs(UnmanagedType.Bool)] bool fullscreen);
    }

    internal static bool ShouldMarkFullscreen(FormWindowState state, bool active, Func<bool> autoHideEnabled) =>
        active && state == FormWindowState.Maximized && autoHideEnabled();

    internal static bool AutoHideEnabled()
    {
        var data = new AppBarData { Size = (uint)Marshal.SizeOf<AppBarData>() };
        return (SHAppBarMessage(GetState, ref data) & AutoHide) != 0;
    }

    internal static bool TryMarkFullscreen(IntPtr window, bool fullscreen)
    {
        object? shell = null;
        try
        {
            shell = new TaskbarList();
            var taskbar = (ITaskbarList2)shell;
            return taskbar.HrInit() >= 0 && taskbar.MarkFullscreenWindow(window, fullscreen) >= 0;
        }
        catch (COMException) { return false; }
        catch (InvalidCastException) { return false; }
        finally
        {
            if (shell is not null) Marshal.ReleaseComObject(shell);
        }
    }
}
