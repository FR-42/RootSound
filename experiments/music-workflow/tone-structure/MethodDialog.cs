namespace RootSound.ToneStructure;

internal sealed class MethodDialog:Form
{
    private readonly Dictionary<SeparationMethod,RadioButton> choices=[];
    private readonly NumericUpDown count=new(){Minimum=2,Maximum=8,Value=4,Width=55};
    private readonly Button accept=new(){Text="使用此方法分解",AutoSize=true,DialogResult=DialogResult.OK};
    private readonly FlowLayoutPanel device=new(){AutoSize=true,WrapContents=false,Margin=Padding.Empty};
    private readonly RadioButton automatic=new(){Text="自动（GPU 优先）",AutoSize=true},gpu=new(){Text="GPU（失败就停止）",AutoSize=true},cpu=new(){Text="CPU",AutoSize=true};
    private readonly Label deviceInfo=new(){Dock=DockStyle.Fill,AutoEllipsis=true,Text="默认使用 CPU。选择 GPU 或自动后会检测显卡。"};
    private readonly CancellationTokenSource detection=new();
    private bool detectionDisposed;
    private bool shown,detectionStarted;
    internal SeparationMethod Selected=>choices.First(x=>x.Value.Checked).Key;
    internal int LayerCount=>(int)count.Value;
    internal ModelDevice SelectedDevice=>gpu.Checked?ModelDevice.Gpu:cpu.Checked?ModelDevice.Cpu:ModelDevice.Auto;
    internal MethodDialog(string root,int channels,SeparationMethod current,bool refine,int remaining,ModelDevice selectedDevice=ModelDevice.Cpu)
    {
        Text="选择分解方法";Font=new Font("Microsoft YaHei UI",9.5f);ClientSize=new Size(710,660);FormBorderStyle=FormBorderStyle.FixedDialog;
        MaximizeBox=MinimizeBox=false;StartPosition=FormStartPosition.CenterParent;ShowInTaskbar=false;BackColor=Color.FromArgb(245,248,251);
        var layout=new TableLayoutPanel{Dock=DockStyle.Fill,Padding=new Padding(16),ColumnCount=1,RowCount=10};
        layout.RowStyles.Add(new(SizeType.Absolute,48));
        layout.Controls.Add(new Label{Text=refine?"只处理选中的声音层；新子层替换它，其他层不变。":"每次从原片段开始分解；上一次结果可通过“撤销分解”恢复。",Dock=DockStyle.Fill},0,0);
        int row=1;
        foreach(var method in SeparationMethods.All)
        {
            string? unavailable=SeparationMethods.Unavailable(method.Id,channels,root);
            int required=method.Id==SeparationMethod.Demucs?4:2;
            if(required>remaining)unavailable="剩余层数不足；最多同时保留 16 层。";
            var radio=new RadioButton{Text=method.Title,AutoSize=true,Enabled=unavailable is null,Margin=new Padding(0,0,0,3)};
            var item=new FlowLayoutPanel{Dock=DockStyle.Fill,FlowDirection=FlowDirection.TopDown,WrapContents=false,Margin=Padding.Empty};
            item.Controls.Add(radio);
            item.Controls.Add(new Label{Text=unavailable??method.Detail,AutoSize=false,Width=664,Height=22,ForeColor=unavailable is null?Color.FromArgb(39,57,73):Color.FromArgb(154,72,56)});
            item.Controls.Add(new Label{Text=method.Limitation,AutoSize=false,Width=664,Height=22,ForeColor=Color.FromArgb(93,105,116)});
            layout.RowStyles.Add(new(SizeType.Absolute,82));layout.Controls.Add(item,0,row++);choices.Add(method.Id,radio);
            radio.CheckedChanged+=(_,_)=>{if(radio.Checked){foreach(var other in choices.Values)if(other!=radio)other.Checked=false;count.Enabled=method.Id==SeparationMethod.Templates;device.Enabled=method.Id==SeparationMethod.Demucs;accept.Enabled=true;}};
            // Radios live in separate panels, so exclusivity is managed above.
        }
        var options=new FlowLayoutPanel{Dock=DockStyle.Fill};options.Controls.Add(new Label{Text="频谱模板层数：",AutoSize=true,Margin=new Padding(0,5,0,0)});options.Controls.Add(count);
        options.Controls.Add(new Label{Text="其他方法的层数由原理决定。",AutoSize=true,Margin=new Padding(12,5,0,0)});
        count.Maximum=Math.Min(8,Math.Max(2,remaining));count.Value=Math.Min(refine?2:4,count.Maximum);
        layout.RowStyles.Add(new(SizeType.Absolute,38));layout.Controls.Add(options,0,row++);
        var devices=new FlowLayoutPanel{Dock=DockStyle.Fill};devices.Controls.Add(new Label{Text="乐器模型设备：",AutoSize=true,Margin=new Padding(0,5,0,0)});
        device.Controls.AddRange([automatic,gpu,cpu]);devices.Controls.Add(device);
        (selectedDevice==ModelDevice.Gpu?gpu:selectedDevice==ModelDevice.Cpu?cpu:automatic).Checked=true;
        layout.RowStyles.Add(new(SizeType.Absolute,37));layout.Controls.Add(devices,0,row++);
        layout.RowStyles.Add(new(SizeType.Absolute,33));layout.Controls.Add(deviceInfo,0,row++);
        var buttons=new FlowLayoutPanel{Dock=DockStyle.Fill,FlowDirection=FlowDirection.RightToLeft};var cancel=new Button{Text="取消",AutoSize=true,DialogResult=DialogResult.Cancel};buttons.Controls.Add(cancel);buttons.Controls.Add(accept);
        layout.RowStyles.Add(new(SizeType.Percent,100));layout.Controls.Add(buttons,0,row);Controls.Add(layout);AcceptButton=accept;CancelButton=cancel;
        accept.Enabled=false;var initial=choices[current].Enabled?choices[current]:choices.Values.FirstOrDefault(x=>x.Enabled);if(initial is not null)initial.Checked=true;
        Shown+=async(_,_)=>{shown=true;if(SelectedDevice!=ModelDevice.Cpu)await DetectGpuAsync(root);};
        gpu.CheckedChanged+=async(_,_)=>{if(shown && gpu.Checked)await DetectGpuAsync(root);};
        automatic.CheckedChanged+=async(_,_)=>{if(shown && automatic.Checked)await DetectGpuAsync(root);};
    }
    internal async Task DetectGpuAsync(string root)
    {
        if(detectionStarted)return;detectionStarted=true;
        deviceInfo.Text="正在检测显卡计算支持…";
        try
        {
            var result=await DemucsRunner.ProbeAsync(root,detection.Token);if(IsDisposed || detection.IsCancellationRequested)return;
            deviceInfo.Text=result.Available?$"可用 GPU：{result.Name}。此选项用于乐器模型，其他四种方法使用 CPU。":"GPU 不可用："+result.Reason+"；自动模式使用 CPU。";
        }
        catch(OperationCanceledException){}
    }
    protected override void Dispose(bool disposing){if(disposing && !detectionDisposed){detectionDisposed=true;detection.Cancel();detection.Dispose();}base.Dispose(disposing);}
}
