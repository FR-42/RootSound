using System.Runtime.InteropServices;
using System.Text.Json;

namespace RootSound.Desktop;

internal sealed class DesktopPointerInput : IDisposable
{
    [StructLayout(LayoutKind.Sequential)]
    private struct Device
    {
        public ushort Page, Usage;
        public uint Flags;
        public IntPtr Target;
    }
    [StructLayout(LayoutKind.Sequential)]
    private struct Header
    {
        public uint Type, Size;
        public IntPtr Device, Parameter;
    }
    [StructLayout(LayoutKind.Explicit, Size = 24)]
    private struct Mouse
    {
        [FieldOffset(0)] public ushort Flags;
        [FieldOffset(4)] public ushort Buttons;
        [FieldOffset(12)] public int X;
        [FieldOffset(16)] public int Y;
    }
    [StructLayout(LayoutKind.Sequential)]
    private struct Input { public Header Header; public Mouse Mouse; }

    [DllImport("user32.dll", SetLastError = true)]
    [return: MarshalAs(UnmanagedType.Bool)]
    private static extern bool RegisterRawInputDevices(in Device device, uint count, uint size);

    [DllImport("user32.dll")]
    private static extern uint GetRawInputData(IntPtr handle, uint command, out Input data, ref uint size, uint headerSize);

    [StructLayout(LayoutKind.Sequential)]
    private struct Frame
    {
        public int Left, Top, Right, Bottom;
        public readonly Rectangle ToRectangle() => Rectangle.FromLTRB(Left, Top, Right, Bottom);
    }

    [StructLayout(LayoutKind.Sequential)]
    private struct MonitorInfo
    {
        public int Size;
        public Frame Bounds, WorkArea;
        public uint Flags;
    }

    [DllImport("user32.dll")]
    private static extern IntPtr SetThreadDpiAwarenessContext(IntPtr context);

    [DllImport("user32.dll")]
    private static extern IntPtr GetForegroundWindow();

    [DllImport("user32.dll")]
    private static extern IntPtr GetAncestor(IntPtr window, uint flags);

    [DllImport("user32.dll")]
    private static extern IntPtr MonitorFromWindow(IntPtr window, uint flags);

    [DllImport("user32.dll", ExactSpelling = true)]
    [return: MarshalAs(UnmanagedType.Bool)]
    private static extern bool GetMonitorInfoW(IntPtr monitor, ref MonitorInfo info);

    [DllImport("user32.dll")]
    [return: MarshalAs(UnmanagedType.Bool)]
    private static extern bool GetPhysicalCursorPos(out Point point);

    [DllImport("user32.dll")]
    [return: MarshalAs(UnmanagedType.Bool)]
    private static extern bool GetWindowRect(IntPtr window, out Frame bounds);

    [DllImport("dwmapi.dll")]
    private static extern int DwmGetWindowAttribute(IntPtr window, int attribute, out Frame bounds, int size);

    private readonly Form window;
    private readonly Action<string> send;
    private readonly System.Windows.Forms.Timer timer = new() { Interval = 16 };
    private readonly bool registered;
    private int dx, dy;
    private bool pressed, pending;

    public DesktopPointerInput(Form window, Action<string> send)
    {
        this.window = window;
        this.send = send;
        const uint inputSink = 0x100;
        registered = RegisterRawInputDevices(new Device { Page = 1, Usage = 2, Flags = inputSink, Target = window.Handle }, 1, (uint)Marshal.SizeOf<Device>());
        timer.Tick += (_, _) => Flush();
        if (registered) timer.Start();
    }

    public void Read(Message message)
    {
        if (!registered || message.Msg != 0x00ff
            || ((message.WParam.ToInt64() & 0xff) != 0 && !IsForeground(message.HWnd))) return;
        uint size = (uint)Marshal.SizeOf<Input>();
        if (GetRawInputData(message.LParam, 0x10000003, out var value, ref size, (uint)Marshal.SizeOf<Header>()) == uint.MaxValue
            || value.Header.Type != 0) return;
        if ((value.Mouse.Flags & 1) == 0)
        {
            dx = Math.Clamp(dx + value.Mouse.X, -8192, 8192);
            dy = Math.Clamp(dy + value.Mouse.Y, -8192, 8192);
        }
        pressed |= (value.Mouse.Buttons & 0x0155) != 0;
        pending = true;
    }

    private void Flush()
    {
        if (!pending) return;
        IntPtr handle = window.Handle;
        if (!IsForeground(handle)) { Reset(); return; }
        var movement = (dx, dy, pressed);
        dx = dy = 0;
        pressed = pending = false;
        bool maximized = window.WindowState == FormWindowState.Maximized;
        var cursor = Cursor.Position;
        var client = window.RectangleToScreen(window.ClientRectangle);
        var edge = (maximized ? ReadEdgePosition(handle) : null)
            ?? EdgePosition(cursor, client, maximized ? Screen.FromControl(window).Bounds : null);
        if (edge is not { } position) return;
        send(JsonSerializer.Serialize(new
        {
            type = "rootsound-pointer", x = position.X, y = position.Y,
            clientX = (cursor.X - client.Left) / (double)Math.Max(1, client.Width),
            clientY = (cursor.Y - client.Top) / (double)Math.Max(1, client.Height),
            movement.dx, movement.dy, movement.pressed, held = Control.MouseButtons != MouseButtons.None
        }));
    }

    private static bool IsForeground(IntPtr handle)
    {
        const uint root = 2;
        IntPtr foreground = GetForegroundWindow();
        return foreground != IntPtr.Zero && (foreground == handle || GetAncestor(foreground, root) == handle);
    }

    private static (double X, double Y)? ReadEdgePosition(IntPtr handle)
    {
        const int perMonitorAware = -3;
        const int extendedFrameBounds = 9;
        const uint nearestMonitor = 2;
        IntPtr previousContext = SetThreadDpiAwarenessContext(new IntPtr(perMonitorAware));
        if (previousContext == IntPtr.Zero) return null;
        try
        {
            if (!GetPhysicalCursorPos(out var cursor)) return null;
            if (DwmGetWindowAttribute(handle, extendedFrameBounds, out var frame, Marshal.SizeOf<Frame>()) != 0
                && !GetWindowRect(handle, out frame)) return null;
            var monitor = new MonitorInfo { Size = Marshal.SizeOf<MonitorInfo>() };
            Rectangle? screen = GetMonitorInfoW(MonitorFromWindow(handle, nearestMonitor), ref monitor)
                ? monitor.Bounds.ToRectangle() : null;
            return EdgePosition(cursor, frame.ToRectangle(), screen);
        }
        finally { SetThreadDpiAwarenessContext(previousContext); }
    }

    internal static (double X, double Y)? EdgePosition(Point cursor, Rectangle bounds, Rectangle? screen)
    {
        if (screen is { } display) bounds.Intersect(display);
        if (bounds.Width <= 1 || bounds.Height <= 1) return null;
        return (EdgeCoordinate(cursor.X - bounds.Left, bounds.Width), EdgeCoordinate(cursor.Y - bounds.Top, bounds.Height));
    }

    private static double EdgeCoordinate(int offset, int size)
    {
        return offset / (double)(size - 1);
    }

    public void Reset()
    {
        dx = dy = 0;
        pressed = pending = false;
        if (registered) send("{\"type\":\"rootsound-pointer-reset\"}");
    }

    public void Dispose()
    {
        timer.Dispose();
        if (registered) RegisterRawInputDevices(new Device { Page = 1, Usage = 2, Flags = 1 }, 1, (uint)Marshal.SizeOf<Device>());
    }
}
