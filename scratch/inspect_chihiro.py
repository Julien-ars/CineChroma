import json

for fn in ['films_part1.json', 'films_part2.json', 'films_part3.json']:
    with open(fn, 'r', encoding='utf-8') as f:
        films = json.load(f)
    for f in films:
        if f.get('id') == 129:
            print(f"=== {f.get('titre')} (Orig: {f.get('langue_origine')}) in {fn} ===")
            for a in f.get('affiches_globales', []):
                print(f"  [{a.get('type')}] iso:{a.get('iso_639_1')} -> {a.get('affiche_w500')}")
