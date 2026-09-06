#!/usr/bin/env python3
"""
CineChroma — update_recent_films.py
Actualise les données financières (budget, recettes box-office), les notes et les affiches
des films récents (< X jours) ou des films avec données incomplètes.

Usage:
  python scripts/update_recent_films.py --days 30
  python scripts/update_recent_films.py --missing-financials --limit 50
  python scripts/update_recent_films.py --id 123456
"""

import sys

if sys.stdout and hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')
if sys.stderr and hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8')

import time
import argparse
from datetime import datetime, timedelta
from pipeline_core import (
    load_database,
    save_database,
    get_tmdb_session,
    fetch_tmdb_movie_full
)


def parse_date(date_str: str):
    if not date_str:
        return None
    try:
        return datetime.strptime(date_str[:10], "%Y-%m-%d")
    except ValueError:
        return None


def main():
    parser = argparse.ArgumentParser(description="Actualiser les données des films récents ou incomplets sur CineChroma.")
    parser.add_argument("--days", "-d", type=int, default=45, help="Nombre de jours depuis la sortie pour cibler les films récents (défaut : 45)")
    parser.add_argument("--missing-financials", "-m", action="store_true", help="Cibler aussi les films avec budget ou recettes à 0")
    parser.add_argument("--id", "-i", type=int, help="Cibler un ID de film spécifique")
    parser.add_argument("--limit", "-l", type=int, default=100, help="Nombre maximum de films à traiter (défaut : 100)")
    parser.add_argument("--full-reprocess", action="store_true", help="Recalculer aussi toutes les affiches et palettes")

    args = parser.parse_args()

    all_films = load_database()
    session = get_tmdb_session()

    today = datetime.now()
    threshold_date = today - timedelta(days=args.days)

    targets = []

    # Filtrage des films à actualiser
    for idx, film in enumerate(all_films):
        m_id = film.get("id")
        if not m_id:
            continue

        if args.id:
            if m_id == args.id:
                targets.append((idx, film, "ID ciblé"))
                break
            continue

        date_sortie = parse_date(film.get("date_sortie"))
        is_recent = date_sortie and date_sortie >= threshold_date

        has_missing_financials = args.missing_financials and (film.get("budget", 0) == 0 or film.get("revenue", 0) == 0)

        if is_recent:
            days_ago = (today - date_sortie).days
            targets.append((idx, film, f"Sorti il y a {days_ago}j"))
        elif has_missing_financials:
            targets.append((idx, film, "Budget/Recettes à 0"))

        if len(targets) >= args.limit:
            break

    if not targets:
        print(f"\n✨ Aucun film à actualiser pour les critères spécifiés (sortis depuis moins de {args.days} jours).")
        sys.exit(0)

    print(f"\n🎯 {len(targets)} film(s) sélectionné(s) pour actualisation...\n")

    updated_count = 0
    financials_updated = 0

    for idx, (db_idx, film, reason) in enumerate(targets):
        m_id = film.get("id")
        titre = film.get("titre", "Titre inconnu")
        print(f"[{idx + 1}/{len(targets)}] ({reason}) {titre} (ID : {m_id})...")

        if args.full_reprocess:
            # Retraitement complet (affiches + métadonnées)
            new_film = fetch_tmdb_movie_full(m_id, session)
            if new_film:
                all_films[db_idx] = new_film
                updated_count += 1
                print(f"  ✅ Film entièrement actualisé avec nouvelles palettes.")
        else:
            # Actualisation rapide des données TMDb (budget, revenue, note, popularité)
            url = f"https://api.themoviedb.org/3/movie/{m_id}?language=fr-FR"
            try:
                resp = session.get(url, timeout=10, verify=False)
                if resp.status_code == 200:
                    details = resp.json()
                    old_budget = film.get("budget", 0)
                    old_revenue = film.get("revenue", 0)

                    new_budget = details.get("budget", 0)
                    new_revenue = details.get("revenue", 0)

                    film["budget"] = new_budget
                    film["revenue"] = new_revenue
                    film["note_moyenne"] = round(details.get("vote_average", film.get("note_moyenne", 0)), 2)
                    film["popularite"] = round(details.get("popularity", film.get("popularite", 0)), 2)
                    film["duree_minutes"] = details.get("runtime") or film.get("duree_minutes", 0)

                    updated_count += 1
                    if (new_budget != old_budget) or (new_revenue != old_revenue):
                        financials_updated += 1
                        print(f"  💰 Données financières mises à jour : Budget ${new_budget:,} | Recettes ${new_revenue:,}")
                    else:
                        print(f"  ✅ Métadonnées synchronisées.")
                elif resp.status_code == 404:
                    print(f"  ⚠️ Introuvable sur TMDb.")
            except Exception as err:
                print(f"  ⚠️ Erreur réseau : {err}")

        time.sleep(0.08)

    # Sauvegarde
    if updated_count > 0:
        save_database(all_films)
        print(f"\n🎉 Terminé ! {updated_count} film(s) mis à jour (dont {financials_updated} avec évolution financière).")


if __name__ == "__main__":
    main()
