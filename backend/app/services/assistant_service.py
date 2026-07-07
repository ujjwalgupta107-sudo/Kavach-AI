from app.schemas.assistant import ChatRequest, ChatResponse
from app.core.llm_provider import get_llm_provider

class AIAssistantService:
    async def chat(self, request: ChatRequest) -> ChatResponse:
        """
        Chatbot response. Connects to LLM.
        """
        system_prompt = "You are KAVACH AI Assistant, an expert cybercrime investigator AI. You assist human investigators by analyzing case data, summarizing evidence, identifying fraud patterns, and recommending tactical actions. Be professional, concise, and analytical."
        
        try:
            llm = get_llm_provider(allow_mock=True)
            reply = await llm.generate(
                system_prompt=system_prompt,
                user_prompt=request.message,
                temperature=0.3
            )
            return ChatResponse(reply=reply)
        except Exception as e:
            return ChatResponse(reply=f"System Error: Unable to reach KAVACH Cognitive Engine. Fallback diagnostic: {str(e)}")
