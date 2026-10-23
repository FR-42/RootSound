using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Runtime.InteropServices;
using System.Text;
using Microsoft.Win32.SafeHandles;

namespace RootSound.Launcher
{
    internal static class LauncherSelfTests
    {
        private static readonly List<string> Passed = new List<string>();
        private static readonly List<string> Skipped = new List<string>();
        private static string testDirectory;
        private static string fixtureDirectory;
        private static int fixtureNumber;

        private static int Main(string[] args)
        {
            if (args.Length >= 2 && args[0] == "--launcher-test-echo")
            {
                List<string> values = new List<string>();
                values.Add("cwd:" + Convert.ToBase64String(Encoding.Unicode.GetBytes(Environment.CurrentDirectory)));
                for (int index = 2; index < args.Length; index++)
                    values.Add("arg:" + Convert.ToBase64String(Encoding.Unicode.GetBytes(args[index])));
                File.WriteAllLines(args[1], values.ToArray(), Encoding.UTF8);
                return 0;
            }
            if (args.Length != 1) { Console.Error.WriteLine("Provide one isolated test output directory."); return 2; }
            testDirectory = Path.GetFullPath(args[0]);
            Directory.CreateDirectory(testDirectory);
            fixtureDirectory = Path.Combine(testDirectory, "fixtures-" + Guid.NewGuid().ToString("N"));
            try
            {
                Run();
                string report = "{\"passed\":" + Passed.Count + ",\"checks\":[\"" + String.Join("\",\"", Passed.ToArray())
                    + "\"],\"skipped\":[" + (Skipped.Count == 0 ? "" : "\"" + String.Join("\",\"", Skipped.ToArray()) + "\"") + "]}";
                File.WriteAllText(Path.Combine(testDirectory, "launcher-report.json"), report, Encoding.UTF8);
                Console.WriteLine("Launcher checks passed: " + Passed.Count + "; optional native junction checks skipped: " + Skipped.Count);
                return 0;
            }
            catch (Exception error)
            {
                File.WriteAllText(Path.Combine(testDirectory, "launcher-report.json"), "{\"passed\":" + Passed.Count + ",\"failed\":true}", Encoding.UTF8);
                Console.Error.WriteLine(error);
                return 1;
            }
        }

