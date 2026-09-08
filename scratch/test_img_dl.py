import sys
import os
import requests
from io import BytesIO
from PIL import Image

SCRIPT_DIR = os.path.join(os.path.dirname(__file__), "..", "scripts")
sys.path.insert(0, SCRIPT_DIR)

from pipeline_core import get_tmdb_session

session = get_tmdb_session()
url = "https://image.tmdb.org/t/p/w500/hTP1DtLGFamjfu8WqjnuQdP1n4i.jpg"

print("Trying with session headers (including accept: application/json)...", flush=True)
try:
    r = session.get(url, timeout=5, verify=False)
    print(f"Status: {r.status_code}, Content-Type: {r.headers.get('Content-Type')}, Length: {len(r.content)}", flush=True)
    img = Image.open(BytesIO(r.content))
    print(f"Image format: {img.format}, size: {img.size}", flush=True)
except Exception as e:
    print(f"Error with session: {e}", flush=True)

print("\nTrying with clean requests.get (no session headers)...", flush=True)
try:
    r2 = requests.get(url, timeout=5, verify=False)
    print(f"Status: {r2.status_code}, Content-Type: {r2.headers.get('Content-Type')}, Length: {len(r2.content)}", flush=True)
    img2 = Image.open(BytesIO(r2.content))
    print(f"Image format: {img2.format}, size: {img2.size}", flush=True)
except Exception as e:
    print(f"Error without session: {e}", flush=True)
