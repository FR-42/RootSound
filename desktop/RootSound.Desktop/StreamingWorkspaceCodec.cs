using System.Globalization;
using System.Buffers;
using System.Text;
using System.Text.Json;
using System.Text.Json.Nodes;

namespace RootSound.Desktop;

/// <summary>Bounds temporary text to a single sample, never the whole embedded library.</summary>
internal static class StreamingWorkspaceCodec
{
    private static readonly UTF8Encoding Utf8 = new(false, true);
    internal sealed record Workspace(JsonObject Metadata, string Library);

    /// <summary>Bounded discovery read; never decode the embedded audio/music string.</summary>
    internal static JsonObject? ReadHeader(Stream stream)
    {
        byte[] prefix = new byte[64 * 1024]; int length = 0;
        while (length < prefix.Length)
        {
            int read = stream.Read(prefix, length, Math.Min(4096, prefix.Length - length));
            length += read;
            int bom = length >= 3 && prefix[0] == 0xef && prefix[1] == 0xbb && prefix[2] == 0xbf ? 3 : 0;
            var reader = new Utf8JsonReader(prefix.AsSpan(bom, length - bom), isFinalBlock: read == 0, state: default);
            if (!reader.Read()) { if (read == 0) return null; continue; }
            if (reader.TokenType != JsonTokenType.StartObject) throw new InvalidDataException("工程 JSON 必须是对象。");
            var metadata = new JsonObject();
            while (reader.Read())
            {
                if (reader.TokenType == JsonTokenType.EndObject) return null;
                if (reader.TokenType != JsonTokenType.PropertyName) throw new InvalidDataException("工程 JSON 字段无效。");
                string key = reader.GetString()!;
                if (key == "libraryText")
                    return new[] { "format", "version", "id", "name", "createdAtUtc" }.All(metadata.ContainsKey) ? metadata : null;
                if (metadata.ContainsKey(key)) throw new InvalidDataException("工程存在重复字段。");
                if (!JsonDocument.TryParseValue(ref reader, out var value)) break;
                using (value) metadata.Add(key, JsonNode.Parse(value!.RootElement.GetRawText()));
            }
            if (read == 0) return null;
        }
        return null;
    }

    internal static Workspace Read(Stream stream, SessionPayloadStore? payloads, bool metadataOnly = false)
    {
        using var reader = new StreamReader(stream, Utf8, true, 16 * 1024, leaveOpen: true);
        var parser = new Parser(reader, null, allowHostAssets: false);
        parser.Expect('{'); var metadata = new JsonObject(); string? library = null;
        if (!parser.Take('}')) do
        {
            string key = parser.String(); parser.Expect(':');
            if (key == "libraryText")
            {
                if (library is not null) throw new InvalidDataException("工程存在重复资料库字段。");
                parser.Expect('"');
                using var inner = new JsonStringReader(reader);
                if (metadataOnly)
                {
                    var scanner = new Parser(inner, null, false, discardStrings: true);
                    JsonNode? header = scanner.Value(); scanner.End();
                    ProjectDirectoryManager.ValidateLibrary(header?.ToJsonString() ?? "null"); library = "";
                }
                else
                {
                    var innerParser = new Parser(inner, payloads, allowHostAssets: false);
                    JsonNode? value = innerParser.Value(); innerParser.End();
                    library = value?.ToJsonString() ?? throw new InvalidDataException("工程资料库为空。");
                    ProjectDirectoryManager.ValidateLibrary(library);
                }
            }
            else
            {
                if (metadata.ContainsKey(key)) throw new InvalidDataException("工程存在重复字段。");
                metadata.Add(key, parser.Value());
            }
        } while (parser.Take(','));
        parser.Expect('}'); parser.End();
        if (library is null) throw new InvalidDataException("工程缺少资料库。");
        return new(metadata, library);
    }

    internal static string Compact(string text, SessionPayloadStore payloads, bool allowHostAssets)
    {
        using var reader = new StringReader(text);
        var parser = new Parser(reader, payloads, allowHostAssets);
        var value = parser.Value(); parser.End();
        return value?.ToJsonString() ?? throw new InvalidDataException("工程资料库为空。");
    }

