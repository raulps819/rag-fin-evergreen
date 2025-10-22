"""
Get conversation use case.
"""
from typing import Optional

from app.domain.entities.conversation import Conversation
from app.domain.ports.conversation_repository import ConversationRepositoryPort
from app.domain.ports.message_repository import MessageRepositoryPort


class GetConversationUseCase:
    """
    Use case for retrieving a conversation with its messages.
    """

    def __init__(
        self,
        conversation_repository: ConversationRepositoryPort,
        message_repository: MessageRepositoryPort
    ):
        self.conversation_repository = conversation_repository
        self.message_repository = message_repository

    async def execute(self, conversation_id: str) -> Optional[Conversation]:
        """
        Get a conversation by ID with all its messages.

        Args:
            conversation_id: Conversation identifier

        Returns:
            Conversation entity with messages or None if not found
        """
        conversation = await self.conversation_repository.get_by_id(conversation_id)

        if not conversation:
            return None

        # Load messages for this conversation
        messages = await self.message_repository.get_by_conversation_id(conversation_id)
        conversation.messages = messages

        return conversation
