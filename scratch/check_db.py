import json, glob

for fn in ['films_part1.json', 'films_part2.json', 'films_part3.json']:
    with open(fn, 'r', encoding='utf-8') as f:
        films = json.load(f)
    print(f"=== {fn} ===")
    count_non_en = 0
    for item in films:
        orig_lang = item.get('langue_origine')
        affiches = item.get('affiches_globales') or item.get('affiches') or []
        orig_posters = [a for a in affiches if a.get('type') == 'origine']
        world_posters = [a for a in affiches if a.get('type') == 'monde']
        textless_posters = [a for a in affiches if a.get('type') == 'textless']
        
        # Check if anime or non-en
        if orig_lang and orig_lang not in ['en', 'fr'] and (item.get('est_serie') or item.get('est_anime') or '2024' in str(item.get('date_sortie', '')) or '2025' in str(item.get('date_sortie', ''))):
            orig_langs = [a.get('iso_639_1') for a in orig_posters]
            world_langs = [a.get('iso_639_1') for a in world_posters]
            print(f"ID:{item.get('id')} '{item.get('titre')}' (Orig: {orig_lang}, is_tv:{item.get('est_serie')}, is_anime:{item.get('est_anime')})")
            print(f"   Orig posters ({len(orig_posters)}): {orig_langs}")
            print(f"   World posters ({len(world_posters)}): {world_langs}")
            print(f"   Textless ({len(textless_posters)})")
            count_non_en += 1
            if count_non_en >= 5:
                break
