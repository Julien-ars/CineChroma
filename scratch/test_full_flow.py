from playwright.sync_api import sync_playwright

def test_full_flow():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True, channel="chrome")
        
        # 1. Test Dark Mode AfficheFlou
        page = browser.new_page(viewport={'width': 1280, 'height': 850})
        page.add_init_script("localStorage.setItem('cinechroma_theme', 'dark');")
        page.goto("http://localhost:3000/game.html")
        page.wait_for_timeout(500)
        page.click("#hub-card-af")
        page.wait_for_timeout(300)
        page.click("#config-start-btn")
        page.wait_for_timeout(1500)
        
        # Test hint click
        page.click("#af-hint-btn")
        page.wait_for_timeout(400)
        page.screenshot(path="scratch/flow_af_hint.png")
        
        # Click first choice to see reveal state
        page.click("#af-choices .game-choice-btn:first-child")
        page.wait_for_timeout(600)
        page.screenshot(path="scratch/flow_af_revealed.png")
        
        # 2. Test CouleurQuiz
        page.goto("http://localhost:3000/game.html")
        page.wait_for_timeout(400)
        page.click("#hub-card-cq")
        page.wait_for_timeout(300)
        page.click("#config-start-btn")
        page.wait_for_timeout(1000)
        page.screenshot(path="scratch/flow_couleurquiz.png")
        
        # 3. Test PalettePure
        page.goto("http://localhost:3000/game.html")
        page.wait_for_timeout(400)
        page.click("#hub-card-pp")
        page.wait_for_timeout(300)
        page.click("#config-start-btn")
        page.wait_for_timeout(1000)
        page.screenshot(path="scratch/flow_palettepure.png")

        # 4. Test ChronoChroma
        page.goto("http://localhost:3000/game.html")
        page.wait_for_timeout(400)
        page.click("#hub-card-cc")
        page.wait_for_timeout(300)
        page.click("#config-start-btn")
        page.wait_for_timeout(1000)
        page.screenshot(path="scratch/flow_chronochroma.png")
        
        browser.close()
        print("All flows captured successfully!")

if __name__ == "__main__":
    test_full_flow()
