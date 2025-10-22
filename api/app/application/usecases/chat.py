"""
Chat use case.
"""
from datetime import datetime
from typing import List, Optional
import uuid

from app.domain.entities.message import Message, Source
from app.domain.entities.conversation import Conversation
from app.domain.ports.vector_store import VectorStorePort
from app.domain.ports.llm_service import LLMServicePort
from app.domain.ports.conversation_repository import ConversationRepositoryPort
from app.domain.ports.message_repository import MessageRepositoryPort
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
        embedding_service: OpenAIEmbeddingService,
        conversation_repository: ConversationRepositoryPort,
        message_repository: MessageRepositoryPort
    ):
        self.vector_store = vector_store
        self.llm_service = llm_service
        self.embedding_service = embedding_service
        self.conversation_repository = conversation_repository
        self.message_repository = message_repository

    async def execute(self, query: str, conversation_id: Optional[str] = None) -> tuple[Message, str]:
        """
        Execute the chat use case.

        Args:
            query: User question
            conversation_id: Optional conversation ID. If not provided, creates a new conversation.

        Returns:
            Tuple of (assistant message with answer and sources, conversation_id)
        """
        # Step 0: Create or retrieve conversation
        if not conversation_id:
            # Create new conversation
            now = datetime.utcnow()
            conversation = Conversation(
                id=None,
                created_at=now,
                updated_at=now,
                messages=[]
            )
            conversation_id = await self.conversation_repository.save(conversation)
        else:
            # Verify conversation exists
            conversation = await self.conversation_repository.get_by_id(conversation_id)
            if not conversation:
                raise ValueError(f"Conversation {conversation_id} not found")

        # Step 1: Save user message
        user_message = Message(
            id=None,
            role="user",
            content=query,
            created_at=datetime.utcnow(),
            sources=None
        )
        await self.message_repository.save(user_message, conversation_id)

        # Step 2: Generate embedding for the query
        query_embedding = await self.embedding_service.generate_embedding(query)

        # Step 3: Search for relevant chunks in vector store
        search_results = await self.vector_store.search(
            query_embedding=query_embedding,
            top_k=settings.TOP_K
        )

        # Step 4: Extract context and sources
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

        # Step 5: Generate response using LLM
        if not context_chunks:
            answer = "No encontré información relevante en los documentos para responder tu pregunta. Por favor, asegúrate de haber subido documentos relacionados con tu consulta."
        else:
            answer = await self.llm_service.generate_response(
                query=query,
                context=context_chunks
            )

        # Step 6: Create and save assistant message
        assistant_message = Message(
            id=None,
            role="assistant",
            content=answer,
            created_at=datetime.utcnow(),
            sources=sources if sources else None
        )
        await self.message_repository.save(assistant_message, conversation_id)

        # Step 7: Update conversation timestamp
        conversation.updated_at = datetime.utcnow()
        await self.conversation_repository.update(conversation)

        return assistant_message, conversation_id