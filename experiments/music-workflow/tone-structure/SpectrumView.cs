using System.Drawing.Drawing2D;
using RootSound.ToneProcessor;

namespace RootSound.ToneStructure;

internal sealed class SpectrumView : Control
{
    private FrequencyPoint[] points=[];
    internal string Caption="";
    internal Color TraceColor=Color.FromArgb(47,174,214);
    internal int SampleRate=48000;
    internal SpectrumView(){DoubleBuffered=true;ResizeRedraw=true;BackColor=Color.FromArgb(15,23,34);ForeColor=Color.FromArgb(148,166,184);}
    internal void SetPoints(FrequencyPoint[] value){points=value;Invalidate();}
    protected override void OnPaint(PaintEventArgs e)
    {
        base.OnPaint(e);var g=e.Graphics;var area=new Rectangle(52,22,Math.Max(1,Width-69),Math.Max(1,Height-46));
        using var grid=new Pen(Color.FromArgb(38,150,170,190));using var trace=new Pen(TraceColor,1.6f);
        double maximum=Math.Min(20000,SampleRate/2d);
        float X(double hz)=>area.Left+(float)(Math.Log(Math.Clamp(hz,20,maximum)/20)/Math.Log(maximum/20)*area.Width);
        float Y(double db)=>area.Bottom-(float)((Math.Clamp(db,-100,6)+100)/106*area.Height);
        foreach(int db in new[]{0,-20,-40,-60,-80,-100})
        {float y=Y(db);g.DrawLine(grid,area.Left,y,area.Right,y);TextRenderer.DrawText(g,db.ToString(),Font,new Rectangle(1,(int)y-9,44,18),ForeColor,TextFormatFlags.Right);}
        foreach(int hz in new[]{20,50,100,200,500,1000,2000,5000,10000,20000})if(hz<=maximum)
        {
            float x=X(hz);g.DrawLine(grid,x,area.Top,x,area.Bottom);
            TextRenderer.DrawText(g,hz>=1000?$"{hz/1000}k":hz.ToString(),Font,new Rectangle((int)x-22,area.Bottom+4,44,18),ForeColor,TextFormatFlags.HorizontalCenter);
        }
        TextRenderer.DrawText(g,Caption,Font,new Point(area.Left,2),ForeColor);
        g.SmoothingMode=SmoothingMode.AntiAlias;
        var line=points.Where(p=>p.x>=20 && p.x<=maximum).Select(p=>new PointF(X(p.x),Y(p.y))).ToArray();
        if(line.Length>1)g.DrawLines(trace,line);
    }
}

internal sealed class TimeRuler : Control
{
    internal long Frames;
    internal int SampleRate=48000;
    internal double Position;
    private bool dragging;
    internal event Action? SeekStarted,SeekEnded;
    internal event Action<double>? SeekRequested;
    internal TimeRuler(){DoubleBuffered=true;ResizeRedraw=true;Height=48;BackColor=Color.FromArgb(228,235,241);TabStop=true;Cursor=Cursors.Hand;}
    internal void MoveTo(double position){Position=Math.Clamp(position,0,Frames);Invalidate();}
    private void SeekAt(int x)
    {if(Frames<1)return;MoveTo((x-52)/(double)Math.Max(1,Width-69)*Frames);SeekRequested?.Invoke(Position);}
    protected override void OnMouseDown(MouseEventArgs e)
    {base.OnMouseDown(e);if(e.Button!=MouseButtons.Left || Frames<1)return;dragging=true;SeekStarted?.Invoke();SeekAt(e.X);Capture=true;}
    protected override void OnMouseMove(MouseEventArgs e){base.OnMouseMove(e);if(dragging)SeekAt(e.X);}
    protected override void OnMouseUp(MouseEventArgs e){base.OnMouseUp(e);if(e.Button==MouseButtons.Left)EndGesture();}
    protected override void OnMouseCaptureChanged(EventArgs e){base.OnMouseCaptureChanged(e);if(!Capture)EndGesture();}
    private void EndGesture(){if(!dragging)return;dragging=false;Capture=false;SeekEnded?.Invoke();}
    protected override void OnPaint(PaintEventArgs e)
    {
        base.OnPaint(e);if(Frames<1)return;int left=52,right=Math.Max(left+1,Width-17);var g=e.Graphics;
        using var line=new Pen(Color.FromArgb(142,160,176));using var red=new Pen(Color.FromArgb(237,76,84),2);
        g.DrawLine(line,left,18,right,18);
        for(int i=0;i<=8;i++)
        {int x=left+(right-left)*i/8;g.DrawLine(line,x,14,x,22);double seconds=Frames/(double)SampleRate*i/8;TextRenderer.DrawText(g,Format(seconds),Font,new Rectangle(Math.Clamp(x-32,0,Math.Max(0,Width-64)),25,64,18),Color.FromArgb(68,86,103),TextFormatFlags.HorizontalCenter);}
        int at=left+(int)((right-left)*Position/Frames);g.DrawLine(red,at,1,at,24);
    }
    internal static string Format(double seconds)=>$"{(int)(seconds/60):00}:{seconds%60:00.00}";
}
