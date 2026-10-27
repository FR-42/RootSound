namespace RootSound.ReferenceStudio.Controls;

internal static class BundledCaseNavigation
{
    internal static string FileName(bool observation) => observation ? "Vulcanus-声音观察.rscase" : "Vulcanus.rscase";
    internal static string Caption(bool observation) => observation ? "回到重建" : "听原曲分层";
    internal static string? Target(bool observation, string? reconstructionPath, string? observationPath) => observation ? reconstructionPath : observationPath;
    internal static double Position(double current, double duration) => Math.Clamp(double.IsFinite(current) ? current : 0, 0, duration);
}