    internal static void ValidateTokens(string text, SessionPayloadStore? payloads)
    {
        using var document = JsonDocument.Parse(text);
        void Visit(JsonElement node, bool sampleAudio = false)
        {
            if (node.ValueKind == JsonValueKind.Object)
            {
                bool sampled = node.TryGetProperty("model", out var model) && model.ValueKind == JsonValueKind.String && model.GetString() == "audio-sample";
                if (node.TryGetProperty("encoding", out var encoding) && encoding.ValueKind == JsonValueKind.String && encoding.GetString() == "host-asset")
                {
                    if (!sampleAudio || payloads is null) throw new IOException("这个缓存不属于当前工程采样。");
                    payloads.Validate(node.GetProperty("data").GetString()!, node.GetProperty("byteLength").GetInt32());
                }
                foreach (var property in node.EnumerateObject()) Visit(property.Value, sampled && property.Name == "audio");
            }
            else if (node.ValueKind == JsonValueKind.Array) foreach (var child in node.EnumerateArray()) Visit(child);
        }
        Visit(document.RootElement);
    }

    internal static void Write(Stream stream, JsonObject metadata, string library, SessionPayloadStore? payloads)
    {
        using var bounded = new LimitedStream(stream, AtomicTextStore.MaximumBytes);
        using var writer = new StreamWriter(bounded, Utf8, 16 * 1024, leaveOpen: true);
        string prefix = metadata.ToJsonString(); writer.Write(prefix.AsSpan(0, prefix.Length - 1));
        if (metadata.Count != 0) writer.Write(',');
        writer.Write("\"libraryText\":\"");
        using (var quoted = new JsonEscapingWriter(writer)) WriteLibrary(quoted, library, payloads);
        writer.Write("\"}"); writer.Flush();
    }

    internal static void WriteLibrary(TextWriter writer, string library, SessionPayloadStore? payloads)
    {
        var node = JsonNode.Parse(library) ?? throw new InvalidDataException("工程资料库为空。");
        WriteNode(writer, node, payloads);
    }

    internal static string Expand(string text, SessionPayloadStore? payloads, int maxBytes)
    {
        if (maxBytes < 1 || Utf8.GetByteCount(text) > maxBytes) throw new InvalidDataException("内容超过当前导出大小范围。");
        ValidateTokens(text, payloads);
        long minimumBytes = Utf8.GetByteCount(text);
        using (var document = JsonDocument.Parse(text))
        {
            void Estimate(JsonElement value)
            {
                if (value.ValueKind == JsonValueKind.Object)
                {
                    if (value.TryGetProperty("encoding", out var encoding) && encoding.ValueKind == JsonValueKind.String && encoding.GetString() == "host-asset")
                    {
                        long bytes = value.GetProperty("byteLength").GetInt32();
                        minimumBytes += ((bytes + 2) / 3) * 4 - value.GetProperty("data").GetString()!.Length - 4;
                    }
                    foreach (var property in value.EnumerateObject()) Estimate(property.Value);
                }
                else if (value.ValueKind == JsonValueKind.Array) foreach (var child in value.EnumerateArray()) Estimate(child);
            }
            Estimate(document.RootElement);
        }
        if (minimumBytes > maxBytes) throw new InvalidDataException("内容超过当前导出大小范围，尚未载入音频。");
        using var memory = new MemoryStream();
        using (var limit = new LimitedStream(memory, maxBytes))
        using (var writer = new StreamWriter(limit, Utf8, 4096, leaveOpen: true)) { WriteLibrary(writer, text, payloads); writer.Flush(); }
        return Utf8.GetString(memory.GetBuffer(), 0, checked((int)memory.Length));
    }

    private static void WriteNode(TextWriter writer, JsonNode? node, SessionPayloadStore? payloads)
    {
        if (node is JsonObject obj)
        {
            if (obj["encoding"]?.GetValueKind() == JsonValueKind.String && obj["encoding"]!.GetValue<string>() == "host-asset")
                throw new InvalidDataException("临时音频引用只能位于采样实体中，尚未写入文件。");
            bool sampled = obj["model"]?.GetValueKind() == JsonValueKind.String && obj["model"]!.GetValue<string>() == "audio-sample";
            writer.Write('{'); bool comma = false;
            foreach (var field in obj)
            {
                if (comma) writer.Write(','); comma = true; writer.Write(JsonSerializer.Serialize(field.Key)); writer.Write(':');
                if (sampled && field.Key == "audio" && field.Value is JsonObject audio && audio["encoding"]?.GetValue<string>() == "host-asset")
                {
                    if (payloads is null) throw new IOException("音频缓存不属于当前工程，尚未导出。");
                    string token = audio["data"]!.GetValue<string>();
                    using var input = payloads.Open(token);
                    if (input.Length != audio["byteLength"]!.GetValue<int>()) throw new IOException("音频缓存声明不一致。");
                    writer.Write('{'); bool audioComma = false;
                    foreach (var property in audio)
                    {
                        if (audioComma) writer.Write(','); audioComma = true; writer.Write(JsonSerializer.Serialize(property.Key)); writer.Write(':');
                        if (property.Key == "encoding") writer.Write("\"base64\"");
                        else if (property.Key == "data")
                        {
                            writer.Write('"'); byte[] bytes = new byte[12 * 1024]; int count;
                            while ((count = input.Read(bytes, 0, bytes.Length)) > 0)
                            {
                                // FileStream can return short reads; only the final group may have padding.
                                while (count < bytes.Length) { int more = input.Read(bytes, count, bytes.Length - count); if (more == 0) break; count += more; }
                                writer.Write(Convert.ToBase64String(bytes, 0, count));
                            }
                            writer.Write('"');
                        }
                        else WriteNode(writer, property.Value, payloads);
                    }
                    writer.Write('}');
                }
                else WriteNode(writer, field.Value, payloads);
            }
            writer.Write('}');
        }
        else if (node is JsonArray array)
        {
            writer.Write('['); for (int i = 0; i < array.Count; i++) { if (i > 0) writer.Write(','); WriteNode(writer, array[i], payloads); } writer.Write(']');
        }
        else writer.Write(node?.ToJsonString() ?? "null");
    }

