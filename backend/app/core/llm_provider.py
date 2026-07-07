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
            response = self.client.models.generate_content(
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
        return "{\n  \"status\": \"success\",\n  \"mock_response\": \"This is a mock provider output based on the provided context.\"\n}"

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
