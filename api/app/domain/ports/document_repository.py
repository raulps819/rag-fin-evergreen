"""
Document repository port (interface).
"""
from abc import ABC, abstractmethod
from typing import List, Optional
from app.domain.entities.document import Document


class DocumentRepositoryPort(ABC):
    """
    Port for document repository operations.
    """

    @abstractmethod
    async def save(self, document: Document) -> str:
        """
        Save a document to the repository.

        Args:
            document: Document entity to save

        Returns:
            Document ID
        """
        pass

    @abstractmethod
    async def get_by_id(self, document_id: str) -> Optional[Document]:
        """
        Retrieve a document by ID.

        Args:
            document_id: Document identifier

        Returns:
            Document entity or None
        """
        pass

    @abstractmethod
    async def list_all(self) -> List[Document]:
        """
        List all documents.

        Returns:
            List of document entities
        """
        pass

    @abstractmethod
    async def delete(self, document_id: str) -> None:
        """
        Delete a document.

        Args:
            document_id: Document identifier
        """
        pass