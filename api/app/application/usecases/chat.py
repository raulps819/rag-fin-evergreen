"""
Chat use case.
"""
from datetime import datetime
from typing import List
import uuid

from app.domain.entities.message import Message, Source
from app.domain.ports.vector_store import VectorStorePort
from app.domain.ports.llm_service import LLMServicePort
from app.infrastructure.llm.openai_embedding import OpenAIEmbeddingService
from app.core.config import settings


class ChatUseCase:
    """
    Use case for chat interactions with documents.
    """

    def __init__(
        self,
        vector_store: VectorStorePort,
        llm_service: LLMServicePort,
        embedding_service: OpenAIEmbeddingService
    ):
        self.vector_store = vector_store
        self.llm_service = llm_service
        self.embedding_service = embedding_service

    async def execute(self, query: str) -> Message:
        """
        Execute the chat use case.

        Args:
            query: User question

        Returns:
            Assistant message with answer and sources
        """
        # Step 1: Generate embedding for the query
        query_embedding = await self.embedding_service.generate_embedding(query)

        # Step 2: Search for relevant chunks in vector store
        search_results = await self.vector_store.search(
            query_embedding=query_embedding,
            top_k=settings.TOP_K
        )

        # Step 3: Extract context and sources
        context_chunks = []
        sources = []

        for result in search_results:
            context_chunks.append(result["document"])

            metadata = result.get("metadata", {})
            source = Source(
                document_id=metadata.get("document_id", "unknown"),
                filename=metadata.get("filename", "unknown"),
                chunk_index=metadata.get("chunk_index", 0),
                content=result["document"][:200] + "...",  # Preview
                relevance_score=1 - result.get("distance", 0) if result.get("distance") is not None else None
            )
            sources.append(source)

        # Step 4: Generate response using LLM
        if not context_chunks:
            answer = "No encontré información relevante en los documentos para responder tu pregunta. Por favor, asegúrate de haber subido documentos relacionados con tu consulta."
        else:
            answer = await self.llm_service.generate_response(
                query=query,
                context=context_chunks
            )

        # Step 5: Create assistant message
        message = Message(
            id=str(uuid.uuid4()),
            role="assistant",
            content=answer,
            created_at=datetime.now(),
            sources=sources if sources else None
        )

        return message