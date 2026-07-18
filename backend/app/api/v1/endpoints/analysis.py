from typing import Annotated
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.models.user import User
from app.schemas.analysis import AnalysisRequest, AnalysisResultResponse
from app.services.analysis_service import AnalysisService
from app.api.deps import get_current_user

router = APIRouter()

@router.post("/analyze", response_model=AnalysisResultResponse)
async def analyze_fraud_text(
    request: AnalysisRequest,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)]
):
    """
    Simulates the AI risk engine. Processes suspicious text and returns a deterministic risk score,
    scam classification, and recommended actions.
    """
    service = AnalysisService(db)
    return await service.analyze_text(request)

@router.post("/counterfeit")
async def analyze_counterfeit(
    current_user: Annotated[User, Depends(get_current_user)],
):
    """
    Mock endpoint for Computer Vision Counterfeit Currency Identification.
    Simulates analyzing an image of a banknote for microprints, UV features, etc.
    """
    import asyncio
    await asyncio.sleep(2) # Simulate processing time
    return {
        "status": "Counterfeit Detected",
        "confidence": 0.98,
        "details": [
            "Missing RBI security thread.",
            "Microprint 'RBI' illegible under simulated magnification.",
            "Watermark portrait does not match expected density."
        ],
        "action_required": "Do not accept this note. Retain it if safe to do so and contact local authorities."
    }

