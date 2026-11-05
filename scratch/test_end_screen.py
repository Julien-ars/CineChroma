from playwright.sync_api import sync_playwright

def test_end_screen():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True, channel="chrome")
        page = browser.new_page(viewport={'width': 1280, 'height': 850})
        page.add_init_script("localStorage.setItem('cinechroma_theme', 'dark');")
        page.goto("http://localhost:3000/game.html")
        page.wait_for_timeout(500)
        page.click("#hub-card-af")
        page.wait_for_timeout(300)
        page.click("#config-start-btn")
        page.wait_for_timeout(1000)
        for i in range(5):
            page.wait_for_timeout(300)
            page.click("#af-choices .game-choice-btn:first-child")
            page.wait_for_timeout(300)
            page.click("#af-next-btn")
        page.wait_for_timeout(800)
        page.screenshot(path="scratch/flow_end_screen.png")
        browser.close()
        print("End screen captured successfully!")

if __name__ == "__main__":
    test_end_screen()
