from playwright.sync_api import sync_playwright
import time
import os

def test():
    with sync_playwright() as p:
        try:
            browser = p.chromium.launch(headless=True, channel="msedge")
        except Exception:
            browser = p.chromium.launch(headless=True, channel="chrome")
        context = browser.new_context(viewport={'width': 1280, 'height': 850})
        page = context.new_page()

        console_messages = []
        page.on("console", lambda msg: console_messages.append(f"[{msg.type}] {msg.text}"))
        page.on("pageerror", lambda err: console_messages.append(f"[ERROR] {err}"))

        print("Navigating to http://localhost:3000/game.html ...")
        page.goto("http://localhost:3000/game.html", wait_until="networkidle")
        time.sleep(2)

        # Take screenshot of Hub
        os.makedirs("scratch", exist_ok=True)
        page.screenshot(path="scratch/hub_screenshot.png")
        print("Hub screenshot taken.")

        # Click on AfficheFlou card
        print("Clicking #hub-card-af ...")
        page.click("#hub-card-af")
        time.sleep(1)

        # Click "Lancer la partie"
        print("Clicking #config-start-btn ...")
        page.click("#config-start-btn")
        time.sleep(1.5)

        # Screenshot of in-game AfficheFlou
        page.screenshot(path="scratch/afficheflou_gameplay.png")
        print("AfficheFlou gameplay screenshot taken.")

        # Check choices
        choices = page.query_selector_all("#af-choices .game-choice-btn")
        print(f"Found {len(choices)} choices in AfficheFlou.")

        if choices:
            # Click first choice to see answer state
            print("Clicking first choice...")
            choices[0].click()
            time.sleep(1)
            page.screenshot(path="scratch/afficheflou_answered.png")
            print("AfficheFlou answered screenshot taken.")

        browser.close()

        print("\n--- Console logs ---")
        for log in console_messages:
            if "error" in log.lower() or "warn" in log.lower():
                print(log)

if __name__ == "__main__":
    test()
