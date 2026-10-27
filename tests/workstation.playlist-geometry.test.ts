import assert from 'node:assert/strict';
import { test } from 'node:test';
import { playlistBeats, playlistClipRect, playlistGridLines, playlistSeconds, playlistSegmentIntersectsRect, playlistTrackAt, zoomPlaylist } from '../src/workstation/modules/ui-rendering/playlist-geometry.ts';

test('grid tempo changes visible beat/bar positions while clips retain their stored seconds and width', () => {
  const view = { leftSeconds: 1.25, top: 30, pixelsPerSecond: 88, rowHeight: 48 };
  const rect = playlistClipRect(playlistSeconds(8, 120), playlistSeconds(16, 120), 2, view);
  assert.deepEqual(rect, { x: 242, y: 70, width: 704, height: 40 });
  assert.equal(playlistBeats(3.127, 120), 6.254);
  const before = playlistGridLines(view.leftSeconds, 1000, 88, 120);
  const after = playlistGridLines(view.leftSeconds, 1000, 88, 75);
  assert.notDeepEqual(before.map(line => line.x), after.map(line => line.x));
  assert.deepEqual(playlistClipRect(4, 8, 2, view), rect);
  assert(before.some(line => line.strong)); assert(before.some(line => !line.strong));
});

test('far-away views remain bounded and negative requests are clamped to the left edge', () => {
  for (const left of [-1e8, -3.1, 0, 1e8]) for (const scale of [12, 88, 640]) {
    const lines = playlistGridLines(left, 1000, scale, 240);
    assert(lines.length <= 128);
    assert(lines.every(line => line.x >= -170 && line.x <= 1170));
    assert(lines.some(line => line.x >= 0 && line.x <= 1000));
  }
});

test('horizontal and vertical zoom keep the pointed time or row fixed', () => {
  const view = { leftSeconds: 17.5, top: 340, pixelsPerSecond: 88, rowHeight: 48 };
  const horizontal = zoomPlaylist(view, 327, 123, 1.8, false);
  assert(Math.abs((horizontal.leftSeconds + 327 / horizontal.pixelsPerSecond) - (view.leftSeconds + 327 / view.pixelsPerSecond)) < 1e-12);
  const vertical = zoomPlaylist(view, 327, 123, 1.8, true);
  assert(Math.abs((vertical.top + 123) / vertical.rowHeight - (view.top + 123) / view.rowHeight) < 1e-12);
  assert.equal(zoomPlaylist(view, 0, 0, 1000, false).pixelsPerSecond, 2560);
  assert.equal(zoomPlaylist(view, 0, 0, .001, true).rowHeight, 28);
});

test('the outline add row and the area after it never resolve to a drop track', () => {
  assert.equal(playlistTrackAt(0, 0, 48, 7), 0);
  assert.equal(playlistTrackAt(335.99, 0, 48, 7), 6);
  assert.equal(playlistTrackAt(336, 0, 48, 7), undefined);
  assert.equal(playlistTrackAt(500, 0, 48, 7), undefined);
  assert.equal(playlistTrackAt(-1, 20, 48, 7), undefined);
  assert.equal(playlistTrackAt(30, 70, 48, 7), 2);
});

test('the eraser intersects every crossed clip even between distant pointer samples', () => {
  const row = [50, 200, 400].map(x => ({ x, y: 4, width: 40, height: 40 }));
  assert(row.every(rect => playlistSegmentIntersectsRect({ x: 0, y: 25 }, { x: 600, y: 25 }, rect)));
  assert(row.every(rect => !playlistSegmentIntersectsRect({ x: 0, y: 50 }, { x: 600, y: 50 }, rect)));
  assert(playlistSegmentIntersectsRect({ x: 0, y: 0 }, { x: 600, y: 100 }, row[1]!));
  assert(playlistSegmentIntersectsRect({ x: 205, y: 10 }, { x: 205, y: 10 }, row[1]!));
  assert(!playlistSegmentIntersectsRect({ x: 205, y: 60 }, { x: 205, y: 60 }, row[1]!));
});

test('grid phase translates the virtual lattice without changing the viewport or clip coordinates', () => {
  const baseline = playlistGridLines(0, 1000, 88, 120, 0);
  const moved = playlistGridLines(0, 1000, 88, 120, .2);
  const originalBar = baseline.find(line => line.strong && line.seconds === 2)!;
  const shiftedBar = moved.find(line => line.strong && Math.abs(line.seconds - 2.2) < 1e-9)!;
  assert(Math.abs(shiftedBar.x - originalBar.x - 17.6) < 1e-9);
  assert(moved.every(line => line.seconds >= 0));
  assert(playlistGridLines(1e8, 1000, 12, 240, -1e6).length <= 128);
});
