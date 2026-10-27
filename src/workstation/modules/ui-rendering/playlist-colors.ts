/** Vivid musical labels; the workspace itself stays quiet and neutral. */
export const PLAYLIST_COLORS = [
  '#ff5252', '#fb7185', '#f43f8d', '#f472d0', '#d946ef', '#a855f7',
  '#8b5cf6', '#6366f1', '#4f8cff', '#38bdf8', '#06b6d4', '#22d3c5',
  '#14b88a', '#22c55e', '#84cc16', '#c5df27', '#fde047', '#fbbf24',
  '#fb923c', '#f97316', '#ef6650', '#e5a6ff', '#83d9ff', '#91f2b3',
] as const;

export function playlistPhraseColor(_id: string): string {
  return '#dce3e9';
}

/** Choose ink by actual luminance, including arbitrary user-selected colors. */
export function playlistColorInk(color: string): string {
  const luminance = (hex: string): number => {
    const channels = [1, 3, 5].map(offset => {
      const value = Number.parseInt(hex.slice(offset, offset + 2), 16) / 255;
      return value <= .04045 ? value / 12.92 : ((value + .055) / 1.055) ** 2.4;
    });
    return channels[0]! * .2126 + channels[1]! * .7152 + channels[2]! * .0722;
  };
  const background = luminance(color); const dark = '#050505'; const darkLuminance = luminance(dark);
  return (background + .05) / (darkLuminance + .05) >= 1.05 / (background + .05) ? dark : '#ffffff';
}
