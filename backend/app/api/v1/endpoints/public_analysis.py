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

from app.models.case import ScamType, RiskLevel
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import APIRouter, Depends, HTTPException
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

def _run_heuristics(text: str) -> PublicAnalyzeResponse:
    t = text.lower()
    score = 0.1
    flags: List[str] = []
    entities: List[PublicEntityResult] = []
    scam = ScamType.OTHER

    # Digital Arrest / Law Enforcement Impersonation
    if any(x in t for x in ["cbi", "police", "arrest", "ed", "enforcement directorate",
                              "customs", "trai", "telecom", "supreme court", "high court"]):
        score += 0.4
        flags.append("Impersonation of law enforcement or government authority.")
        if scam == ScamType.OTHER:
            scam = ScamType.DIGITAL_ARREST

    # Drugs / Illegal substances in parcel
    if any(x in t for x in ["illegal", "substance", "drugs", "mdma", "narcotics", "contraband"]) \
            and ("parcel" in t or "courier" in t):
        score += 0.3
        flags.append("Accusation of illegal substances in a parcel.")
        scam = ScamType.DIGITAL_ARREST

    # Account freeze / legal threats
    if any(x in t for x in ["freeze", "suspended", "blocked", "deactivated"]) \
            and any(x in t for x in ["account", "card", "aadhaar", "pan"]):
        score += 0.3
        flags.append("Threat of account freeze or suspension.")
        if scam == ScamType.OTHER:
            scam = ScamType.PHISHING

    # Urgency
    if any(x in t for x in ["urgent", "immediately", "within 24 hours", "action required", "act now"]):
        score += 0.2
        flags.append("High sense of urgency to bypass critical thinking.")

    # Secrecy / Isolation
    if any(x in t for x in ["do not tell", "secret", "alone", "confidential", "isolate", "family"]):
        score += 0.3
        flags.append("Instruction to maintain secrecy or isolate the victim.")
        if scam == ScamType.OTHER:
            scam = ScamType.DIGITAL_ARREST

    # Financial Demands
    if any(x in t for x in ["transfer", "pay", "deposit", "send money", "rs", "rupees", "amount"]):
        score += 0.3
        flags.append("Explicit demand for money transfer.")

    # OTP / PIN / Passwords
    if any(x in t for x in ["otp", "pin", "password", "cvv", "verification code"]):
        score += 0.4
        flags.append("Request for sensitive authentication details (OTP/PIN).")
        if scam == ScamType.OTHER:
            scam = ScamType.OTP_THEFT

    # Remote Access Apps
    if any(x in t for x in ["anydesk", "teamviewer", "rustdesk", "quicksupport", "screen share"]):
        score += 0.5
        flags.append("Request to install remote access applications.")

    # Crypto
    if any(x in t for x in ["crypto", "bitcoin", "usdt", "wallet", "binance", "investment"]):
        score += 0.3
        flags.append("Demand for cryptocurrency payment or investment.")
        if scam == ScamType.OTHER:
            scam = ScamType.INVESTMENT_SCAM

    # URLs / Links
    if "http" in t or "www." in t or ".com" in t or ".in" in t:
        if "update" in t or "kyc" in t or "verify" in t:
            score += 0.3
            flags.append("Suspicious link prompting for KYC or verification.")
            if scam == ScamType.OTHER:
                scam = ScamType.PHISHING

    score = round(min(max(score, 0.0), 1.0), 4)

    if score > 0.8:
        level = RiskLevel.CRITICAL
    elif score > 0.6:
        level = RiskLevel.HIGH
    elif score > 0.3:
        level = RiskLevel.MEDIUM
    else:
        level = RiskLevel.LOW

    # Simple entity extraction (phone / UPI / URL)
    import re
    for phone in re.findall(r'\+?[\d\s\-]{10,13}', text):
        cleaned = re.sub(r'[\s\-]', '', phone)
        if len(cleaned) >= 10:
            entities.append(PublicEntityResult(type="PHONE", value=cleaned[:15]))

    for upi in re.findall(r'[\w.\-]+@[a-z]+', text):
        entities.append(PublicEntityResult(type="UPI_ID", value=upi))

    for url in re.findall(r'https?://[^\s]+|www\.[^\s]+', text):
        entities.append(PublicEntityResult(type="URL", value=url[:100]))

    actions = [
        "Do not share any personal information, OTP, or banking credentials.",
        "Block and report the sender through your messaging app.",
        "Report the incident at cybercrime.gov.in or call 1930.",
        "Save all evidence (screenshots, call recordings) before blocking.",
    ]
    if not flags:
        actions = ["This message appears legitimate. Stay vigilant and verify through official channels."]

    explanation = (
        f"KAVACH AI detected {len(flags)} risk indicator(s) in this message. "
        f"Risk score: {round(score * 100)}%. "
        f"Classified as: {scam.value.replace('_', ' ')}."
    ) if flags else "No significant scam indicators were detected in this message."

    return PublicAnalyzeResponse(
        risk_score=round(score * 100, 1),
        risk_level=level.value,
        scam_category=scam.value,
        explanation=explanation,
        red_flags=flags,
        extracted_entities=entities,
        recommended_actions=actions,
    )


# ─── Endpoint ─────────────────────────────────────────────────────────────────

@router.post("/analyze", response_model=PublicAnalyzeResponse, summary="Public scam analysis — no auth required")
async def public_analyze(request: PublicAnalyzeRequest):
    """
    Stateless public scam analysis.  Accepts suspicious text and returns
    risk assessment, red flags, and recommended actions.

    **No authentication required.**  No data is persisted to the database.
    """
    return _run_heuristics(request.text)


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
