"""
Unit tests for UploadDocumentUseCase.
"""
import pytest
from datetime import datetime
from unittest.mock import AsyncMock

from app.application.usecases.upload_document import UploadDocumentUseCase
from app.domain.entities.document import Document


@pytest.mark.unit
class TestUploadDocumentUseCase:
    """Test UploadDocumentUseCase class."""

    @pytest.fixture
    def mock_document_repository(self):
        """Mock document repository."""
        repo = AsyncMock()
        repo.save.return_value = "test-doc-id"
        return repo

    @pytest.fixture
    def mock_document_processor(self):
        """Mock document processor."""
        processor = AsyncMock()
        processor.extract_text.return_value = "Este es un documento de prueba con contenido financiero."
        processor.chunk_text.return_value = [
            "Este es un documento de prueba",
            "con contenido financiero"
        ]
        return processor

    @pytest.fixture
    def usecase(
        self,
        mock_document_repository,
        mock_vector_store,
        mock_embedding_service,
        mock_document_processor
    ):
        """Create UploadDocumentUseCase with mocked dependencies."""
        return UploadDocumentUseCase(
            document_repository=mock_document_repository,
            vector_store=mock_vector_store,
            embedding_service=mock_embedding_service,
            document_processor=mock_document_processor
        )

    @pytest.mark.asyncio
    async def test_execute_success(
        self,
        usecase,
        mock_document_processor,
        mock_embedding_service,
        mock_vector_store,
        mock_document_repository,
        sample_csv_content
    ):
        """Test successful document upload."""
        # Execute use case
        result = await usecase.execute(
            filename="test.csv",
            file_content=sample_csv_content,
            file_type="csv",
            is_temporary=False
        )

        # Verify result
        assert isinstance(result, Document)
        assert result.id == "test-doc-id"
        assert result.filename == "test.csv"
        assert result.file_type == "csv"
        assert result.chunk_count == 2
        assert result.is_temporary is False

        # Verify calls
        mock_document_processor.extract_text.assert_called_once_with(sample_csv_content, "csv")
        mock_document_processor.chunk_text.assert_called_once()
        mock_embedding_service.generate_embeddings.assert_called_once()
        mock_vector_store.add_chunks.assert_called_once()
        mock_document_repository.save.assert_called_once()

    @pytest.mark.asyncio
    async def test_execute_empty_text(
        self,
        usecase,
        mock_document_processor,
        sample_csv_content
    ):
        """Test upload with empty extracted text."""
        mock_document_processor.extract_text.return_value = ""

        with pytest.raises(ValueError, match="No text could be extracted"):
            await usecase.execute(
                filename="empty.csv",
                file_content=sample_csv_content,
                file_type="csv"
            )

    @pytest.mark.asyncio
    async def test_execute_no_chunks(
        self,
        usecase,
        mock_document_processor,
        sample_csv_content
    ):
        """Test upload with no chunks created."""
        mock_document_processor.extract_text.return_value = "Some text"
        mock_document_processor.chunk_text.return_value = []

        with pytest.raises(ValueError, match="No chunks could be created"):
            await usecase.execute(
                filename="test.csv",
                file_content=sample_csv_content,
                file_type="csv"
            )

    @pytest.mark.asyncio
    async def test_execute_temporary_document(
        self,
        usecase,
        sample_csv_content
    ):
        """Test upload with temporary flag."""
        result = await usecase.execute(
            filename="temp.csv",
            file_content=sample_csv_content,
            file_type="csv",
            is_temporary=True
        )

        assert result.is_temporary is True

    @pytest.mark.asyncio
    async def test_execute_metadata_creation(
        self,
        usecase,
        mock_vector_store,
        sample_csv_content
    ):
        """Test that correct metadata is created for chunks."""
        await usecase.execute(
            filename="test.csv",
            file_content=sample_csv_content,
            file_type="csv"
        )

        # Verify vector store was called with correct metadata
        call_args = mock_vector_store.add_chunks.call_args
        metadata = call_args.kwargs["metadata"]

        assert len(metadata) == 2  # Two chunks
        assert all(m["document_id"] == "test-doc-id" for m in metadata)
        assert all(m["filename"] == "test.csv" for m in metadata)
        assert all(m["file_type"] == "csv" for m in metadata)
        assert metadata[0]["chunk_index"] == 0
        assert metadata[1]["chunk_index"] == 1