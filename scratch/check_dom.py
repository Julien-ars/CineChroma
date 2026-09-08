import re

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

ids_in_html = set(re.findall(r'id=["\']([^"\']+)["\']', html))

with open('app.js', 'r', encoding='utf-8') as f:
    js = f.read()

# Find all dom definitions: dom = { ... }
dom_block = re.search(r'const dom = \{([\s\S]*?)\};', js)
if dom_block:
    matches = re.findall(r'(\w+):\s+\$\([\'"]#([a-zA-Z0-9_-]+)[\'"]\)', dom_block.group(1))
    print(f"Total DOM mappings defined: {len(matches)}")
    missing = []
    for var_name, elem_id in matches:
        if elem_id not in ids_in_html:
            missing.append((var_name, elem_id))
    print(f"Missing IDs in index.html ({len(missing)}):")
    for var_name, elem_id in missing:
        print(f"  - dom.{var_name} (expects #{elem_id})")

# Also check any direct $('#some-id') calls in app.js
direct_dollar = set(re.findall(r"\$\(['\"]#([a-zA-Z0-9_-]+)['\"]\)", js))
print(f"\nDirect $('#id') calls in app.js total: {len(direct_dollar)}")
missing_direct = [eid for eid in direct_dollar if eid not in ids_in_html]
print(f"Missing direct $('#id') elements ({len(missing_direct)}):")
for eid in missing_direct:
    print(f"  - #{eid}")
