using System.Text.Json;
namespace RootSound.ToneProcessor;
internal sealed class Preferences
{
    private readonly string path;
    internal string ImportDirectory { get; private set; }="";
    internal string ExportDirectory { get; private set; }="";
    internal Preferences(string root)
    {
        path=Path.Combine(root,"output","directories.json");
        try
        {
            if(!File.Exists(path) || new FileInfo(path).Length>32768)return;
            var value=JsonSerializer.Deserialize<Dictionary<string,string>>(File.ReadAllText(path));
            if(value is null)return;
            if(value.TryGetValue("import",out var input) && Directory.Exists(input))ImportDirectory=input;
            if(value.TryGetValue("export",out var output) && Directory.Exists(output))ExportDirectory=output;
        }
        catch(IOException){}catch(UnauthorizedAccessException){}catch(JsonException){}
    }
    internal void RememberImport(string file){ImportDirectory=Path.GetDirectoryName(Path.GetFullPath(file))!;Save();}
    internal void RememberExport(string file){ExportDirectory=Path.GetDirectoryName(Path.GetFullPath(file))!;Save();}
    private void Save()
    {
        string staging=path+"."+Guid.NewGuid().ToString("N")+".tmp";
        try
        {
            Directory.CreateDirectory(Path.GetDirectoryName(path)!);
            File.WriteAllText(staging,JsonSerializer.Serialize(new Dictionary<string,string>{{"import",ImportDirectory},{"export",ExportDirectory}}));
            File.Move(staging,path,true);
        }
        catch(IOException){}catch(UnauthorizedAccessException){}
        finally{try{File.Delete(staging);}catch(IOException){}catch(UnauthorizedAccessException){}}
    }
}
