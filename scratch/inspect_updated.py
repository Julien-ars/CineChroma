import json

with open('films_part1.json', 'r', encoding='utf-8') as f:
    films = json.load(f)

for f in films[:10]:
    orig_lang = f.get('langue_origine')
    affs = f.get('affiches_globales', [])
    print(f"=== {f.get('titre')} (Orig: {orig_lang}) ===")
    for a in affs:
        print(f"  [{a.get('type')}] iso:{a.get('iso_639_1')} -> {a.get('affiche_w500')}")
