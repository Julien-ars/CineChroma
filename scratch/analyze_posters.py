import json

for fn in ['films_part1.json', 'films_part2.json', 'films_part3.json']:
    with open(fn, 'r', encoding='utf-8') as f:
        films = json.load(f)
    print(f"\n==================== {fn} ====================")
    
    non_en_count = 0
    orig_mismatch_count = 0
    world_len_distribution = {}
    
    for f in films:
        orig_lang = (f.get('langue_origine') or f.get('original_language') or '').lower()
        affs = f.get('affiches_globales') or f.get('affiches') or []
        
        orig_posters = [a for a in affs if (a.get('type') or a.get('categorie')) == 'origine']
        world_posters = [a for a in affs if (a.get('type') or a.get('categorie')) == 'monde']
        
        w_len = len(world_posters)
        world_len_distribution[w_len] = world_len_distribution.get(w_len, 0) + 1
        
        if orig_lang and orig_lang not in ['en', 'xx']:
            non_en_count += 1
            # Check if posters have iso_639_1 matching orig_lang
            poster_langs = [(a.get('iso_639_1') or '').lower() for a in orig_posters]
            # Does it have any matching?
            has_match = any(l == orig_lang or (orig_lang in ['zh', 'cn'] and l in ['zh', 'cn']) for l in poster_langs)
            if not has_match and len(orig_posters) > 0:
                orig_mismatch_count += 1
                if orig_mismatch_count <= 10:
                    print(f"Mismatch: ID {f.get('id')} '{f.get('titre')}' | orig_lang={orig_lang} | poster_langs={poster_langs} | is_serie={f.get('est_serie')} | is_anime={f.get('est_anime')}")

    print(f"Total non-EN items: {non_en_count}")
    print(f"Total with mismatch in 'origine' posters: {orig_mismatch_count} / {non_en_count} ({orig_mismatch_count/non_en_count*100:.1f}%)")
    print(f"World posters length distribution: {world_len_distribution}")
