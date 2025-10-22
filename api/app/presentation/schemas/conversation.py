"""
Conversation schemas for API requests and responses.
"""
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel

from app.presentation.schemas.chat import MessageResponse


class ConversationResponse(BaseModel):
    """
    Schema for conversation response (without messages).
    """
    id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ConversationDetailResponse(BaseModel):
    """
    Schema for conversation detail response (with messages).
    """
    id: str
    created_at: datetime
    updated_at: datetime
    messages: List[MessageResponse]

    class Config:
        from_attributes = True


class ConversationListResponse(BaseModel):
    """
    Schema for list of conversations response.
    """
    conversations: List[ConversationResponse]
    total: int

    class Config:
        from_attributes = True
