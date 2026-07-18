from pydantic import BaseModel
from typing import Optional

class ChatRequest(BaseModel):
    message: str
    context: str = "" # e.g. case details to give AI context
    language: Optional[str] = "English"

class ChatResponse(BaseModel):
    reply: str
