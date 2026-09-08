import requests, json, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)) + "/..")
from scripts.pipeline_core import (
    get_tmdb_session,
    load_database,
    is_original_language_match,
    select_textless_posters,
    select_origin_posters,
    select_world_posters
)

session = get_tmdb_session()
db = load_database()
item = next(x for x in db if x.get('id') == 1022789 or 'Demon Slayer' in x.get('titre', ''))
print("Title:", item.get('titre'), "ID:", item.get('id'), "type_media:", item.get('type_media'), "est_serie:", item.get('est_serie'))

item_id = item.get("id") or item.get("tmdb_id")
is_tv = bool(item.get("est_serie") or item.get("type_media") == "tv")
orig_lang = (item.get("langue_origine") or item.get("langue_originale") or "en").lower()
media_type = "tv" if is_tv else "movie"

url_images = f"https://api.themoviedb.org/3/{media_type}/{item_id}/images"
resp = session.get(url_images, timeout=10, verify=False)
print("Images status:", resp.status_code)
images_all = resp.json().get("posters", [])
print("Total posters:", len(images_all))

t = select_textless_posters(session, images_all, count=3)
print("Textless selected:", len(t))
o = select_origin_posters(session, images_all, orig_lang, count=3)
print("Origin selected:", len(o))
w = select_world_posters(session, images_all, orig_lang, count=3)
print("World selected:", len(w))
