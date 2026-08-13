#!/usr/bin/env python3
"""Generate solid-color rounded icon PNGs for PWA without PIL."""
import os
import struct
import zlib

OUT = os.path.join(os.path.dirname(__file__), 'public', 'icons')
os.makedirs(OUT, exist_ok=True)

TOP = (0x40, 0x9E, 0xFF)
BOTTOM = (0x7C, 0x3A, 0xED)


def lerp(a, b, t):
    return tuple(int(a[i] + (b[i] - a[i]) * t) for i in range(3))


def chunk(tag, data):
    c = struct.pack('>I', len(data)) + tag + data
    crc = zlib.crc32(tag + data) & 0xFFFFFFFF
    return c + struct.pack('>I', crc)


def make_png(size):
    radius = int(size * 0.22)
    rows = []
    for y in range(size):
        row = bytearray([0])
        t = y / max(1, size - 1)
        r, g, b = lerp(TOP, BOTTOM, t)
        for x in range(size):
            # rounded-rect corner test
            dx = max(radius - x, 0, x - (size - radius))
            dy = max(radius - y, 0, y - (size - radius))
            if dx and dy and (dx * dx + dy * dy) > radius * radius:
                row += bytes((0, 0, 0, 0))
            else:
                row += bytes((r, g, b, 255))
        rows.append(bytes(row))
    raw = b''.join(rows)
    ihdr = struct.pack('>IIBBBBB', size, size, 8, 6, 0, 0, 0)
    png = b'\x89PNG\r\n\x1a\n'
    png += chunk(b'IHDR', ihdr)
    png += chunk(b'IDAT', zlib.compress(raw, 9))
    png += chunk(b'IEND', b'')
    return png


for size in (192, 512):
    path = os.path.join(OUT, f'pwa-{size}x{size}.png')
    with open(path, 'wb') as f:
        f.write(make_png(size))
    print('generated', path)
