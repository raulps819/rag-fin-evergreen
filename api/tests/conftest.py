"""
Pytest configuration and shared fixtures.
"""
import pytest
import os
import tempfile
from datetime import datetime
from unittest.mock import AsyncMock
from httpx import AsyncClient, ASGITransport

from app.main import app
from app.domain.entities.document import Document
from app.infrastructure.db.sqlite_client import SQLiteClient
from app.infrastructure.db.migrations import run_migrations


@pytest.fixture
def temp_db():
    """Create a temporary database for testing."""
    with tempfile.NamedTemporaryFile(suffix=".db", delete=False) as f:
        db_path = f.name
    yield db_path
    # Cleanup
    if os.path.exists(db_path):
        os.unlink(db_path)


@pytest.fixture
async def db_client(temp_db):
    """Create a test database client."""
    # Override DATABASE_URL for testing
    os.environ["DATABASE_URL"] = f"sqlite:///{temp_db}"

    client = SQLiteClient()
    await client.connect()

    # Use the same migration logic as production
    await run_migrations(client)

    yield client

    await client.disconnect()


@pytest.fixture
async def sqlite_client(temp_db):
    """Alias for db_client - used by repository tests."""
    # Override DATABASE_URL for testing
    os.environ["DATABASE_URL"] = f"sqlite:///{temp_db}"

    client = SQLiteClient()
    await client.connect()

    # Use the same migration logic as production
    await run_migrations(client)

    yield client

    await client.disconnect()


@pytest.fixture
def mock_embedding_service():
    """Mock OpenAI embedding service."""
    service = AsyncMock()
    service.generate_embedding.return_value = [0.1] * 1536  # Mock embedding vector
    service.generate_embeddings.return_value = [[0.1] * 1536, [0.2] * 1536]
    return service


@pytest.fixture
def mock_chat_service():
    """Mock OpenAI chat service."""
    service = AsyncMock()
    service.generate_response.return_value = "Esta es una respuesta de prueba basada en el contexto proporcionado."
    service.classify_intent.return_value = "rag"  # Default to RAG intent
    service.generate_conversational_response.return_value = "¡Hola! Soy tu asistente financiero. ¿En qué puedo ayudarte hoy?"
    return service


@pytest.fixture
def mock_vector_store():
    """Mock Chroma vector store."""
    store = AsyncMock()
    store.add_chunks.return_value = None
    store.search.return_value = [
        {
            "id": "doc1_chunk_0",
            "document": "Este es un fragmento de documento de prueba con información financiera.",
            "metadata": {
                "document_id": "test-doc-id",
                "filename": "test.pdf",
                "chunk_index": 0,
                "file_type": "pdf"
            },
            "distance": 0.1
        }
    ]
    store.delete_document.return_value = None
    return store


@pytest.fixture
def mock_conversation_repository():
    """Mock conversation repository."""
    from app.domain.entities.conversation import Conversation

    repo = AsyncMock()

    # Mock save - returns a conversation ID
    repo.save.return_value = "test-conversation-id"

    # Mock get_by_id - returns a conversation
    mock_conversation = Conversation(
        id="test-conversation-id",
        created_at=datetime(2024, 1, 15, 10, 30, 0),
        updated_at=datetime(2024, 1, 15, 10, 30, 0),
        messages=[]
    )
    repo.get_by_id.return_value = mock_conversation

    # Mock update
    repo.update.return_value = None

    return repo


@pytest.fixture
def mock_message_repository():
    """Mock message repository."""
    from app.domain.entities.message import Message

    repo = AsyncMock()

    # Mock save - returns a message ID
    repo.save.return_value = "test-message-id"

    # Mock get_by_conversation_id - returns list with just the current user message
    # This simulates the message being saved before classification
    def get_messages_side_effect(_conversation_id):
        # Return a list with the just-saved user message
        return [
            Message(
                id="msg-1",
                role="user",
                content="hola",
                created_at=datetime(2024, 1, 15, 10, 30, 0),
                sources=None
            )
        ]

    repo.get_by_conversation_id.side_effect = get_messages_side_effect

    return repo


@pytest.fixture
def sample_document():
    """Create a sample document entity."""
    return Document(
        id="test-doc-id",
        filename="test_document.pdf",
        file_type="pdf",
        chunk_count=5,
        upload_date=datetime(2024, 1, 15, 10, 30, 0),
        is_temporary=False
    )


@pytest.fixture
def sample_pdf_content():
    """Sample PDF content (minimal valid PDF)."""
    # This is a minimal valid PDF with some text
    return b"""%PDF-1.4
1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj
2 0 obj<</Type/Pages/Count 1/Kids[3 0 R]>>endobj
3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 612 792]/Contents 4 0 R/Resources<<>>>>endobj
4 0 obj<</Length 44>>stream
BT /F1 12 Tf 100 700 Td (Test Document) Tj ET
endstream
endobj
xref
0 5
0000000000 65535 f
0000000009 00000 n
0000000058 00000 n
0000000115 00000 n
0000000214 00000 n
trailer<</Size 5/Root 1 0 R>>
startxref
306
%%EOF"""


@pytest.fixture
def sample_csv_content():
    """Sample CSV content."""
    return b"""Fecha,Concepto,Monto,Categoria
2024-01-01,Compra suministros,1500,Gastos operativos
2024-01-02,Pago servicios,800,Servicios
2024-01-03,Venta producto,3000,Ingresos"""


@pytest.fixture
async def test_client():
    """Create a test HTTP client."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        yield client