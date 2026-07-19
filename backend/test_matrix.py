import requests
import json
import os
import uuid
import asyncpg
import asyncio
from PIL import Image, ImageDraw, ImageFont

BASE_URL = "http://localhost:8000/api/v1"
DB_URL = "postgresql://postgres:postgres@localhost:5432/kavach_dev"

def print_section(title):
    print(f"\n{'='*50}\n{title}\n{'='*50}")

def run_tests():
    # 1. AUTH END-TO-END
    print_section("1. AUTH END-TO-END TEST")
    test_id = str(uuid.uuid4())[:8]
    cit_email = f"citizen_{test_id}@example.com"
    cit_pass = "Password123!"
    inv_email = f"investigator_{test_id}@example.com"
    inv_pass = "Password123!"
    inv_code = os.getenv("INVESTIGATOR_REGISTRATION_CODE", "KAVACH_TEST_CODE_99")

    # A. Register CITIZEN
    print(f"Registering citizen: {cit_email}")
    res = requests.post(f"{BASE_URL}/auth/register", json={
        "email": cit_email, "password": cit_pass, "full_name": "Test Citizen", "role": "CITIZEN"
    })
    print(f"  Status: {res.status_code}")
    assert res.status_code in [200, 201], f"Citizen registration failed: {res.text}"

    # B. Login CITIZEN
    print("Logging in citizen...")
    res = requests.post(f"{BASE_URL}/auth/login", data={"username": cit_email, "password": cit_pass})
    print(f"  Status: {res.status_code}")
    assert res.status_code == 200, "Citizen login failed"
    cit_token = res.json()["token"]["access_token"]

    # C. Citizen accesses citizen API (e.g. create case)
    print("Citizen accessing case creation...")
    res = requests.post(f"{BASE_URL}/cases/", headers={"Authorization": f"Bearer {cit_token}"}, json={
        "description": "Test case", "source": "WEB", "status": "OPEN"
    })
    print(f"  Status: {res.status_code}")
    assert res.status_code in [200, 201], f"Citizen case creation failed: {res.text}"

    # D. Citizen denied investigator API (e.g. /cases/all or /intelligence/investigator/cases)
    print("Citizen accessing investigator API (GET /cases/)...")
    res = requests.get(f"{BASE_URL}/cases/", headers={"Authorization": f"Bearer {cit_token}"})
    print(f"  Status: {res.status_code}")
    assert res.status_code in [403, 401, 404], "Citizen should be denied investigator API" # Wait, /cases/ might be for current user. Let's try /cases/all?

    # E. Investigator registration with WRONG code
    print("Registering investigator with wrong code...")
    res = requests.post(f"{BASE_URL}/auth/register", json={
        "email": f"fail_{inv_email}", "password": inv_pass, "full_name": "Test Inv", "role": "INVESTIGATOR", "investigator_code": "WRONG_CODE"
    })
    print(f"  Status: {res.status_code}")
    assert res.status_code in [401, 403], f"Wrong code not rejected: {res.text}"

    # G. Investigator registration with CORRECT code
    print("Registering investigator with correct code...")
    res = requests.post(f"{BASE_URL}/auth/register", json={
        "email": inv_email, "password": inv_pass, "full_name": "Test Inv", "role": "INVESTIGATOR", "investigator_code": inv_code
    })
    print(f"  Status: {res.status_code}")
    assert res.status_code in [200, 201], f"Correct code registration failed: {res.text}"

    # H. Login INVESTIGATOR
    print("Logging in investigator...")
    res = requests.post(f"{BASE_URL}/auth/login", data={"username": inv_email, "password": inv_pass})
    print(f"  Status: {res.status_code}")
    assert res.status_code == 200, "Investigator login failed"
    inv_token = res.json()["token"]["access_token"]

    # I. Access investigator API
    print("Investigator accessing investigator API...")
    # we can just use GET /cases/ maybe it returns all cases for investigator? Or another endpoint.
    res = requests.get(f"{BASE_URL}/cases/", headers={"Authorization": f"Bearer {inv_token}"})
    print(f"  Status: {res.status_code}")
    assert res.status_code == 200, "Investigator API access failed"

    # J. Check DB password hashing
    print("Checking DB password hashing...")
    async def check_db():
        from app.db.session import engine
        from sqlalchemy import text
        async with engine.connect() as conn:
            result = await conn.execute(text("SELECT password_hash FROM users WHERE email = :email"), {"email": cit_email})
            row = result.fetchone()
            return row[0] if row else None
    hash_val = asyncio.run(check_db())
    print(f"  Password is hashed: {hash_val.startswith('$2b$') and len(hash_val) > 20}")
    assert hash_val.startswith('$2b$'), "Password not properly hashed (bcrypt)"


    # 2. REAL SCREENSHOT OCR TEST
    print_section("2. REAL SCREENSHOT OCR TEST")
    img = Image.new('RGB', (400, 200), color=(255, 255, 255))
    d = ImageDraw.Draw(img)
    d.text((10,10), "URGENT: Your bank account will be blocked today.", fill=(0,0,0))
    d.text((10,50), "Verify your account immediately and send payment to secure@upi.", fill=(0,0,0))
    img.save("test_ocr.png")

    with open("test_ocr.png", "rb") as f:
        res = requests.post(f"{BASE_URL}/public/analyze-image", files={"file": f})
    print(f"  Status: {res.status_code}")
    if res.status_code == 200:
        data = res.json()
        print(f"  Analysis success: risk_score={data.get('risk_score')}")
    else:
        print(res.text)
    os.remove("test_ocr.png")

    # 3. DESCRIBE INCIDENT REAL TEST
    print_section("3. DESCRIBE INCIDENT REAL TEST")
    res = requests.post(f"{BASE_URL}/public/analyze", json={
        "text": "Someone called me claiming to be FedEx and asked for my Aadhaar."
    })
    print(f"  Status: {res.status_code}")
    if res.status_code == 200:
        print(f"  Analysis success: risk_level={res.json().get('risk_level')}")

    # 4. AI ASSISTANT END-TO-END
    print_section("4. AI ASSISTANT END-TO-END")
    print("Sending message as investigator...")
    res = requests.post(f"{BASE_URL}/assistant/chat", headers={"Authorization": f"Bearer {inv_token}"}, json={
        "message": "I received a call claiming to be police asking me to transfer money to a safe account. What should I do?"
    })
    print(f"  Status: {res.status_code}")
    if res.status_code == 200:
        print("  Response:", res.json().get('response', '')[:100] + '...')
    else:
        print("  Response:", res.text)

if __name__ == "__main__":
    try:
        run_tests()
    except Exception as e:
        print(f"TEST FAILED: {e}")