        private static void Run()
        {
            Check("relative-backslash", delegate {
                string root = Fixture(@".cache\desktop-builds\20261023-001-abcdef");
                Equal(Path.Combine(root, @".cache\desktop-builds\20261023-001-abcdef\RootSound.exe"), Launcher.ResolveExecutable(root));
            });
            Check("relative-forward-slash", delegate {
                string root = Fixture(".cache/desktop-builds/20261023-001-abcdef");
                Launcher.ResolveExecutable(root);
            });
            Check("root-with-chinese-spaces", delegate {
                string root = Fixture(@".cache\desktop-builds\20261023-001-abcdef");
                Assert(root.Contains("中文 空格"), "Fixture must exercise a Chinese directory with spaces.");
                Launcher.ResolveExecutable(root + Path.DirectorySeparatorChar);
            });
            Check("pointer-bom-and-terminal-newline", delegate {
                string root = Fixture(".cache/desktop-builds/20261023-001-abcdef\r\n");
                Launcher.ResolveExecutable(root);
            });
            string[] invalidPointers = new string[] {
                @"C:\Windows\System32", @"\\server\share\build", @"\Windows\System32",
                @".cache\desktop-builds\..", @".cache\desktop-builds\..\outside",
                @".cache\desktop-builds-evil\20261023-001-abcdef", @".cache\desktop-builds\20261023-001-abcdef\nested",
                @".cache\desktop-builds\good:evil", @".cache\desktop-builds\CON", @".cache\desktop-builds\nul.exe",
                @".cache\desktop-builds\LPT1", @".cache\desktop-builds\bad.", @".cache\desktop-builds\two words",
                ".cache/desktop-builds/good\nname", ".cache/desktop-builds/good\0name", ".cache/desktop-builds/good\tname", ""
            };
            for (int index = 0; index < invalidPointers.Length; index++)
            {
                string pointer = invalidPointers[index];
                Check("invalid-pointer-" + index, delegate { Reject(delegate { Launcher.ResolveExecutable(Fixture(pointer)); }); });
            }
            Check("oversized-pointer", delegate { Reject(delegate { Launcher.ResolveExecutable(Fixture(new string('a', 513))); }); });
            Check("missing-pointer", delegate {
                string root = Fixture(@".cache\desktop-builds\20261023-001-abcdef");
                File.Delete(Path.Combine(root, @".cache\desktop-build.current"));
                Reject(delegate { Launcher.ResolveExecutable(root); });
            });
            string[] required = new string[] {
                "RootSound.exe", "RootSound.dll", "RootSound.deps.json", "RootSound.runtimeconfig.json", @"ui\index.html"
            };
            foreach (string relative in required)
            {
                string current = relative;
                Check("missing-" + current.Replace('\\', '-'), delegate {
                    string root = Fixture(@".cache\desktop-builds\20261023-001-abcdef");
                    File.Delete(Path.Combine(root, @".cache\desktop-builds\20261023-001-abcdef", current));
                    Reject(delegate { Launcher.ResolveExecutable(root); });
                });
            }
            Check("required-file-is-directory", delegate {
                string root = Fixture(@".cache\desktop-builds\20261023-001-abcdef");
                string file = Path.Combine(root, @".cache\desktop-builds\20261023-001-abcdef\RootSound.dll");
                File.Delete(file); Directory.CreateDirectory(file);
                Reject(delegate { Launcher.ResolveExecutable(root); });
            });
            string[] reparseComponents = new string[] {
                "", ".cache", @".cache\desktop-builds", @".cache\desktop-build.current",
                @".cache\desktop-builds\20261023-001-abcdef", @".cache\desktop-builds\20261023-001-abcdef\ui",
                @".cache\desktop-builds\20261023-001-abcdef\RootSound.exe",
                @".cache\desktop-builds\20261023-001-abcdef\RootSound.dll",
                @".cache\desktop-builds\20261023-001-abcdef\RootSound.deps.json",
                @".cache\desktop-builds\20261023-001-abcdef\RootSound.runtimeconfig.json",
                @".cache\desktop-builds\20261023-001-abcdef\ui\index.html"
            };
            for (int index = 0; index < reparseComponents.Length; index++)
            {
                string component = reparseComponents[index];
                Check("reparse-attribute-component-" + index, delegate {
                    string root = Fixture(@".cache\desktop-builds\20261023-001-abcdef");
                    string redirected = Path.Combine(root, component);
                    Reject(delegate {
                        Launcher.ResolveExecutable(root, delegate(string path) {
                            FileAttributes attributes = File.GetAttributes(path);
                            return String.Equals(path, redirected, StringComparison.OrdinalIgnoreCase)
                                ? attributes | FileAttributes.ReparsePoint : attributes;
                        });
                    });
                });
            }
            OptionalJunctionCheck("native-reparse-selected-build", delegate {
                string root = Fixture(@".cache\desktop-builds\redirected");
                string target = Path.Combine(root, @".cache\desktop-builds\20261023-001-abcdef");
                string junction = Path.Combine(root, @".cache\desktop-builds\redirected");
                CreateJunction(junction, target);
                try { Reject(delegate { Launcher.ResolveExecutable(root); }); }
                finally { Directory.Delete(junction); }
            });
            OptionalJunctionCheck("native-reparse-cache-parent", delegate {
                string root = Fixture(@".cache\desktop-builds\20261023-001-abcdef");
                string cache = Path.Combine(root, ".cache");
                string target = Path.Combine(root, "cache-target");
                Directory.Move(cache, target);
                CreateJunction(cache, target);
                try { Reject(delegate { Launcher.ResolveExecutable(root); }); }
                finally { Directory.Delete(cache); }
            });
            Check("no-shell-and-preserved-working-directory", delegate {
                string root = Fixture(@".cache\desktop-builds\20261023-001-abcdef");
                ProcessStartInfo start = Launcher.CreateStartInfo(root, new string[0]);
                Assert(!start.UseShellExecute && start.CreateNoWindow, "Launcher must not create a shell or console.");
                Equal(root, start.WorkingDirectory);
                Equal("", start.Arguments);
            });
            Check("argument-escaping-real-child-roundtrip", ArgumentRoundtrip);
            Check("null-argument-rejected", delegate { Reject(delegate { Launcher.QuoteArguments(new string[] { null }); }); });
            Check("nul-argument-rejected", delegate { Reject(delegate { Launcher.QuoteArguments(new string[] { "a\0b" }); }); });
        }

        private static void ArgumentRoundtrip()
        {
            string root = Fixture(@".cache\desktop-builds\20261023-001-abcdef");
            string executable = Launcher.ResolveExecutable(root);
            File.Copy(typeof(LauncherSelfTests).Assembly.Location, executable, true);
            string resultPath = Path.Combine(root, "echo-result.txt");
            string[] values = new string[] {
                "--data-dir", @"D:\音乐素材\项目 空格\", "", "plain", "one two", "\"", "a\"b", "\\",
                "\\\\", "before\\\"after", "before\\\\\"after", "ends with spaces  ", "\tline\nnext", "中文🎵",
                "&whoami|echo >ignored", "`$()%;", "\\\\server\\share\\", "last\\\\\\"
            };
            List<string> forwarded = new List<string>();
            forwarded.Add("--launcher-test-echo"); forwarded.Add(resultPath); forwarded.AddRange(values);
            using (Process child = Process.Start(Launcher.CreateStartInfo(root, forwarded.ToArray())))
            {
                Assert(child != null, "Stub child did not start.");
                if (!child.WaitForExit(10000)) { child.Kill(); throw new Exception("Stub child timed out."); }
                Equal(0, child.ExitCode);
            }
            string[] actual = File.ReadAllLines(resultPath, Encoding.UTF8);
            Equal(values.Length + 1, actual.Length);
            Equal("cwd:" + Convert.ToBase64String(Encoding.Unicode.GetBytes(root)), actual[0]);
            for (int index = 0; index < values.Length; index++)
                Equal("arg:" + Convert.ToBase64String(Encoding.Unicode.GetBytes(values[index])), actual[index + 1]);
        }

