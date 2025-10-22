"""
Create conversation use case.
"""
from datetime import datetime

from app.domain.entities.conversation import Conversation
from app.domain.ports.conversation_repository import ConversationRepositoryPort


class CreateConversationUseCase:
    """
    Use case for creating a new conversation.
    """

    def __init__(self, conversation_repository: ConversationRepositoryPort):
        self.conversation_repository = conversation_repository

    async def execute(self) -> Conversation:
        """
        Create a new empty conversation.

        Returns:
            Created conversation entity with ID
        """
        now = datetime.utcnow()
        conversation = Conversation(
            id=None,
            created_at=now,
            updated_at=now,
            messages=[]
        )

        conversation_id = await self.conversation_repository.save(conversation)
        conversation.id = conversation_id

        return conversation
