from collections import deque
from PIL import Image, ImageFilter
import os

SRC = r"C:\Users\chris\Downloads\visions_logo.png"
OUT_DIR = r"C:\AIDA\89vibes\vision\assets\images\brand"
os.makedirs(OUT_DIR, exist_ok=True)

im = Image.open(SRC).convert("RGBA")
w, h = im.size
px = im.load()

# --- 1. flood fill the near-white studio background from the borders -------
def is_bg(c):
    r, g, b = c[0], c[1], c[2]
    return min(r, g, b) >= 224 and (max(r, g, b) - min(r, g, b)) <= 16

mask = bytearray(w * h)          # 1 = background
queue = deque()
for x in range(w):
    for y in (0, h - 1):
        if not mask[y * w + x] and is_bg(px[x, y]):
            mask[y * w + x] = 1
            queue.append((x, y))
for y in range(h):
    for x in (0, w - 1):
        if not mask[y * w + x] and is_bg(px[x, y]):
            mask[y * w + x] = 1
            queue.append((x, y))

while queue:
    x, y = queue.popleft()
    for nx, ny in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
        if 0 <= nx < w and 0 <= ny < h and not mask[ny * w + nx] and is_bg(px[nx, ny]):
            mask[ny * w + nx] = 1
            queue.append((nx, ny))

# --- 2. alpha matte -------------------------------------------------------
alpha = Image.new("L", (w, h), 255)
apx = alpha.load()
for y in range(h):
    for x in range(w):
        if mask[y * w + x]:
            apx[x, y] = 0

# shrink the shape by one pixel so no light halo survives, then feather
alpha = alpha.filter(ImageFilter.MinFilter(3))
alpha = alpha.filter(ImageFilter.GaussianBlur(0.7))

out = im.copy()
out.putalpha(alpha)

bbox = out.getbbox()
out = out.crop(bbox)
ow, oh = out.size

# --- 3. split mark (icon) and wordmark by scanning for empty rows ---------
a = out.getchannel("A")
rows = [max(a.crop((0, y, ow, y + 1)).getdata()) for y in range(oh)]
gaps = [y for y in range(oh) if rows[y] < 12]
# widest empty band separates icon from the text block
best_start = best_len = cur_start = cur_len = 0
for y in range(oh):
    if rows[y] < 12:
        if cur_len == 0:
            cur_start = y
        cur_len += 1
        if cur_len > best_len:
            best_len, best_start = cur_len, cur_start
    else:
        cur_len = 0
split = best_start + best_len // 2

mark = out.crop((0, 0, ow, split))
mark = mark.crop(mark.getbbox())

wordmark = out.crop((0, split, ow, oh))
wordmark = wordmark.crop(wordmark.getbbox())

# cut the (tiny, illegible) tagline line off below the wordmark
wa = wordmark.getchannel("A")
ww, wmh = wordmark.size
seen_ink = False
cut_row = wmh
for y in range(wmh):
    row_ink = max(wa.crop((0, y, ww, y + 1)).getdata())
    if row_ink > 12:
        seen_ink = True
    elif seen_ink:
        cut_row = y
        break
wordmark = wordmark.crop((0, 0, ww, cut_row))
wordmark = wordmark.crop(wordmark.getbbox())

# The tagline is only ~10 px tall in the source and does not survive scaling,
# so the logo asset is mark + wordmark only; the claim is rendered as real text.
logo = out.crop((0, 0, ow, split))
logo = logo.crop(logo.getbbox())

logo.save(os.path.join(OUT_DIR, "visions-logo.png"))
mark.save(os.path.join(OUT_DIR, "visions-mark.png"))
wordmark.save(os.path.join(OUT_DIR, "visions-wordmark.png"))

# --- 4. previews on a dark and on the app background ----------------------
def preview(path, bg):
    canvas = Image.new("RGBA", (ow + 60, oh + 60), bg)
    canvas.alpha_composite(out, (30, 30))
    canvas.convert("RGB").save(path)

preview(os.path.join(OUT_DIR, "_preview-dark.png"), (13, 10, 16, 255))
preview(os.path.join(OUT_DIR, "_preview-light.png"), (255, 251, 246, 255))

print("logo", logo.size, "mark", mark.size, "wordmark", wordmark.size, "split", split)
