from playwright.sync_api import sync_playwright
import time

def test_gallery_and_modal():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True, channel="chrome")
        page = browser.new_page(viewport={'width': 1400, 'height': 900})
        
        page.goto("http://localhost:3000/")
        page.wait_for_selector("#splash-screen.hidden, #splash-screen[hidden], #film-grid:not([hidden])", timeout=20000)
        time.sleep(1)
        
        # Click on Explorer la galerie to scroll down
        page.click("#hero-cta-explore")
        time.sleep(1.5)
        page.screenshot(path="scratch/gallery_scrolled.png")
        
        # Click on the first film card
        first_card = page.locator(".film-card").first
        if first_card.is_visible():
            first_card.click()
            time.sleep(1)
            page.screenshot(path="scratch/modal_open.png")
            print("Modal screenshot saved.")
        else:
            print("No film card found.")
            
        browser.close()

if __name__ == "__main__":
    test_gallery_and_modal()
