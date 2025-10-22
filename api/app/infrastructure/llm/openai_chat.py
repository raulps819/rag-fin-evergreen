"""
OpenAI chat service.
"""
from typing import List, Optional
from openai import AsyncOpenAI

from app.domain.ports.llm_service import LLMServicePort
from app.core.config import settings


class OpenAIChatService(LLMServicePort):
    """
    Service for generating chat responses using OpenAI.
    """

    def __init__(self):
        self.api_key = settings.OPENAI_API_KEY
        self.model = "gpt-5-nano"  # Fast and cost-effective
        # Create client once at initialization to avoid httpx wrapper issues
        self._client = AsyncOpenAI(api_key=self.api_key) if self.api_key else None

    def _get_client(self) -> AsyncOpenAI:
        """Get OpenAI client."""
        if not self._client:
            raise ValueError("OPENAI_API_KEY not configured in environment variables")
        return self._client

    async def generate_response(
        self,
        query: str,
        context: List[str],
        system_prompt: Optional[str] = None
    ) -> str:
        """
        Generate a response based on query and context.

        Args:
            query: User question
            context: List of relevant text chunks for context
            system_prompt: Optional system prompt to guide the model

        Returns:
            Generated response text
        """
        client = self._get_client()

        # Default system prompt for financial assistant
        if not system_prompt:
            system_prompt = """Eres un asistente financiero inteligente especializado en análisis de documentos financieros.
Tu tarea es responder preguntas basándote en el contexto proporcionado de documentos financieros.

Reglas importantes:
- Responde SOLO basándote en la información del contexto proporcionado
- Si la información no está en el contexto, indica claramente que no tienes esa información
- Sé preciso y conciso en tus respuestas
- Utiliza formato claro y profesional
- Si hay números o datos específicos, cítalos exactamente como aparecen
- Responde en español"""

        # Build context text
        context_text = "\n\n---\n\n".join(context) if context else "No hay contexto disponible."

        # Build messages
        messages = [
            {"role": "system", "content": system_prompt},
            {
                "role": "user",
                "content": f"""Contexto de documentos financieros:

{context_text}

---

Pregunta del usuario: {query}

Por favor, responde basándote únicamente en el contexto proporcionado."""
            }
        ]

        # Generate response
        response = await client.chat.completions.create(
            model=self.model,
            messages=messages,
            #temperature=0.3,  # Lower temperature for more consistent answers
            max_completion_tokens=1000  # Updated parameter name for OpenAI 2.x
        )

        return response.choices[0].message.content.strip()

    async def close(self):
        """Close the OpenAI client and cleanup resources."""
        if self._client:
            try:
                # OpenAI wraps httpx client, which can cause AttributeError on close
                # We catch and ignore it as the client will be garbage collected
                await self._client.close()
            except AttributeError:
                pass  # Ignore the _state error from AsyncHttpxClientWrapper
            finally:
                self._client = None