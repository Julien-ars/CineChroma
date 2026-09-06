"""
CineChroma — pipeline_core.py
Moteur d'extraction et de synchronisation des données films et palettes chromatiques TMDb.
"""

import json
import os
import time
from io import BytesIO
from collections import Counter
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


# ─── DÉDOUBLONNAGE VISUEL (pHash sur Zone Centrale) ─────────────────

def get_image_hash(session: requests.Session, file_path: str) -> str:
    """Calcule l'empreinte visuelle pHash sur la zone centrale de l'affiche (20% à 65%)."""
    if not file_path:
        return None
    if file_path in IMAGE_HASH_CACHE:
        return IMAGE_HASH_CACHE[file_path]

    url = f"https://image.tmdb.org/t/p/w185{file_path}"
    try:
        resp = session.get(url, timeout=6, verify=False)
        if resp.status_code == 200:
            img = Image.open(BytesIO(resp.content))
            w, h = img.size
            cropped = img.crop((0, int(h * 0.20), w, int(h * 0.65)))
            img_gray = cropped.convert("L").resize((8, 8))
            pixels = list(img_gray.getdata())
            avg = sum(pixels) / 64.0
            h_str = "".join(["1" if p > avg else "0" for p in pixels])
            IMAGE_HASH_CACHE[file_path] = h_str
            return h_str
    except Exception:
        pass
    return None


def are_visually_identical(hash1: str, hash2: str, threshold: int = 12) -> bool:
    """Distance de Hamming entre deux empreintes visuelles."""
    if not hash1 or not hash2:
        return False
    return sum(c1 != c2 for c1, c2 in zip(hash1, hash2)) <= threshold


# ─── SÉLECTION D'AFFICHES (TEXTLESS, ORIGINE, MONDE) ────────────────

def is_original_language_match(lang_code: str, orig_lang: str) -> bool:
    if not lang_code:
        return False
    lang_code = lang_code.lower()
    orig_lang = (orig_lang or "").lower()
    if orig_lang in ["zh", "cn"] and lang_code in ["zh", "cn"]:
        return True
    return lang_code == orig_lang


def select_textless_posters(session: requests.Session, posters: list, count: int = 3) -> list:
    candidates = [p for p in posters if p.get("iso_639_1") is None]
    selected = []
    seen_hashes = []

    for p in candidates:
        h = get_image_hash(session, p.get("file_path"))
        if h and any(are_visually_identical(h, sh) for sh in seen_hashes):
            continue
        selected.append(p)
        if h:
            seen_hashes.append(h)
        if len(selected) == count:
            break

    return selected


def select_origin_posters(session: requests.Session, posters: list, orig_lang: str, count: int = 3) -> list:
    """Sélectionne les affiches dans la langue originale, en français ou en anglais."""
    candidates = [
        p for p in posters
        if p.get("iso_639_1") and (
            is_original_language_match(p.get("iso_639_1"), orig_lang) or
            p.get("iso_639_1") in ["fr", "en"]
        )
    ]
    # Tri par note / vote_count
    candidates.sort(key=lambda p: (p.get("vote_average", 0), p.get("vote_count", 0)), reverse=True)

    selected = []
    seen_hashes = []
    for p in candidates:
        h = get_image_hash(session, p.get("file_path"))
        if h and any(are_visually_identical(h, sh) for sh in seen_hashes):
            continue
        selected.append(p)
        if h:
            seen_hashes.append(h)
        if len(selected) == count:
            break

    return selected


