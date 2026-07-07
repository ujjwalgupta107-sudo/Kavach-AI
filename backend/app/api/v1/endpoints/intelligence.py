from typing import Annotated, List
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.models.user import User
from app.schemas.entity import GraphResponse, EntityResponse
from app.services.graph_service import GraphService
from app.repositories.entity_repository import EntityRepository
from app.api.deps import require_investigator

router = APIRouter()

@router.get("/graph", response_model=GraphResponse)
async def get_fraud_network_graph(
    current_user: Annotated[User, Depends(require_investigator)],
    db: Annotated[AsyncSession, Depends(get_db)]
):
    """
    Returns nodes and edges for the frontend Cytoscape graph.
    Requires investigator privileges.
    """
    service = GraphService(db)
    return await service.get_cytoscape_graph()

@router.get("/entities", response_model=List[EntityResponse])
async def get_all_entities(
    current_user: Annotated[User, Depends(require_investigator)],
    db: Annotated[AsyncSession, Depends(get_db)]
):
    """
    Returns a list of all extracted entities.
    """
    repo = EntityRepository(db)
    return await repo.get_all_entities()

from app.services.semantic_service import SemanticService
from fastapi import HTTPException
import uuid
from typing import Dict, Any

@router.get("/cases/{case_id}/similar", response_model=List[Dict[str, Any]])
async def get_similar_cases(
    case_id: uuid.UUID,
    current_user: Annotated[User, Depends(require_investigator)],
    db: Annotated[AsyncSession, Depends(get_db)]
):
    """
    Returns top semantically similar cases based on narrative description.
    """
    try:
        similar = await SemanticService.get_similar_cases(case_id, db, top_k=5, threshold=0.3)
        return similar
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch similar cases: {str(e)}")