    private sealed class Parser(TextReader reader, SessionPayloadStore? payloads, bool allowHostAssets, bool discardStrings = false)
    {
        private int depth;
        private void Space() { while (reader.Peek() is ' ' or '\t' or '\r' or '\n') reader.Read(); }
        internal void Expect(char value) { Space(); if (reader.Read() != value) throw new InvalidDataException("工程 JSON 不完整。"); }
        internal bool Take(char value) { Space(); if (reader.Peek() != value) return false; reader.Read(); return true; }
        internal void End() { Space(); if (reader.Read() != -1) throw new InvalidDataException("工程 JSON 有多余内容。"); }
        internal string String()
        {
            Expect('"'); using var text = new JsonStringReader(reader); var value = new StringBuilder(); char[] buffer = new char[4096]; int count;
            while ((count = text.Read(buffer, 0, buffer.Length)) > 0)
            {
                if (value.Length + count > 24 * 1024 * 1024) throw new InvalidDataException("工程单个字段超过可处理范围。");
                value.Append(buffer, 0, count);
            }
            string result = value.ToString();
            try { _ = Utf8.GetByteCount(result); }
            catch (EncoderFallbackException error) { throw new InvalidDataException("工程含有无效的 Unicode 字符。", error); }
            return result;
        }
        internal JsonNode? Value(string? field = null)
        {
            if (++depth > 256) throw new InvalidDataException("工程 JSON 嵌套过深。");
            try
            {
                Space(); int first = reader.Peek();
                if (first == '"')
                {
                    if (!discardStrings || field == "format") return JsonValue.Create(String());
                    Expect('"'); using var skipped = new JsonStringReader(reader); char[] buffer = new char[4096];
                    while (skipped.Read(buffer, 0, buffer.Length) > 0) { }
                    return JsonValue.Create("");
                }
                if (first == '{')
                {
                    Expect('{'); var result = new JsonObject();
                    if (!Take('}'))
                    {
                        do { string key = String(); Expect(':'); if (result.ContainsKey(key)) throw new InvalidDataException("工程 JSON 存在重复字段。"); result.Add(key, Value(key)); } while (Take(','));
                        Expect('}');
                    }
                    if (result["encoding"]?.GetValueKind() == JsonValueKind.String && result["encoding"]!.GetValue<string>() == "host-asset")
                    {
                        if (!allowHostAssets || payloads is null) throw new InvalidDataException("外部工程不能含有临时音频缓存引用。");
                        payloads.Validate(result["data"]!.GetValue<string>(), result["byteLength"]!.GetValue<int>());
                    }
                    if (result["model"]?.GetValueKind() == JsonValueKind.String && result["model"]!.GetValue<string>() == "audio-sample" && result["audio"] is JsonObject audio)
                    {
                        string encoding = audio["encoding"]?.GetValue<string>() ?? "";
                        if (encoding == "host-asset")
                        {
                            if (!allowHostAssets || payloads is null) throw new InvalidDataException("外部工程不能含有临时音频缓存引用。");
                            payloads.Validate(audio["data"]!.GetValue<string>(), audio["byteLength"]!.GetValue<int>());
                        }
                        else if (encoding == "base64" && payloads is not null && audio["data"]?.GetValueKind() == JsonValueKind.String)
                        {
                            string data = audio["data"]!.GetValue<string>();
                            if (data.Length >= payloads.Threshold)
                            {
                                string token = payloads.AddBase64(data, audio["byteLength"]!.GetValue<int>());
                                audio["encoding"] = "host-asset"; audio["data"] = token;
                            }
                        }
                    }
                    return result;
                }
                if (first == '[')
                {
                    Expect('['); var result = new JsonArray(); if (!Take(']')) { do { result.Add(Value()); } while (Take(',')); Expect(']'); } return result;
                }
                var primitive = new StringBuilder();
                while (reader.Peek() is int value && value != -1 && value is not ',' and not ']' and not '}' and not ' ' and not '\t' and not '\r' and not '\n')
                { if (primitive.Length > 128) throw new InvalidDataException("工程数值无效。"); primitive.Append((char)reader.Read()); }
                return JsonNode.Parse(primitive.ToString());
            }
            finally { depth--; }
        }
    }

