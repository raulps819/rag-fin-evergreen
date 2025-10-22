"""
Document entity.
"""
from datetime import datetime
from typing import Optional
from dataclasses import dataclass


@dataclass
class Document:
    """
    Document entity representing a financial document.
    """
    id: Optional[str]
    filename: str
    file_type: str
    chunk_count: int
    upload_date: datetime
    is_temporary: bool = False

    def __post_init__(self):
        """Validate entity after initialization."""
        if not self.filename:
            raise ValueError("filename cannot be empty")
        if self.chunk_count < 0:
            raise ValueError("chunk_count must be non-negative")