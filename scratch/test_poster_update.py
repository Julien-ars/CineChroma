import sys
import os
import time
from concurrent.futures import ThreadPoolExecutor
from io import BytesIO
from PIL import Image
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from scripts.pipeline_core import get_tmdb_session, extract_improved_palette, is_original_language_match

session = get_tmdb_session()

def fetch_fast_posters(media_type, media_id, orig_lang):
    t0 = time.time()
    # 1. Fetch all posters with no language restriction
    res = session.get(f"https://api.themoviedb.org/3/{media_type}/{media_id}/images", timeout=10, verify=False).json()
    posters = res.get("posters", [])
    
    # 2. Categorize
    # Textless: no language code
    textless_cands = [p for p in posters if p.get("iso_639_1") is None]
    textless_cands.sort(key=lambda p: (p.get("vote_average", 0), p.get("vote_count", 0)), reverse=True)
    textless_selected = textless_cands[:3]
    
    # Origine: STRICTLY orig_lang first!
    orig_cands = [p for p in posters if is_original_language_match(p.get("iso_639_1"), orig_lang)]
    orig_cands.sort(key=lambda p: (p.get("vote_average", 0), p.get("vote_count", 0)), reverse=True)
    
    orig_selected = orig_cands[:3]
    # Fallback to other languages ONLY if no orig_lang posters exist
    if len(orig_selected) < 3:
        fallback = [p for p in posters if p.get("iso_639_1") and p not in orig_selected and (p.get("iso_639_1") in ["fr", "en"])]
        fallback.sort(key=lambda p: (p.get("vote_average", 0), p.get("vote_count", 0)), reverse=True)
        orig_selected.extend(fallback[:3 - len(orig_selected)])
        
    # Monde: languages OTHER than orig_lang
    world_cands = [p for p in posters if p.get("iso_639_1") and not is_original_language_match(p.get("iso_639_1"), orig_lang)]
    world_cands.sort(key=lambda p: (p.get("vote_average", 0), p.get("vote_count", 0)), reverse=True)
    
    world_selected = []
    seen_langs = set()
    for p in world_cands:
        lang = p.get("iso_639_1")
        if lang not in seen_langs:
            world_selected.append(p)
            seen_langs.add(lang)
            if len(world_selected) == 3:
                break
    if len(world_selected) < 3:
        for p in world_cands:
            if p not in world_selected:
                world_selected.append(p)
                if len(world_selected) == 3:
                    break
                    
    all_to_fetch = []
    for p in textless_selected: all_to_fetch.append((p, "textless"))
    for p in orig_selected: all_to_fetch.append((p, "origine"))
    for p in world_selected: all_to_fetch.append((p, "monde"))
    
    def process_one(item):
        p, cat = item
        fp = p.get("file_path")
        if not fp: return None
        url_w500 = f"https://image.tmdb.org/t/p/w500{fp}"
        url_orig = f"https://image.tmdb.org/t/p/original{fp}"
        try:
            r = session.get(url_w500, timeout=8, verify=False)
            if r.status_code == 200:
                img = Image.open(BytesIO(r.content))
                palette = extract_improved_palette(img, k=5)
                return {
                    "categorie": cat,
                    "iso_639_1": p.get("iso_639_1"),
                    "affiche_w500": url_w500,
                    "affiche_original": url_orig,
                    "palette": palette
                }
        except Exception as e:
            pass
        return None

    with ThreadPoolExecutor(max_workers=9) as executor:
        results = list(executor.map(process_one, all_to_fetch))
        
    final_posters = [r for r in results if r]
    print(f"Done in {time.time()-t0:.2f}s! Extracted {len(final_posters)} posters.")
    for a in final_posters:
        print(f"  [{a['categorie']}] ({a['iso_639_1']}) -> {a['affiche_w500']}")
    return final_posters

if __name__ == '__main__':
    fetch_fast_posters('tv', 1429, 'ja') # Attack on Titan
