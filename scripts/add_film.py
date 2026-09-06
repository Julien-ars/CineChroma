#!/usr/bin/env python3
"""
CineChroma — add_film.py
Ajoute un film à la base de données CineChroma depuis TMDb (par titre ou par ID).

Usage:
  python scripts/add_film.py "Challengers"
  python scripts/add_film.py --id 937287
  python scripts/add_film.py --query "Dune" --year 2024
"""

import sys

if sys.stdout and hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')
if sys.stderr and hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8')

import argparse
from pipeline_core import (
    search_tmdb_movies,
    fetch_tmdb_movie_full,
    load_database,
    save_database,
    get_tmdb_session
)


def main():
    parser = argparse.ArgumentParser(description="Ajouter un film à la base CineChroma depuis TMDb.")
    parser.add_argument("search_term", nargs="?", default="", help="Titre du film à rechercher")
    parser.add_argument("--id", "-i", type=int, help="ID TMDb direct du film")
    parser.add_argument("--query", "-q", type=str, help="Titre du film à rechercher")
    parser.add_argument("--year", "-y", type=str, help="Année de sortie optionnelle")
    parser.add_argument("--yes", "-y_auto", action="store_true", help="Valider automatiquement le premier résultat")

    args = parser.parse_args()

    query = args.query or args.search_term
    movie_id = args.id

    if not movie_id and query and query.isdigit():
        movie_id = int(query)

    if not movie_id and not query:
        print("❌ Spécifiez au moins un titre ou un ID TMDb.")
        print("Exemples :")
        print("  python scripts/add_film.py \"Oppenheimer\"")
        print("  python scripts/add_film.py --id 872585")
        sys.exit(1)

    session = get_tmdb_session()

    # Si recherche par titre
    if not movie_id:
        print(f"\n🔍 Recherche TMDb pour : '{query}'...")
        results = search_tmdb_movies(query, args.year)
        if not results:
            print(f"❌ Aucun film trouvé sur TMDb pour '{query}'.")
            sys.exit(1)

        print(f"\n🎬 {len(results)} résultats trouvés :")
        for i, res in enumerate(results[:5]):
            year = res.get("release_date", "Date inconnue")[:4]
            title = res.get("title", "Sans titre")
            orig_title = res.get("original_title", "")
            diff_title = f" ({orig_title})" if orig_title and orig_title != title else ""
            print(f"  [{i + 1}] {title}{diff_title} — {year} (ID TMDb : {res['id']}, note : {res.get('vote_average', 0)}/10)")

        choice_idx = 0
        if len(results) > 1 and not args.yes:
            try:
                user_choice = input(f"\nChoisissez un numéro (1-{min(5, len(results))}) [1 par défaut] : ").strip()
                if user_choice.isdigit():
                    choice_idx = int(user_choice) - 1
            except (KeyboardInterrupt, EOFError):
                print("\nAnnulé.")
                sys.exit(0)

        selected_movie = results[choice_idx]
        movie_id = selected_movie["id"]

    # Chargement de la base existante
    all_films = load_database()
    existing_idx = next((i for i, f in enumerate(all_films) if f.get("id") == movie_id), None)

    if existing_idx is not None:
        print(f"\nℹ️ Le film ID {movie_id} est déjà présent dans la base : '{all_films[existing_idx].get('titre')}'.")
        print("Mise à jour de ses métadonnées et palettes...")

    # Récupération et traitement complet
    film_obj = fetch_tmdb_movie_full(movie_id, session)
    if not film_obj:
        print("❌ Impossible de traiter ce film.")
        sys.exit(1)

    # Insertion ou mise à jour
    if existing_idx is not None:
        all_films[existing_idx] = film_obj
    else:
        # Ajout en tête de la base
        all_films.insert(0, film_obj)

    # Sauvegarde
    save_database(all_films)

    print("\n" + "=" * 60)
    print(f"🎉 SUCCÈS : '{film_obj['titre']}' ({film_obj.get('date_sortie', '')[:4]}) a été intégré !")
    print(f"   • Réalisateur   : {film_obj.get('realisateur', 'Non renseigné')}")
    print(f"   • Budget        : ${film_obj.get('budget', 0):,}")
    print(f"   • Recettes      : ${film_obj.get('revenue', 0):,}")
    print(f"   • Affiches traitées : {len(film_obj.get('affiches_globales', []))}")
    if film_obj.get('affiches_globales'):
        print("   • Exemple de palette extraite :", [p['hex'] for p in film_obj['affiches_globales'][0].get('palette', [])])
    print("=" * 60 + "\n")


if __name__ == "__main__":
    main()
