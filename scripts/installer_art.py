import math
import pathlib
import struct
import zlib


def create_art(directory):
    directory = pathlib.Path(directory)
    directory.mkdir(parents=True, exist_ok=True)
    width, height = 720, 420
    rows = []
    for y in range(height):
        row = bytearray()
        for x in range(width):
            warm = math.exp(-(((x / width - .18) / .7) ** 2 + ((y / height - .15) / .8) ** 2) * 2)
            cool = math.exp(-(((x / width - .95) / .65) ** 2 + ((y / height - .85) / .7) ** 2) * 2)
            color = [base - a * warm - b * cool for base, a, b in [(252, 0, 11), (251, 10, 8), (253, 7, 0)]]
            for left, top, length, rgb in [(0.76, 0.14, 0.26, (117, 185, 220)), (0.84, 0.21, 0.19, (147, 165, 207)), (0.92, 0.11, 0.16, (151, 185, 174))]:
                if left <= x / width <= left + 0.018 and top <= y / height <= top + length:
                    alpha = 0.68 * (1 - (y / height - top) / length) ** 2
                    color = [value * (1 - alpha) + target * alpha for value, target in zip(color, rgb)]
            row.extend(round(value) for value in color)
        rows.append(bytes(row))
    def chunk(kind, value):
        return struct.pack('>I', len(value)) + kind + value + struct.pack('>I', zlib.crc32(kind + value))
    png = b'\x89PNG\r\n\x1a\n' + chunk(b'IHDR', struct.pack('>2I5B', width, height, 8, 2, 0, 0, 0))
    png += chunk(b'IDAT', zlib.compress(b''.join(b'\0' + row for row in rows), 9)) + chunk(b'IEND', b'')
    (directory / 'background.png').write_bytes(png)
    padding = b'\0' * ((-width * 3) % 4)
    pixels = b''.join(b''.join(row[i:i+3][::-1] for i in range(0, len(row), 3)) + padding for row in reversed(rows))
    bmp = b'BM' + struct.pack('<IHHI', 54 + len(pixels), 0, 0, 54)
    bmp += struct.pack('<IiiHHIIiiII', 40, width, height, 1, 24, 0, len(pixels), 2835, 2835, 0, 0) + pixels
    (directory / 'background.bmp').write_bytes(bmp)


if __name__ == '__main__':
    import sys
    create_art(sys.argv[1])
