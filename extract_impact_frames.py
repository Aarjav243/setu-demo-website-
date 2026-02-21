from PIL import Image
import os

def extract_frames(webp_name, out_dir):
    if not os.path.exists(out_dir):
        os.makedirs(out_dir)
    
    print(f"Extracting frames from {webp_name} to {out_dir}...")
    with Image.open(webp_name) as im:
        frameCount = 0
        try:
            while True:
                im.seek(frameCount)
                # convert to RGB to save as JPEG (smaller than PNG)
                rgb_im = im.convert('RGB')
                rgb_im.save(os.path.join(out_dir, f"frame_{frameCount:04d}.jpg"), "JPEG", quality=85)
                frameCount += 1
        except EOFError:
            print(f"Done. Extracted {frameCount} frames.")
    return frameCount

# Extract Problem frames
problem_count = extract_frames("problem webp.webp", "problem_frames")

# Extract Solution frames
solution_count = extract_frames("solution webp.webp", "solution_frames")

print(f"\nFinal Summary:\nProblem: {problem_count} frames\nSolution: {solution_count} frames")
