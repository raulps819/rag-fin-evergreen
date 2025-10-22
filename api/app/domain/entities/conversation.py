"""
Conversation entity.
"""
from datetime import datetime
from typing import Optional, List
from dataclasses import dataclass

from app.domain.entities.message import Message


@dataclass
class Conversation:
    """
    Conversation entity representing a chat conversation.
    """
    id: Optional[str]
    created_at: datetime
    updated_at: datetime
    messages: Optional[List[Message]] = None

    def __post_init__(self):
        """Validate entity after initialization."""
        if self.messages is None:
            self.messages = []
