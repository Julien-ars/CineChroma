with open('style.css', 'r', encoding='utf-8') as f:
    for i, line in enumerate(f, 1):
        if '[data-theme="light"]' in line:
            for term in ['game', 'choice', 'screen', 'af-', 'cq-', 'pp-', 'chrono', 'hud', 'card', 'ticket']:
                if term in line.lower():
                    print(f"{i}: {line.strip()[:100]}")
                    break
