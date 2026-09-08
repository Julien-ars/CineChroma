"""
CineChroma — pipeline_core.py
Moteur d'extraction et de synchronisation des données films et palettes chromatiques TMDb.
"""

import json
import os
import time
from io import BytesIO
from collections import Counter
from concurrent.futures import ThreadPoolExecutor
import requests
import urllib3
import numpy as np
from PIL import Image
from sklearn.cluster import MiniBatchKMeans
from skimage.color import rgb2lab, lab2rgb

import sys

# Support UTF-8 sur Windows
if sys.stdout and hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')
if sys.stderr and hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8')

# Désactivation des alertes SSL
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

# Configuration TMDb
TMDB_BEARER_TOKEN = os.environ.get(
    "TMDB_BEARER_TOKEN",
    "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIyZDY4ZDgwMDBlMjNjY2E1Mzc4NDAxYmY5MDA0ZTg4NCIsIm5iZiI6MTc4NDU3ODY2MS45ODg5OTk4LCJzdWIiOiI2YTVlODI2NTFhODNiZTIyYWM0ZjYyN2QiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.fxMEYiohV7Ot3AuR1R5GxoMMROYjZmAUp1RMUJN_1Sg"
)

# Chemins des fichiers de base de données
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PART_FILES = [
    os.path.join(BASE_DIR, "films_part1.json"),
    os.path.join(BASE_DIR, "films_part2.json"),
    os.path.join(BASE_DIR, "films_part3.json"),
]

IMAGE_HASH_CACHE = {}


def get_tmdb_session():
    """Crée une session requests avec les headers d'authentification TMDb."""
    session = requests.Session()
    session.headers.update({
        "Authorization": f"Bearer {TMDB_BEARER_TOKEN}",
        "accept": "application/json",
        "User-Agent": "CineChroma-Pipeline/2.0"
    })
    return session


# ─── EXTRACTION DE PALETTE CHROMATIQUE (LAB + MiniBatchKMeans) ──────

def extract_improved_palette(img: Image.Image, k: int = 5) -> list:
    """
    Extrait la palette des k couleurs dominantes dans l'espace colorimétrique LAB
    avec un rognage fin des bordures (5%) pour éliminer les liserés et bandes noires.
    """
    try:
        width, height = img.size
        # Rognage des marges à 5%
        cropped = img.crop((width * 0.05, height * 0.05, width * 0.95, height * 0.95))
        resized = cropped.convert('RGB').resize((100, 150))
        pixels_rgb = np.array(resized)

        # Conversion RGB -> LAB pour une perception humaine réaliste des nuances
        pixels_lab = rgb2lab(pixels_rgb / 255.0).reshape(-1, 3)
        kmeans = MiniBatchKMeans(n_clusters=k, random_state=42, n_init=3, batch_size=2048)
        labels = kmeans.fit_predict(pixels_lab)

        centers_lab = kmeans.cluster_centers_.reshape(1, k, 3)
        centers_rgb = lab2rgb(centers_lab).reshape(k, 3) * 255

        counts = Counter(labels)
        total_pixels = len(pixels_lab)
        sorted_counts = sorted(counts.items(), key=lambda x: x[1], reverse=True)

        palette = []
        for cluster_idx, count in sorted_counts:
            r, g, b = [int(np.clip(c, 0, 255)) for c in centers_rgb[cluster_idx]]
            hex_code = f"#{r:02x}{g:02x}{b:02x}"
            percentage = round((count / total_pixels) * 100, 2)
            palette.append({"hex": hex_code, "weight": percentage})

        return palette
    except Exception as err:
        print(f"  ⚠️ Erreur extraction palette : {err}")
        return []


# ─── DÉDOUBLONNAGE VISUEL & DIVERSITÉ CHROMATIQUE (NOTEBOOK PROJET COULEUR) ──

def calculer_dhash(img, hash_size=8):
    """Génère une empreinte numérique (dHash) basée sur la structure visuelle."""
    try:
        img_gray = img.convert('L').resize((hash_size + 1, hash_size), Image.Resampling.LANCZOS)
        pixels = np.array(img_gray)
        diff = pixels[:, 1:] > pixels[:, :-1]
        return diff
    except Exception:
        return None


