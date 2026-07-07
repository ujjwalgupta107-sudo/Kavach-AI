"""
Public analysis endpoint — no JWT required.

Runs the existing analysis heuristics in a *stateless* manner (nothing
is written to the database).  Returns the same intelligence fields that
the authenticated analysis pipeline produces so the frontend Kavach
Shield page can display real results without requiring a citizen account.
"""
from typing import List, Optional
from fastapi import APIRouter
from pydantic import BaseModel, Field, field_validator
import easyocr
import io

from app.models.case import ScamType, RiskLevel
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from app.db.session import get_db
from app.services.case_service import CaseService
from app.schemas.case import CaseCreate
from app.models.user import User, UserRole

router = APIRouter()


# ─── Request / Response schemas ───────────────────────────────────────────────

class PublicAnalyzeRequest(BaseModel):
    text: str = Field(..., min_length=10, max_length=5000, description="Suspicious message text")


class PublicReportRequest(BaseModel):
    phone: Optional[str] = None
    upi: Optional[str] = None
    details: str = Field(..., min_length=10, max_length=5000)

class PublicReportResponse(BaseModel):
    success: bool
    case_id: str
    message: str


class PublicEntityResult(BaseModel):
    type: str
    value: str


class PublicAnalyzeResponse(BaseModel):
    risk_score: float
    risk_level: str
    scam_category: str
    explanation: str
    red_flags: List[str]
    extracted_entities: List[PublicEntityResult]
    recommended_actions: List[str]


# ─── Inline heuristics (reuses the same logic as AnalysisService) ─────────────

import json
from app.core.llm_provider import get_llm_provider

async def _run_ai_analysis(text: str) -> PublicAnalyzeResponse:
    try:
        llm = get_llm_provider(allow_mock=True)
        system_prompt = """You are KAVACH AI, an elite fraud detection intelligence system.
Analyze the following text and return a JSON object ONLY. Do not use markdown blocks.
Required JSON format:
{
  "risk_score": 95.5,
  "risk_level": "CRITICAL", // LOW, MEDIUM, HIGH, CRITICAL
  "scam_category": "DIGITAL_ARREST",
  "explanation": "A clear explanation of why this is suspicious.",
  "red_flags": ["Demand for money", "Urgency"],
  "extracted_entities": [
    {"type": "PHONE", "value": "1234567890"},
    {"type": "UPI_ID", "value": "fraud@upi"}
  ],
  "recommended_actions": ["Block number", "Report to cyber cell"]
}"""
        response_text = await llm.generate(system_prompt=system_prompt, user_prompt=text)
        
        # Clean potential markdown wrapping
        cleaned = response_text.replace("```json", "").replace("```", "").strip()
        data = json.loads(cleaned)
        
        return PublicAnalyzeResponse(
            risk_score=float(data.get("risk_score", 0.0)),
            risk_level=data.get("risk_level", "LOW"),
            scam_category=data.get("scam_category", "OTHER"),
            explanation=data.get("explanation", "Analysis complete."),
            red_flags=data.get("red_flags", []),
            extracted_entities=[PublicEntityResult(**e) for e in data.get("extracted_entities", [])],
            recommended_actions=data.get("recommended_actions", [])
        )
    except Exception as e:
        print(f"LLM Analysis failed: {e}")
        # Fallback for provider error
        return PublicAnalyzeResponse(
            risk_score=0.0,
            risk_level="UNABLE_TO_ANALYZE",
            scam_category="OTHER",
            explanation="The KAVACH AI engine is temporarily unavailable due to high load or a network error. Please try again in a few moments.",
            red_flags=[],
            extracted_entities=[],
            recommended_actions=["Retry analysis later."]
        )


# ─── Endpoint ─────────────────────────────────────────────────────────────────

@router.post("/analyze", response_model=PublicAnalyzeResponse, summary="Public scam analysis — no auth required")
async def public_analyze(request: PublicAnalyzeRequest):
    """
    Stateless public scam analysis.  Accepts suspicious text and returns
    risk assessment, red flags, and recommended actions.

    **No authentication required.**  No data is persisted to the database.
    """
    return await _run_ai_analysis(request.text)

@router.post("/analyze-image", response_model=PublicAnalyzeResponse, summary="Public OCR image analysis")
async def public_analyze_image(file: UploadFile = File(...)):
    """
    Performs OCR on an uploaded screenshot and runs AI analysis.
    """
    content = await file.read()
    try:
        reader = easyocr.Reader(['en'], gpu=False)
        result = reader.readtext(content)
        extracted_text = " ".join([text for _, text, _ in result])
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"OCR failed: {e}")
        
    if not extracted_text.strip() or len(extracted_text.strip()) < 10:
        return PublicAnalyzeResponse(
            risk_score=0.0,
            risk_level="INSUFFICIENT_TEXT",
            scam_category="OTHER",
            explanation="We couldn't find enough readable text in this image to perform a scam analysis. Upload a clearer screenshot containing the suspicious message, payment request, email, or conversation.",
            red_flags=[],
            extracted_entities=[],
            recommended_actions=[]
        )
        
    return await _run_ai_analysis(extracted_text)

@router.post("/report", response_model=PublicReportResponse, summary="Submit a public incident report")
async def public_report(request: PublicReportRequest, db: AsyncSession = Depends(get_db)):
    """
    Allows citizens to submit reports from the mobile app without an account.
    """
    from sqlalchemy import select
    
    # Try to find a default system citizen user or pick the first CITIZEN
    result = await db.execute(select(User).where(User.role == UserRole.CITIZEN).limit(1))
    system_user = result.scalar_one_or_none()
    
    if not system_user:
        # Fallback to creating a dummy citizen if none exist
        system_user = User(
            email="anonymous_citizen@kavach.ai",
            hashed_password="fake",
            full_name="Anonymous Citizen",
            role=UserRole.CITIZEN,
            is_active=True
        )
        db.add(system_user)
        await db.commit()
        await db.refresh(system_user)

    description = request.details
    if request.phone:
        description += f"\nSuspect Phone: {request.phone}"
    if request.upi:
        description += f"\nSuspect UPI: {request.upi}"

    case_in = CaseCreate(
        scam_type=ScamType.OTHER,
        description=description,
    )
    
    service = CaseService(db)
    created_case = await service.create_case(case_in, system_user)
    
    return PublicReportResponse(
        success=True,
        case_id=str(created_case.id),
        message="Incident submitted successfully"
    )
