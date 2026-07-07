import asyncio
import uuid
import json
from sqlalchemy import select
from app.db.session import async_session_maker
from app.models.case import Case
from app.models.user import User
from app.models.agent_run import AgentRun
from app.services.orchestrator import InvestigationOrchestrator

async def run_orchestrator_tests():
    print("--- TESTING ORCHESTRATION ---")
    async with async_session_maker() as db:
        result = await db.execute(select(Case).limit(1))
        case = result.scalar()
        if not case:
            print("No cases found in DB.")
            return

        print(f"Creating AgentRun for Case ID: {case.id}")
        
        from app.models.agent_run import AgentRunStatus
        # Test Provider missing failure
        run = AgentRun(
            case_id=case.id,
            status=AgentRunStatus.PENDING,
            provider="system",
            model="system"
        )
        db.add(run)
        await db.commit()
        
        print("Run created. Status:", run.status.name if hasattr(run.status, 'name') else run.status)
        
        # We run it synchronously here for testing
        print("Executing orchestrator without mock...")
        orch = InvestigationOrchestrator(db, run.id, allow_mock=False)
        await orch.execute_run()
        
        await db.refresh(run)
        print("Run status after execution:", run.status.name if hasattr(run.status, 'name') else run.status)
        print("Error message:", run.error_message)

        # Test successful mock execution
        print("\nExecuting orchestrator WITH mock...")
        run_mock = AgentRun(
            case_id=case.id,
            status=AgentRunStatus.PENDING,
            provider="system",
            model="system"
        )
        db.add(run_mock)
        await db.commit()
        
        orch_mock = InvestigationOrchestrator(db, run_mock.id, allow_mock=True)
        await orch_mock.execute_run()
        
        await db.refresh(run_mock)
        print("Mock run status:", run_mock.status.value)
        
        print("\nValidation complete.")

if __name__ == "__main__":
    asyncio.run(run_orchestrator_tests())
