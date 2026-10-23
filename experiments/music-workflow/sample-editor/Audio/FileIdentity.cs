using System.Runtime.InteropServices;
using Microsoft.Win32.SafeHandles;

namespace RootSound.SampleEditor.Audio;

/// <summary>Recognizes junction, short-path and hard-link aliases of the imported original.</summary>
internal sealed record FileIdentity(ulong Volume, ulong Low, ulong High)
{
    internal static FileIdentity? Read(SafeFileHandle handle)
    {
        if (!OperatingSystem.IsWindows()) return null;
        if (GetFileInformationByHandleEx(handle, 18, out FileIdInfo info, (uint)Marshal.SizeOf<FileIdInfo>()))
            return new FileIdentity(info.Volume, info.Low, info.High);
        // Older/network file systems can provide the legacy 64-bit identity instead.
        if (GetFileInformationByHandle(handle, out ByHandleFileInformation legacy))
            return new FileIdentity(legacy.VolumeSerial, ((ulong)legacy.FileIndexHigh << 32) | legacy.FileIndexLow, 0);
        return null;
    }

    internal static void ProtectOriginal(ImportedAudio audio, string destination)
    {
        if (!OperatingSystem.IsWindows() || !File.Exists(destination)) return;
        using var handle = File.OpenHandle(destination, FileMode.Open, FileAccess.Read,
            FileShare.ReadWrite | FileShare.Delete);
        FileIdentity? target = Read(handle);
        if (audio.SourceIdentity is null || target is null)
            throw new IOException("无法确认目标文件与原始音频是否相同，请使用新的文件名。 ");
        if (target == audio.SourceIdentity)
            throw new IOException("请使用新的文件名，不能覆盖导入的原始音频。 ");
    }

    [StructLayout(LayoutKind.Sequential)]
    private struct FileIdInfo { internal ulong Volume; internal ulong Low; internal ulong High; }

    [StructLayout(LayoutKind.Sequential)]
    private struct ByHandleFileInformation
    {
        internal uint Attributes;
        internal System.Runtime.InteropServices.ComTypes.FILETIME CreationTime;
        internal System.Runtime.InteropServices.ComTypes.FILETIME LastAccessTime;
        internal System.Runtime.InteropServices.ComTypes.FILETIME LastWriteTime;
        internal uint VolumeSerial;
        internal uint FileSizeHigh;
        internal uint FileSizeLow;
        internal uint NumberOfLinks;
        internal uint FileIndexHigh;
        internal uint FileIndexLow;
    }

    [DllImport("kernel32.dll", SetLastError = true)]
    [return: MarshalAs(UnmanagedType.Bool)]
    private static extern bool GetFileInformationByHandleEx(SafeFileHandle handle, int informationClass,
        out FileIdInfo information, uint size);
    [DllImport("kernel32.dll", SetLastError = true)]
    [return: MarshalAs(UnmanagedType.Bool)]
    private static extern bool GetFileInformationByHandle(SafeFileHandle handle, out ByHandleFileInformation information);
}
