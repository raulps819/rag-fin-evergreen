"""
Document repository implementation.
"""
import uuid
from typing import List, Optional
from datetime import datetime

from app.domain.entities.document import Document
from app.domain.ports.document_repository import DocumentRepositoryPort
from app.infrastructure.db.postgres_client import PostgresClient


class DocumentRepository(DocumentRepositoryPort):
    """
    PostgreSQL document repository.
    """

    def __init__(self, db_client: PostgresClient):
        self.db = db_client

    async def save(self, document: Document) -> str:
        """
        Save a document to the repository.
        """
        # Generate ID if not provided
        if not document.id:
            document.id = str(uuid.uuid4())

        query = """
            INSERT INTO documents (id, filename, file_type, chunk_count, upload_date, is_temporary)
            VALUES ($1, $2, $3, $4, $5, $6)
        """

        await self.db.execute(
            query,
            document.id,
            document.filename,
            document.file_type,
            document.chunk_count,
            document.upload_date,
            document.is_temporary
        )

        return document.id

    async def get_by_id(self, document_id: str) -> Optional[Document]:
        """
        Retrieve a document by ID.
        """
        query = "SELECT * FROM documents WHERE id = $1"
        row = await self.db.fetch_one(query, document_id)

        if not row:
            return None

        return Document(
            id=row["id"],
            filename=row["filename"],
            file_type=row["file_type"],
            chunk_count=row["chunk_count"],
            upload_date=row["upload_date"],
            is_temporary=bool(row["is_temporary"])
        )

    async def list_all(self) -> List[Document]:
        """
        List all documents.
        """
        query = "SELECT * FROM documents ORDER BY upload_date DESC"
        rows = await self.db.fetch_all(query)

        return [
            Document(
                id=row["id"],
                filename=row["filename"],
                file_type=row["file_type"],
                chunk_count=row["chunk_count"],
                upload_date=row["upload_date"],
                is_temporary=bool(row["is_temporary"])
            )
            for row in rows
        ]

    async def delete(self, document_id: str) -> None:
        """
        Delete a document.
        """
        query = "DELETE FROM documents WHERE id = $1"
        await self.db.execute(query, document_id)