    private sealed class JsonStringReader(TextReader input) : TextReader
    {
        private bool ended; private int peek = -2;
        private bool highSurrogate;
        public override int Peek() { if (peek == -2) peek = Next(); return peek; }
        public override int Read() { if (peek != -2) { int value = peek; peek = -2; return value; } return Next(); }
        private int Next()
        {
            if (ended) return -1;
            int value = input.Read();
            if (value == '"')
            {
                if (highSurrogate) throw new InvalidDataException("工程 Unicode 字符未成对。");
                ended = true; return -1;
            }
            if (value < 32) throw new InvalidDataException("工程 JSON 字符串不完整。");
            if (value == '\\')
            {
                value = input.Read();
                if (value == 'u')
                {
                    int code = 0; for (int i = 0; i < 4; i++) { int hex = input.Read(); int digit = hex is >= '0' and <= '9' ? hex - '0' : hex is >= 'a' and <= 'f' ? hex - 'a' + 10 : hex is >= 'A' and <= 'F' ? hex - 'A' + 10 : -1; if (digit < 0) throw new InvalidDataException("工程 Unicode 转义无效。"); code = code * 16 + digit; } value = code;
                }
                else value = value switch { '"' => '"', '\\' => '\\', '/' => '/', 'b' => '\b', 'f' => '\f', 'n' => '\n', 'r' => '\r', 't' => '\t', _ => throw new InvalidDataException("工程 JSON 转义无效。") };
            }
            bool low = char.IsLowSurrogate((char)value);
            if (highSurrogate != low) throw new InvalidDataException("工程 Unicode 字符未成对。");
            highSurrogate = char.IsHighSurrogate((char)value);
            return value;
        }
        public override int Read(char[] buffer, int index, int count) { int read = 0; while (read < count) { int value = Read(); if (value < 0) break; buffer[index + read++] = (char)value; } return read; }
    }

    private sealed class JsonEscapingWriter(TextWriter output) : TextWriter
    {
        private static readonly SearchValues<char> Escapes = SearchValues.Create("\"\\\u0000\u0001\u0002\u0003\u0004\u0005\u0006\u0007\u0008\u0009\u000a\u000b\u000c\u000d\u000e\u000f\u0010\u0011\u0012\u0013\u0014\u0015\u0016\u0017\u0018\u0019\u001a\u001b\u001c\u001d\u001e\u001f");
        public override Encoding Encoding => output.Encoding;
        public override void Write(char value)
        {
            if (value is '"' or '\\') { output.Write('\\'); output.Write(value); }
            else if (value < 32) output.Write("\\u" + ((int)value).ToString("x4", CultureInfo.InvariantCulture));
            else output.Write(value);
        }
        public override void Write(string? value) { if (value is not null) Write(value.AsSpan()); }
        public override void Write(ReadOnlySpan<char> value)
        {
            while (!value.IsEmpty)
            {
                int index = value.IndexOfAny(Escapes);
                if (index < 0) { output.Write(value); break; }
                output.Write(value[..index]); Write(value[index]); value = value[(index + 1)..];
            }
        }
    }

    private sealed class LimitedStream(Stream output, int maximum) : Stream
    {
        private long count;
        public override void Write(byte[] buffer, int offset, int length) { if (count + length > maximum) throw new InvalidDataException("内容超过当前导出大小范围，原文件已保留。"); output.Write(buffer, offset, length); count += length; }
        public override void Write(ReadOnlySpan<byte> buffer) { if (count + buffer.Length > maximum) throw new InvalidDataException("内容超过当前导出大小范围，原文件已保留。"); output.Write(buffer); count += buffer.Length; }
        public override bool CanRead => false; public override bool CanSeek => false; public override bool CanWrite => true; public override long Length => count; public override long Position { get => count; set => throw new NotSupportedException(); }
        public override void Flush() => output.Flush(); public override int Read(byte[] buffer, int offset, int count) => throw new NotSupportedException(); public override long Seek(long offset, SeekOrigin origin) => throw new NotSupportedException(); public override void SetLength(long value) => throw new NotSupportedException();
    }
}
