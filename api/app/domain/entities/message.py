"""
Message entity.
"""
from datetime import datetime
from typing import Optional, List, Dict, Any
from dataclasses import dataclass


@dataclass
class Source:
    """
    Source reference for a message.
    """
    document_id: str
    filename: str
    chunk_index: int
    content: str
    relevance_score: Optional[float] = None


@dataclass
class Message:
    """
    Message entity representing a chat message.
    """
    id: Optional[str]
    role: str  # "user" or "assistant"
    content: str
    created_at: datetime
    sources: Optional[List[Source]] = None

    def __post_init__(self):
        """Validate entity after initialization."""
        if self.role not in ["user", "assistant"]:
            raise ValueError("role must be 'user' or 'assistant'")
        if not self.content:
            raise ValueError("content cannot be empty")