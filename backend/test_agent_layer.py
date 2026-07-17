import asyncio
import uuid
import json
from sqlalchemy import select
from app.db.session import async_session_maker
from app.services.agent_tool_service import AgentToolService
from app.models.case import Case
from app.models.user import User
from app.core.llm_provider import get_llm_provider, MockProvider
from app.core.config import settings

async def run_tool_context_test():
    print("--- TESTING TOOL CONTEXT ---")
    async with async_session_maker() as db:
        result = await db.execute(select(Case).limit(1))
        case = result.scalar()
        if not case:
            print("No cases found in DB to test context.")
            return

        print(f"Extracting context for Case ID: {case.id}")
        service = AgentToolService(db)
        context = await service.build_investigation_context(case.id)
        
        print("\nCONTEXT EXTRACT:")
        print("Facts:", context["case_facts"].get("scam_type"), context["case_facts"].get("risk_score"))
        print("Entities Extracted:", len(context["entities_extracted"]))
        print("Alerts:", len(context["system_signals"]["alerts"]))
        print("Cluster Context:", context["network_context"]["cluster"].get("status", "Exists"))
        print("Semantic Matches:", len(context["network_context"]["semantic_similar_cases"]))

async def run_provider_test():
    print("\n--- TESTING LLM PROVIDER ---")
    provider = get_llm_provider()
    print(f"Resolved Provider Instance: {type(provider).__name__}")
    if isinstance(provider, MockProvider):
        res = await provider.generate("System", "User")
        print(f"Mock Output:\n{res}")

async def run_tests():
    try:
        await run_tool_context_test()
    except Exception as e:
        print(f"DB Context Test Failed (likely DB offline): {e}")
        
    await run_provider_test()
    
    print("\nValidation complete.")

if __name__ == "__main__":
    asyncio.run(run_tests())
