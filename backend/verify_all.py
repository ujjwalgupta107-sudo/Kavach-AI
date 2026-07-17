import asyncio
from playwright.async_api import async_playwright
import json

async def run():
    report = {
        "ConsoleErrors": [],
        "LoginFlow": "PENDING",
        "Dashboard": "PENDING",
        "CaseList": "PENDING",
        "CaseDetail": "PENDING",
        "AlertCenter": "PENDING",
        "FraudGraph": "PENDING",
        "GeoMap": "PENDING",
        "CitizenFlow": "PENDING"
    }

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()

        # Catch console errors
        page.on("console", lambda msg: report["ConsoleErrors"].append(msg.text) if msg.type == "error" else None)

        try:
            # 1. Login Flow
            await page.goto("http://localhost:5173/login")
            await page.fill("input[type='text']", "admin@kavach.ai")
            await page.fill("input[type='password']", "admin123")
            await page.click("button[type='submit']")
            await page.wait_for_url("**/intelligence")
            report["LoginFlow"] = "PASS"

            # 2. Dashboard
            await page.wait_for_selector("text=Active High-Risk Cases")
            await page.wait_for_selector("text=New Reports Today")
            report["Dashboard"] = "PASS"

            # 3. Case List & Case Detail
            await page.goto("http://localhost:5173/intelligence/cases")
            await page.wait_for_selector("tbody tr") # Wait for rows
            await page.click("tbody tr:first-child") # Click first row
            await page.wait_for_selector("text=RISK", timeout=5000)
            report["CaseList"] = "PASS"
            report["CaseDetail"] = "PASS"

            # 4. Alert Center
            await page.goto("http://localhost:5173/intelligence/alerts")
            await page.wait_for_selector("text=Alert Centre")
            report["AlertCenter"] = "PASS"

            # 5. Fraud Graph
            await page.goto("http://localhost:5173/intelligence/network")
            await page.wait_for_selector("text=Fraud Network Explorer")
            report["FraudGraph"] = "PASS"

            # 6. Geo Map
            await page.goto("http://localhost:5173/intelligence/map")
            await page.wait_for_selector("text=Geospatial Intelligence")
            report["GeoMap"] = "PASS"

            # 7. Citizen Flow
            await page.goto("http://localhost:5173/shield")
            await page.fill("textarea", "This is CBI. Your Aadhaar is linked to an illegal parcel. Do not tell anyone. Transfer Rs 50000 to verify.case@upi or you will be arrested.")
            await page.click("button:has-text('Analyze')")
            await page.wait_for_selector("text=RISK", timeout=15000)
            report["CitizenFlow"] = "PASS"

        except Exception as e:
            report["Error"] = str(e)
            print(f"Exception during test: {e}")
            await page.screenshot(path="error.png")

        finally:
            await browser.close()
            with open("ui_test_report.json", "w") as f:
                json.dump(report, f, indent=2)
            print(json.dumps(report, indent=2))

asyncio.run(run())