def sont_affiches_trop_similaires(hash1, palette1, hash2, palette2, seuil_hash=14, seuil_couleur=25.0):
    """
    Vérifie si deux affiches sont visuellement trop proches (composition + couleur).
    - Hamming < 14 (sur 64 bits) : composition/cadrage quasi-identique.
    - Distance de couleur dominante < 25.0 : tonalité chromatique trop similaire.
    - Hamming < 18 ET Distance couleur < 45.0 : composition et palette proches.
    """
    if hash1 is not None and hash2 is not None:
        distance_hamming = np.count_nonzero(hash1 != hash2)
        if distance_hamming < seuil_hash:
            return True
            
    if palette1 and palette2:
        hex1 = palette1[0].get("hex") if isinstance(palette1[0], dict) else palette1[0]
        hex2 = palette2[0].get("hex") if isinstance(palette2[0], dict) else palette2[0]
        if hex1.startswith('#'): hex1 = hex1[1:]
        if hex2.startswith('#'): hex2 = hex2[1:]
        try:
            r1, g1, b1 = int(hex1[0:2], 16), int(hex1[2:4], 16), int(hex1[4:6], 16)
            r2, g2, b2 = int(hex2[0:2], 16), int(hex2[2:4], 16), int(hex2[4:6], 16)
            dist_couleur = np.sqrt((r1 - r2)**2 + (g1 - g2)**2 + (b1 - b2)**2)
            if dist_couleur < seuil_couleur:
                return True
            if hash1 is not None and hash2 is not None:
                distance_hamming = np.count_nonzero(hash1 != hash2)
                if distance_hamming < 18 and dist_couleur < 45.0:
                    return True
        except Exception:
            pass
            
    return False


def is_original_language_match(lang_code: str, orig_lang: str) -> bool:
    if not lang_code:
        return False
    lang_code = lang_code.lower()
    orig_lang = (orig_lang or "").lower()
    if orig_lang in ["zh", "cn"] and lang_code in ["zh", "cn"]:
        return True
    return lang_code == orig_lang


def traiter_categorie_diversifiee(session: requests.Session, posters_cat: list, nom_categorie: str, max_affiches: int = 3) -> list:
    """
    Sélectionne jusqu'à `max_affiches` avec le système à 2 passes du Notebook :
    - PASSE 1 : Diversité stricte de composition (dHash) ET de palette de couleurs.
    - PASSE 2 : Levée du filtre couleur pour compléter à 3 si besoin (sans doublon exact).
    """
    res = []
    hashes = []
    candidats_evalues = []

    posters_tries = sorted(posters_cat, key=lambda p: (-p.get('vote_average', 0), -p.get('vote_count', 0)))

    # --- PASSE 1 : Diversité couleur + composition ---
    for poster_info in posters_tries:
        if len(res) >= max_affiches:
            break
            
        file_path = poster_info.get('file_path')
        if not file_path:
            continue
            
        url_w500 = f"https://image.tmdb.org/t/p/w500{file_path}"
        url_original = f"https://image.tmdb.org/t/p/original{file_path}"
        
        try:
            resp = session.get(url_w500, timeout=8, verify=False)
            if resp.status_code != 200:
                continue
            img = Image.open(BytesIO(resp.content))
            palette = extract_improved_palette(img, k=5)
            img_hash = calculer_dhash(img)
            
            if palette and img_hash is not None:
                item = {
                    "categorie": nom_categorie,
                    "type": nom_categorie,
                    "iso_639_1": poster_info.get("iso_639_1"),
                    "file_path": file_path,
                    "affiche_w500": url_w500,
                    "affiche_original": url_original,
                    "palette": palette,
                    "palette_brute": palette,
                    "hash": img_hash
                }
                candidats_evalues.append(item)

                trop_similaire = False
                for idx, exist in enumerate(res):
                    if sont_affiches_trop_similaires(img_hash, palette, hashes[idx], exist["palette"]):
                        trop_similaire = True
                        break

                if not trop_similaire:
                    res.append(item)
                    hashes.append(img_hash)
        except Exception:
            continue

    # --- PASSE 2 : Levée du filtre de couleur si < max_affiches (films monochromes ou variantes artistiques) ---
    if len(res) < max_affiches:
        for item in candidats_evalues:
            if len(res) >= max_affiches:
                break
            if any(r["file_path"] == item["file_path"] for r in res):
                continue

            est_doublon_exact = False
            for h_exist in hashes:
                if np.count_nonzero(item["hash"] != h_exist) < 12:
                    est_doublon_exact = True
                    break

            if not est_doublon_exact:
                res.append(item)
                hashes.append(item["hash"])

    for item in res:
        item.pop("file_path", None)
        item.pop("hash", None)

    return res