def select_world_posters(session: requests.Session, posters: list, orig_lang: str, count: int = 3) -> list:
    world_candidates = [
        p for p in posters
        if p.get("iso_639_1") and not is_original_language_match(p.get("iso_639_1"), orig_lang)
    ]
    if not world_candidates:
        return []

    selected = []
    selected_languages = set()
    selected_hashes = []

    for p in world_candidates:
        lang = p.get("iso_639_1", "").lower()
        if lang in selected_languages:
            continue
        h = get_image_hash(session, p.get("file_path"))
        if h and any(are_visually_identical(h, sh) for sh in selected_hashes):
            continue
        selected.append(p)
        selected_languages.add(lang)
        if h:
            selected_hashes.append(h)
        if len(selected) == count:
            break

    return selected


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
                    "affiche_w500": url_w500,
                    "affiche_original": url_original,
                    "palette": palette
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

    # 1. Requête principale avec crédits, vidéos et images
    url_main = f"https://api.themoviedb.org/3/movie/{movie_id}?append_to_response=credits,videos,images,release_dates&include_image_language=fr,en,ja,null"
    resp_main = session.get(url_main, timeout=12, verify=False)
    if resp_main.status_code != 200:
        print(f"❌ Film ID {movie_id} introuvable sur TMDb (code {resp_main.status_code}).")
        return None

    data_main = resp_main.json()

    # 2. Requêtes localisées (FR, EN, JA) pour les titres et résumés
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
    est_animation = any("anim" in g.lower() for g in genres)

    # Récupération et traitement des affiches
    images_all = (data_main.get("images") or {}).get("posters", [])
    orig_lang = data_main.get("original_language", "en")

    print(f"🎨 Traitement des affiches et palettes ({len(images_all)} affiches candidates)...")
    selected_textless = select_textless_posters(session, images_all, count=3)
    selected_origin = select_origin_posters(session, images_all, orig_lang, count=3)
    selected_world = select_world_posters(session, images_all, orig_lang, count=3)

    affiches_globales = []

    for p in selected_textless:
        obj = build_poster_object(session, p, "textless")
        if obj:
            affiches_globales.append(obj)

    for p in selected_origin:
        obj = build_poster_object(session, p, "origine")
        if obj:
            affiches_globales.append(obj)

    for p in selected_world:
        obj = build_poster_object(session, p, "monde")
        if obj:
            affiches_globales.append(obj)

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


# ─── CHARGEMENT & SAUVEGARDE DE LA BASE CINECHROMA ───────────────────

def load_database() -> list:
    """Charge l'ensemble des films depuis les fichiers partitionnés films_part1/2/3.json."""
    all_films = []
    for filepath in PART_FILES:
        if os.path.exists(filepath):
            with open(filepath, "r", encoding="utf-8") as f:
                films = json.load(f)
                all_films.extend(films)
                print(f"📖 Chargé : {os.path.basename(filepath)} ({len(films)} films)")
    print(f"📊 Total films en mémoire : {len(all_films)}")
    return all_films


def save_database(all_films: list):
    """
    Sauvegarde et partitionne équitablement l'ensemble des films
    dans films_part1.json, films_part2.json, films_part3.json.
    """
    total = len(all_films)
    chunk_size = (total + len(PART_FILES) - 1) // len(PART_FILES)

    print(f"\n💾 Sauvegarde de {total} films répartis en {len(PART_FILES)} parties...")
    for idx, filepath in enumerate(PART_FILES):
        start = idx * chunk_size
        end = min((idx + 1) * chunk_size, total)
        part_data = all_films[start:end]

        with open(filepath, "w", encoding="utf-8") as f:
            json.dump(part_data, f, ensure_ascii=False, indent=2)
        print(f"  ✅ {os.path.basename(filepath)} : {len(part_data)} films sauvegardés.")


def search_tmdb_movies(query: str, year: str = None) -> list:
    """Recherche des films sur TMDb par mot-clé."""
    session = get_tmdb_session()
    url = f"https://api.themoviedb.org/3/search/movie?query={requests.utils.quote(query)}&language=fr-FR&page=1"
    if year:
        url += f"&year={year}"

    resp = session.get(url, timeout=10, verify=False)
    if resp.status_code == 200:
        return resp.json().get("results", [])
    return []
