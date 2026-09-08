#!/usr/bin/env python3
"""
CineChroma — add_film.py
Ajoute un film, une série ou un animé à la base de données CineChroma depuis TMDb (par titre ou par ID).

Usage:
  python scripts/add_film.py "Challengers"
  python scripts/add_film.py "Breaking Bad" --type tv
  python scripts/add_film.py "L'Attaque des Titans"
  python scripts/add_film.py --id 1399 --type tv
"""

import sys

if sys.stdout and hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')
if sys.stderr and hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8')

import argparse
from pipeline_core import (
    search_tmdb_media,
    fetch_tmdb_media_full,
    load_database,
    save_database,
    get_tmdb_session
)


def main():
    parser = argparse.ArgumentParser(description="Ajouter un film, une série ou un animé à la base CineChroma depuis TMDb.")
    parser.add_argument("search_term", nargs="?", default="", help="Titre de l'œuvre à rechercher")
    parser.add_argument("--id", "-i", type=int, help="ID TMDb direct")
    parser.add_argument("--type", "-t", choices=["movie", "tv", "all"], default="all", help="Type de média (movie, tv, all)")
    parser.add_argument("--query", "-q", type=str, help="Titre de l'œuvre à rechercher")
    parser.add_argument("--year", "-y", type=str, help="Année de sortie optionnelle")
    parser.add_argument("--yes", "-y_auto", action="store_true", help="Valider automatiquement le premier résultat")

    args = parser.parse_args()

    query = args.query or args.search_term
    media_id = args.id
    media_type = args.type

    if not media_id and query and query.isdigit():
        media_id = int(query)

    if not media_id and not query:
        print("❌ Spécifiez au moins un titre ou un ID TMDb.")
        print("Exemples :")
        print("  python scripts/add_film.py \"Oppenheimer\"")
        print("  python scripts/add_film.py \"Breaking Bad\"")
        print("  python scripts/add_film.py --id 1399 --type tv")
        sys.exit(1)

    session = get_tmdb_session()

    # Si recherche par titre
    if not media_id:
        print(f"\n🔍 Recherche TMDb pour : '{query}' (type: {media_type})...")
        results = search_tmdb_media(query, media_type, args.year)
        if not results:
            print(f"❌ Aucun résultat trouvé sur TMDb pour '{query}'.")
            sys.exit(1)

        print(f"\n🎬 {len(results)} résultats trouvés :")
        for i, res in enumerate(results[:6]):
            year = res.get("release_date", "Date inconnue")[:4]
            title = res.get("title", "Sans titre")
            orig_title = res.get("original_title", "")
            diff_title = f" ({orig_title})" if orig_title and orig_title != title else ""
            
            # Badge de type
            if res.get("is_anime"):
                badge = "🌸 Animé"
            elif res.get("media_type") == "tv":
                badge = "📺 Série TV"
            else:
                badge = "🎬 Film"

            print(f"  [{i + 1}] [{badge}] {title}{diff_title} — {year} (ID : {res['id']}, note : {res.get('vote_average', 0)}/10)")

        choice_idx = 0
        if len(results) > 1 and not args.yes:
            try:
                user_choice = input(f"\nChoisissez un numéro (1-{min(6, len(results))}) [1 par défaut] : ").strip()
                if user_choice.isdigit():
                    choice_idx = int(user_choice) - 1
            except (KeyboardInterrupt, EOFError):
                print("\nAnnulé.")
                sys.exit(0)

        selected_media = results[choice_idx]
        media_id = selected_media["id"]
        media_type = selected_media.get("media_type", "movie")
    else:
        if media_type == "all":
            media_type = "movie"

    # Chargement de la base existante
    all_films = load_database()
    existing_idx = next((i for i, f in enumerate(all_films) if f.get("id") == media_id and f.get("type_media", "movie") == media_type), None)

    if existing_idx is not None:
        print(f"\nℹ️ L'œuvre ID {media_id} est déjà présente dans la base : '{all_films[existing_idx].get('titre')}'.")
        print("Mise à jour de ses métadonnées et palettes...")

    # Récupération et traitement complet
    media_obj = fetch_tmdb_media_full(media_id, media_type, session)
    if not media_obj:
        print("❌ Impossible de traiter cette œuvre.")
        sys.exit(1)

    # Insertion ou mise à jour
    if existing_idx is not None:
        all_films[existing_idx] = media_obj
    else:
        # Ajout en tête de la base
        all_films.insert(0, media_obj)

    # Sauvegarde
    save_database(all_films)

    print("\n" + "=" * 60)
    badge_final = "Animé" if media_obj.get("est_anime") else ("Série TV" if media_obj.get("est_serie") else "Film")
    print(f"🎉 SUCCÈS [{badge_final}] : '{media_obj['titre']}' ({media_obj.get('date_sortie', '')[:4]}) a été intégré !")
    if media_obj.get("est_serie"):
        print(f"   • Format        : {media_obj.get('nombre_saisons', 1)} Saisons • {media_obj.get('nombre_episodes', 0)} Épisodes")
        print(f"   • Créateur      : {media_obj.get('realisateur', 'Non renseigné')}")
    else:
        print(f"   • Réalisateur   : {media_obj.get('realisateur', 'Non renseigné')}")
        print(f"   • Durée         : {media_obj.get('duree_minutes', 0)} min")
    
    print(f"   • Affiches traitées : {len(media_obj.get('affiches_globales', []))}")
    if media_obj.get('affiches_globales'):
        print("   • Exemple de palette extraite :", [p['hex'] for p in media_obj['affiches_globales'][0].get('palette', [])])
    print("=" * 60 + "\n")


if __name__ == "__main__":
    main()

