using System;
using System.Diagnostics;
using System.IO;
using System.Text;
using System.Text.RegularExpressions;

namespace RootSound.Launcher
{
    internal static class Launcher
    {
        private static readonly Regex BuildPointer = new Regex(
            @"\A\.cache[\\/]desktop-builds[\\/](?<name>[A-Za-z0-9][A-Za-z0-9._-]{0,127})\z",
            RegexOptions.CultureInvariant);

        internal static string ResolveExecutable(string rootDirectory)
        {
            return ResolveExecutable(rootDirectory, File.GetAttributes);
        }

        internal static string ResolveExecutable(string rootDirectory, Func<string, FileAttributes> readAttributes)
        {
            if (String.IsNullOrWhiteSpace(rootDirectory))
                throw new ArgumentException("找不到 RootSound 所在目录。", "rootDirectory");

            string root = Path.GetFullPath(rootDirectory);
            if (readAttributes == null) throw new ArgumentNullException("readAttributes");
            RequireOrdinary(root, true, readAttributes);
            string cache = Path.Combine(root, ".cache");
            string builds = Path.Combine(cache, "desktop-builds");
            string pointer = Path.Combine(cache, "desktop-build.current");
            RequireOrdinary(cache, true, readAttributes);
            RequireOrdinary(builds, true, readAttributes);
            RequireOrdinary(pointer, false, readAttributes);

            // The pointer selects exactly one managed build directory. It is not
            // a command line, an executable path, or an unrestricted relative path.
            FileInfo pointerInfo = new FileInfo(pointer);
            if (pointerInfo.Length > 512)
                throw new IOException("RootSound 的版本记录无效，请重新构建。");
            string selected = File.ReadAllText(pointer, Encoding.UTF8).Trim();
            Match match = BuildPointer.Match(selected);
            if (!match.Success || selected.IndexOfAny(new char[] { '\0', '\r', '\n', '\t' }) >= 0)
                throw new IOException("RootSound 的版本记录无效，请重新构建。");
            string buildName = match.Groups["name"].Value;
            if (buildName.EndsWith(".", StringComparison.Ordinal) || IsDeviceName(buildName))
                throw new IOException("RootSound 的版本名称无效，请重新构建。");

            string build = Path.GetFullPath(Path.Combine(builds, buildName));
            string parent = Path.GetDirectoryName(build);
            if (!String.Equals(parent, Path.GetFullPath(builds), StringComparison.OrdinalIgnoreCase))
                throw new IOException("RootSound 的版本目录不在允许的位置。");
            RequireOrdinary(build, true, readAttributes);
            RequireOrdinary(Path.Combine(build, "ui"), true, readAttributes);
            string[] required = new string[] {
                "RootSound.exe", "RootSound.dll", "RootSound.deps.json", "RootSound.runtimeconfig.json",
                Path.Combine("ui", "index.html")
            };
            foreach (string relative in required)
                RequireOrdinary(Path.Combine(build, relative), false, readAttributes);
            return Path.Combine(build, "RootSound.exe");
        }

        internal static ProcessStartInfo CreateStartInfo(string rootDirectory, string[] arguments)
        {
            if (arguments == null) throw new ArgumentNullException("arguments");
            return new ProcessStartInfo {
                FileName = ResolveExecutable(rootDirectory),
                WorkingDirectory = Path.GetFullPath(rootDirectory),
                Arguments = QuoteArguments(arguments),
                UseShellExecute = false,
                CreateNoWindow = true
            };
        }

        internal static string QuoteArguments(string[] arguments)
        {
            if (arguments == null) throw new ArgumentNullException("arguments");
            StringBuilder result = new StringBuilder();
            foreach (string argument in arguments)
            {
                if (argument == null || argument.IndexOf('\0') >= 0)
                    throw new ArgumentException("启动参数包含无效字符。", "arguments");
                if (result.Length != 0) result.Append(' ');
                result.Append('"');
                int slashes = 0;
                foreach (char character in argument)
                {
                    if (character == '\\') { slashes++; continue; }
                    if (character == '"')
                    {
                        result.Append('\\', slashes * 2 + 1);
                        result.Append('"');
                    }
                    else
                    {
                        result.Append('\\', slashes);
                        result.Append(character);
                    }
                    slashes = 0;
                }
                result.Append('\\', slashes * 2);
                result.Append('"');
            }
            return result.ToString();
        }

        private static bool IsDeviceName(string name)
        {
            string prefix = name.Split('.')[0].ToUpperInvariant();
            if (prefix == "CON" || prefix == "PRN" || prefix == "AUX" || prefix == "NUL") return true;
            return prefix.Length == 4 && prefix[3] >= '1' && prefix[3] <= '9'
                && (prefix.StartsWith("COM", StringComparison.Ordinal) || prefix.StartsWith("LPT", StringComparison.Ordinal));
        }

        private static void RequireOrdinary(string path, bool directory, Func<string, FileAttributes> readAttributes)
        {
            FileAttributes attributes;
            try { attributes = readAttributes(path); }
            catch (FileNotFoundException) { throw Missing(path); }
            catch (DirectoryNotFoundException) { throw Missing(path); }
            if ((attributes & FileAttributes.ReparsePoint) != 0)
                throw new IOException("RootSound 的程序目录或文件被重定向，无法安全选择版本：" + path);
            if (((attributes & FileAttributes.Directory) != 0) != directory)
                throw Missing(path);
        }

        private static IOException Missing(string path)
        {
            return new IOException("RootSound 的已构建程序不完整，缺少：" + path);
        }
    }
}
