"""
Unit tests for ChatUseCase.
"""
import pytest
from unittest.mock import AsyncMock

from app.application.usecases.chat import ChatUseCase
from app.domain.entities.message import Message


@pytest.mark.unit
class TestChatUseCase:
    """Test ChatUseCase class."""

    @pytest.fixture
    def usecase(
        self,
        mock_vector_store,
        mock_chat_service,
        mock_embedding_service
    ):
        """Create ChatUseCase with mocked dependencies."""
        return ChatUseCase(
            vector_store=mock_vector_store,
            llm_service=mock_chat_service,
            embedding_service=mock_embedding_service
        )

    @pytest.mark.asyncio
    async def test_execute_success(
        self,
        usecase,
        mock_embedding_service,
        mock_vector_store,
        mock_chat_service
    ):
        """Test successful chat execution."""
        query = "¿Cuáles son los gastos principales?"

        # Execute use case
        result = await usecase.execute(query)

        # Verify result
        assert isinstance(result, Message)
        assert result.role == "assistant"
        assert result.content == "Esta es una respuesta de prueba basada en el contexto proporcionado."
        assert result.sources is not None
        assert len(result.sources) == 1
        assert result.sources[0].document_id == "test-doc-id"
        assert result.sources[0].filename == "test.pdf"

        # Verify calls
        mock_embedding_service.generate_embedding.assert_called_once_with(query)
        mock_vector_store.search.assert_called_once()
        mock_chat_service.generate_response.assert_called_once()

    @pytest.mark.asyncio
    async def test_execute_no_results(
        self,
        usecase,
        mock_vector_store
    ):
        """Test chat with no search results."""
        # Mock empty search results
        mock_vector_store.search.return_value = []

        query = "Pregunta sin resultados"
        result = await usecase.execute(query)

        # Should return a message saying no information was found
        assert isinstance(result, Message)
        assert result.role == "assistant"
        assert "No encontré información relevante" in result.content
        assert result.sources is None or len(result.sources) == 0

    @pytest.mark.asyncio
    async def test_execute_multiple_sources(
        self,
        usecase,
        mock_vector_store,
        mock_chat_service
    ):
        """Test chat with multiple source chunks."""
        # Mock multiple search results
        mock_vector_store.search.return_value = [
            {
                "id": "doc1_chunk_0",
                "document": "Primer fragmento de información",
                "metadata": {
                    "document_id": "doc1",
                    "filename": "report1.pdf",
                    "chunk_index": 0,
                    "file_type": "pdf"
                },
                "distance": 0.1
            },
            {
                "id": "doc1_chunk_1",
                "document": "Segundo fragmento de información",
                "metadata": {
                    "document_id": "doc1",
                    "filename": "report1.pdf",
                    "chunk_index": 1,
                    "file_type": "pdf"
                },
                "distance": 0.15
            },
            {
                "id": "doc2_chunk_0",
                "document": "Tercer fragmento de otro documento",
                "metadata": {
                    "document_id": "doc2",
                    "filename": "report2.pdf",
                    "chunk_index": 0,
                    "file_type": "pdf"
                },
                "distance": 0.2
            }
        ]

        query = "Pregunta con múltiples fuentes"
        result = await usecase.execute(query)

        # Verify sources
        assert len(result.sources) == 3
        assert result.sources[0].document_id == "doc1"
        assert result.sources[1].document_id == "doc1"
        assert result.sources[2].document_id == "doc2"

        # Verify LLM was called with all context
        call_args = mock_chat_service.generate_response.call_args
        context = call_args.kwargs["context"]
        assert len(context) == 3

    @pytest.mark.asyncio
    async def test_execute_relevance_scores(
        self,
        usecase,
        mock_vector_store
    ):
        """Test that relevance scores are calculated correctly."""
        # Distance of 0.1 should give relevance of 0.9
        mock_vector_store.search.return_value = [
            {
                "id": "doc1_chunk_0",
                "document": "Test content",
                "metadata": {
                    "document_id": "doc1",
                    "filename": "test.pdf",
                    "chunk_index": 0,
                    "file_type": "pdf"
                },
                "distance": 0.1
            }
        ]

        result = await usecase.execute("test query")

        # Relevance score should be 1 - distance = 0.9
        assert result.sources[0].relevance_score == pytest.approx(0.9)

    @pytest.mark.asyncio
    async def test_execute_content_preview(
        self,
        usecase,
        mock_vector_store
    ):
        """Test that content preview is truncated."""
        long_content = "A" * 500  # Long content
        mock_vector_store.search.return_value = [
            {
                "id": "doc1_chunk_0",
                "document": long_content,
                "metadata": {
                    "document_id": "doc1",
                    "filename": "test.pdf",
                    "chunk_index": 0,
                    "file_type": "pdf"
                },
                "distance": 0.1
            }
        ]

        result = await usecase.execute("test query")

        # Content should be truncated to 200 chars + "..."
        assert len(result.sources[0].content) <= 203
        assert result.sources[0].content.endswith("...")