# ─── SÉLECTION D'AFFICHES (TEXTLESS, ORIGINE, MONDE) ────────────────

def select_textless_posters(session: requests.Session, posters: list, count: int = 3) -> list:
    cat_textless = [p for p in posters if p.get("iso_639_1") is None]
    return traiter_categorie_diversifiee(session, cat_textless, "textless", max_affiches=count)


def select_origin_posters(session: requests.Session, posters: list, orig_lang: str, count: int = 3) -> list:
    """
    Sélectionne STRICTEMENT jusqu'à `count` affiches dans la véritable langue d'origine (`orig_lang`).
    Ne pollue JAMAIS avec de l'anglais/français si l'œuvre est dans une autre langue.
    """
    cat_origine = [
        p for p in posters
        if p.get("iso_639_1") and is_original_language_match(p.get("iso_639_1"), orig_lang)
    ]
    return traiter_categorie_diversifiee(session, cat_origine, "origine", max_affiches=count)


def select_world_posters(session: requests.Session, posters: list, orig_lang: str, count: int = 3) -> list:
    """
    Sélectionne jusqu'à `count` affiches internationales de langues et pays différents,
    en excluant la langue d'origine et les affiches textless.
    """
    world_candidates = [
        p for p in posters
        if p.get("iso_639_1") and not is_original_language_match(p.get("iso_639_1"), orig_lang)
    ]
    if not world_candidates:
        return []

    # Priorité aux langues différentes par ordre de popularité
    ordered_langs = []
    for p in sorted(world_candidates, key=lambda x: (-x.get('vote_average', 0), -x.get('vote_count', 0))):
        l = (p.get("iso_639_1") or "").lower()
        if l and l not in ordered_langs:
            ordered_langs.append(l)

    # Répartir les meilleurs posters par langue
    cat_monde = []
    for l in ordered_langs:
        best_p = next((p for p in world_candidates if (p.get("iso_639_1") or "").lower() == l), None)
        if best_p:
            cat_monde.append(best_p)

    # Compléter avec les affiches restantes si moins de 3 langues
    if len(cat_monde) < count:
        for p in world_candidates:
            if p not in cat_monde:
                cat_monde.append(p)

    return traiter_categorie_diversifiee(session, cat_monde, "monde", max_affiches=count)

def build_poster_object(session: requests.Session, poster_info: dict, category_name: str) -> dict:
    """Télécharge l'affiche w500, génère la palette 5 couleurs et assemble l'objet affiche."""
    file_path = poster_info.get("file_path")
    if not file_path:
        return None

    url_w500 = f"https://image.tmdb.org/t/p/w500{file_path}"
    url_original = f"https://image.tmdb.org/t/p/original{file_path}"

    try:
        resp = session.get(url_w500, timeout=10, verify=False)
        if resp.status_code == 200:
            img = Image.open(BytesIO(resp.content))
            palette = extract_improved_palette(img, k=5)
            if palette and len(palette) == 5:
                return {
                    "categorie": category_name,
                    "type": category_name,
                    "iso_639_1": poster_info.get("iso_639_1"),
                    "affiche_w500": url_w500,
                    "affiche_original": url_original,
                    "palette": palette,
                    "palette_brute": palette
                }
    except Exception as err:
        print(f"  ⚠️ Erreur téléchargement affiche {file_path} : {err}")
    return None


# ─── EXTRACTION DÉTAILLÉE DU FILM DEPUIS TMDB ─────────────────────────

