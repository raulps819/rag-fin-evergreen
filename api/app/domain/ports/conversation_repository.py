"""
Conversation repository port (interface).
"""
from abc import ABC, abstractmethod
from typing import List, Optional
from app.domain.entities.conversation import Conversation


class ConversationRepositoryPort(ABC):
    """
    Port for conversation repository operations.
    """

    @abstractmethod
    async def save(self, conversation: Conversation) -> str:
        """
        Save a conversation to the repository.

        Args:
            conversation: Conversation entity to save

        Returns:
            Conversation ID
        """
        pass

    @abstractmethod
    async def get_by_id(self, conversation_id: str) -> Optional[Conversation]:
        """
        Retrieve a conversation by ID (without messages).

        Args:
            conversation_id: Conversation identifier

        Returns:
            Conversation entity or None
        """
        pass

    @abstractmethod
    async def list_all(self) -> List[Conversation]:
        """
        List all conversations (without messages).

        Returns:
            List of conversation entities
        """
        pass

    @abstractmethod
    async def update(self, conversation: Conversation) -> None:
        """
        Update a conversation (e.g., updated_at timestamp).

        Args:
            conversation: Conversation entity to update
        """
        pass

    @abstractmethod
    async def delete(self, conversation_id: str) -> None:
        """
        Delete a conversation.

        Args:
            conversation_id: Conversation identifier
        """
        pass
