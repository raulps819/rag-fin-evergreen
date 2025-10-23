"""
OpenAI chat service.
"""
from typing import List, Optional
from openai import AsyncOpenAI
import logging

from app.domain.ports.llm_service import LLMServicePort
from app.core.config import settings

logger = logging.getLogger(__name__)


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
            context: List of relevant text chunks (documents or conversation history)
            system_prompt: Optional system prompt to guide the model

        Returns:
            Generated response text
        """
        client = self._get_client()

        # Default system prompt for financial assistant
        if not system_prompt:
            system_prompt = """Eres un asistente financiero inteligente y amigable.

Tu tarea es ayudar al usuario respondiendo sus preguntas de manera profesional y útil.

Reglas importantes:
- Si el contexto incluye documentos financieros, úsalos para responder con datos precisos
- Si el contexto incluye historial de conversación, úsalo para mantener coherencia
- Si no hay suficiente información en el contexto para responder una pregunta específica sobre documentos, indica claramente que no tienes esa información
- Puedes saludar cordialmente y mantener conversaciones casuales
- Sé amable, preciso y conciso
- Responde siempre en español"""

        # Build context text
        if not context:
            # No context available - conversational mode
            context_text = "No hay documentos cargados aún. Puedes mantener una conversación general."
        else:
            context_text = "\n\n---\n\n".join(context)

        # Build messages
        messages = [
            {"role": "system", "content": system_prompt},
            {
                "role": "user",
                "content": f"""Contexto disponible:

{context_text}

---

Pregunta del usuario: {query}

Por favor, responde de manera útil basándote en el contexto si está disponible."""
            }
        ]

        # Generate response
        response = await client.chat.completions.create(
            model=self.model,
            messages=messages,
            max_completion_tokens=1000
        )

        return response.choices[0].message.content.strip() if response.choices[0].message.content else ""

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