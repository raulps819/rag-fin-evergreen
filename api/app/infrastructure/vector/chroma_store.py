"""
Chroma vector store implementation.
"""
from typing import List, Dict, Any
import chromadb
from chromadb.config import Settings
from app.domain.ports.vector_store import VectorStorePort
from app.core.config import settings as app_settings


class ChromaVectorStore(VectorStorePort):
    """
    Chroma vector store implementation.
    Connects to ChromaDB server via HTTP.
    """

    def __init__(self):
        # Initialize Chroma REST client (required for server-based deployments)
        self.client = chromadb.Client(
            Settings(
                chroma_api_impl="chromadb.api.fastapi.FastAPI",
                chroma_server_host=self._parse_chroma_host(),
                chroma_server_http_port=self._parse_chroma_port(),
                anonymized_telemetry=False
            )
        )

        # Get or create collection
        self.collection = self.client.get_or_create_collection(
            name="financial_documents",
            metadata={"description": "Financial documents embeddings"}
        )

    def _parse_chroma_host(self) -> str:
        """Extract host from CHROMA_URL."""
        url = app_settings.CHROMA_URL
        # Remove http:// or https://
        if "://" in url:
            url = url.split("://")[1]
        # Remove port if present
        if ":" in url:
            url = url.split(":")[0]
        return url

    def _parse_chroma_port(self) -> int:
        """Extract port from CHROMA_URL."""
        url = app_settings.CHROMA_URL
        # Remove http:// or https://
        if "://" in url:
            url = url.split("://")[1]
        # Extract port if present
        if ":" in url:
            return int(url.split(":")[1])
        return 8000  # Default ChromaDB port

    async def add_chunks(
        self,
        document_id: str,
        chunks: List[str],
        embeddings: List[List[float]],
        metadata: List[Dict[str, Any]]
    ) -> None:
        """
        Add document chunks with embeddings to the vector store.
        """
        if not chunks:
            return

        # Generate IDs for chunks
        ids = [f"{document_id}_chunk_{i}" for i in range(len(chunks))]

        # Add to collection
        self.collection.add(
            ids=ids,
            embeddings=embeddings,
            documents=chunks,
            metadatas=metadata
        )

    async def search(
        self,
        query_embedding: List[float],
        top_k: int = 5
    ) -> List[Dict[str, Any]]:
        """
        Search for similar chunks based on query embedding.
        """
        results = self.collection.query(
            query_embeddings=[query_embedding],
            n_results=top_k
        )

        # Format results
        formatted_results = []
        if results["documents"] and results["documents"][0]:
            for i in range(len(results["documents"][0])):
                formatted_results.append({
                    "id": results["ids"][0][i],
                    "document": results["documents"][0][i],
                    "metadata": results["metadatas"][0][i] if results["metadatas"] else {},
                    "distance": results["distances"][0][i] if results.get("distances") else None
                })

        return formatted_results

    async def delete_document(self, document_id: str) -> None:
        """
        Delete all chunks for a document.
        """
        # Query all chunk IDs for this document
        try:
            self.collection.delete(
                where={"document_id": document_id}
            )
        except Exception as e:
            print(f"Error deleting document {document_id}: {e}")
