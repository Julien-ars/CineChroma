#!/usr/bin/env python3
"""
CineChroma — import_community_films.py
Module et script de traitement des ajouts de films avec filtre de qualité strict (Quality Gate).

Critères d'acceptation pour la base globale :
1. Vote count >= 50 sur TMDb (élimine le contenu amateur/spam)
2. Au moins 1 affiche haute résolution valide
3. Non classé Adulte (adult == False)
4. Durée >= 15 minutes (élimine les micro-clips)
5. Titre valide et métadonnées cohérentes
"""

import sys
import os
import argparse
import datetime

# Support UTF-8 sur Windows
if sys.stdout and hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')
if sys.stderr and hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8')

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, SCRIPT_DIR)

from pipeline_core import (
    load_database,
    save_database,
    get_tmdb_session,
    fetch_tmdb_media_full
)

MIN_VOTES_THRESHOLD = 50
MIN_RUNTIME_MINUTES = 15


def evaluate_quality_gate(session, tmdb_id: int, media_type: str = "movie") -> tuple:
    """
    Évalue si un film ou une série TMDb satisfait aux critères de qualité pour intégrer la base globale.
    Retourne (is_valid: bool, reason: str, raw_data: dict)
    """
    endpoint = "tv" if media_type == "tv" else "movie"
    url = f"https://api.themoviedb.org/3/{endpoint}/{tmdb_id}?language=fr-FR"
    try:
        resp = session.get(url, timeout=10, verify=False)
        if resp.status_code != 200:
            return False, f"Œuvre introuvable sur TMDb (code HTTP {resp.status_code})", None
        
        data = resp.json()
        
        # 1. Vérification contenu Adulte
        if data.get("adult", False):
            return False, "Contenu adulte non éligible au catalogue public", data
        
        # 2. Vérification du nombre de votes (popularité & légitimité)
        vote_count = data.get("vote_count", 0)
        if vote_count < MIN_VOTES_THRESHOLD:
            return False, f"Notoriété restreinte ({vote_count} votes sur TMDb, minimum requis: {MIN_VOTES_THRESHOLD})", data
        
        # 3. Vérification de la durée (pour les films uniquement)
        if media_type == "movie":
            runtime = data.get("runtime") or 0
            if runtime > 0 and runtime < MIN_RUNTIME_MINUTES:
                return False, f"Durée trop courte ({runtime} min, minimum: {MIN_RUNTIME_MINUTES} min)", data
        
        # 4. Vérification de l'affiche principale
        if not data.get("poster_path"):
            return False, "Aucune affiche officielle disponible sur TMDb", data
        
        return True, "Critères de qualité validés", data
        
    except Exception as err:
        return False, f"Erreur réseau TMDb : {err}", None


def import_community_film(tmdb_id: int, media_type: str = "movie", force: bool = False, session=None) -> tuple:
    """
    Valide et importe une œuvre (film, série, animé) dans la base de données globale CineChroma.
    Retourne (success: bool, message: str, film_obj: dict)
    """
    if not session:
        session = get_tmdb_session()
    
    all_films = load_database()
    existing_keys = {(f.get("id"), f.get("type_media", "movie")) for f in all_films if f.get("id")}
    
    if (tmdb_id, media_type) in existing_keys:
        for f in all_films:
            if f.get("id") == tmdb_id and f.get("type_media", "movie") == media_type:
                return True, "Cette œuvre est déjà présente dans la base officielle.", f
    
    if not force:
        is_valid, reason, _ = evaluate_quality_gate(session, tmdb_id, media_type=media_type)
        if not is_valid:
            return False, f"Refusé par le filtre qualité : {reason}", None
    
    # Traitement complet avec extraction des palettes CIELAB K-Means
    media_obj = fetch_tmdb_media_full(tmdb_id, media_type=media_type, session=session)
    if not media_obj or not (media_obj.get("affiches_globales") or media_obj.get("affiches")):
        return False, "Impossible de générer les affiches et palettes chromatiques.", None
    
    # Insertion au début du catalogue
    all_films.insert(0, media_obj)
    save_database(all_films)
    
    titre = media_obj.get("titre") or media_obj.get("titre_original")
    aff_count = len(media_obj.get("affiches_globales", media_obj.get("affiches", [])))
    return True, f"Œuvre « {titre} » intégrée avec succès dans la base globale ({aff_count} affiches).", media_obj


def main():
    parser = argparse.ArgumentParser(description="Importer des œuvres communautaires (films, séries, animés) avec filtre de qualité.")
    parser.add_argument("--id", "-i", type=int, required=True, help="ID TMDb de l'œuvre à vérifier et importer")
    parser.add_argument("--type", "-t", choices=["movie", "tv", "anime"], default="movie", help="Type de média (movie, tv, anime)")
    parser.add_argument("--force", "-f", action="store_true", help="Forcer l'import même si les votes sont < 50")
    args = parser.parse_args()

    m_type = "tv" if args.type in ["tv", "anime"] else "movie"
    print(f"🔍 Analyse de l'œuvre TMDb ID : {args.id} ({args.type.upper()})...")
    success, message, film = import_community_film(args.id, media_type=m_type, force=args.force)
    
    if success:
        print(f"✅ {message}")
        if film:
            print(f"   Titre : {film.get('titre')}")
            print(f"   Format: {film.get('type_media', 'movie').upper()}")
            print(f"   Date  : {film.get('date_sortie')}")
            print(f"   Note  : {film.get('note_moyenne')}/10 ({film.get('vote_count')} votes)")
    else:
        print(f"❌ {message}")
        sys.exit(1)


if __name__ == "__main__":
    main()
