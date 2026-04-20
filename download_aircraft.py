from pathlib import Path
from datasets import load_dataset
from PIL import Image
from tqdm import tqdm
import re

OUT_DIR = Path(r"C:\Users\shanm\Documents\New project 2\defaults")
MAX_IMAGES = None

def safe_name(text: str) -> str:
    text = str(text).strip().replace("\n", " ")
    text = re.sub(r"[^\w\-. ]+", "", text)
    text = re.sub(r"\s+", "_", text)
    return text[:120] if text else "image"

def main():
    OUT_DIR.mkdir(parents=True, exist_ok=True)

    ds = load_dataset("nyuuzyou/aircraft-images", split="train")

    total = len(ds) if MAX_IMAGES is None else min(MAX_IMAGES, len(ds))
    print(f"Downloading {total} images...")

    for i in tqdm(range(total)):
        row = ds[i]
        img = row["image"]

        if img is None:
            continue

        caption = row.get("text") or f"aircraft_{i}"
        filename = safe_name(caption)

        out_path = OUT_DIR / f"{filename}.jpg"

        try:
            img.convert("RGB").save(out_path, "JPEG", quality=95)
        except:
            continue

    print(f"Saved to: {OUT_DIR}")

if __name__ == "__main__":
    main()