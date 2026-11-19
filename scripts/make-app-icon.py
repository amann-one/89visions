"""Builds the opaque app icon / favicon from the transparent brand mark.

The source mark is small (114 px), so the canvas corners are filled with a
bilinear gradient sampled from the mark's own corners. That way the rounded
edge of the mark disappears into the background instead of showing white.
"""
import os
from PIL import Image, ImageFilter

BRAND = r"C:\AIDA\89vibes\vision\assets\images\brand"
IMAGES = r"C:\AIDA\89vibes\vision\assets\images"

mark = Image.open(os.path.join(BRAND, "visions-mark.png")).convert("RGBA")
mw, mh = mark.size

# sample the four corner colours slightly inside the mark
inset = int(min(mw, mh) * 0.10)
corners = [
    mark.getpixel((inset, inset)),
    mark.getpixel((mw - 1 - inset, inset)),
    mark.getpixel((inset, mh - 1 - inset)),
    mark.getpixel((mw - 1 - inset, mh - 1 - inset)),
]


def build(size: int) -> Image.Image:
    canvas = Image.new("RGBA", (size, size))
    px = canvas.load()
    for y in range(size):
        fy = y / (size - 1)
        for x in range(size):
            fx = x / (size - 1)
            c = [0, 0, 0]
            for i in range(3):
                top = corners[0][i] * (1 - fx) + corners[1][i] * fx
                bottom = corners[2][i] * (1 - fx) + corners[3][i] * fx
                c[i] = int(round(top * (1 - fy) + bottom * fy))
            px[x, y] = (c[0], c[1], c[2], 255)

    scaled = mark.resize((size, size), Image.LANCZOS)
    # soften the seam between mark and generated gradient
    canvas.alpha_composite(scaled)
    return canvas.convert("RGB")


icon = build(1024)
icon.save(os.path.join(IMAGES, "icon.png"))

favicon = build(96).resize((48, 48), Image.LANCZOS)
favicon.save(os.path.join(IMAGES, "favicon.png"))

# Expo's splash icon: mark on its own, transparent
mark.resize((256, 256), Image.LANCZOS).save(os.path.join(IMAGES, "splash-icon.png"))

# Android adaptive icon: foreground must keep the mark inside the safe zone
fg = Image.new("RGBA", (1024, 1024), (0, 0, 0, 0))
scaled_mark = mark.resize((640, 640), Image.LANCZOS)
fg.alpha_composite(scaled_mark, ((1024 - 640) // 2, (1024 - 640) // 2))
fg.save(os.path.join(IMAGES, "android-icon-foreground.png"))

print("corners", corners)
