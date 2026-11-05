from playwright.sync_api import sync_playwright

def inspect():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True, channel="chrome")
        page = browser.new_page(viewport={'width': 1280, 'height': 850})
        # Set dark theme in localStorage first to match user's screenshot
        page.add_init_script("localStorage.setItem('cinechroma_theme', 'dark');")
        page.goto("http://localhost:3000/game.html")
        page.wait_for_timeout(1000)
        page.click("#hub-card-af")
        page.wait_for_timeout(500)
        page.click("#config-start-btn")
        page.wait_for_timeout(1000)

        # Print layout info
        stage = page.query_selector(".af-stage")
        print("af-stage box:", stage.bounding_box())
        
        controls = page.query_selector(".af-stage-controls")
        print("controls box:", controls.bounding_box())

        af_choices = page.query_selector("#af-choices")
        print("af-choices box:", af_choices.bounding_box())
        print("af-choices computed style:", page.evaluate("el => ({display: getComputedStyle(el).display, gridTemplateColumns: getComputedStyle(el).gridTemplateColumns, height: getComputedStyle(el).height})", af_choices))

        btns = page.query_selector_all("#af-choices .game-choice-btn")
        for i, btn in enumerate(btns):
            box = btn.bounding_box()
            style = page.evaluate("el => ({display: getComputedStyle(el).display, height: getComputedStyle(el).height, width: getComputedStyle(el).width, flexDir: getComputedStyle(el).flexDirection, alignItems: getComputedStyle(el).alignItems, whiteSpace: getComputedStyle(el).whiteSpace})", btn)
            print(f"btn {i} box:", box)
            print(f"btn {i} style:", style)

        page.screenshot(path="scratch/dark_afficheflou.png")
        print("Saved scratch/dark_afficheflou.png")
        browser.close()

if __name__ == "__main__":
    inspect()