def fetch_tmdb_movie_full(movie_id: int, session: requests.Session = None) -> dict:
    """
    Récupère l'ensemble des données d'un film sur TMDb (métadonnées multilingues,
    bandes-annonces, affiches avec palettes) et formate l'objet selon le schéma CineChroma.
    """
    if session is None:
        session = get_tmdb_session()

    print(f"📥 Récupération des données TMDb pour l'ID {movie_id}...")

    # 1. Requête principale avec crédits, vidéos et release_dates
    url_main = f"https://api.themoviedb.org/3/movie/{movie_id}?append_to_response=credits,videos,release_dates"
    resp_main = session.get(url_main, timeout=12, verify=False)
    if resp_main.status_code != 200:
        print(f"❌ Film ID {movie_id} introuvable sur TMDb (code {resp_main.status_code}).")
        return None

    data_main = resp_main.json()

    # 2. Requête dédiée pour TOUTES les images (toutes langues incluses sans restriction)
    url_images = f"https://api.themoviedb.org/3/movie/{movie_id}/images"
    resp_images = session.get(url_images, timeout=10, verify=False)
    images_all = resp_images.json().get("posters", []) if resp_images.status_code == 200 else []

    # 3. Requêtes localisées (FR, EN, JA) pour les titres et résumés
    url_fr = f"https://api.themoviedb.org/3/movie/{movie_id}?language=fr-FR&append_to_response=videos"
    url_en = f"https://api.themoviedb.org/3/movie/{movie_id}?language=en-US&append_to_response=videos"
    url_ja = f"https://api.themoviedb.org/3/movie/{movie_id}?language=ja-JP&append_to_response=videos"

    data_fr = session.get(url_fr, timeout=10, verify=False).json() if True else {}
    data_en = session.get(url_en, timeout=10, verify=False).json() if True else {}
    data_ja = session.get(url_ja, timeout=10, verify=False).json() if True else {}

    # Extraction des bandes-annonces YouTube
    def extract_trailer_url(vid_data):
        videos = (vid_data.get("videos") or {}).get("results", [])
        trailers = [v for v in videos if v.get("site") == "YouTube" and v.get("type") in ["Trailer", "Teaser"]]
        if trailers:
            return f"https://www.youtube.com/watch?v={trailers[0].get('key')}"
        return ""

    trailer_fr = extract_trailer_url(data_fr) or extract_trailer_url(data_main)
    trailer_en = extract_trailer_url(data_en) or extract_trailer_url(data_main)
    trailer_ja = extract_trailer_url(data_ja)

    # Extraction du réalisateur
    crew = (data_main.get("credits") or {}).get("crew", [])
    directors = [c.get("name") for c in crew if c.get("job") == "Director"]
    realisateur = ", ".join(directors) if directors else ""

    # Genres
    genres = [g.get("name") for g in data_main.get("genres", [])]
    orig_lang = data_main.get("original_language", "en")
    est_animation = any("anim" in g.lower() for g in genres)

    print(f"🎨 Traitement des affiches et palettes ({len(images_all)} affiches candidates)...")
    selected_textless = select_textless_posters(session, images_all, count=3)
    selected_origin = select_origin_posters(session, images_all, orig_lang, count=3)
    selected_world = select_world_posters(session, images_all, orig_lang, count=3)

    affiches_globales = selected_textless + selected_origin + selected_world

    # Fallback si aucune affiche n'a pu être sélectionnée
    if not affiches_globales and data_main.get("poster_path"):
        fallback_obj = build_poster_object(session, {"file_path": data_main.get("poster_path")}, "origine")
        if fallback_obj:
            affiches_globales.append(fallback_obj)

    film_obj = {
        "id": data_main.get("id"),
        "est_serie": False,
        "type_media": "movie",
        "est_animation": est_animation,
        "est_anime": est_animation and orig_lang == "ja",
        "titre": data_fr.get("title") or data_main.get("title") or data_main.get("original_title"),
        "titre_en": data_en.get("title") or data_main.get("title"),
        "titre_ja": data_ja.get("title") or "",
        "titre_original": data_main.get("original_title"),
        "date_sortie": data_main.get("release_date", ""),
        "genres": genres,
        "duree_minutes": data_main.get("runtime", 0),
        "realisateur": realisateur,
        "langue_origine": orig_lang,
        "note_moyenne": round(data_main.get("vote_average", 0), 2),
        "popularite": round(data_main.get("popularity", 0), 2),
        "resume_fr": data_fr.get("overview") or data_main.get("overview", ""),
        "resume_en": data_en.get("overview") or "",
        "resume_ja": data_ja.get("overview") or "",
        "bande_annonce_url_fr": trailer_fr,
        "bande_annonce_url_en": trailer_en,
        "bande_annonce_url_ja": trailer_ja,
        "affiches_globales": affiches_globales,
        "saisons": [],
        "v2_complete": True,
        "revenue": data_main.get("revenue", 0),
        "budget": data_main.get("budget", 0),
        "affiches_valides": len(affiches_globales),
        "statut_traitement": "valide"
    }

    return film_obj


