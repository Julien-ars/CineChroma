import requests, json
import numpy as np
from io import BytesIO
from PIL import Image

token = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIyZDY4ZDgwMDBlMjNjY2E1Mzc4NDAxYmY5MDA0ZTg4NCIsIm5iZiI6MTc4NDU3ODY2MS45ODg5OTk4LCJzdWIiOiI2YTVlODI2NTFhODNiZTIyYWM0ZjYyN2QiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.fxMEYiohV7Ot3AuR1R5GxoMMROYjZmAUp1RMUJN_1Sg'
headers = {'Authorization': f'Bearer {token}', 'accept': 'application/json'}

def is_original_language_match(lang_code, orig_lang):
    if not lang_code: return False
    lang_code = lang_code.lower()
    orig_lang = (orig_lang or "").lower()
    if orig_lang in ["zh", "cn"] and lang_code in ["zh", "cn"]:
        return True
    return lang_code == orig_lang

def calculer_dhash(img, hash_size=8):
    try:
        img_gray = img.convert('L').resize((hash_size + 1, hash_size), Image.Resampling.LANCZOS)
        pixels = np.array(img_gray)
        diff = pixels[:, 1:] > pixels[:, :-1]
        return diff
    except Exception:
        return None

def sont_affiches_trop_similaires(hash1, palette1, hash2, palette2, seuil_hash=10, seuil_couleur=25.0):
    if hash1 is not None and hash2 is not None:
        distance_hamming = np.count_nonzero(hash1 != hash2)
        if distance_hamming < seuil_hash:
            return True
            
    if palette1 and palette2:
        hex1 = palette1[0].get("hex") if isinstance(palette1[0], dict) else palette1[0]
        hex2 = palette2[0].get("hex") if isinstance(palette2[0], dict) else palette2[0]
        if hex1.startswith('#'): hex1 = hex1[1:]
        if hex2.startswith('#'): hex2 = hex2[1:]
        r1, g1, b1 = int(hex1[0:2], 16), int(hex1[2:4], 16), int(hex1[4:6], 16)
        r2, g2, b2 = int(hex2[0:2], 16), int(hex2[2:4], 16), int(hex2[4:6], 16)
        dist_couleur = np.sqrt((r1 - r2)**2 + (g1 - g2)**2 + (b1 - b2)**2)
        if dist_couleur < seuil_couleur:
            return True
            
    return False

import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)) + "/..")
from scripts.pipeline_core import extract_improved_palette

def traiter_categorie_notebook(session, posters_cat, nom_categorie, max_affiches=3):
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
            resp = session.get(url_w500, timeout=10, verify=False)
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
        except Exception as e:
            continue

    # --- PASSE 2 : Levée du filtre de couleur si < 3 affiches ---
    if len(res) < max_affiches:
        for item in candidats_evalues:
            if len(res) >= max_affiches:
                break
            if any(r["file_path"] == item["file_path"] for r in res):
                continue

            est_doublon_exact = False
            for h_exist in hashes:
                if np.count_nonzero(item["hash"] != h_exist) < 6:
                    est_doublon_exact = True
                    break

            if not est_doublon_exact:
                res.append(item)
                hashes.append(item["hash"])

    for item in res:
        item.pop("file_path", None)
        item.pop("hash", None)

    return res

session = requests.Session()
session.headers.update(headers)

# Test Chihiro (129)
res = session.get("https://api.themoviedb.org/3/movie/129/images", verify=False).json()
posters = res.get("posters", [])
orig_lang = "ja"

cat_textless = [p for p in posters if p.get('iso_639_1') is None]
cat_origine = [p for p in posters if is_original_language_match(p.get('iso_639_1'), orig_lang)]

# World posters : round robin or grouped by distinct foreign languages
world_candidates = [p for p in posters if p.get('iso_639_1') and not is_original_language_match(p.get('iso_639_1'), orig_lang)]
# Priorité aux langues différentes
ordered_langs = []
for p in world_candidates:
    l = p.get('iso_639_1').lower()
    if l not in ordered_langs:
        ordered_langs.append(l)

# Prendre le meilleur poster de chaque langue
cat_monde = []
for l in ordered_langs:
    best_p = next(p for p in world_candidates if p.get('iso_639_1').lower() == l)
    cat_monde.append(best_p)

textless = traiter_categorie_notebook(session, cat_textless, "textless", 3)
origine = traiter_categorie_notebook(session, cat_origine, "origine", 3)
monde = traiter_categorie_notebook(session, cat_monde, "monde", 3)

print("=== CHIHIRO NOTEBOOK FILTERS ===")
print("Textless:", len(textless), [p['affiche_w500'] for p in textless])
print("Origine:", len(origine), [(p['iso_639_1'], p['affiche_w500']) for p in origine])
print("Monde:", len(monde), [(p['iso_639_1'], p['affiche_w500']) for p in monde])
