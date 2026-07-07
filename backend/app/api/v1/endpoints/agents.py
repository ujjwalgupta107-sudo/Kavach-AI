import uuid
from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.api import deps
from app.models.agent_run import AgentRun, AgentRunStatus, AgentFinding
from app.models.case import Case

router = APIRouter()

@router.post("/investigations/{case_id}")
async def create_investigation(
    case_id: uuid.UUID,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(deps.get_db),
    # Requires investigator role in production
) -> Any:
    """
    Creates a new AI investigation run for a specific case.
    """
    # Validate case existence
    case = await db.get(Case, case_id)
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")

    # For Hackathon/Demo: In-process background execution
    # A durable queue like Celery is required for production scale.
    
    # We must ensure there isn't an already running or pending job
    existing_run = await db.execute(
        select(AgentRun).where(
            AgentRun.case_id == case_id,
            AgentRun.status.in_([AgentRunStatus.PENDING, AgentRunStatus.RUNNING])
        )
    )
    if existing_run.scalars().first():
        raise HTTPException(status_code=400, detail="Investigation already in progress for this case")

    # Create run entry
    run = AgentRun(
        case_id=case_id,
        status=AgentRunStatus.PENDING,
        provider="system",
        model="system"
    )
    db.add(run)
    await db.commit()
    await db.refresh(run)
    
    run_id_str = str(run.id)

    async def _run_orchestrator(run_uuid: uuid.UUID):
        from app.db.session import SessionLocal
        from app.services.orchestrator import InvestigationOrchestrator
        async with SessionLocal() as session:
            orch = InvestigationOrchestrator(session, run_uuid)
            await orch.execute_run()

    background_tasks.add_task(_run_orchestrator, run.id)

    return {
        "id": run_id_str,
        "status": run.status.value,
        "message": "Investigation scheduled"
    }

@router.get("/runs/{run_id}")
async def get_investigation_run(
    run_id: uuid.UUID,
    db: AsyncSession = Depends(deps.get_db)
) -> Any:
    """
    Get status and results of a specific investigation run.
    """
    run = await db.get(AgentRun, run_id)
    if not run:
        raise HTTPException(status_code=404, detail="Run not found")
        
    result = await db.execute(
        select(AgentFinding).where(AgentFinding.run_id == run_id)
    )
    findings = result.scalars().all()

    return {
        "id": str(run.id),
        "case_id": str(run.case_id),
        "status": run.status.value,
        "provider": run.provider,
        "model": run.model,
        "started_at": run.started_at,
        "completed_at": run.completed_at,
        "error_message": run.error_message,
        "final_brief": run.final_brief,
        "findings": [
            {
                "id": str(f.id),
                "agent_type": f.agent_type,
                "finding_type": f.finding_type,
                "content": f.content,
                "confidence": f.confidence,
                "source_refs": f.source_refs
            } for f in findings
        ]
    }

@router.get("/runs")
async def list_investigation_runs(
    case_id: Optional[uuid.UUID] = None,
    db: AsyncSession = Depends(deps.get_db)
) -> Any:
    """
    List previous investigation runs, optionally filtered by case_id.
    """
    query = select(AgentRun).order_by(AgentRun.created_at.desc())
    if case_id:
        query = query.where(AgentRun.case_id == case_id)
        
    result = await db.execute(query)
    runs = result.scalars().all()
    
    return [
        {
            "id": str(r.id),
            "case_id": str(r.case_id),
            "status": r.status.value,
            "started_at": r.started_at,
            "completed_at": r.completed_at
        } for r in runs
    ]
