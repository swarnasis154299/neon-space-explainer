import sys, glob, os
from PIL import Image, ImageDraw
d, out = sys.argv[1], sys.argv[2]
fs = sorted(glob.glob(os.path.join(d, 'f*.jpg')))
ims = [Image.open(f) for f in fs]
w, h = ims[0].size
cols = min(len(ims), 4 if w > 400 else 6)
rows = (len(ims) + cols - 1) // cols
s = Image.new('RGB', (cols * w, rows * h), (20, 20, 20))
dr = ImageDraw.Draw(s)
for i, (f, im) in enumerate(zip(fs, ims)):
    x, y = (i % cols) * w, (i // cols) * h
    s.paste(im, (x, y))
    dr.rectangle([x, y, x + 46, y + 16], fill=(0, 0, 0))
    dr.text((x + 3, y + 2), os.path.basename(f)[1:5], fill=(255, 220, 0))
s.save(out, quality=88)
print(out, s.size)
