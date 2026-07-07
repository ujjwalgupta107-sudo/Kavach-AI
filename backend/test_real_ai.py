import requests
import json
import os

BASE_URL = "http://localhost:8000/api/v1"

print("--- Testing /public/analyze ---")
res = requests.post(f"{BASE_URL}/public/analyze", json={
    "text": "Your Aadhaar has been linked to an illegal parcel. Transfer 50,000 immediately."
})
print(f"Status: {res.status_code}")
try:
    print(json.dumps(res.json(), indent=2))
except:
    print(res.text)

print("\n--- Testing /assistant/chat ---")
# Get token first
print("Getting token for citizen...")
login_res = requests.post(f"{BASE_URL}/auth/login", data={"username": "citizen@example.com", "password": "Password123!"})
token = ""
if login_res.status_code == 200:
    token = login_res.json()["token"]["access_token"]
    print("Logged in successfully.")
    
    res = requests.post(f"{BASE_URL}/assistant/chat", 
                        headers={"Authorization": f"Bearer {token}"},
                        json={"message": "What should I do if I get a scam call?"})
    print(f"Status: {res.status_code}")
    try:
        print(json.dumps(res.json(), indent=2))
    except:
        print(res.text)
else:
    print("Login failed, skipping assistant test.", login_res.status_code, login_res.text)

print("\n--- Testing /public/analyze-image ---")
with open("test_img.png", "wb") as f:
    f.write(b"fake image data")

with open("test_img.png", "rb") as f:
    res = requests.post(f"{BASE_URL}/public/analyze-image", files={"file": f})
    print(f"Status: {res.status_code}")
    print(res.text)
os.remove("test_img.png")