# ─── EXTRACTION DÉTAILLÉE DE SÉRIE / ANIMÉ TV DEPUIS TMDB ────────────

def fetch_tmdb_tv_full(tv_id: int, session: requests.Session = None) -> dict:
    """
    Récupère l'ensemble des données d'une série TV ou d'un animé sur TMDb
    (métadonnées multilingues, showrunners, saisons, affiches avec palettes K-Means LAB)
    et formate l'objet selon le schéma CineChroma unifié.
    """
    if session is None:
        session = get_tmdb_session()

    print(f"📥 Récupération des données TMDb Série/Animé pour l'ID {tv_id}...")

    # 1. Requête principale avec crédits, aggregate_credits et vidéos
    url_main = f"https://api.themoviedb.org/3/tv/{tv_id}?append_to_response=credits,aggregate_credits,videos"
    resp_main = session.get(url_main, timeout=12, verify=False)
    if resp_main.status_code != 200:
        print(f"❌ Série ID {tv_id} introuvable sur TMDb (code {resp_main.status_code}).")
        return None

    data_main = resp_main.json()

    # 2. Requête dédiée pour TOUTES les images (toutes langues incluses sans restriction)
    url_images = f"https://api.themoviedb.org/3/tv/{tv_id}/images"
    resp_images = session.get(url_images, timeout=10, verify=False)
    images_all = resp_images.json().get("posters", []) if resp_images.status_code == 200 else []

    # 3. Requêtes localisées (FR, EN, JA) pour les titres et résumés
    url_fr = f"https://api.themoviedb.org/3/tv/{tv_id}?language=fr-FR&append_to_response=videos"
    url_en = f"https://api.themoviedb.org/3/tv/{tv_id}?language=en-US&append_to_response=videos"
    url_ja = f"https://api.themoviedb.org/3/tv/{tv_id}?language=ja-JP&append_to_response=videos"

    data_fr = session.get(url_fr, timeout=10, verify=False).json() if True else {}
    data_en = session.get(url_en, timeout=10, verify=False).json() if True else {}
    data_ja = session.get(url_ja, timeout=10, verify=False).json() if True else {}

    # Extraction des bandes-annonces YouTube
    def extract_trailer_url(vid_data):
        videos = (vid_data.get("videos") or {}).get("results", [])
        trailers = [v for v in videos if v.get("site") == "YouTube" and v.get("type") in ["Trailer", "Teaser", "Opening"]]
        if trailers:
            return f"https://www.youtube.com/watch?v={trailers[0].get('key')}"
        return ""

    trailer_fr = extract_trailer_url(data_fr) or extract_trailer_url(data_main)
    trailer_en = extract_trailer_url(data_en) or extract_trailer_url(data_main)
    trailer_ja = extract_trailer_url(data_ja)

    # Extraction des créateurs / showrunners
    created_by = [c.get("name") for c in data_main.get("created_by", [])]
    if not created_by:
        crew = (data_main.get("credits") or {}).get("crew", [])
        created_by = [c.get("name") for c in crew if c.get("job") in ["Director", "Executive Producer", "Series Director"]]
    realisateur = ", ".join(created_by[:3]) if created_by else ""

    # Genres & Détection Animation / Animé
    genres = [g.get("name") for g in data_main.get("genres", [])]
    orig_lang = data_main.get("original_language", "en")
    origin_countries = data_main.get("origin_country", [])

    est_animation = any("anim" in g.lower() for g in genres) or (data_main.get("type") == "Animation")
    est_anime = est_animation and (orig_lang == "ja" or "JP" in origin_countries)

    # Saisons & Épisodes
    number_of_seasons = data_main.get("number_of_seasons", 1)
    number_of_episodes = data_main.get("number_of_episodes", 0)

    # Extraction des saisons
    saisons_liste = []
    for s in data_main.get("seasons", []):
        s_num = s.get("season_number")
        if s_num is not None:
            s_obj = {
                "numero": s_num,
                "nom": s.get("name") or f"Saison {s_num}",
                "nb_episodes": s.get("episode_count", 0),
                "date_diffusion": s.get("air_date", ""),
                "affiche_path": s.get("poster_path")
            }
            saisons_liste.append(s_obj)

    # Compléter avec les affiches de saisons si nécessaire
    has_orig = any(p.get("iso_639_1") and is_original_language_match(p.get("iso_639_1"), orig_lang) for p in images_all)
    if not has_orig and seasons_liste:
        for s in seasons_liste[:3]:
            s_num = s.get("numero")
            if s_num is not None:
                try:
                    s_resp = session.get(f"https://api.themoviedb.org/3/tv/{tv_id}/season/{s_num}/images", timeout=6, verify=False)
                    if s_resp.status_code == 200:
                        s_posters = s_resp.json().get("posters", [])
                        images_all.extend(s_posters)
                except Exception:
                    pass

    print(f"🎨 Traitement des affiches et palettes ({len(images_all)} affiches candidates)...")
    selected_textless = select_textless_posters(session, images_all, count=3)
    selected_origin = select_origin_posters(session, images_all, orig_lang, count=3)
    selected_world = select_world_posters(session, images_all, orig_lang, count=3)

    affiches_globales = selected_textless + selected_origin + selected_world

    # Fallback si aucune affiche n'a pu être sélectionnée
    if not affiches_globales and data_main.get("poster_path"):
        fallback_obj = build_poster_object(session, {"file_path": data_main.get("poster_path")}, "origine")
        if fallback_obj:
            affiches_globales.append(fallback_obj)

    episode_run_times = data_main.get("episode_run_time", [])
    duree_minutes = episode_run_times[0] if episode_run_times else 0

    networks = [n.get("name") for n in data_main.get("networks", []) if n.get("name")]
    studios = [c.get("name") for c in data_main.get("production_companies", []) if c.get("name")]

    serie_obj = {
        "id": data_main.get("id"),
        "est_serie": True,
        "type_media": "tv",
        "est_animation": est_animation,
        "est_anime": est_anime,
        "titre": data_fr.get("name") or data_main.get("name") or data_main.get("original_name"),
        "titre_en": data_en.get("name") or data_main.get("name"),
        "titre_ja": data_ja.get("name") or "",
        "titre_original": data_main.get("original_name"),
        "date_sortie": data_main.get("first_air_date", ""),
        "derniere_diffusion": data_main.get("last_air_date", ""),
        "statut": data_main.get("status", ""),
        "type_serie": data_main.get("type", ""),
        "genres": genres,
        "duree_minutes": duree_minutes,
        "nombre_saisons": number_of_seasons,
        "nombre_episodes": number_of_episodes,
        "nb_saisons": number_of_seasons,
        "nb_episodes": number_of_episodes,
        "createur": realisateur,
        "realisateur": realisateur,
        "reseaux": networks,
        "studios": studios,
        "langue_origine": orig_lang,
        "note_moyenne": round(data_main.get("vote_average", 0), 2),
        "popularite": round(data_main.get("popularity", 0), 2),
        "resume_fr": data_fr.get("overview") or data_main.get("overview", ""),
        "resume_en": data_en.get("overview") or "",
        "resume_ja": data_ja.get("overview") or "",
        "bande_annonce_url_fr": trailer_fr,
        "bande_annonce_url_en": trailer_en,
        "bande_annonce_url_ja": trailer_ja,
        "affiches_globales": affiches_globales,
        "saisons": saisons_liste,
        "v2_complete": True,
        "affiches_valides": len(affiches_globales),
        "statut_traitement": "valide"
    }

    return serie_obj


