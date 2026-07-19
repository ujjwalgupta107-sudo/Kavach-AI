"""
Update demo user passwords to admin123.
"""
import asyncio
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

async def update_passwords():
    from app.models.user import User
    from app.core.security import get_password_hash
    from app.db.session import async_session_maker
    from sqlalchemy import select

    new_hash = get_password_hash("admin123")

    async with async_session_maker() as session:
        result = await session.execute(select(User))
        users = result.scalars().all()
        
        for user in users:
            user.password_hash = new_hash
        
        await session.commit()
        print(f"Updated {len(users)} users with password: admin123")

if __name__ == "__main__":
    asyncio.run(update_passwords())
