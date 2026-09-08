#!/usr/bin/env python3
"""
CineChroma — import_series_animes.py
Script d'ingestion massive, parallèle et optimisée des séries TV et animés cultes depuis TMDb :
- Découverte étendue : Top votes, top notes, popularité (Live-Action + Animés Japonais + Animation Internationale).
- Traitement parallèle multi-threads (16 workers).
- Filtrage visuel strict (dHash 14 + distance chromatique 25/45) sur chaque affiche.
- Sauvegarde atomique incrémentale par lots.
"""

import os
import sys
import time
import argparse
from concurrent.futures import ThreadPoolExecutor, as_completed

# Support UTF-8 sous Windows
if sys.stdout and hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')
if sys.stderr and hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8')

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from pipeline_core import (
    fetch_tmdb_media_full,
    load_database,
    save_database,
    get_tmdb_session
)


def discover_top_series(session, target_count: int = 600, min_votes: int = 80) -> list:
    """Découvre les meilleures séries TV (non-animation) triées par vote_count et popularité."""
    print(f"\n🔍 [Découverte] Recherche des {target_count} meilleures séries TV live-action sur TMDb...")
    series_candidates = []
    seen_ids = set()

    # Passe 1 : Les plus votées / cultes (vote_count desc)
    page = 1
    max_pages = max(35, target_count // 15)
    while len(series_candidates) < target_count and page <= max_pages:
        url = f"https://api.themoviedb.org/3/discover/tv?sort_by=vote_count.desc&without_genres=16&vote_count.gte={min_votes}&page={page}&language=fr-FR"
        resp = session.get(url, timeout=10, verify=False)
        if resp.status_code == 200:
            results = resp.json().get("results", [])
            if not results:
                break
            for r in results:
                s_id = r.get("id")
                if s_id not in seen_ids:
                    seen_ids.add(s_id)
                    series_candidates.append({
                        "id": s_id,
                        "title": r.get("name") or r.get("original_name"),
                        "type": "tv"
                    })
                    if len(series_candidates) >= target_count:
                        break
        page += 1

    # Passe 2 : Les plus populaires avec note >= 7.0
    if len(series_candidates) < target_count:
        page = 1
        while len(series_candidates) < target_count and page <= 35:
            url = f"https://api.themoviedb.org/3/discover/tv?sort_by=popularity.desc&vote_average.gte=7.0&without_genres=16&vote_count.gte=50&page={page}&language=fr-FR"
            resp = session.get(url, timeout=10, verify=False)
            if resp.status_code == 200:
                results = resp.json().get("results", [])
                if not results:
                    break
                for r in results:
                    s_id = r.get("id")
                    if s_id not in seen_ids:
                        seen_ids.add(s_id)
                        series_candidates.append({
                            "id": s_id,
                            "title": r.get("name") or r.get("original_name"),
                            "type": "tv"
                        })
                        if len(series_candidates) >= target_count:
                            break
            page += 1

    print(f"  ✅ {len(series_candidates)} séries TV candidates identifiées.")
    return series_candidates


def discover_top_anime_and_animation(session, target_count: int = 600, min_votes: int = 40) -> list:
    """Découvre les meilleures séries d'animés japonais et séries d'animation internationales."""
    print(f"\n🔍 [Découverte] Recherche des {target_count} meilleures séries d'animés et d'animation...")
    anime_candidates = []
    seen_ids = set()

    # Passe 1 : Animés Japonais (vote_count desc)
    page = 1
    max_pages = max(30, (target_count * 2) // 30)
    while len(anime_candidates) < (target_count * 0.8) and page <= max_pages:
        url = f"https://api.themoviedb.org/3/discover/tv?with_genres=16&with_original_language=ja&sort_by=vote_count.desc&vote_count.gte={min_votes}&page={page}&language=fr-FR"
        resp = session.get(url, timeout=10, verify=False)
        if resp.status_code == 200:
            results = resp.json().get("results", [])
            if not results:
                break
            for r in results:
                a_id = r.get("id")
                if a_id not in seen_ids:
                    seen_ids.add(a_id)
                    anime_candidates.append({
                        "id": a_id,
                        "title": r.get("name") or r.get("original_name"),
                        "type": "tv"
                    })
        page += 1

    # Passe 2 : Animation Internationale (Arcane, Avatar, Rick and Morty, Invincible, etc.)
    page = 1
    while len(anime_candidates) < target_count and page <= 25:
        url = f"https://api.themoviedb.org/3/discover/tv?with_genres=16&sort_by=vote_count.desc&vote_count.gte=80&page={page}&language=fr-FR"
        resp = session.get(url, timeout=10, verify=False)
        if resp.status_code == 200:
            results = resp.json().get("results", [])
            if not results:
                break
            for r in results:
                a_id = r.get("id")
                if a_id not in seen_ids:
                    seen_ids.add(a_id)
                    anime_candidates.append({
                        "id": a_id,
                        "title": r.get("name") or r.get("original_name"),
                        "type": "tv"
                    })
                    if len(anime_candidates) >= target_count:
                        break
        page += 1

    # Passe 3 : Animés Populaires / Acclamés (vote_average >= 7.5)
    if len(anime_candidates) < target_count:
        page = 1
        while len(anime_candidates) < target_count and page <= 30:
            url = f"https://api.themoviedb.org/3/discover/tv?with_genres=16&sort_by=popularity.desc&vote_average.gte=7.5&vote_count.gte=30&page={page}&language=fr-FR"
            resp = session.get(url, timeout=10, verify=False)
            if resp.status_code == 200:
                results = resp.json().get("results", [])
                if not results:
                    break
                for r in results:
                    a_id = r.get("id")
                    if a_id not in seen_ids:
                        seen_ids.add(a_id)
                        anime_candidates.append({
                            "id": a_id,
                            "title": r.get("name") or r.get("original_name"),
                            "type": "tv"
                        })
                        if len(anime_candidates) >= target_count:
                            break
            page += 1

    print(f"  ✅ {len(anime_candidates)} séries d'animés et animation identifiées.")
    return anime_candidates


def process_candidates_parallel(candidates: list, all_films: list, session, max_workers: int = 16, batch_save_interval: int = 50) -> int:
    """Traite la liste candidate en parallèle multi-threads avec sauvegarde incrémentale."""
    existing_keys = set((f.get("id"), f.get("type_media", "movie")) for f in all_films)
    to_process = [c for c in candidates if (c["id"], c["type"]) not in existing_keys]
    
    print(f"\n🚀 {len(to_process)} nouvelles œuvres à ingérer (sur {len(candidates)} candidates, {len(candidates) - len(to_process)} déjà en base).")
    if not to_process:
        return 0

    added_count = 0
    t0 = time.time()

    def worker(item):
        m_id = item["id"]
        m_type = item["type"]
        title = item["title"]
        try:
            res = fetch_tmdb_media_full(m_id, m_type, session)
            return m_id, m_type, title, res
        except Exception:
            return m_id, m_type, title, None

    with ThreadPoolExecutor(max_workers=max_workers) as executor:
        futures = {executor.submit(worker, itm): itm for itm in to_process}

        for i, future in enumerate(as_completed(futures), 1):
            m_id, m_type, title, media_obj = future.result()
            if media_obj and media_obj.get("affiches_globales"):
                all_films.insert(0, media_obj)
                existing_keys.add((m_id, m_type))
                added_count += 1
            
            if i % 25 == 0 or i == len(to_process):
                elapsed = time.time() - t0
                speed = i / elapsed if elapsed > 0 else 0
                print(f"  [{i}/{len(to_process)}] ({added_count} ajoutées) - {speed:.1f} oeuvres/s - Dernier : {title[:30] if title else ''}", flush=True)

            if added_count > 0 and added_count % batch_save_interval == 0:
                print(f"💾 Sauvegarde incrémentale ({added_count} œuvres)...", flush=True)
                save_database(all_films)

    return added_count


def main():
    parser = argparse.ArgumentParser(description="Ingestion massive et parallèle de séries et animés TMDb.")
    parser.add_argument("--series-count", type=int, default=600, help="Nombre de séries TV live-action à importer")
    parser.add_argument("--anime-count", type=int, default=600, help="Nombre de séries d'animés / animation à importer")
    parser.add_argument("--workers", type=int, default=16, help="Nombre de threads parallèles")
    parser.add_argument("--batch-save", type=int, default=50, help="Fréquence de sauvegarde incrémentale sur disque")

    args = parser.parse_args()

    print("=" * 70)
    print("🎬 CINECHROMA — INGESTION MASSIVE SÉRIES & ANIMÉS (600 + 600)")
    print(f"• Séries TV Live-Action demandées : {args.series_count}")
    print(f"• Séries d'Animés & Animation      : {args.anime_count}")
    print(f"• Threads parallèles (Workers)     : {args.workers}")
    print("=" * 70)

    session = get_tmdb_session()
    all_films = load_database()
    initial_total = len(all_films)

    # 1. Découverte étendue
    series_candidates = discover_top_series(session, args.series_count) if args.series_count > 0 else []
    anime_candidates = discover_top_anime_and_animation(session, args.anime_count) if args.anime_count > 0 else []

    all_candidates = series_candidates + anime_candidates

    # 2. Traitement parallèle
    total_added = process_candidates_parallel(all_candidates, all_films, session, max_workers=args.workers, batch_save_interval=args.batch_save)

    # 3. Sauvegarde finale
    print("\n💾 Sauvegarde finale de la base de données...")
    save_database(all_films)

    print("\n" + "=" * 70)
    print(f"🎉 INGESTION MASSIVE TERMINÉE AVEC SUCCÈS !")
    print(f"• Nouvelles œuvres ajoutées : {total_added}")
    print(f"• Total en base             : {len(all_films)} (au lieu de {initial_total})")
    print("=" * 70)


if __name__ == "__main__":
    main()
