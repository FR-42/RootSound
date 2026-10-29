using System.Buffers;
using System.Text;
using System.Text.Json;

namespace RootSound.Desktop;

/// <summary>Append a large validated text field without the JSON writer's pessimistic sixfold token bound.</summary>
internal static class LargeJsonText
{
    private static readonly UTF8Encoding Utf8 = new(false, true);
    private static readonly SearchValues<char> Escapes = SearchValues.Create(
        "\"\\\u0000\u0001\u0002\u0003\u0004\u0005\u0006\u0007\u0008\u0009\u000a\u000b\u000c\u000d\u000e\u000f"
        + "\u0010\u0011\u0012\u0013\u0014\u0015\u0016\u0017\u0018\u0019\u001a\u001b\u001c\u001d\u001e\u001f");
    private const string Hex = "0123456789abcdef";
    private const int MaximumStringCharacters = 0x3fffffdf;

    internal static string Serialize(object metadata, string field, string? text)
    {
        ArgumentNullException.ThrowIfNull(metadata);
        ArgumentException.ThrowIfNullOrWhiteSpace(field);
        if (text is not null)
        {
            if (text.Length > AtomicTextStore.MaximumBytes)
                throw new InvalidDataException("歌曲文本超过当前文件大小范围，原文件已保留。");
            try
            {
                // Validate complete UTF-16, including pairs spanning vector/chunk boundaries.
                if (Utf8.GetByteCount(text) > AtomicTextStore.MaximumBytes)
                    throw new InvalidDataException("歌曲文本超过当前文件大小范围，原文件已保留。");
            }
            catch (EncoderFallbackException error)
            {
                throw new InvalidDataException("歌曲文本含有无效的 Unicode 字符，原文件已保留。", error);
            }
        }

        string prefix = JsonSerializer.Serialize(metadata);
        bool comma;
        using (var document = JsonDocument.Parse(prefix))
        {
            if (document.RootElement.ValueKind != JsonValueKind.Object
                || document.RootElement.TryGetProperty(field, out _))
                throw new ArgumentException("JSON 元信息必须是对象，且不能包含待写入的文本字段。", nameof(metadata));
            comma = document.RootElement.EnumerateObject().Any();
        }
        string key = JsonSerializer.Serialize(field);
        long length = prefix.Length - 1L + (comma ? 1 : 0) + key.Length + 1 + 1;
        if (text is null) length += 4;
        else
        {
            length += text.Length + 2L;
            ReadOnlySpan<char> remaining = text.AsSpan();
            while (!remaining.IsEmpty)
            {
                int index = remaining.IndexOfAny(Escapes);
                if (index < 0) break;
                char value = remaining[index];
                length += value is '"' or '\\' or '\b' or '\f' or '\n' or '\r' or '\t' ? 1 : 5;
                remaining = remaining[(index + 1)..];
            }
        }
        if (length > MaximumStringCharacters)
            throw new InvalidDataException("歌曲文本转为 JSON 后过大，原文件已保留。");

        return string.Create(checked((int)length), (prefix, key, text, comma), static (destination, state) =>
        {
            int position = state.prefix.Length - 1;
            state.prefix.AsSpan(0, position).CopyTo(destination);
            if (state.comma) destination[position++] = ',';
            state.key.AsSpan().CopyTo(destination[position..]); position += state.key.Length;
            destination[position++] = ':';
            if (state.text is null)
            {
                "null".AsSpan().CopyTo(destination[position..]); position += 4;
            }
            else
            {
                destination[position++] = '"';
                ReadOnlySpan<char> remaining = state.text.AsSpan();
                while (!remaining.IsEmpty)
                {
                    int index = remaining.IndexOfAny(Escapes);
                    if (index < 0)
                    {
                        remaining.CopyTo(destination[position..]); position += remaining.Length;
                        break;
                    }
                    remaining[..index].CopyTo(destination[position..]); position += index;
                    char value = remaining[index]; remaining = remaining[(index + 1)..];
                    destination[position++] = '\\';
                    char shortEscape = value switch
                    {
                        '"' => '"', '\\' => '\\', '\b' => 'b', '\f' => 'f',
                        '\n' => 'n', '\r' => 'r', '\t' => 't', _ => '\0',
                    };
                    if (shortEscape != '\0') destination[position++] = shortEscape;
                    else
                    {
                        destination[position++] = 'u'; destination[position++] = '0'; destination[position++] = '0';
                        destination[position++] = Hex[value >> 4]; destination[position++] = Hex[value & 15];
                    }
                }
                destination[position++] = '"';
            }
            destination[position] = '}';
        });
    }
}
