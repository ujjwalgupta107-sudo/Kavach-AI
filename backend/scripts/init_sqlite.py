import asyncio
import uuid
import random
from datetime import datetime, timezone, timedelta
from passlib.context import CryptContext

# Import SQLAlchemy and session settings
from app.db.session import async_session_maker, engine
from app.db.base import Base

# Import all models to register them on the Base metadata
from app.models.user import User, UserRole
from app.models.case import Case, CaseStatus, ScamType, RiskLevel, CaseTimelineEvent
from app.models.entity import Entity, EntityType, CaseEntityLink, FraudCluster
from app.models.analysis import AnalysisResult
from app.models.alert import Alert, AlertType, AlertSeverity
from app.models.agent_run import AgentRun, AgentFinding
from app.models.audit import InvestigatorNote

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

async def init_db():
    print("Creating SQLite database tables...")
    async with engine.begin() as conn:
        # Drop all tables first for a clean state
        await conn.run_sync(Base.metadata.drop_all)
        # Create all tables
        await conn.run_sync(Base.metadata.create_all)
    print("Tables created successfully.")

    print("Seeding demo data...")
    async with async_session_maker() as db:
        # Create default users
        admin = User(
            email="admin@kavach.ai",
            password_hash=get_password_hash("admin123"),
            role=UserRole.ADMIN,
            full_name="Kavach Admin",
            is_active=True,
            is_verified=True
        )
        investigator = User(
            email="investigator@kavach.ai",
            password_hash=get_password_hash("admin123"),
            role=UserRole.INVESTIGATOR,
            full_name="Raj Singh",
            is_active=True,
            is_verified=True
        )
        citizen = User(
            email="citizen@example.com",
            password_hash=get_password_hash("password123"),
            role=UserRole.CITIZEN,
            full_name="Jane Doe",
            is_active=True,
            is_verified=True
        )
        
        db.add(admin)
        db.add(investigator)
        db.add(citizen)
        await db.commit()
        await db.refresh(admin)
        await db.refresh(investigator)
        await db.refresh(citizen)
        
        # 4 Clusters setup
        clusters = []
        for i in range(4):
            c = FraudCluster(risk_score=random.uniform(0.5, 1.0))
            db.add(c)
            clusters.append(c)
        await db.commit()
        for c in clusters: 
            await db.refresh(c)
        
        # Generate some shared entities
        shared_phone = Entity(type=EntityType.PHONE, value="9876543210", risk_score=0.9, cluster_id=clusters[0].id)
        shared_upi = Entity(type=EntityType.UPI_ID, value="scammer@ybl", risk_score=0.8, cluster_id=clusters[1].id)
        db.add(shared_phone)
        db.add(shared_upi)
        await db.commit()
        await db.refresh(shared_phone)
        await db.refresh(shared_upi)

        # Generate 40 cases
        scam_types = list(ScamType)
        cities = ["Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai", "Kolkata", "Pune", "Ahmedabad"]

        for i in range(40):
            created = datetime.now(timezone.utc) - timedelta(days=random.randint(0, 30))
            case = Case(
                reporter_id=citizen.id,
                description=f"Citizen reported a suspicious transaction/message sequence #{i+1}.",
                scam_type=random.choice(scam_types),
                status=random.choice(list(CaseStatus)),
                report_location=random.choice(cities),
                risk_score=random.uniform(0.1, 1.0),
                risk_level=random.choice(list(RiskLevel)),
                created_at=created
            )
            db.add(case)
            await db.commit()
            await db.refresh(case)
            
            # Link to shared entities randomly
            if i % 5 == 0:
                link = CaseEntityLink(case_id=case.id, entity_id=shared_phone.id, relationship_type="CONTACTED_VIA")
                db.add(link)
            elif i % 7 == 0:
                link = CaseEntityLink(case_id=case.id, entity_id=shared_upi.id, relationship_type="REQUESTED_PAYMENT_TO")
                db.add(link)
                
            # Create AnalysisResult
            analysis = AnalysisResult(
                case_id=case.id,
                risk_score=case.risk_score,
                risk_level=case.risk_level,
                predicted_type=case.scam_type
            )
            db.add(analysis)
            await db.commit()
            
            # Create alerts randomly
            if case.risk_score > 0.8:
                alert = Alert(
                    alert_type=AlertType.HIGH_RISK_CASE,
                    severity=AlertSeverity.CRITICAL,
                    title=f"High Risk Case detected: {case.id}",
                    description="This case triggered a high risk alert.",
                    case_id=case.id
                )
                db.add(alert)
                
        await db.commit()
        print("SQLite database initialized and seeded successfully.")

if __name__ == "__main__":
    # Configure the environment to use SQLite (overwrite DATABASE_URL dynamically just in case)
    import os
    os.environ["DATABASE_URL"] = "sqlite+aiosqlite:///./kavach_dev.db"
    asyncio.run(init_db())
