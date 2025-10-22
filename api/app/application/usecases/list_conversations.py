"""
List conversations use case.
"""
from typing import List

from app.domain.entities.conversation import Conversation
from app.domain.ports.conversation_repository import ConversationRepositoryPort


class ListConversationsUseCase:
    """
    Use case for listing all conversations.
    """

    def __init__(self, conversation_repository: ConversationRepositoryPort):
        self.conversation_repository = conversation_repository

    async def execute(self) -> List[Conversation]:
        """
        List all conversations (without messages).

        Returns:
            List of conversation entities ordered by updated_at DESC
        """
        conversations = await self.conversation_repository.list_all()
        return conversations
