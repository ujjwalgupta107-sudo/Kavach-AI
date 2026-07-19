import enum
import uuid
from datetime import datetime, timezone
from sqlalchemy import String, DateTime, Enum, ForeignKey, Text, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, UUIDType

class AlertType(str, enum.Enum):
    HIGH_RISK_CASE = "HIGH_RISK_CASE"
    ENTITY_REAPPEARED = "ENTITY_REAPPEARED"
    PAYMENT_ENDPOINT_REUSED = "PAYMENT_ENDPOINT_REUSED"
    CLUSTER_EXPANSION = "CLUSTER_EXPANSION"
    CROSS_CITY_PATTERN = "CROSS_CITY_PATTERN"
    CRITICAL_ENTITY_ACTIVITY = "CRITICAL_ENTITY_ACTIVITY"

class AlertSeverity(str, enum.Enum):
    CRITICAL = "CRITICAL"
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"

class Alert(Base):
    __tablename__ = "alerts"

    id: Mapped[uuid.UUID] = mapped_column(UUIDType(), primary_key=True, default=uuid.uuid4)
    alert_type: Mapped[AlertType] = mapped_column(Enum(AlertType), nullable=False)
    severity: Mapped[AlertSeverity] = mapped_column(Enum(AlertSeverity), nullable=False)
    
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    
    # Optional links
    case_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("cases.id"), index=True, nullable=True)
    entity_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("entities.id"), index=True, nullable=True)
    cluster_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("fraud_clusters.id"), index=True, nullable=True)
    
    is_acknowledged: Mapped[bool] = mapped_column(Boolean, default=False)
    acknowledged_by: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("users.id"), nullable=True)
    acknowledged_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
