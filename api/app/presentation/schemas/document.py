"""
Document schemas for API requests and responses.
"""
from datetime import datetime
from pydantic import BaseModel, Field


class DocumentUploadResponse(BaseModel):
    """Response schema for document upload."""

    id: str = Field(..., description="Document ID")
    filename: str = Field(..., description="Original filename")
    file_type: str = Field(..., description="File type/extension")
    chunk_count: int = Field(..., description="Number of chunks created")
    upload_date: datetime = Field(..., description="Upload timestamp")
    is_temporary: bool = Field(default=False, description="Whether document is temporary")

    class Config:
        json_schema_extra = {
            "example": {
                "id": "123e4567-e89b-12d3-a456-426614174000",
                "filename": "financial_report.pdf",
                "file_type": "pdf",
                "chunk_count": 15,
                "upload_date": "2024-01-15T10:30:00",
                "is_temporary": False
            }
        }


class DocumentListResponse(BaseModel):
    """Response schema for listing documents."""

    documents: list[DocumentUploadResponse] = Field(..., description="List of documents")
    total: int = Field(..., description="Total number of documents")

    class Config:
        json_schema_extra = {
            "example": {
                "documents": [
                    {
                        "id": "123e4567-e89b-12d3-a456-426614174000",
                        "filename": "financial_report.pdf",
                        "file_type": "pdf",
                        "chunk_count": 15,
                        "upload_date": "2024-01-15T10:30:00",
                        "is_temporary": False
                    }
                ],
                "total": 1
            }
        }