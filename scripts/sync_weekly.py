#!/usr/bin/env python3
"""
CineChroma — sync_weekly.py
Script de synchronisation hebdomadaire automatisée :
1. Intègre les films les plus populaires / tendances du moment (non encore répertoriés).
2. Actualise les affiches et palettes UNIQUEMENT pour les films récents (sortis depuis <= 7 jours ou à venir).
3. Actualise les données financières (box-office / recettes) des sorties récentes.
4. Équilibre et sauvegarde les fichiers partitionnés films_part1/2/3.json.
"""

import argparse
import datetime
import json
import os
import sys

# Support UTF-8 sur Windows
if sys.stdout and hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')
if sys.stderr and hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8')

# Import du moteur CineChroma
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, SCRIPT_DIR)

from pipeline_core import (
    load_database,
    save_database,
    get_tmdb_session,
    fetch_tmdb_movie_full,
    extract_improved_palette,
    select_textless_posters,
    select_origin_posters,
    select_world_posters,
    build_poster_object
)


def is_film_in_window_for_poster_refresh(film: dict, today: datetime.date, max_days: int = 7) -> bool:
    """
    Règle stricte : Un film n'est éligible au rafraîchissement d'affiches que si :
    - Sa date de sortie est dans le futur (film à venir), OU
    - Sa date de sortie est comprise entre (Aujourd'hui - 7 jours) et Aujourd'hui.
    Tous les films sortis il y a plus de 7 jours ne sont JAMAIS modifiés.
    """
    date_str = film.get("date_sortie")
    if not date_str:
        return False
    try:
        parts = [int(p) for p in date_str.split("-")]
        if len(parts) < 3:
            return False
        rel_date = datetime.date(parts[0], parts[1], parts[2])
        days_since_release = (today - rel_date).days
        # Film à venir (days_since_release < 0) ou sorti il y a <= max_days
        return days_since_release <= max_days
    except Exception:
        return False


def get_trending_movie_ids(session, limit: int = 40) -> list:
    """Récupère les IDs des films les plus populaires et tendances du moment sur TMDb."""
    print("🌐 Récupération des tendances et sorties cinéma depuis TMDb...")
    collected_ids = []
    seen = set()

    endpoints = [
        "https://api.themoviedb.org/3/trending/movie/week?language=fr-FR",
        "https://api.themoviedb.org/3/movie/now_playing?language=fr-FR&page=1",
        "https://api.themoviedb.org/3/movie/popular?language=fr-FR&page=1"
    ]

    for ep in endpoints:
        try:
            resp = session.get(ep, timeout=10, verify=False)
            if resp.status_code == 200:
                results = resp.json().get("results", [])
                for m in results:
                    mid = m.get("id")
                    # Filtrer le contenu pour adulte ou non pertinent
                    if mid and mid not in seen and not m.get("adult", False):
                        seen.add(mid)
                        collected_ids.append({
                            "id": mid,
                            "title": m.get("title") or m.get("original_title"),
                            "release_date": m.get("release_date", ""),
                            "popularity": m.get("popularity", 0),
                            "vote_count": m.get("vote_count", 0)
                        })
        except Exception as err:
            print(f"  ⚠️ Erreur endpoint {ep} : {err}")

    # Tri par popularité décroissante
    collected_ids.sort(key=lambda x: x.get("popularity", 0), reverse=True)
    return collected_ids


def refresh_single_film_posters(session, film: dict) -> bool:
    """
    Interroge TMDb pour actualiser les affiches d'un film récent si de nouvelles variantes sont disponibles.
    """
    movie_id = film.get("id")
    if not movie_id:
        return False

    url = f"https://api.themoviedb.org/3/movie/{movie_id}?append_to_response=images,release_dates&include_image_language=fr,en,ja,null"
    try:
        resp = session.get(url, timeout=10, verify=False)
        if resp.status_code != 200:
            return False

        data = resp.json()
        raw_posters = (data.get("images") or {}).get("posters", [])
        if not raw_posters:
            return False

        orig_lang = data.get("original_language", "en")
        selected_textless = select_textless_posters(session, raw_posters, count=3)
        selected_origin = select_origin_posters(session, raw_posters, orig_lang, count=3)
        selected_world = select_world_posters(session, raw_posters, orig_lang, count=3)

        new_affiches = []
        for p in selected_textless:
            obj = build_poster_object(session, p, "textless")
            if obj: new_affiches.append(obj)
        for p in selected_origin:
            obj = build_poster_object(session, p, "origine")
            if obj: new_affiches.append(obj)
        for p in selected_world:
            obj = build_poster_object(session, p, "monde")
            if obj: new_affiches.append(obj)

        if len(new_affiches) > len(film.get("affiches_globales", [])):
            film["affiches_globales"] = new_affiches
            film["affiches_valides"] = len(new_affiches)
            return True

        # Mise à jour des métadonnées financières et de vote
        film["budget"] = data.get("budget") or film.get("budget", 0)
        film["revenue"] = data.get("revenue") or film.get("revenue", 0)
        film["note_moyenne"] = round(data.get("vote_average", film.get("note_moyenne", 0)), 2)
        film["popularite"] = round(data.get("popularity", film.get("popularite", 0)), 2)
        return False
    except Exception as err:
        print(f"  ⚠️ Erreur refresh film {movie_id} : {err}")
        return False


