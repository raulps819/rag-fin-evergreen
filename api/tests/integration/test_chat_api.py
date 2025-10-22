"""
Integration tests for chat API endpoints.
"""
import pytest
from unittest.mock import patch, AsyncMock
from contextlib import contextmanager
from datetime import datetime
from app.domain.entities.conversation import Conversation


@contextmanager
def mock_chat_dependencies():
    """Context manager to mock all chat dependencies including repositories."""
    with patch("app.core.container.container.embedding_service") as mock_embed, \
         patch("app.core.container.container.vector_store") as mock_store, \
         patch("app.core.container.container.chat_service") as mock_chat, \
         patch("app.core.container.container.conversation_repository") as mock_conv_repo, \
         patch("app.core.container.container.message_repository") as mock_msg_repo, \
         patch("app.core.container.container.get_chat_usecase") as mock_get_usecase:

        # Setup repository mocks
        mock_conv_repo.save = AsyncMock(return_value="test-conv-id")
        mock_conv_repo.get_by_id = AsyncMock(return_value=Conversation(
            id="test-conv-id",
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
            messages=[]
        ))
        mock_conv_repo.update = AsyncMock()
        mock_msg_repo.save = AsyncMock(return_value="test-msg-id")

        # Create a real ChatUseCase with mocked dependencies
        from app.application.usecases.chat import ChatUseCase
        chat_usecase_instance = ChatUseCase(
            vector_store=mock_store,
            llm_service=mock_chat,
            embedding_service=mock_embed,
            conversation_repository=mock_conv_repo,
            message_repository=mock_msg_repo
        )

        # Make get_chat_usecase return our instance
        mock_get_usecase.return_value = chat_usecase_instance

        yield {
            "embedding": mock_embed,
            "vector_store": mock_store,
            "chat": mock_chat,
            "conv_repo": mock_conv_repo,
            "msg_repo": mock_msg_repo,
            "usecase": chat_usecase_instance
        }


@pytest.mark.integration
class TestChatAPI:
    """Test chat API endpoints."""

    @pytest.mark.asyncio
    async def test_chat_message_success(self, test_client):
        """Test successful chat message."""
        with mock_chat_dependencies() as mocks:
            # Mock responses
            mocks["embedding"].generate_embedding = AsyncMock(return_value=[0.1] * 1536)
            mocks["vector_store"].search = AsyncMock(return_value=[
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
            mocks["chat"].generate_response = AsyncMock(
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
            assert "conversation_id" in result
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
        with mock_chat_dependencies() as mocks:
            mocks["embedding"].generate_embedding = AsyncMock(return_value=[0.1] * 1536)
            mocks["vector_store"].search = AsyncMock(return_value=[])  # No results

            request_data = {"message": "Pregunta sin resultados"}
            response = await test_client.post("/chat/message", json=request_data)

            assert response.status_code == 200
            result = response.json()

            assert "No encontré información relevante" in result["answer"]
            assert "conversation_id" in result
            assert result["sources"] is None or len(result["sources"]) == 0

    @pytest.mark.asyncio
    async def test_chat_multiple_sources(self, test_client):
        """Test chat with multiple source documents."""
        with mock_chat_dependencies() as mocks:
            mocks["embedding"].generate_embedding = AsyncMock(return_value=[0.1] * 1536)
            mocks["vector_store"].search = AsyncMock(return_value=[
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
            mocks["chat"].generate_response = AsyncMock(
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
        with mock_chat_dependencies() as mocks:
            mocks["embedding"].generate_embedding = AsyncMock(return_value=[0.1] * 1536)
            mocks["vector_store"].search = AsyncMock(return_value=[
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
            mocks["chat"].generate_response = AsyncMock(return_value="Test response")

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

    @pytest.mark.asyncio
    async def test_chat_with_conversation_id(self, test_client):
        """Test chat with existing conversation_id."""
        with mock_chat_dependencies() as mocks:
            mocks["embedding"].generate_embedding = AsyncMock(return_value=[0.1] * 1536)
            mocks["vector_store"].search = AsyncMock(return_value=[])
            mocks["chat"].generate_response = AsyncMock(return_value="Test response")

            # First message creates conversation
            request1 = {"message": "First message"}
            response1 = await test_client.post("/chat/message", json=request1)
            assert response1.status_code == 200
            conversation_id = response1.json()["conversation_id"]
            assert "conversation_id" in response1.json()

            # Second message uses same conversation
            request2 = {"message": "Second message", "conversation_id": conversation_id}
            response2 = await test_client.post("/chat/message", json=request2)
            assert response2.status_code == 200
            assert response2.json()["conversation_id"] == conversation_id

    @pytest.mark.asyncio
    async def test_chat_creates_new_conversation_if_not_provided(self, test_client):
        """Test that chat creates a new conversation if conversation_id is not provided."""
        with mock_chat_dependencies() as mocks:
            mocks["embedding"].generate_embedding = AsyncMock(return_value=[0.1] * 1536)
            mocks["vector_store"].search = AsyncMock(return_value=[])
            mocks["chat"].generate_response = AsyncMock(return_value="Test response")

            request = {"message": "Test message"}
            response = await test_client.post("/chat/message", json=request)

            assert response.status_code == 200
            assert "conversation_id" in response.json()
            assert response.json()["conversation_id"] is not None