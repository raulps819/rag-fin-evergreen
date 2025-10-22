"""
OpenAI embedding service.
"""
from typing import List
from openai import AsyncOpenAI
from app.core.config import settings


class OpenAIEmbeddingService:
    """
    Service for generating embeddings using OpenAI.
    """

    def __init__(self):
        self.api_key = settings.OPENAI_API_KEY
        self.model = "text-embedding-3-small"
        self._client = None

    def _get_client(self) -> AsyncOpenAI:
        """Get or create OpenAI client."""
        if not self.api_key:
            raise ValueError("OPENAI_API_KEY not configured in environment variables")

        if not self._client:
            self._client = AsyncOpenAI(api_key=self.api_key)

        return self._client

    async def generate_embeddings(self, texts: List[str]) -> List[List[float]]:
        """
        Generate embeddings for a list of texts.

        Args:
            texts: List of text strings

        Returns:
            List of embedding vectors
        """
        if not texts:
            return []

        client = self._get_client()
        response = await client.embeddings.create(
            model=self.model,
            input=texts
        )

        return [item.embedding for item in response.data]

    async def generate_embedding(self, text: str) -> List[float]:
        """
        Generate embedding for a single text.

        Args:
            text: Text string

        Returns:
            Embedding vector
        """
        embeddings = await self.generate_embeddings([text])
        return embeddings[0] if embeddings else []