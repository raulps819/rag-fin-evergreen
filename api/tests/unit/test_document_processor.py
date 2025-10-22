"""
Unit tests for DocumentProcessor.
"""
import pytest
from app.infrastructure.document_processor import DocumentProcessor


@pytest.mark.unit
class TestDocumentProcessor:
    """Test DocumentProcessor class."""

    @pytest.mark.asyncio
    async def test_extract_text_from_csv(self, sample_csv_content):
        """Test CSV text extraction."""
        processor = DocumentProcessor()
        text = await processor.extract_text_from_csv(sample_csv_content)

        assert "Fecha" in text
        assert "Concepto" in text
        assert "Compra suministros" in text
        assert "1500" in text

    @pytest.mark.asyncio
    async def test_extract_text_unsupported_type(self):
        """Test extraction with unsupported file type."""
        processor = DocumentProcessor()

        with pytest.raises(ValueError, match="Unsupported file type"):
            await processor.extract_text(b"content", "txt")

    @pytest.mark.asyncio
    async def test_extract_text_empty_file(self):
        """Test extraction with empty file."""
        processor = DocumentProcessor()

        with pytest.raises(ValueError):
            await processor.extract_text_from_csv(b"")

    def test_chunk_text_basic(self):
        """Test basic text chunking."""
        processor = DocumentProcessor()
        text = "This is a test. " * 100  # Create a long text

        chunks = processor.chunk_text(text, chunk_size=50, overlap=10)

        assert len(chunks) > 0
        assert all(len(chunk) <= 60 for chunk in chunks)  # Allow some margin

    def test_chunk_text_with_overlap(self):
        """Test chunking with overlap."""
        processor = DocumentProcessor()
        text = "First sentence. Second sentence. Third sentence. Fourth sentence."

        chunks = processor.chunk_text(text, chunk_size=30, overlap=10)

        assert len(chunks) >= 2
        # Check that there's some overlap
        if len(chunks) >= 2:
            # Some content should appear in multiple chunks
            assert any(
                word in chunks[1]
                for word in chunks[0].split()[-3:]
            )

    def test_chunk_text_empty(self):
        """Test chunking empty text."""
        processor = DocumentProcessor()

        chunks = processor.chunk_text("", chunk_size=100, overlap=20)

        assert chunks == []

    def test_chunk_text_short(self):
        """Test chunking text shorter than chunk size."""
        processor = DocumentProcessor()
        text = "Short text"

        chunks = processor.chunk_text(text, chunk_size=100, overlap=20)

        assert len(chunks) == 1
        assert chunks[0] == text

    def test_chunk_text_sentence_boundary(self):
        """Test that chunking respects sentence boundaries."""
        processor = DocumentProcessor()
        text = "First sentence here. Second sentence here. Third sentence here."

        chunks = processor.chunk_text(text, chunk_size=30, overlap=5)

        # Chunks should end at sentence boundaries when possible
        for chunk in chunks:
            if len(chunk) < 30:  # Only check full chunks
                continue
            # Should end with period or be at the end
            assert chunk.rstrip().endswith('.') or chunk == chunks[-1]