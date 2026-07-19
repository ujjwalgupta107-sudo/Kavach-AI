import enum
import uuid
from datetime import datetime, timezone
from typing import List, Optional

from sqlalchemy import String, Boolean, DateTime, Enum, ForeignKey, Float
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, UUIDType

class EntityType(str, enum.Enum):
    PHONE = "PHONE"
    UPI_ID = "UPI_ID"
    BANK_ACCOUNT = "BANK_ACCOUNT"
    DOMAIN = "DOMAIN"
    DEVICE = "DEVICE"
    ORGANIZATION = "ORGANIZATION"
    LOCATION = "LOCATION"

class FraudCluster(Base):
    __tablename__ = "fraud_clusters"

    id: Mapped[uuid.UUID] = mapped_column(UUIDType(), primary_key=True, default=uuid.uuid4)
    risk_score: Mapped[float] = mapped_column(Float, default=0.0)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

class Entity(Base):
    __tablename__ = "entities"

    id: Mapped[uuid.UUID] = mapped_column(UUIDType(), primary_key=True, default=uuid.uuid4)
    type: Mapped[EntityType] = mapped_column(Enum(EntityType), nullable=False)
    value: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    masked_value: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    
    risk_score: Mapped[float] = mapped_column(Float, default=0.0)
    
    cluster_id: Mapped[Optional[uuid.UUID]] = mapped_column(ForeignKey("fraud_clusters.id"), nullable=True, index=True)

    first_seen: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    last_seen: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    case_links: Mapped[List["CaseEntityLink"]] = relationship("CaseEntityLink", back_populates="entity")

class CaseEntityLink(Base):
    __tablename__ = "case_entity_links"

    id: Mapped[uuid.UUID] = mapped_column(UUIDType(), primary_key=True, default=uuid.uuid4)
    case_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("cases.id"), index=True, nullable=False)
    entity_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("entities.id"), index=True, nullable=False)
    
    relationship_type: Mapped[str] = mapped_column(String(100), default="MENTIONED_IN")
    confidence: Mapped[float] = mapped_column(Float, default=1.0)
    
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    entity: Mapped["Entity"] = relationship("Entity", back_populates="case_links")
    case: Mapped["Case"] = relationship("Case", backref="entity_links")
