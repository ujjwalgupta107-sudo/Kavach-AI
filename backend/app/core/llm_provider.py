import os
import httpx
import logging
from typing import Dict, Any, Optional
from app.core.config import settings

logger = logging.getLogger(__name__)

class LLMProviderException(Exception):
    pass

class BaseLLMProvider:
    async def generate(self, system_prompt: str, user_prompt: str, max_tokens: int = 1024, temperature: float = 0.2) -> str:
        raise NotImplementedError

class GeminiProvider(BaseLLMProvider):
    def __init__(self, api_key: str, model: str):
        self.api_key = api_key
        self.model = model
        try:
            from google import genai
            from google.genai import types
            self.client = genai.Client(api_key=self.api_key)
            self.types = types
        except ImportError:
            self.client = None
            logger.warning("google-genai package not found. Gemini provider is disabled.")

    async def generate(self, system_prompt: str, user_prompt: str, max_tokens: int = 1024, temperature: float = 0.2) -> str:
        if not self.client:
            raise LLMProviderException("Gemini client is not initialized (google-genai missing)")
        
        try:
            response = await self.client.aio.models.generate_content(
                model=self.model,
                contents=user_prompt,
                config=self.types.GenerateContentConfig(
                    system_instruction=system_prompt,
                    temperature=temperature,
                    max_output_tokens=max_tokens,
                )
            )
            return response.text
        except Exception as e:
            raise LLMProviderException(f"Gemini API error: {str(e)}")

class OllamaProvider(BaseLLMProvider):
    def __init__(self, base_url: str, model: str):
        self.base_url = base_url.rstrip("/")
        self.model = model

    async def generate(self, system_prompt: str, user_prompt: str, max_tokens: int = 1024, temperature: float = 0.2) -> str:
        url = f"{self.base_url}/api/generate"
        payload = {
            "model": self.model,
            "system": system_prompt,
            "prompt": user_prompt,
            "stream": False,
            "options": {
                "temperature": temperature,
                "num_predict": max_tokens
            }
        }
        
        try:
            async with httpx.AsyncClient(timeout=60.0) as client:
                response = await client.post(url, json=payload)
                response.raise_for_status()
                data = response.json()
                return data.get("response", "")
        except Exception as e:
            raise LLMProviderException(f"Ollama API error: {str(e)}")

class MockProvider(BaseLLMProvider):
    async def generate(self, system_prompt: str, user_prompt: str, max_tokens: int = 1024, temperature: float = 0.2) -> str:
        lower_system = system_prompt.lower()
        lower_user = user_prompt.lower()
        
        if "json" in lower_system or "json" in lower_user:
            if "executive_case_assessment" in lower_user:
                return """{
  "executive_case_assessment": "This case shows strong indicators of an organized digital arrest scam. The victim was contacted via a known fraudulent phone number.",
  "confirmed_facts": ["Victim received call claiming to be police", "Victim transferred Rs 50,000"],
  "system_signals": ["High risk phone number", "Suspicious UPI address"],
  "network_findings": ["Phone number linked to cluster 1", "UPI address linked to cluster 2"],
  "ai_inferences": ["Organized gang operating out of Jamtara", "Possibility of further contact by scammers"],
  "uncertainties": ["Exact location of suspect", "Destination bank account details"],
  "source_refs": []
}"""
            elif "chronology_summary" in lower_user:
                return """{
  "chronology_summary": "Scam initiated on 2026-07-15. Transfer completed within 2 hours. Report filed by victim same day.",
  "evidence_strengths": ["Clear UPI transaction screenshot", "VOIP phone call log"],
  "evidence_gaps": ["No recording of the call", "IP logs of the connection missing"],
  "contradictions_or_uncertainties": ["Discrepancy in exact timestamp of the call"],
  "recommended_evidence_actions": ["Request IP logs from ISP", "Trace UPI payment flow"],
  "source_refs": []
}"""
            elif "executive_summary" in lower_user:
                return """{
  "executive_summary": "Comprehensive analysis of digital arrest fraud case. Suspects utilized VOIP call spoofing and instant UPI transfers to siphon funds.",
  "confirmed_facts": ["Call claiming to be police", "Transfer of Rs 50,000"],
  "key_system_signals": ["High risk phone", "UPI flag"],
  "network_connections": ["Linked to 2 distinct clusters"],
  "ai_assessment": ["Organized syndicate pattern"],
  "evidence_gaps": ["ISP logs missing"],
  "recommended_next_actions": ["Freezing UPI account", "Subpoena ISP records"],
  "priority": "HIGH",
  "source_refs": []
}"""
            else:
                return """{
  "risk_score": 95.5,
  "risk_level": "CRITICAL",
  "scam_category": "DIGITAL_ARREST",
  "explanation": "This text contains elements of a classic 'Digital Arrest' scam, including spoofed authorities and high urgency.",
  "red_flags": ["Aadhaar link threat", "Urgent transfer demand"],
  "extracted_entities": [
    {"type": "PHONE", "value": "9876543210"},
    {"type": "UPI_ID", "value": "verify.case@upi"}
  ],
  "recommended_actions": ["Do not transfer money", "Report to cyber cell"]
}"""

        # Return a realistic-looking response based on common investigator questions
        if "summarize" in lower_user or "cluster" in lower_user:
            return "Based on the intelligence data, this cluster involves a coordinated investment scam operating out of multiple locations. High risk entities include a shared crypto wallet and two VOIP phone numbers used across 5 different cases. I recommend freezing the associated accounts immediately."
        elif "hello" in lower_user or "hi" in lower_user:
            return "Hello Investigator. I am ready to assist you. You can ask me to summarize cases, analyze entity networks, or investigate specific clusters."
        else:
            return "I have analyzed the provided context. The data indicates suspicious patterns consistent with organized fraud. Several entities share common identifiers. Please specify if you need a detailed breakdown of a specific case or cluster."

def get_llm_provider(allow_mock: bool = False) -> BaseLLMProvider:
    provider_name = settings.AI_PROVIDER.lower()
    
    if provider_name == "gemini":
        if not settings.LLM_API_KEY:
            raise LLMProviderException("Gemini provider selected but LLM_API_KEY is not set.")
            
        return GeminiProvider(api_key=settings.LLM_API_KEY, model=settings.AI_MODEL)
    elif provider_name == "ollama":
        return OllamaProvider(base_url=settings.OLLAMA_BASE_URL, model=settings.OLLAMA_MODEL)
    elif provider_name == "mock" and allow_mock:
        return MockProvider()
        
    raise LLMProviderException(f"Unsupported or unconfigured AI_PROVIDER: {provider_name}")
