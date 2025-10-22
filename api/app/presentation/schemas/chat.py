"""
Chat schemas for API requests and responses.
"""
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field


class SourceSchema(BaseModel):
    """Schema for document source reference."""

    document_id: str = Field(..., description="Document ID")
    filename: str = Field(..., description="Source filename")
    chunk_index: int = Field(..., description="Chunk index in document")
    content: str = Field(..., description="Chunk content preview")
    relevance_score: Optional[float] = Field(None, description="Relevance score (0-1)")

    class Config:
        json_schema_extra = {
            "example": {
                "document_id": "123e4567-e89b-12d3-a456-426614174000",
                "filename": "financial_report.pdf",
                "chunk_index": 5,
                "content": "Este es un extracto del documento...",
                "relevance_score": 0.95
            }
        }


class ChatRequest(BaseModel):
    """Request schema for chat message."""

    message: str = Field(
        ...,
        description="User question or message",
        min_length=1,
        max_length=2000
    )
    conversation_id: Optional[str] = Field(
        None,
        description="Optional conversation ID. If not provided, a new conversation will be created."
    )

    class Config:
        json_schema_extra = {
            "example": {
                "message": "¿Cuáles fueron los gastos totales del último trimestre?",
                "conversation_id": "123e4567-e89b-12d3-a456-426614174000"
            }
        }


class MessageResponse(BaseModel):
    """Response schema for a message (used in conversation history)."""

    id: str = Field(..., description="Message ID")
    role: str = Field(..., description="Message role (user or assistant)")
    content: str = Field(..., description="Message content")
    sources: Optional[List[SourceSchema]] = Field(
        None,
        description="Source documents (only for assistant messages)"
    )
    created_at: datetime = Field(..., description="Message timestamp")

    class Config:
        from_attributes = True


class ChatResponse(BaseModel):
    """Response schema for chat message."""

    answer: str = Field(..., description="Assistant's response")
    conversation_id: str = Field(..., description="Conversation ID")
    sources: Optional[List[SourceSchema]] = Field(
        None,
        description="Source documents used to generate the answer"
    )
    created_at: datetime = Field(..., description="Response timestamp")

    class Config:
        json_schema_extra = {
            "example": {
                "answer": "Los gastos totales del último trimestre fueron $150,000 según el reporte financiero.",
                "conversation_id": "123e4567-e89b-12d3-a456-426614174000",
                "sources": [
                    {
                        "document_id": "123e4567-e89b-12d3-a456-426614174000",
                        "filename": "financial_report.pdf",
                        "chunk_index": 5,
                        "content": "Gastos Q4: $150,000...",
                        "relevance_score": 0.95
                    }
                ],
                "created_at": "2024-01-15T10:30:00"
            }
        }