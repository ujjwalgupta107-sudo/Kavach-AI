from app.schemas.assistant import ChatRequest, ChatResponse
from app.core.llm_provider import get_llm_provider

from app.models.user import UserRole, User
import logging

logger = logging.getLogger(__name__)

class AIAssistantService:
    async def chat(self, request: ChatRequest, user: User) -> ChatResponse:
        """
        Chatbot response. Connects to LLM.
        """
        if user.role == UserRole.CITIZEN:
            system_prompt = (
                "You are KAVACH AI Assistant, a citizen safety and help assistant. "
                "Your scope is strictly limited to: scam safety guidance, suspicious call/message/payment advice, "
                "explaining Shield results, reporting guidance, immediate safe next actions, and KAVACH usage help. "
                "You CANNOT query arbitrary case data, expose investigator notes, expose private case intelligence, "
                "expose internal database IDs, claim police action occurred, or declare guilt. "
                "Always be helpful, calm, and protective."
            )
        else:
            system_prompt = (
                "You are KAVACH AI Assistant, an expert cybercrime investigator AI. "
                "You assist human investigators by analyzing case data, summarizing evidence, identifying fraud patterns, "
                "and recommending tactical actions. Be professional, concise, and analytical. "
                "You CANNOT query arbitrary case data, expose investigator notes, expose private case intelligence, "
                "expose internal database IDs, claim police action occurred, or declare guilt."
            )
        
        try:
            llm = get_llm_provider(allow_mock=True)
            reply = await llm.generate(
                system_prompt=system_prompt,
                user_prompt=request.message,
                temperature=0.3
            )
            return ChatResponse(reply=reply)
        except Exception as e:
            error_str = str(e).lower()
            logger.error(f"AI Assistant error: {e}")
            if "503" in error_str or "429" in error_str or "high demand" in error_str:
                reply_msg = "I am currently experiencing high demand. Please try again in a few moments."
            else:
                reply_msg = "I am having trouble connecting to my cognitive engine right now. Please try again later."
            return ChatResponse(reply=reply_msg)

