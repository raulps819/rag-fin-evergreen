"""
Integration tests for chat API endpoints.
"""
import pytest
from unittest.mock import patch, AsyncMock


@pytest.mark.integration
class TestChatAPI:
    """Test chat API endpoints."""

    @pytest.mark.asyncio
    async def test_chat_message_success(self, test_client):
        """Test successful chat message."""
        with patch("app.core.container.container.embedding_service") as mock_embed, \
             patch("app.core.container.container.vector_store") as mock_store, \
             patch("app.core.container.container.chat_service") as mock_chat:

            # Mock responses
            mock_embed.generate_embedding = AsyncMock(return_value=[0.1] * 1536)
            mock_store.search = AsyncMock(return_value=[
                {
                    "id": "doc1_chunk_0",
                    "document": "Los gastos del Q4 fueron $150,000",
                    "metadata": {
                        "document_id": "doc1",
                        "filename": "report.pdf",
                        "chunk_index": 0,
                        "file_type": "pdf"
                    },
                    "distance": 0.1
                }
            ])
            mock_chat.generate_response = AsyncMock(
                return_value="Los gastos del último trimestre fueron $150,000 según el reporte."
            )

            # Make request
            request_data = {
                "message": "¿Cuáles fueron los gastos del último trimestre?"
            }
            response = await test_client.post("/chat/message", json=request_data)

            # Verify response
            assert response.status_code == 200
            result = response.json()

            assert "answer" in result
            assert "sources" in result
            assert "created_at" in result
            assert "150,000" in result["answer"]
            assert len(result["sources"]) == 1
            assert result["sources"][0]["document_id"] == "doc1"
            assert result["sources"][0]["filename"] == "report.pdf"

    @pytest.mark.asyncio
    async def test_chat_message_empty(self, test_client):
        """Test chat with empty message."""
        request_data = {"message": ""}

        response = await test_client.post("/chat/message", json=request_data)

        assert response.status_code == 422  # Validation error

    @pytest.mark.asyncio
    async def test_chat_message_too_long(self, test_client):
        """Test chat with message exceeding max length."""
        request_data = {"message": "x" * 2001}  # Max is 2000

        response = await test_client.post("/chat/message", json=request_data)

        assert response.status_code == 422  # Validation error

    @pytest.mark.asyncio
    async def test_chat_no_results(self, test_client):
        """Test chat when no relevant documents are found."""
        with patch("app.core.container.container.embedding_service") as mock_embed, \
             patch("app.core.container.container.vector_store") as mock_store:

            mock_embed.generate_embedding = AsyncMock(return_value=[0.1] * 1536)
            mock_store.search = AsyncMock(return_value=[])  # No results

            request_data = {"message": "Pregunta sin resultados"}
            response = await test_client.post("/chat/message", json=request_data)

            assert response.status_code == 200
            result = response.json()

            assert "No encontré información relevante" in result["answer"]
            assert result["sources"] is None or len(result["sources"]) == 0

    @pytest.mark.asyncio
    async def test_chat_multiple_sources(self, test_client):
        """Test chat with multiple source documents."""
        with patch("app.core.container.container.embedding_service") as mock_embed, \
             patch("app.core.container.container.vector_store") as mock_store, \
             patch("app.core.container.container.chat_service") as mock_chat:

            mock_embed.generate_embedding = AsyncMock(return_value=[0.1] * 1536)
            mock_store.search = AsyncMock(return_value=[
                {
                    "id": "doc1_chunk_0",
                    "document": "Información del primer documento",
                    "metadata": {
                        "document_id": "doc1",
                        "filename": "report1.pdf",
                        "chunk_index": 0,
                        "file_type": "pdf"
                    },
                    "distance": 0.1
                },
                {
                    "id": "doc2_chunk_0",
                    "document": "Información del segundo documento",
                    "metadata": {
                        "document_id": "doc2",
                        "filename": "report2.pdf",
                        "chunk_index": 0,
                        "file_type": "pdf"
                    },
                    "distance": 0.15
                }
            ])
            mock_chat.generate_response = AsyncMock(
                return_value="Respuesta basada en múltiples documentos"
            )

            request_data = {"message": "Pregunta con múltiples fuentes"}
            response = await test_client.post("/chat/message", json=request_data)

            assert response.status_code == 200
            result = response.json()

            assert len(result["sources"]) == 2
            assert result["sources"][0]["filename"] == "report1.pdf"
            assert result["sources"][1]["filename"] == "report2.pdf"

    @pytest.mark.asyncio
    async def test_chat_relevance_scores(self, test_client):
        """Test that relevance scores are included in response."""
        with patch("app.core.container.container.embedding_service") as mock_embed, \
             patch("app.core.container.container.vector_store") as mock_store, \
             patch("app.core.container.container.chat_service") as mock_chat:

            mock_embed.generate_embedding = AsyncMock(return_value=[0.1] * 1536)
            mock_store.search = AsyncMock(return_value=[
                {
                    "id": "doc1_chunk_0",
                    "document": "Test content",
                    "metadata": {
                        "document_id": "doc1",
                        "filename": "test.pdf",
                        "chunk_index": 0,
                        "file_type": "pdf"
                    },
                    "distance": 0.2  # Should give relevance of 0.8
                }
            ])
            mock_chat.generate_response = AsyncMock(return_value="Test response")

            request_data = {"message": "Test query"}
            response = await test_client.post("/chat/message", json=request_data)

            assert response.status_code == 200
            result = response.json()

            assert result["sources"][0]["relevance_score"] == pytest.approx(0.8, rel=0.01)

    @pytest.mark.asyncio
    async def test_chat_invalid_json(self, test_client):
        """Test chat with invalid JSON."""
        response = await test_client.post(
            "/chat/message",
            content=b"invalid json",
            headers={"Content-Type": "application/json"}
        )

        assert response.status_code == 422