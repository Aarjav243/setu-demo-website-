from PIL import Image
import os

webp_path = "hero section webp.webp"
out_dir = "hero_frames"

if not os.path.exists(out_dir):
    os.makedirs(out_dir)

with Image.open(webp_path) as im:
    frameCount = 0
    try:
        while True:
            im.seek(frameCount)
            # convert to RGB if image has Alpha channel (LA, PA, RGBA) otherwise JPEG save fails
            rgb_im = im.convert('RGB')
            rgb_im.save(os.path.join(out_dir, f"frame_{frameCount:04d}.jpg"), "JPEG", quality=85)
            frameCount += 1
    except EOFError:
        print(f"Extracted {frameCount} frames.")
