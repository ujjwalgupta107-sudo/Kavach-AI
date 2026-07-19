"""
Setup script for Kavach AI Backend.
Creates all database tables and seeds demo users.
Run: python setup_db.py
"""
import asyncio
import sys
import os

# Ensure we can import the app package
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

async def setup():
    from app.core.config import settings
    from app.db.session import engine
    from app.db.base import Base
    
    # Import all models so they register with Base.metadata
    from app.models.user import User, UserRole
    from app.models.case import Case, Evidence, CaseTimelineEvent
    from app.models.entity import Entity, FraudCluster, CaseEntityLink
    from app.models.analysis import AnalysisResult, RedFlag, RecommendedAction
    from app.models.alert import Alert
    from app.models.audit import AuditLog, InvestigatorNote
    from app.models.agent_run import AgentRun, AgentFinding
    from app.core.security import get_password_hash
    from app.db.session import async_session_maker

    print(f"Database URL: {settings.DATABASE_URL}")
    print("Creating all tables...")

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    print("✅ Tables created successfully!")

    # Seed demo users
    async with async_session_maker() as session:
        from sqlalchemy import select
        
        # Check if investigator already exists
        result = await session.execute(select(User).where(User.email == "investigator@kavach.ai"))
        existing = result.scalar_one_or_none()
        
        if existing:
            print("Demo users already exist. Skipping seed.")
            return
        
        # Create demo investigator
        investigator = User(
            email="investigator@kavach.ai",
            full_name="Demo Investigator",
            password_hash=get_password_hash("admin123"),
            role=UserRole.INVESTIGATOR,
            is_active=True,
            is_verified=True,
        )
        
        # Create demo citizen
        citizen = User(
            email="citizen@example.com",
            full_name="Demo Citizen",
            password_hash=get_password_hash("password123"),
            role=UserRole.CITIZEN,
            is_active=True,
            is_verified=True,
        )
        
        # Create demo admin
        admin = User(
            email="admin@kavach.ai",
            full_name="Admin User",
            password_hash=get_password_hash("admin123"),
            role=UserRole.ADMIN,
            is_active=True,
            is_verified=True,
        )
        
        session.add_all([investigator, citizen, admin])
        await session.commit()
        
        print("✅ Demo users created:")
        print("   📧 investigator@kavach.ai / admin123  (INVESTIGATOR)")
        print("   📧 citizen@example.com / password123  (CITIZEN)")
        print("   📧 admin@kavach.ai / admin123  (ADMIN)")

if __name__ == "__main__":
    asyncio.run(setup())
    print("\n🎉 Database setup complete! You can now start the backend.")
