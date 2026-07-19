import uuid
from datetime import datetime, timezone
from typing import List

from sqlalchemy import String, DateTime, ForeignKey, Float, Text, Enum
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, UUIDType
from app.models.case import ScamType, RiskLevel

class AnalysisResult(Base):
    __tablename__ = "analysis_results"

    id: Mapped[uuid.UUID] = mapped_column(UUIDType(), primary_key=True, default=uuid.uuid4)
    evidence_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("evidence.id"), index=True, nullable=True) # Analysis can be on evidence
    case_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("cases.id"), index=True, nullable=True) # Or directly on case description
    
    risk_score: Mapped[float] = mapped_column(Float, default=0.0)
    risk_level: Mapped[RiskLevel] = mapped_column(Enum(RiskLevel), default=RiskLevel.LOW)
    predicted_type: Mapped[ScamType] = mapped_column(Enum(ScamType), default=ScamType.OTHER)
    confidence: Mapped[float] = mapped_column(Float, default=0.0)
    
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    red_flags: Mapped[List["RedFlag"]] = relationship("RedFlag", back_populates="analysis", cascade="all, delete-orphan")
    recommended_actions: Mapped[List["RecommendedAction"]] = relationship("RecommendedAction", back_populates="analysis", cascade="all, delete-orphan")


class RedFlag(Base):
    __tablename__ = "red_flags"

    id: Mapped[uuid.UUID] = mapped_column(UUIDType(), primary_key=True, default=uuid.uuid4)
    analysis_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("analysis_results.id"), index=True, nullable=False)
    
    description: Mapped[str] = mapped_column(Text, nullable=False)

    analysis: Mapped["AnalysisResult"] = relationship("AnalysisResult", back_populates="red_flags")

class RecommendedAction(Base):
    __tablename__ = "recommended_actions"

    id: Mapped[uuid.UUID] = mapped_column(UUIDType(), primary_key=True, default=uuid.uuid4)
    analysis_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("analysis_results.id"), index=True, nullable=False)
    
    action: Mapped[str] = mapped_column(Text, nullable=False)

    analysis: Mapped["AnalysisResult"] = relationship("AnalysisResult", back_populates="recommended_actions")
