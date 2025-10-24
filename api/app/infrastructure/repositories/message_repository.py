"""
Message repository implementation.
"""
import json
from typing import List
from datetime import datetime
import uuid

from app.domain.entities.message import Message, Source
from app.domain.ports.message_repository import MessageRepositoryPort
from app.infrastructure.db.postgres_client import PostgresClient


class MessageRepository(MessageRepositoryPort):
    """
    PostgreSQL message repository.
    """

    def __init__(self, db_client: PostgresClient):
        self.db = db_client

    async def save(self, message: Message, conversation_id: str) -> str:
        """
        Save a message to the repository.

        Args:
            message: Message entity to save
            conversation_id: ID of the conversation this message belongs to

        Returns:
            Message ID
        """
        if not message.id:
            message.id = str(uuid.uuid4())

        # Serialize sources to JSON
        sources_json = None
        if message.sources:
            sources_json = json.dumps([
                {
                    "document_id": src.document_id,
                    "filename": src.filename,
                    "chunk_index": src.chunk_index,
                    "content": src.content,
                    "relevance_score": src.relevance_score
                }
                for src in message.sources
            ])

        query = """
            INSERT INTO messages (id, conversation_id, role, content, sources, created_at)
            VALUES ($1, $2, $3, $4, $5, $6)
        """

        await self.db.execute(
            query,
            message.id,
            conversation_id,
            message.role,
            message.content,
            sources_json,
            message.created_at
        )
        return message.id

    async def get_by_conversation_id(self, conversation_id: str) -> List[Message]:
        """
        Retrieve all messages for a conversation.

        Args:
            conversation_id: Conversation identifier

        Returns:
            List of message entities
        """
        query = """
            SELECT id, role, content, sources, created_at
            FROM messages
            WHERE conversation_id = $1
            ORDER BY created_at ASC
        """

        rows = await self.db.fetch_all(query, conversation_id)

        messages = []
        for row in rows:
            # Deserialize sources from JSON
            sources = None
            if row["sources"]:
                sources_data = json.loads(row["sources"])
                sources = [
                    Source(
                        document_id=src["document_id"],
                        filename=src["filename"],
                        chunk_index=src["chunk_index"],
                        content=src["content"],
                        relevance_score=src.get("relevance_score")
                    )
                    for src in sources_data
                ]

            messages.append(Message(
                id=row["id"],
                role=row["role"],
                content=row["content"],
                created_at=row["created_at"],
                sources=sources
            ))

        return messages

    async def delete_by_conversation_id(self, conversation_id: str) -> None:
        """
        Delete all messages for a conversation.

        Args:
            conversation_id: Conversation identifier
        """
        query = "DELETE FROM messages WHERE conversation_id = $1"
        await self.db.execute(query, conversation_id)
