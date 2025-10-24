"""
Conversation repository implementation.
"""
from typing import List, Optional
from datetime import datetime
import uuid

from app.domain.entities.conversation import Conversation
from app.domain.ports.conversation_repository import ConversationRepositoryPort
from app.infrastructure.db.postgres_client import PostgresClient


class ConversationRepository(ConversationRepositoryPort):
    """
    PostgreSQL conversation repository.
    """

    def __init__(self, db_client: PostgresClient):
        self.db = db_client

    async def save(self, conversation: Conversation) -> str:
        """
        Save a conversation to the repository.

        Args:
            conversation: Conversation entity to save

        Returns:
            Conversation ID
        """
        if not conversation.id:
            conversation.id = str(uuid.uuid4())

        query = """
            INSERT INTO conversations (id, created_at, updated_at)
            VALUES ($1, $2, $3)
        """

        await self.db.execute(
            query,
            conversation.id,
            conversation.created_at,
            conversation.updated_at
        )
        return conversation.id

    async def get_by_id(self, conversation_id: str) -> Optional[Conversation]:
        """
        Retrieve a conversation by ID (without messages).

        Args:
            conversation_id: Conversation identifier

        Returns:
            Conversation entity or None
        """
        query = """
            SELECT id, created_at, updated_at
            FROM conversations
            WHERE id = $1
        """

        row = await self.db.fetch_one(query, conversation_id)

        if not row:
            return None

        return Conversation(
            id=row["id"],
            created_at=row["created_at"],
            updated_at=row["updated_at"],
            messages=[]
        )

    async def list_all(self) -> List[Conversation]:
        """
        List all conversations (without messages).

        Returns:
            List of conversation entities
        """
        query = """
            SELECT id, created_at, updated_at
            FROM conversations
            ORDER BY updated_at DESC
        """

        rows = await self.db.fetch_all(query)

        conversations = []
        for row in rows:
            conversations.append(Conversation(
                id=row["id"],
                created_at=row["created_at"],
                updated_at=row["updated_at"],
                messages=[]
            ))

        return conversations

    async def update(self, conversation: Conversation) -> None:
        """
        Update a conversation (e.g., updated_at timestamp).

        Args:
            conversation: Conversation entity to update
        """
        query = """
            UPDATE conversations
            SET updated_at = $1
            WHERE id = $2
        """

        await self.db.execute(
            query,
            conversation.updated_at,
            conversation.id
        )

    async def delete(self, conversation_id: str) -> None:
        """
        Delete a conversation.

        Args:
            conversation_id: Conversation identifier
        """
        query = "DELETE FROM conversations WHERE id = $1"
        await self.db.execute(query, conversation_id)
