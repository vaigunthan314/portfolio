#!/usr/bin/env python3
"""
Cut out subject from image sequence using rembg with model u2net_human_seg.
Saves alpha WebP cutouts at 960px wide, quality ~60 to public/frames-fg/frame-XXXX.webp.
Uses multiprocessing with 4 worker processes to utilize multi-core CPU.
"""

import os
import glob
from pathlib import Path
from PIL import Image
from tqdm import tqdm
from concurrent.futures import ProcessPoolExecutor, as_completed
from rembg import new_session, remove

SRC_DIR = Path("./assests/frames-src")
OUT_DIR = Path("./public/frames-fg")
OUT_DIR.mkdir(parents=True, exist_ok=True)

TARGET_WIDTH = 960
WEBP_QUALITY = 60
MODEL_NAME = "u2net_human_seg"

# Global session per worker process
_worker_session = None

def init_worker():
    global _worker_session
    _worker_session = new_session(MODEL_NAME)

def process_frame(task):
    idx, filepath = task
    out_path = OUT_DIR / f"frame-{idx:04d}.webp"

    # Skip if already exists and non-empty
    if out_path.exists() and out_path.stat().st_size > 0:
        return idx, True

    try:
        with Image.open(filepath) as img:
            aspect = img.height / img.width
            target_height = int(TARGET_WIDTH * aspect)
            resized = img.resize((TARGET_WIDTH, target_height), Image.Resampling.LANCZOS)
            cutout = remove(resized, session=_worker_session)
            cutout.save(out_path, "WEBP", quality=WEBP_QUALITY, method=4)
        return idx, True
    except Exception as e:
        print(f"Error on frame {idx}: {e}")
        return idx, False

def main():
    files = sorted(glob.glob(str(SRC_DIR / "ezgif-frame-*.jpg")))
    if not files:
        print("No source frames found in", SRC_DIR)
        return

    tasks = [(idx, fp) for idx, fp in enumerate(files, start=1)]
    print(f"Processing {len(tasks)} frames with 4 workers...")

    num_workers = 4
    with ProcessPoolExecutor(max_workers=num_workers, initializer=init_worker) as executor:
        futures = [executor.submit(process_frame, task) for task in tasks]
        for f in tqdm(as_completed(futures), total=len(futures), desc="Cutouts"):
            f.result()

    print(f"\nAll cutouts generated in {OUT_DIR}")

if __name__ == "__main__":
    main()
