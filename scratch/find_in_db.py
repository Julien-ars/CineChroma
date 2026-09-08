import json

for part in ['films_part1.json', 'films_part2.json', 'films_part3.json']:
    with open(part, 'r', encoding='utf-8') as f:
        data = json.load(f)
    for m in data:
        t = (m.get('titre') or '').lower()
        if 'attaque des titans' in t or 'shingeki' in t or t == 'one piece':
            print(f"=== {part}: {m.get('titre')} - ID {m.get('id')} ({m.get('type_media')}) ===")
            for i, a in enumerate(m.get('affiches_globales', [])):
                print(f"  [{i+1}] {a.get('type') or a.get('categorie')} | {a.get('affiche_w500')}")
                print(f"      palette: {[c.get('hex') for c in a.get('palette', [])]}")
