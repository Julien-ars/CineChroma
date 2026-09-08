import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "scripts"))
import requests
from pipeline_core import get_tmdb_session, select_world_posters, select_origin_posters, select_textless_posters

session = get_tmdb_session()
for media_type, media_id, title in [('tv', 1396, 'Breaking Bad'), ('tv', 1399, 'Game of Thrones'), ('movie', 157336, 'Interstellar')]:
    url = f'https://api.themoviedb.org/3/{media_type}/{media_id}/images'
    resp = session.get(url, verify=False).json()
    posters = resp.get('posters', [])
    print(f'=== {title} ({len(posters)} affiches au total sur TMDb) ===')
    
    tl = select_textless_posters(session, posters, count=3)
    orig = select_origin_posters(session, posters, 'en', count=3)
    world = select_world_posters(session, posters, 'en', count=3)
    
    print(f'  Textless retenues: {len(tl)}')
    print(f'  Origine retenues: {len(orig)}')
    print(f'  Monde retenues: {len(world)}')
    for p in world:
        print(f"    -> langue: {p.get('iso_639_1')}, path: {p.get('file_path')}")
