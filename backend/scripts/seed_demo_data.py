import asyncio
import uuid
import random
from datetime import datetime, timezone, timedelta
from passlib.context import CryptContext

from app.db.session import async_session_maker, engine
from app.db.base import Base
from app.models.user import User, UserRole
from app.models.case import Case, CaseStatus, ScamType, RiskLevel, CaseTimelineEvent
from app.models.entity import Entity, EntityType, CaseEntityLink, FraudCluster
from app.models.analysis import AnalysisResult, RedFlag
from app.models.alert import Alert, AlertType, AlertSeverity

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

async def seed_data():
    async with async_session_maker() as db:
        # Create Users
        investigator = User(
            email="investigator@kavach.ai",
            password_hash=get_password_hash("admin123"),
            role=UserRole.INVESTIGATOR,
            full_name="Raj Singh"
        )
        citizen = User(
            email="citizen@example.com",
            password_hash=get_password_hash("password123"),
            role=UserRole.CITIZEN,
            full_name="Jane Doe"
        )
        db.add(investigator)
        db.add(citizen)
        await db.commit()
        await db.refresh(investigator)
        await db.refresh(citizen)
        
        # 4 Clusters setup
        clusters = []
        for i in range(4):
            c = FraudCluster(risk_score=random.uniform(0.5, 1.0))
            db.add(c)
            clusters.append(c)
        await db.commit()
        for c in clusters: await db.refresh(c)
        
        # Generate 40 cases
        scam_types = list(ScamType)
        cities = ["Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai", "Kolkata", "Pune", "Ahmedabad"]
        
        # We will reuse some entities to force clusters
        shared_phone = Entity(type=EntityType.PHONE, value="9876543210", risk_score=0.9, cluster_id=clusters[0].id)
        shared_upi = Entity(type=EntityType.UPI_ID, value="scammer@ybl", risk_score=0.8, cluster_id=clusters[1].id)
        db.add(shared_phone)
        db.add(shared_upi)
        await db.commit()
        await db.refresh(shared_phone)
        await db.refresh(shared_upi)

        for i in range(40):
            created = datetime.now(timezone.utc) - timedelta(days=random.randint(0, 30))
            case = Case(
                reporter_id=citizen.id,
                description="User reported a suspicious message.",
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
            
            # Link to shared entities randomly to build the graph
            if i % 5 == 0:
                link = CaseEntityLink(case_id=case.id, entity_id=shared_phone.id, relationship_type="CONTACTED_VIA")
                db.add(link)
            elif i % 7 == 0:
                link = CaseEntityLink(case_id=case.id, entity_id=shared_upi.id, relationship_type="REQUESTED_PAYMENT_TO")
                db.add(link)
                
            # Create Analysis
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
                    title=f"High Risk Case: {case.id}",
                    description="This case triggered a high risk alert.",
                    case_id=case.id
                )
                db.add(alert)
                
        await db.commit()
        print("Demo data seeded successfully.")

if __name__ == "__main__":
    asyncio.run(seed_data())
