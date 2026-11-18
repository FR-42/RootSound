namespace RootSound.Desktop;

internal sealed class WindowCaptionVisibility
{
    internal bool Visible { get; private set; }
    private Point? previous;
    private Rectangle previousClient;

    internal bool Update(Point pointer, Rectangle client, int captionHeight, int revealHeight, int frameBorder)
    {
        bool atTop = pointer.X >= client.Left && pointer.X < client.Right
            && pointer.Y >= client.Top - frameBorder && pointer.Y < client.Top + revealHeight;
        bool crossedTop = false;
        if (previous is { } last && previousClient == client && client.Contains(last) && pointer.Y < client.Top)
        {
            double fraction = (client.Top - last.Y) / (double)(pointer.Y - last.Y);
            double crossingX = last.X + (pointer.X - last.X) * fraction;
            crossedTop = crossingX >= client.Left && crossingX < client.Right;
        }
        if (atTop || crossedTop) Visible = true;
        else if (client.Contains(pointer) && pointer.Y >= client.Top + captionHeight) Visible = false;
        previous = pointer;
        previousClient = client;
        return Visible;
    }

    internal void Reset()
    {
        Visible = false;
        previous = null;
    }
}
