using System.Text.Json;

namespace RootSound.SpectralForge;

internal sealed record BridgeRequest(string Id, string Method, JsonElement Payload)
{
    internal static BridgeRequest Parse(string text)
    {
        if (text.Length > ((long)NativeFiles.MaximumWavBytes + 2) / 3 * 4 + 8192)
            throw new InvalidDataException("请求超过本实验大小限制。");
        using var document = JsonDocument.Parse(text, new JsonDocumentOptions { MaxDepth = 64 });
        JsonElement root = document.RootElement;
        if (root.ValueKind != JsonValueKind.Object) throw new InvalidDataException("请求格式无效。");
        var fields = new HashSet<string>();
        foreach (var property in root.EnumerateObject())
            if (!fields.Add(property.Name) || property.Name is not ("id" or "method" or "payload")) throw new InvalidDataException("请求字段无效。");
        if (!root.TryGetProperty("id", out var id) || id.ValueKind != JsonValueKind.String || string.IsNullOrWhiteSpace(id.GetString()) || id.GetString()!.Length > 128
            || !root.TryGetProperty("method", out var method) || method.ValueKind != JsonValueKind.String || string.IsNullOrWhiteSpace(method.GetString()) || method.GetString()!.Length > 64)
            throw new InvalidDataException("请求标识无效。");
        JsonElement payload = root.TryGetProperty("payload", out var p) ? p.Clone() : JsonSerializer.SerializeToElement(new { });
        if (payload.ValueKind != JsonValueKind.Object) throw new InvalidDataException("请求参数必须是对象。");
        return new BridgeRequest(id.GetString()!, method.GetString()!, payload);
    }

    internal string Text(string name)
    {
        if (!Payload.TryGetProperty(name, out var value) || value.ValueKind != JsonValueKind.String)
            throw new InvalidDataException("缺少有效的“" + name + "”参数。");
        return value.GetString()!;
    }
    internal string? OptionalText(string name) => Payload.TryGetProperty(name, out var value) && value.ValueKind == JsonValueKind.String ? value.GetString() : null;
}
