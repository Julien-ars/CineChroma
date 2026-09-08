import sys
import os

SCRIPT_DIR = os.path.join(os.path.dirname(__file__), "..", "scripts")
sys.path.insert(0, SCRIPT_DIR)

from pipeline_core import get_tmdb_session, fetch_tmdb_tv_full, fetch_tmdb_movie_full

session = get_tmdb_session()
print("Testing L'Attaque des Titans (TV ID 1429)...")
aot = fetch_tmdb_tv_full(1429, session)
if aot:
    print(f"Title: {aot.get('titre')}")
    for i, p in enumerate(aot.get("affiches_globales", [])):
        print(f"  Poster {i+1} [{p.get('type')}] ISO: {p.get('iso_639_1')}")
        print(f"    URL: {p.get('affiche_w500')}")
        print(f"    Palette: {[c['hex'] for c in p.get('palette', [])]}")

print("\nTesting One Piece (TV ID 37854)...")
op = fetch_tmdb_tv_full(37854, session)
if op:
    print(f"Title: {op.get('titre')}")
    for i, p in enumerate(op.get("affiches_globales", [])):
        print(f"  Poster {i+1} [{p.get('type')}] ISO: {p.get('iso_639_1')}")
        print(f"    URL: {p.get('affiche_w500')}")
        print(f"    Palette: {[c['hex'] for c in p.get('palette', [])]}")
