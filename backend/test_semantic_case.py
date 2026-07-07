import asyncio
from app.db.session import async_session_maker
from app.models.user import User
from app.services.semantic_service import SemanticService

async def run():
    async with async_session_maker() as db:
        import uuid
        case_id = uuid.UUID('0b35233c-db19-48e6-ad2c-0863516d8716')
        r = await SemanticService.get_similar_cases(case_id, db, top_k=5, threshold=0.1)
        print('SIMILAR MATCHES FOUND:', len(r))
        if len(r) > 0:
            print('TOP MATCH SCORE:', r[0]['similarity_score'])

if __name__ == "__main__":
    asyncio.run(run())