        private static string Fixture(string pointer)
        {
            string root = Path.Combine(fixtureDirectory, "中文 空格 " + (++fixtureNumber));
            string build = Path.Combine(root, @".cache\desktop-builds\20261023-001-abcdef");
            Directory.CreateDirectory(Path.Combine(build, "ui"));
            foreach (string name in new string[] { "RootSound.exe", "RootSound.dll", "RootSound.deps.json", "RootSound.runtimeconfig.json" })
                File.WriteAllText(Path.Combine(build, name), "fixture");
            File.WriteAllText(Path.Combine(build, @"ui\index.html"), "<title>Fixture</title>");
            File.WriteAllText(Path.Combine(root, @".cache\desktop-build.current"), pointer, Encoding.UTF8);
            return root;
        }

        private static void Check(string name, Action action) { action(); Passed.Add(name); }
        private static void OptionalJunctionCheck(string name, Action action)
        {
            try { Check(name, action); }
            catch (JunctionNotPermittedException) { Skipped.Add(name + "-win32-access-denied"); }
        }
        private static void Assert(bool condition, string message) { if (!condition) throw new Exception(message); }
        private static void Equal<T>(T expected, T actual)
        {
            if (!EqualityComparer<T>.Default.Equals(expected, actual)) throw new Exception("Expected: " + expected + "; actual: " + actual);
        }
        private static void Reject(Action action)
        {
            try { action(); }
            catch (IOException) { return; }
            catch (ArgumentException) { return; }
            throw new Exception("Invalid launcher input was accepted.");
        }

        // Junctions need no developer-mode or symbolic-link privilege. The test
        // targets only its isolated fixtures and removes the link, never its target.
        private static void CreateJunction(string junction, string target)
        {
            Directory.CreateDirectory(junction);
            byte[] substitute = Encoding.Unicode.GetBytes(@"\??\" + Path.GetFullPath(target));
            byte[] printable = Encoding.Unicode.GetBytes(Path.GetFullPath(target));
            byte[] data = new byte[16 + substitute.Length + 2 + printable.Length + 2];
            Buffer.BlockCopy(BitConverter.GetBytes(0xA0000003U), 0, data, 0, 4);
            Buffer.BlockCopy(BitConverter.GetBytes((ushort)(data.Length - 8)), 0, data, 4, 2);
            Buffer.BlockCopy(BitConverter.GetBytes((ushort)substitute.Length), 0, data, 10, 2);
            Buffer.BlockCopy(BitConverter.GetBytes((ushort)(substitute.Length + 2)), 0, data, 12, 2);
            Buffer.BlockCopy(BitConverter.GetBytes((ushort)printable.Length), 0, data, 14, 2);
            Buffer.BlockCopy(substitute, 0, data, 16, substitute.Length);
            Buffer.BlockCopy(printable, 0, data, 18 + substitute.Length, printable.Length);
            using (SafeFileHandle handle = CreateFile(junction, 0x40000000, 7, IntPtr.Zero, 3, 0x02200000, IntPtr.Zero))
            {
                if (handle.IsInvalid) throw new IOException("Cannot open test junction: " + Marshal.GetLastWin32Error());
                int returned;
                if (!DeviceIoControl(handle, 0x000900A4, data, data.Length, IntPtr.Zero, 0, out returned, IntPtr.Zero))
                {
                    int error = Marshal.GetLastWin32Error();
                    if (error == 5 || error == 1314) throw new JunctionNotPermittedException();
                    throw new IOException("Cannot create test junction: " + error);
                }
            }
        }

        private sealed class JunctionNotPermittedException : Exception { }

        [DllImport("kernel32.dll", CharSet = CharSet.Unicode, SetLastError = true)]
        private static extern SafeFileHandle CreateFile(string fileName, uint access, uint share, IntPtr security, uint creation, uint flags, IntPtr template);
        [DllImport("kernel32.dll", SetLastError = true)]
        private static extern bool DeviceIoControl(SafeFileHandle handle, uint controlCode, byte[] input, int inputSize, IntPtr output, int outputSize, out int returned, IntPtr overlapped);
    }
}
