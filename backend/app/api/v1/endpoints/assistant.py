from typing import Annotated
from fastapi import APIRouter, Depends

from app.models.user import User
from app.schemas.assistant import ChatRequest, ChatResponse
from app.services.assistant_service import AIAssistantService
from app.api.deps import get_current_user

router = APIRouter()

@router.post("/chat", response_model=ChatResponse)
async def chat_with_assistant(
    request: ChatRequest,
    current_user: Annotated[User, Depends(get_current_user)]
):
    """
    Assistant endpoint for citizens and investigators.
    """
    service = AIAssistantService()
    return await service.chat(request, current_user)
