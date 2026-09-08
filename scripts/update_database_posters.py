#!/usr/bin/env python3
"""
CineChroma — update_database_posters.py
Script de réactualisation rapide et précise des affiches pour les séries, animés et films :
- Garantit que les affiches de la catégorie 'origine' sont dans la véritable langue d'origine (ex: japonais pour les animés, coréen, français, etc.).
- Garantit que la catégorie 'monde' contient jusqu'à 3 affiches internationales de langues différentes (ex: es, de, it, pt, en, etc.).
- Conserve les 3 affiches 'textless'.
- Traitement optimisé en parallèle multi-threads avec sauvegarde incrémentale.
"""

import os
import sys
import time
import json
from concurrent.futures import ThreadPoolExecutor, as_completed
from io import BytesIO
from PIL import Image

# Support UTF-8 sous Windows
if sys.stdout and hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')
if sys.stderr and hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8')

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from pipeline_core import (
    get_tmdb_session,
    load_database,
    save_database,
    is_original_language_match,
    select_textless_posters,
    select_origin_posters,
    select_world_posters,
    build_poster_object
)

def update_item_posters(session, item: dict) -> bool:
    """Récupère toutes les affiches TMDb pour l'oeuvre et recalcule les catégories et palettes."""
    item_id = item.get("id") or item.get("tmdb_id")
    if not item_id:
        return False
    
    is_tv = bool(item.get("est_serie") or item.get("type_media") == "tv")
    orig_lang = (item.get("langue_origine") or item.get("langue_originale") or "en").lower()
    media_type = "tv" if is_tv else "movie"
    
    url_images = f"https://api.themoviedb.org/3/{media_type}/{item_id}/images"
    try:
        resp = session.get(url_images, timeout=10, verify=False)
        if resp.status_code != 200:
            return False
        
        images_all = resp.json().get("posters", [])
        if is_tv:
            has_orig = any(p.get("iso_639_1") and is_original_language_match(p.get("iso_639_1"), orig_lang) for p in images_all)
            if not has_orig:
                for s_num in [1, 0, 2]:
                    try:
                        s_resp = session.get(f"https://api.themoviedb.org/3/tv/{item_id}/season/{s_num}/images", timeout=6, verify=False)
                        if s_resp.status_code == 200:
                            s_posters = s_resp.json().get("posters", [])
                            images_all.extend(s_posters)
                            if any(p.get("iso_639_1") and is_original_language_match(p.get("iso_639_1"), orig_lang) for p in images_all):
                                break
                    except Exception:
                        pass

        if not images_all:
            return False
        
        selected_textless = select_textless_posters(session, images_all, count=3)
        selected_origin = select_origin_posters(session, images_all, orig_lang, count=3)
        selected_world = select_world_posters(session, images_all, orig_lang, count=3)
        
        new_affiches = selected_textless + selected_origin + selected_world
        
        if not new_affiches and item.get("poster_path"):
            fallback = build_poster_object(session, {"file_path": item.get("poster_path")}, "origine")
            if fallback:
                new_affiches.append(fallback)
                
        if new_affiches:
            item["affiches_globales"] = new_affiches
            item["affiches"] = new_affiches
            item["affiches_valides"] = len(new_affiches)
            return True
    except Exception as err:
        pass
    return False

def main():
    import argparse
    parser = argparse.ArgumentParser(description="Actualisation des affiches séries/animés/films")
    parser.add_argument("--limit", type=int, default=None, help="Nombre max d'éléments à traiter")
    parser.add_argument("--filter", choices=["all", "anime_series", "mismatched", "movies", "recent"], default="mismatched", help="Filtre de sélection des œuvres")
    args = parser.parse_args()
    
    session = get_tmdb_session()
    print("📂 Chargement de la base de données CineChroma...")
    db = load_database()
    print(f"  Total œuvres dans la base : {len(db)}")
    
    target_items = []
    for idx, item in enumerate(db):
        is_tv_anime = bool(
            item.get("est_serie") 
            or item.get("est_anime") 
            or item.get("type_media") == "tv" 
            or item.get("saisons")
            or (item.get("est_animation") and item.get("langue_origine") == "ja")
        )
        orig_lang = (item.get("langue_origine") or item.get("original_language") or "en").lower()
        affs = item.get("affiches_globales") or item.get("affiches") or []
        orig_posters = [a for a in affs if (a.get("type") or a.get("categorie")) == "origine"]
        world_posters = [a for a in affs if (a.get("type") or a.get("categorie")) == "monde"]

        # Check for mismatch
        has_orig_mismatch = False
        if orig_lang and orig_lang not in ["en", "xx"]:
            has_orig_mismatch = not any(
                is_original_language_match(a.get("iso_639_1"), orig_lang) for a in orig_posters
            )
        has_world_mismatch = (len(world_posters) < 3)

        if args.filter == "all":
            target_items.append((idx, item))
        elif args.filter == "recent":
            if str(item.get("date_sortie", "")) >= "2024-01-01":
                target_items.append((idx, item))
        elif args.filter == "anime_series":
            if is_tv_anime:
                target_items.append((idx, item))
        elif args.filter == "movies":
            if not is_tv_anime:
                target_items.append((idx, item))
        elif args.filter == "mismatched":
            if is_tv_anime or has_orig_mismatch or has_world_mismatch:
                target_items.append((idx, item))
            
    if args.limit:
        target_items = target_items[:args.limit]
        
    print(f"🎯 {len(target_items)} œuvres à réactualiser (filtre: {args.filter}).")
    
    updated_count = 0
    t0 = time.time()
    
    def worker(task):
        idx, itm = task
        ok = update_item_posters(session, itm)
        return idx, ok, itm.get("titre") or itm.get("title")
    
    # Traitement parallèle par lots de 16 workers
    with ThreadPoolExecutor(max_workers=16) as executor:
        futures = {executor.submit(worker, task): task for task in target_items}
        
        for i, future in enumerate(as_completed(futures), 1):
            try:
                idx, ok, title = future.result()
                if ok:
                    updated_count += 1
                if i % 25 == 0 or i == len(target_items):
                    elapsed = time.time() - t0
                    speed = i / elapsed if elapsed > 0 else 0
                    print(f"  [{i}/{len(target_items)}] ({updated_count} màj) - {speed:.1f} oeuvres/s - Dernier : {title[:30] if title else ''}", flush=True)
                if i % 100 == 0:
                    save_database(db)
            except Exception as e:
                pass
                
    print("\n💾 Sauvegarde finale de la base de données...")
    save_database(db)
    print(f"✅ Terminé en {time.time()-t0:.1f}s ! {updated_count} œuvres réactualisées avec succès.")

if __name__ == '__main__':
    main()
