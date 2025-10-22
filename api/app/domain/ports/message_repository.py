"""
Message repository port (interface).
"""
from abc import ABC, abstractmethod
from typing import List
from app.domain.entities.message import Message


class MessageRepositoryPort(ABC):
    """
    Port for message repository operations.
    """

    @abstractmethod
    async def save(self, message: Message, conversation_id: str) -> str:
        """
        Save a message to the repository.

        Args:
            message: Message entity to save
            conversation_id: ID of the conversation this message belongs to

        Returns:
            Message ID
        """
        pass

    @abstractmethod
    async def get_by_conversation_id(self, conversation_id: str) -> List[Message]:
        """
        Retrieve all messages for a conversation.

        Args:
            conversation_id: Conversation identifier

        Returns:
            List of message entities
        """
        pass

    @abstractmethod
    async def delete_by_conversation_id(self, conversation_id: str) -> None:
        """
        Delete all messages for a conversation.

        Args:
            conversation_id: Conversation identifier
        """
        pass
