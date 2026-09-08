import json

targets = [496243, 129, 93405, 70523, 71446, 46298, 1022789]

for fn in ['films_part1.json', 'films_part2.json', 'films_part3.json']:
    with open(fn, 'r', encoding='utf-8') as f:
        films = json.load(f)
    for f in films:
        if f.get('id') in targets:
            print(f"=== {f.get('titre')} (ID {f.get('id')}) in {fn} ===")
            print(f"Orig lang: {f.get('langue_origine')}")
            for a in f.get('affiches_globales', []):
                cat = a.get('categorie') or a.get('type')
                iso = a.get('iso_639_1')
                url = a.get('affiche_w500')
                print(f"  [{cat}] iso:{iso} -> {url}")
