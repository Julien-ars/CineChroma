from playwright.sync_api import sync_playwright
import time

def test_home():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True, channel="chrome")
        page = browser.new_page(viewport={'width': 1400, 'height': 900})
        
        console_logs = []
        errors = []
        page.on("console", lambda msg: console_logs.append(f"[{msg.type}] {msg.text}"))
        page.on("pageerror", lambda err: errors.append(str(err)))
        
        t0 = time.time()
        print("Navigating to http://localhost:3000/ ...")
        page.goto("http://localhost:3000/")
        
        # Wait for splash screen to disappear or timeout
        try:
            page.wait_for_selector("#splash-screen[hidden]", timeout=15000)
            t1 = time.time()
            print(f"Splash screen hidden in {t1 - t0:.2f}s")
        except Exception as e:
            print("Splash screen wait timeout:", e)
        
        time.sleep(2)
        page.screenshot(path="scratch/homepage_loaded.png")
        print("Screenshot saved to scratch/homepage_loaded.png")
        
        print(f"Errors count: {len(errors)}")
        for err in errors:
            print("ERROR:", err)
        print(f"Console messages ({len(console_logs)}):")
        for log in console_logs[:15]:
            print("LOG:", log)
            
        browser.close()

if __name__ == "__main__":
    test_home()
