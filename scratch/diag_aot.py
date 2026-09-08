import sys
import os
import requests
from io import BytesIO
from PIL import Image

SCRIPT_DIR = os.path.join(os.path.dirname(__file__), "..", "scripts")
sys.path.insert(0, SCRIPT_DIR)

from pipeline_core import get_tmdb_session, extract_improved_palette

session = get_tmdb_session()

# Check TV 1429 (Attack on Titan) posters
print("Fetching images for Attack on Titan (tv 1429)...", flush=True)
r = session.get("https://api.themoviedb.org/3/tv/1429/images", verify=False)
posters = r.json().get("posters", [])
print(f"Total posters: {len(posters)}", flush=True)

textless = [p for p in posters if p.get("iso_639_1") is None]
print(f"Textless count: {len(textless)}", flush=True)

for i, p in enumerate(textless[:5]):
    url = f"https://image.tmdb.org/t/p/w500{p['file_path']}"
    resp = session.get(url, verify=False)
    img = Image.open(BytesIO(resp.content))
    pal = extract_improved_palette(img, k=5)
    print(f"Poster {i+1}: {url}", flush=True)
    print(f"  Palette: {[c['hex'] for c in pal]}", flush=True)
    print(f"  Weights: {[c['weight'] for c in pal]}", flush=True)