def fetch_tmdb_media_full(media_id: int, media_type: str = "movie", session: requests.Session = None) -> dict:
    """Aiguille vers l'extraction film ou série TV / animé selon le type de média."""
    if media_type == "tv":
        return fetch_tmdb_tv_full(media_id, session)
    return fetch_tmdb_movie_full(media_id, session)


# ─── CHARGEMENT & SAUVEGARDE DE LA BASE CINECHROMA ───────────────────

def load_database() -> list:
    """Charge l'ensemble des films depuis les fichiers partitionnés films_part1/2/3.json."""
    all_films = []
    for filepath in PART_FILES:
        if os.path.exists(filepath):
            with open(filepath, "r", encoding="utf-8") as f:
                films = json.load(f)
                all_films.extend(films)
                print(f"📖 Chargé : {os.path.basename(filepath)} ({len(films)} œuvres)")
    print(f"📊 Total œuvres en mémoire : {len(all_films)}")
    return all_films


def save_database(all_films: list):
    """
    Sauvegarde et partitionne équitablement l'ensemble des films
    dans films_part1.json, films_part2.json, films_part3.json.
    Utilise une écriture atomique (.tmp -> replace) pour éviter toute corruption.
    """
    total = len(all_films)
    chunk_size = (total + len(PART_FILES) - 1) // len(PART_FILES)

    print(f"\n💾 Sauvegarde de {total} œuvres réparties en {len(PART_FILES)} parties...")
    for idx, filepath in enumerate(PART_FILES):
        start = idx * chunk_size
        end = min((idx + 1) * chunk_size, total)
        part_data = all_films[start:end]

        tmp_path = filepath + ".tmp"
        with open(tmp_path, "w", encoding="utf-8") as f:
            json.dump(part_data, f, ensure_ascii=False, indent=2)
        
        for _ in range(5):
            try:
                os.replace(tmp_path, filepath)
                break
            except PermissionError:
                time.sleep(0.3)
        print(f"  ✅ {os.path.basename(filepath)} : {len(part_data)} œuvres sauvegardées.")


