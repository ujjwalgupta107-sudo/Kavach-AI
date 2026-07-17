import httpx
import json

base_url = "http://localhost:8000/api/v1"

def print_section(title):
    print(f"\n{'='*20} {title} {'='*20}")

def run_tests():
    # 1. Login
    print_section("Auth")
    r_inv = httpx.post(f"{base_url}/auth/login", data={"username": "investigator@kavach.ai", "password": "admin123"})
    inv_token = r_inv.json()["token"]["access_token"]
    print("Investigator Token:", inv_token[:20] + "...")

    r_cit = httpx.post(f"{base_url}/auth/login", data={"username": "citizen@example.com", "password": "test1234"})
    cit_token = r_cit.json()["token"]["access_token"]
    print("Citizen Token:", cit_token[:20] + "...")

    inv_headers = {"Authorization": f"Bearer {inv_token}"}
    cit_headers = {"Authorization": f"Bearer {cit_token}"}

    # 2. Citizen Auth
    print_section("Citizen Authorization")
    r = httpx.get(f"{base_url}/cases/", headers=cit_headers)
    if r.status_code == 200:
        print(f"Citizen Cases count: {r.json()['total']}")
    else:
        print(f"Citizen Cases err: {r.status_code} {r.text}")

    # 3. Text Scam Analysis
    print_section("Text Scam Analysis")
    text_scam = "This is CBI. A parcel linked to your Aadhaar contains illegal substances. Do not tell your family. Transfer Rs 50,000 to secureverify@upi for verification or you will be arrested."
    r_scam = httpx.post(f"{base_url}/analysis/text", headers=cit_headers, json={"text": text_scam})
    print(f"Scam Analysis ({r_scam.status_code}):", json.dumps(r_scam.json(), indent=2) if r_scam.status_code == 200 else r_scam.text)

    # 4. Case creation pipeline
    print_section("Case Creation")
    case_data = {
        "scam_type": "DIGITAL_ARREST",
        "description": text_scam,
        "report_location": "Delhi"
    }
    r_case = httpx.post(f"{base_url}/cases/", headers=cit_headers, json=case_data)
    if r_case.status_code == 200 or r_case.status_code == 201:
        print("Case created successfully.")
        case_id = r_case.json()["id"]
        
        # Verify DB state for this case
        print(f"Checking DB state for case: {case_id}")
    else:
        print(f"Case creation failed: {r_case.status_code} {r_case.text}")
        case_id = None

    # 5. Dashboard
    print_section("Dashboard")
    r_dash = httpx.get(f"{base_url}/dashboard/stats", headers=inv_headers)
    print(f"Dashboard Stats ({r_dash.status_code}):", r_dash.json() if r_dash.status_code == 200 else r_dash.text)

    # 6. Graph
    print_section("Graph")
    r_graph = httpx.get(f"{base_url}/intelligence/graph?depth=1", headers=inv_headers)
    print(f"Graph ({r_graph.status_code}):", "Success (Nodes: " + str(len(r_graph.json().get("nodes", []))) + ")" if r_graph.status_code == 200 else r_graph.text)

    # 7. Geo
    print_section("Geo")
    r_geo = httpx.get(f"{base_url}/geo/hotspots", headers=inv_headers)
    print(f"Geo Hotspots ({r_geo.status_code}):", r_geo.json() if r_geo.status_code == 200 else r_geo.text)

    # 8. Live WebSocket route existence
    print_section("Live Analysis WebSocket")
    import websockets
    import asyncio
    async def test_ws():
        try:
            async with websockets.connect(f"ws://localhost:8000/api/v1/analysis/live/ws?token={cit_token}") as ws:
                await ws.send("Hello")
                res = await ws.recv()
                print("WS response:", res)
        except Exception as e:
            print("WS error:", e)
    asyncio.run(test_ws())

if __name__ == "__main__":
    run_tests()
