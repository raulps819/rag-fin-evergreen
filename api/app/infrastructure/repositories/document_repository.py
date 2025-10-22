"""
Document repository implementation.
"""
import uuid
from typing import List, Optional
from datetime import datetime

from app.domain.entities.document import Document
from app.domain.ports.document_repository import DocumentRepositoryPort
from app.infrastructure.db.sqlite_client import SQLiteClient


class DocumentRepository(DocumentRepositoryPort):
    """
    SQLite implementation of document repository.
    """

    def __init__(self, db_client: SQLiteClient):
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
            VALUES (?, ?, ?, ?, ?, ?)
        """

        await self.db.execute(
            query,
            (
                document.id,
                document.filename,
                document.file_type,
                document.chunk_count,
                document.upload_date.isoformat(),
                1 if document.is_temporary else 0
            )
        )
        await self.db.commit()

        return document.id

    async def get_by_id(self, document_id: str) -> Optional[Document]:
        """
        Retrieve a document by ID.
        """
        query = "SELECT * FROM documents WHERE id = ?"
        row = await self.db.fetch_one(query, (document_id,))

        if not row:
            return None

        return Document(
            id=row["id"],
            filename=row["filename"],
            file_type=row["file_type"],
            chunk_count=row["chunk_count"],
            upload_date=datetime.fromisoformat(row["upload_date"]),
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
                upload_date=datetime.fromisoformat(row["upload_date"]),
                is_temporary=bool(row["is_temporary"])
            )
            for row in rows
        ]

    async def delete(self, document_id: str) -> None:
        """
        Delete a document.
        """
        query = "DELETE FROM documents WHERE id = ?"
        await self.db.execute(query, (document_id,))
        await self.db.commit()