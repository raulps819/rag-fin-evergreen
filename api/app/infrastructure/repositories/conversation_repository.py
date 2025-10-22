"""
Conversation repository implementation.
"""
from typing import List, Optional
from datetime import datetime
import uuid

from app.domain.entities.conversation import Conversation
from app.domain.ports.conversation_repository import ConversationRepositoryPort
from app.infrastructure.db.sqlite_client import SQLiteClient


class ConversationRepository(ConversationRepositoryPort):
    """
    SQLite implementation of conversation repository.
    """

    def __init__(self, db_client: SQLiteClient):
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
            VALUES (?, ?, ?)
        """
        params = (
            conversation.id,
            conversation.created_at.isoformat(),
            conversation.updated_at.isoformat()
        )

        await self.db.execute(query, params)
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
            WHERE id = ?
        """

        row = await self.db.fetch_one(query, (conversation_id,))

        if not row:
            return None

        return Conversation(
            id=row["id"],
            created_at=datetime.fromisoformat(row["created_at"]),
            updated_at=datetime.fromisoformat(row["updated_at"]),
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
                created_at=datetime.fromisoformat(row["created_at"]),
                updated_at=datetime.fromisoformat(row["updated_at"]),
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
            SET updated_at = ?
            WHERE id = ?
        """
        params = (
            conversation.updated_at.isoformat(),
            conversation.id
        )

        await self.db.execute(query, params)

    async def delete(self, conversation_id: str) -> None:
        """
        Delete a conversation.

        Args:
            conversation_id: Conversation identifier
        """
        query = "DELETE FROM conversations WHERE id = ?"
        await self.db.execute(query, (conversation_id,))
