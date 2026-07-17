from passlib.context import CryptContext
import sqlite3

ctx = CryptContext(schemes=["bcrypt"], deprecated="auto")

conn = sqlite3.connect("kavach_dev.db")
cur = conn.cursor()
cur.execute("SELECT email, password_hash FROM users WHERE email = 'investigator@kavach.ai'")
row = cur.fetchone()
conn.close()

if row:
    email, hash_val = row
    passwords_to_try = ["password123", "Test123", "test123", "password", "Password123", "admin123", "kavach123", "Kavach@123", "investigator123", "Investigator@123"]
    for pwd in passwords_to_try:
        result = ctx.verify(pwd, hash_val)
        if result:
            print(f"FOUND! Password for {email}: {pwd}")
            break
        else:
            print(f"  {pwd}: False")
    else:
        print(f"No password matched for {email}")
else:
    print("User not found")
