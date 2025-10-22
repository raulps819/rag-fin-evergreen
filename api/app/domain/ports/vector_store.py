"""
Vector store port (interface).
"""
from abc import ABC, abstractmethod
from typing import List, Dict, Any


class VectorStorePort(ABC):
    """
    Port for vector store operations.
    """

    @abstractmethod
    async def add_chunks(
        self,
        document_id: str,
        chunks: List[str],
        embeddings: List[List[float]],
        metadata: List[Dict[str, Any]]
    ) -> None:
        """
        Add document chunks with embeddings to the vector store.

        Args:
            document_id: Unique identifier for the document
            chunks: List of text chunks
            embeddings: List of embedding vectors
            metadata: List of metadata dicts for each chunk
        """
        pass

    @abstractmethod
    async def search(
        self,
        query_embedding: List[float],
        top_k: int = 5
    ) -> List[Dict[str, Any]]:
        """
        Search for similar chunks based on query embedding.

        Args:
            query_embedding: Query vector
            top_k: Number of results to return

        Returns:
            List of similar chunks with metadata
        """
        pass

    @abstractmethod
    async def delete_document(self, document_id: str) -> None:
        """
        Delete all chunks for a document.

        Args:
            document_id: Document identifier
        """
        pass