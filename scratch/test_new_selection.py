import requests, json
from io import BytesIO
from PIL import Image

token = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIyZDY4ZDgwMDBlMjNjY2E1Mzc4NDAxYmY5MDA0ZTg4NCIsIm5iZiI6MTc4NDU3ODY2MS45ODg5OTk4LCJzdWIiOiI2YTVlODI2NTFhODNiZTIyYWM0ZjYyN2QiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.fxMEYiohV7Ot3AuR1R5GxoMMROYjZmAUp1RMUJN_1Sg'
headers = {'Authorization': f'Bearer {token}', 'accept': 'application/json'}

def is_original_language_match(lang_code: str, orig_lang: str) -> bool:
    if not lang_code:
        return False
    lang_code = lang_code.lower()
    orig_lang = (orig_lang or "").lower()
    if orig_lang in ["zh", "cn"] and lang_code in ["zh", "cn"]:
        return True
    return lang_code == orig_lang

def select_origin_posters_new(posters: list, orig_lang: str, count: int = 3) -> list:
    """
    Sélectionne STRICTEMENT jusqu'à `count` affiches dans la véritable langue d'origine.
    Ne pollue JAMAIS la catégorie 'origine' avec de l'anglais ou du français si l'œuvre est japonaise/coréenne/allemande/etc.
    """
    # 1. Candidats stricts dans la langue d'origine
    orig_candidates = [
        p for p in posters
        if p.get("iso_639_1") and is_original_language_match(p.get("iso_639_1"), orig_lang)
    ]
    orig_candidates.sort(key=lambda p: (p.get("vote_average", 0), p.get("vote_count", 0)), reverse=True)

    # Éviter doublons exacts de file_path
    selected = []
    seen_paths = set()
    for p in orig_candidates:
        fp = p.get("file_path")
        if fp and fp not in seen_paths:
            seen_paths.add(fp)
            selected.append(p)
            if len(selected) == count:
                break
    return selected

def select_world_posters_new(posters: list, orig_lang: str, count: int = 3) -> list:
    """
    Sélectionne jusqu'à `count` affiches internationales de langues différentes,
    en excluant la langue d'origine et les textless.
    """
    world_candidates = [
        p for p in posters
        if p.get("iso_639_1") and not is_original_language_match(p.get("iso_639_1"), orig_lang)
    ]
    if not world_candidates:
        return []

    world_candidates.sort(key=lambda p: (p.get("vote_average", 0), p.get("vote_count", 0)), reverse=True)

    selected = []
    selected_languages = set()
    seen_paths = set()

    # Passe 1 : Priorité absolue à 3 langues/pays différents
    for p in world_candidates:
        lang = (p.get("iso_639_1") or "").lower()
        fp = p.get("file_path")
        if not lang or lang in selected_languages or fp in seen_paths:
            continue
        selected.append(p)
        selected_languages.add(lang)
        seen_paths.add(fp)
        if len(selected) == count:
            break

    # Passe 2 : Si moins de 3 langues existent dans le monde pour ce film, compléter avec les meilleures affiches restantes
    if len(selected) < count:
        for p in world_candidates:
            fp = p.get("file_path")
            if fp not in seen_paths:
                selected.append(p)
                seen_paths.add(fp)
                if len(selected) == count:
                    break

    return selected

def select_textless_posters_new(posters: list, count: int = 3) -> list:
    candidates = [p for p in posters if not p.get("iso_639_1")]
    candidates.sort(key=lambda p: (p.get("vote_average", 0), p.get("vote_count", 0)), reverse=True)
    selected = []
    seen_paths = set()
    for p in candidates:
        fp = p.get("file_path")
        if fp and fp not in seen_paths:
            seen_paths.add(fp)
            selected.append(p)
            if len(selected) == count:
                break
    return selected

# Test cases
test_cases = [
    ('tv', 46298, 'ja', 'Hunter x Hunter 2011'),
    ('tv', 93405, 'ko', 'Squid Game'),
    ('tv', 70523, 'de', 'Dark'),
    ('tv', 71446, 'es', 'La Casa de Papel'),
    ('movie', 129, 'ja', 'Spirited Away'),
    ('movie', 496243, 'ko', 'Parasite'),
    ('movie', 1022789, 'en', 'Inside Out 2'),
    ('movie', 1064486, 'en', 'Memoir of a Snail'),
]

for mtype, mid, orig_lang, title in test_cases:
    url = f"https://api.themoviedb.org/3/{mtype}/{mid}/images"
    r = requests.get(url, headers=headers, verify=False).json()
    posters = r.get('posters', [])
    
    # Also fetch season posters if TV
    if mtype == 'tv':
        # fetch season 1 as well if needed
        r_s = requests.get(f"https://api.themoviedb.org/3/tv/{mid}/season/1/images", headers=headers, verify=False).json()
        posters.extend(r_s.get('posters', []))
        
    orig = select_origin_posters_new(posters, orig_lang, 3)
    world = select_world_posters_new(posters, orig_lang, 3)
    textless = select_textless_posters_new(posters, 3)
    
    print(f"\n================ {title} ({mtype}, orig: {orig_lang}) ================")
    print(f"Orig posters ({len(orig)}): {[p.get('iso_639_1') for p in orig]}")
    print(f"World posters ({len(world)}): {[p.get('iso_639_1') for p in world]}")
    print(f"Textless posters ({len(textless)}): {[p.get('iso_639_1') for p in textless]}")
