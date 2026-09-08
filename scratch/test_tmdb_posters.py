import requests, json

token = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIyZDY4ZDgwMDBlMjNjY2E1Mzc4NDAxYmY5MDA0ZTg4NCIsIm5iZiI6MTc4NDU3ODY2MS45ODg5OTk4LCJzdWIiOiI2YTVlODI2NTFhODNiZTIyYWM0ZjYyN2QiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.fxMEYiohV7Ot3AuR1R5GxoMMROYjZmAUp1RMUJN_1Sg'
headers = {'Authorization': f'Bearer {token}', 'accept': 'application/json'}

def test_media(media_type, media_id, orig_lang, title):
    url = f"https://api.themoviedb.org/3/{media_type}/{media_id}/images"
    r = requests.get(url, headers=headers, timeout=10, verify=False)
    if r.status_code != 200:
        print(f"Error {r.status_code} for {title}")
        return
    posters = r.json().get('posters', [])
    print(f"\n==================== {title} ({media_type} {media_id}, orig: {orig_lang}) ====================")
    print(f"Total raw posters from TMDb: {len(posters)}")
    
    # 1. Textless (iso_639_1 is None or empty)
    textless = [p for p in posters if not p.get('iso_639_1')]
    
    # 2. Strict Origine (iso_639_1 == orig_lang, including zh/cn matching)
    def match_orig(lang):
        if not lang: return False
        l = lang.lower()
        o = orig_lang.lower()
        if o in ['zh', 'cn'] and l in ['zh', 'cn']: return True
        return l == o

    orig = [p for p in posters if match_orig(p.get('iso_639_1'))]
    
    # 3. World (iso_639_1 not matching orig_lang and not textless)
    world = [p for p in posters if p.get('iso_639_1') and not match_orig(p.get('iso_639_1'))]
    
    print(f"Textless count: {len(textless)}")
    print(f"Strict Origine count: {len(orig)} -> langs: {[p.get('iso_639_1') for p in orig[:5]]}")
    
    # Check world languages available
    world_langs = []
    seen = set()
    for p in world:
        l = p.get('iso_639_1')
        if l not in seen:
            seen.add(l)
            world_langs.append(l)
    print(f"World distinct languages available: {len(world_langs)} ({world_langs[:10]})")

test_media('tv', 46952, 'ja', 'Hunter x Hunter')
test_media('tv', 93405, 'ko', 'Squid Game')
test_media('tv', 70523, 'de', 'Dark')
test_media('tv', 71446, 'es', 'La Casa de Papel')
test_media('tv', 1399, 'en', 'Game of Thrones')
test_media('movie', 129, 'ja', 'Spirited Away')
test_media('movie', 496243, 'ko', 'Parasite')
test_media('movie', 1022789, 'en', 'Inside Out 2')
