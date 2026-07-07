from sqlalchemy import Column, String, DateTime, JSON, ForeignKey, Enum, Float
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import enum
import uuid
import datetime

from app.db.base import Base

class AgentRunStatus(str, enum.Enum):
    PENDING = "PENDING"
    RUNNING = "RUNNING"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"

class AgentType(str, enum.Enum):
    INVESTIGATION = "INVESTIGATION"
    NETWORK = "NETWORK"
    EVIDENCE = "EVIDENCE"
    SUPERVISOR = "SUPERVISOR"

class AgentRun(Base):
    __tablename__ = "agent_runs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    case_id = Column(UUID(as_uuid=True), ForeignKey("cases.id", ondelete="CASCADE"), nullable=False)
    status = Column(Enum(AgentRunStatus), default=AgentRunStatus.PENDING, nullable=False)
    provider = Column(String, nullable=False)
    model = Column(String, nullable=False)
    error_message = Column(String, nullable=True)
    final_brief = Column(JSON, nullable=True)
    
    # Keeping created_by minimal; normally this links to Users table
    created_by = Column(UUID(as_uuid=True), nullable=True)
    
    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)

    findings = relationship("AgentFinding", back_populates="run", cascade="all, delete-orphan")

class AgentFinding(Base):
    __tablename__ = "agent_findings"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    run_id = Column(UUID(as_uuid=True), ForeignKey("agent_runs.id", ondelete="CASCADE"), nullable=False)
    agent_type = Column(Enum(AgentType), nullable=False)
    finding_type = Column(String, nullable=False)
    content = Column(String, nullable=False)
    confidence = Column(Float, nullable=True)
    source_refs = Column(JSON, nullable=True)
    
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)

    run = relationship("AgentRun", back_populates="findings")