def run_weekly_sync(max_new_films: int = 10, days_window: int = 7, dry_run: bool = False,
                    skip_new: bool = False, skip_refresh: bool = False):
    print("=" * 65)
    print("🎬 CINECHROMA — SYNCHRONISATION HEBDOMADAIRE AUTOMATISÉE")
    print(f"📅 Date : {datetime.date.today().isoformat()}")
    print(f"🎯 Limite nouveaux films : {max_new_films} | Fenêtre affiches : <= {days_window} jours")
    print("=" * 65)

    session = get_tmdb_session()
    all_films = load_database()
    existing_ids = {f.get("id") for f in all_films if f.get("id")}
    today = datetime.date.today()

    # ─────────────────────────────────────────────────────────────
    # ÉTAPE 1 : Actualisation des affiches (films récents <= 7 jours)
    # ─────────────────────────────────────────────────────────────
    refreshed_posters_count = 0
    if not skip_refresh:
        print(f"\n🔍 [1/2] Recherche des films récents (sortis <= {days_window}j ou à venir) pour actualisation d'affiches...")
        eligible_films = [f for f in all_films if is_film_in_window_for_poster_refresh(f, today, days_window)]
        print(f"  📌 {len(eligible_films)} film(s) dans la fenêtre d'actualisation.")

        for idx, film in enumerate(eligible_films, 1):
            f_title = film.get("titre") or film.get("titre_original")
            f_date = film.get("date_sortie")
            print(f"  [{idx}/{len(eligible_films)}] Vérification : {f_title} ({f_date})")
            updated = refresh_single_film_posters(session, film)
            if updated:
                refreshed_posters_count += 1
                print(f"    ✨ Nouvelles affiches intégrées ! (Total: {len(film.get('affiches_globales', []))})")
    else:
        print("\n⏩ [1/2] Actualisation des affiches ignorée (--skip-refresh).")

    # ─────────────────────────────────────────────────────────────
    # ÉTAPE 2 : Découverte des nouveautés & Actualisation de popularité
    # ─────────────────────────────────────────────────────────────
    added_films_count = 0
    updated_pop_count = 0

    print(f"\n🚀 [2/2] Analyse des tendances TMDb & Actualisation des scores de popularité...")
    trending = get_trending_movie_ids(session, limit=100)

    # 2a. Mise à jour instantanée de la popularité pour les films du catalogue présents dans le Top TMDb
    film_id_map = {f.get("id"): f for f in all_films if f.get("id")}
    for m in trending:
        mid = m.get("id")
        if mid in film_id_map:
            film = film_id_map[mid]
            new_pop = round(m.get("popularity", 0), 2)
            new_votes = m.get("vote_count", 0)
            if new_pop > 0:
                film["popularite"] = new_pop
                if new_votes:
                    film["vote_count"] = new_votes
                updated_pop_count += 1

    if updated_pop_count > 0:
        print(f"  📈 Scores de popularité actualisés pour {updated_pop_count} film(s) du catalogue.")

    # 2b. Ajout des nouveaux films populaires
    if not skip_new:
        candidates = [m for m in trending if m["id"] not in existing_ids]
        print(f"  📌 {len(candidates)} nouveau(x) film(s) potentiel(s) trouvé(s) (limite: {max_new_films}).")

        for m in candidates:
            if added_films_count >= max_new_films:
                break
            mid = m["id"]
            mtitle = m["title"]
            print(f"\n  👉 Traitement du film [{added_films_count + 1}/{max_new_films}] : {mtitle} (ID: {mid})...")
            full_film = fetch_tmdb_movie_full(mid, session=session)

            if full_film and full_film.get("affiches_globales"):
                all_films.insert(0, full_film)
                existing_ids.add(mid)
                added_films_count += 1
                print(f"    ✅ Ajouté avec succès ({len(full_film['affiches_globales'])} affiches).")
            else:
                print(f"    ⏩ Ignoré (pas d'affiches valides).")
    else:
        print("\n⏩ Ajout des nouveaux films ignoré (--skip-new).")

    # ─────────────────────────────────────────────────────────────
    # RÉCAPITULATIF & SAUVEGARDE
    # ─────────────────────────────────────────────────────────────
    print("\n" + "=" * 65)
    print("📊 BILAN DE LA SYNCHRONISATION :")
    print(f"  • Nouveaux films ajoutés : {added_films_count}")
    print(f"  • Affiches de films récents actualisées : {refreshed_posters_count}")
    print(f"  • Scores de popularité actualisés : {updated_pop_count}")
    print(f"  • Total films dans la base : {len(all_films)}")
    print("=" * 65)

    if (added_films_count > 0 or refreshed_posters_count > 0) and not dry_run:
        save_database(all_films)
        print("\n🎉 Base de données mise à jour avec succès !")
    elif dry_run:
        print("\n🔍 Mode simulation (--dry-run) : aucune modification écrite sur le disque.")
    else:
        print("\n✨ Aucune modification nécessaire, la base est déjà à jour.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Synchronisation hebdomadaire CineChroma")
    parser.add_argument("--max-new-films", type=int, default=10, help="Nombre max de nouveaux films populaires à ajouter (défaut: 10)")
    parser.add_argument("--days-window", type=int, default=7, help="Fenêtre en jours pour actualiser les affiches récentes (défaut: 7)")
    parser.add_argument("--dry-run", action="store_true", help="Simuler l'exécution sans sauvegarder les JSON")
    parser.add_argument("--skip-new", action="store_true", help="Ne pas ajouter de nouveaux films")
    parser.add_argument("--skip-refresh", action="store_true", help="Ne pas actualiser les affiches des films récents")

    args = parser.parse_args()
    run_weekly_sync(
        max_new_films=args.max_new_films,
        days_window=args.days_window,
        dry_run=args.dry_run,
        skip_new=args.skip_new,
        skip_refresh=args.skip_refresh
    )
