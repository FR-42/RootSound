const strokes: Record<string, string[]> = {
 '你': [
  'M27 14 Q24 31 9 48','M21 37 Q21 59 17 84',
  'M52 13 Q48 29 36 41','M48 28 Q67 25 89 24 Q94 24 85 37',
  'M65 36 Q68 57 64 79 Q63 87 51 81','M48 53 Q42 65 33 72','M78 54 Q88 62 92 71'],
 '好': [
  'M30 15 Q27 37 19 57 Q34 64 44 70','M9 40 Q25 34 43 34 Q48 34 44 46 Q37 69 16 82',
  'M54 19 Q69 16 87 15 Q91 15 87 21 Q80 30 72 35',
  'M71 36 Q79 53 75 77 Q73 86 62 78','M50 51 Q69 47 95 47'],
 '，':['M38 67 Q46 63 45 71 Q44 79 36 86'],
 '想':[
  'M9 30 Q24 27 43 27','M28 13 Q29 35 24 63','M26 31 Q20 46 8 53','M31 36 Q40 41 44 48',
  'M55 20 Q56 37 54 58','M56 21 Q72 18 85 18 Q89 18 89 22 L85 57','M58 33 Q70 31 84 31','M57 44 Q70 42 84 42','M55 56 Q72 54 84 54',
  'M23 68 Q21 78 14 83','M37 67 Q40 82 54 86 Q72 92 81 81','M55 66 Q61 70 64 74','M79 65 Q91 71 94 77'],
 '创':[
  'M34 14 Q25 32 8 42','M36 16 Q47 27 56 34','M22 43 Q35 40 49 40 Q53 41 51 48 Q48 58 43 59',
  'M23 44 Q22 60 23 73 Q24 84 39 83 Q50 83 56 74','M67 30 Q67 46 65 63','M86 16 Q88 47 86 75 Q85 88 73 81'],
 '作':[
  'M26 15 Q24 31 9 48','M21 37 Q20 62 17 82','M52 14 Q50 31 35 42',
  'M47 31 Q63 28 91 27','M60 32 Q60 56 57 84','M60 47 Q72 45 85 45','M60 64 Q73 61 89 61'],
 '什':['M27 14 Q24 33 9 49','M20 38 Q20 61 16 83','M34 45 Q57 40 92 40','M64 14 Q64 42 60 86'],
 '么':['M62 16 Q47 35 24 48','M63 34 Q49 57 23 72 Q48 74 80 69','M72 55 Q85 64 91 77'],
 '？':['M29 29 C31 12 65 12 69 29 C74 46 50 43 48 62','M47 78 l-.3 1.2']
};

export function paintWelcomeLettering(canvas: HTMLCanvasElement): boolean {
  const context = canvas.getContext?.('2d');
  if (!context) return false;
  canvas.width = 960; canvas.height = 444;
  context.scale(2, 2);
  context.lineCap = 'round';
  context.lineJoin = 'round';
  context.strokeStyle = '#fff';
  context.shadowColor = 'rgba(86,60,99,.63)';
  context.shadowBlur = 14;
  context.shadowOffsetY = 3;

  function paintLine(text: string, x: number, y: number, size: number) {
    context!.save();
    context!.translate(x, y);
    context!.scale(size / 100, size / 100);
    for (const character of text) {
      for (const [index, stroke] of strokes[character]!.entries()) {
        context!.lineWidth = [6.8, 5.8, 5.15][index % 3]!;
        context!.stroke(new Path2D(stroke));
      }
      context!.translate(92, 0);
    }
    context!.restore();
  }

  paintLine('你好，', 0, 0, 123);
  paintLine('你想创作什么？', 48, 125, 67);
  return true;
}
