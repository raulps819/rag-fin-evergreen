"""
Chat use case.
"""
from datetime import datetime
from typing import List, Optional
import uuid
import logging

from app.domain.entities.message import Message, Source
from app.domain.entities.conversation import Conversation
from app.domain.ports.vector_store import VectorStorePort
from app.domain.ports.llm_service import LLMServicePort
from app.domain.ports.conversation_repository import ConversationRepositoryPort
from app.domain.ports.message_repository import MessageRepositoryPort
from app.infrastructure.llm.openai_embedding import OpenAIEmbeddingService
from app.core.config import settings

logger = logging.getLogger(__name__)


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

        # Step 2: Retrieve conversation history
        conversation_messages = await self.message_repository.get_by_conversation_id(conversation_id)

        # Build conversation history (exclude the just-saved user message)
        conversation_history = []
        for msg in conversation_messages[:-1]:  # Exclude last message (current query)
            conversation_history.append(f"{msg.role.upper()}: {msg.content}")

        # Limit history to recent messages
        conversation_history = conversation_history[-settings.CONVERSATION_HISTORY_LIMIT:]

        # Step 3: Generate embedding and search for relevant chunks
        query_embedding = await self.embedding_service.generate_embedding(query)

        # Search for relevant chunks in vector store
        search_results = await self.vector_store.search(
            query_embedding=query_embedding,
            top_k=settings.TOP_K
        )

        # Step 4: Build context and sources
        context_chunks = []
        sources = []

        for result in search_results:
            distance = result.get("distance")

            # Cosine similarity (1 - distance). Si no hay distancia, no filtrar.
            if distance is None:
                context_chunks.append(result["document"])
                similarity = None
            else:
                similarity = 1 - distance
                if similarity < settings.MIN_RELEVANCE:
                    logger.debug(f"Skipping chunk with similarity {similarity:.3f} below threshold {settings.MIN_RELEVANCE}")
                    continue
                context_chunks.append(result["document"])

            metadata = result.get("metadata", {})
            source = Source(
                document_id=metadata.get("document_id", "unknown"),
                filename=metadata.get("filename", "unknown"),
                chunk_index=metadata.get("chunk_index", 0),
                content=result["document"][:200] + "...",  # Preview
                relevance_score=similarity
            )
            sources.append(source)

        # Step 5: Prepare context for LLM
        # If no document chunks found, use conversation history as context
        if not context_chunks and conversation_history:
            logger.info(f"No document chunks found for query '{query}', using conversation history")
            context_chunks = [
                "Historial de la conversación:\n" + "\n".join(conversation_history)
            ]
            sources = None  # No document sources
        elif not context_chunks:
            # No chunks and no history - still provide empty context
            logger.info(f"No context available for query '{query}'")
            context_chunks = []
            sources = None

        # Step 6: Generate response using LLM
        answer = await self.llm_service.generate_response(
            query=query,
            context=context_chunks
        )

        # Step 5: Create and save assistant message
        assistant_message = Message(
            id=None,
            role="assistant",
            content=answer,
            created_at=datetime.utcnow(),
            sources=sources if sources else None
        )
        await self.message_repository.save(assistant_message, conversation_id)

        # Step 6: Update conversation timestamp
        conversation.updated_at = datetime.utcnow()
        await self.conversation_repository.update(conversation)

        return assistant_message, conversation_id