def search_tmdb_media(query: str, media_type: str = "all", year: str = None) -> list:
    """Recherche des films, séries ou animés sur TMDb par mot-clé."""
    session = get_tmdb_session()
    encoded_query = requests.utils.quote(query)

    if media_type == "movie":
        url = f"https://api.themoviedb.org/3/search/movie?query={encoded_query}&language=fr-FR&page=1"
        if year:
            url += f"&year={year}"
    elif media_type == "tv":
        url = f"https://api.themoviedb.org/3/search/tv?query={encoded_query}&language=fr-FR&page=1"
        if year:
            url += f"&first_air_date_year={year}"
    else:
        url = f"https://api.themoviedb.org/3/search/multi?query={encoded_query}&language=fr-FR&page=1"

    resp = session.get(url, timeout=10, verify=False)
    if resp.status_code == 200:
        raw_results = resp.json().get("results", [])
        clean_results = []
        for r in raw_results:
            m_type = r.get("media_type") or media_type
            if m_type not in ["movie", "tv"]:
                continue

            is_anim = 16 in r.get("genre_ids", [])
            orig_lang = r.get("original_language", "")
            is_anime = is_anim and (orig_lang == "ja" or "JP" in r.get("origin_country", []))

            clean_results.append({
                "id": r.get("id"),
                "media_type": m_type,
                "title": r.get("title") or r.get("name") or "Sans titre",
                "original_title": r.get("original_title") or r.get("original_name") or "",
                "release_date": r.get("release_date") or r.get("first_air_date") or "",
                "vote_average": round(r.get("vote_average", 0), 1),
                "poster_path": r.get("poster_path"),
                "overview": r.get("overview", ""),
                "is_anime": is_anime,
                "is_animation": is_anim
            })
        return clean_results
    return []


def search_tmdb_movies(query: str, year: str = None) -> list:
    """Alias rétrocompatible pour la recherche de films."""
    return search_tmdb_media(query, media_type="movie", year=year)
