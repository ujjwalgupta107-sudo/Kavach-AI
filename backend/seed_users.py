"""
Seed demo users into existing database.
"""
import asyncio
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

async def seed():
    from app.models.user import User, UserRole
    from app.core.security import get_password_hash
    from app.db.session import async_session_maker
    from sqlalchemy import select

    async with async_session_maker() as session:
        # Check if investigator already exists
        result = await session.execute(select(User).where(User.email == "investigator@kavach.ai"))
        existing = result.scalar_one_or_none()
        
        if existing:
            print("Demo users already exist. Skipping seed.")
            return
        
        investigator = User(
            email="investigator@kavach.ai",
            full_name="Demo Investigator",
            password_hash=get_password_hash("password"),
            role=UserRole.INVESTIGATOR,
            is_active=True,
            is_verified=True,
        )
        
        citizen = User(
            email="citizen@kavach.ai",
            full_name="Demo Citizen",
            password_hash=get_password_hash("password"),
            role=UserRole.CITIZEN,
            is_active=True,
            is_verified=True,
        )
        
        admin = User(
            email="admin@kavach.ai",
            full_name="Admin User",
            password_hash=get_password_hash("password"),
            role=UserRole.ADMIN,
            is_active=True,
            is_verified=True,
        )
        
        session.add_all([investigator, citizen, admin])
        await session.commit()
        
        print("Demo users created:")
        print("  investigator@kavach.ai / password  (INVESTIGATOR)")
        print("  citizen@kavach.ai / password  (CITIZEN)")
        print("  admin@kavach.ai / password  (ADMIN)")

if __name__ == "__main__":
    asyncio.run(seed())
    print("Database seed complete!")
