import json

for fname in ['films_part1.json', 'films_part2.json', 'films_part3.json']:
    with open(fname, 'r', encoding='utf-8') as f:
        data = json.load(f)
    for m in data:
        t = m.get('titre', '') or ''
        if 'titans' in t.lower() or 'one piece' in t.lower():
            print(f"=== {m.get('titre')} (ID: {m.get('id')}, Type: {m.get('type_media')}) ===")
            for aff in m.get('affiches_globales', []):
                cat = aff.get('type') or aff.get('categorie')
                iso = aff.get('iso_639_1')
                url = aff.get('affiche_w500')
                pal = [c.get('hex') for c in aff.get('palette', [])]
                print(f"  Cat: {cat}, ISO: {iso}, URL: {url}")
                print(f"    Palette: {pal}")
