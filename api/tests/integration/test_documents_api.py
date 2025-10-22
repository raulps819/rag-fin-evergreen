"""
Integration tests for documents API endpoints.
"""
import pytest
from io import BytesIO
from unittest.mock import patch, AsyncMock


@pytest.mark.integration
class TestDocumentsAPI:
    """Test documents API endpoints."""

    @pytest.mark.asyncio
    async def test_upload_csv_success(self, test_client, sample_csv_content):
        """Test successful CSV document upload."""
        # Mock the dependencies
        with patch("app.core.container.container.embedding_service") as mock_embed, \
             patch("app.core.container.container.vector_store") as mock_store:

            mock_embed.generate_embeddings = AsyncMock(return_value=[[0.1] * 1536])
            mock_store.add_chunks = AsyncMock()

            # Prepare file upload
            files = {"file": ("test.csv", BytesIO(sample_csv_content), "text/csv")}
            data = {"is_temporary": "false"}

            # Make request
            response = await test_client.post("/documents/upload", files=files, data=data)

            # Verify response
            assert response.status_code == 201
            result = response.json()

            assert "id" in result
            assert result["filename"] == "test.csv"
            assert result["file_type"] == "csv"
            assert result["chunk_count"] > 0
            assert result["is_temporary"] is False

    @pytest.mark.asyncio
    async def test_upload_without_file(self, test_client):
        """Test upload without file."""
        response = await test_client.post("/documents/upload")

        assert response.status_code == 422  # Validation error

    @pytest.mark.asyncio
    async def test_upload_unsupported_type(self, test_client):
        """Test upload with unsupported file type."""
        files = {"file": ("test.txt", BytesIO(b"test content"), "text/plain")}

        response = await test_client.post("/documents/upload", files=files)

        assert response.status_code == 400
        assert "Unsupported file type" in response.json()["detail"]

    @pytest.mark.asyncio
    async def test_upload_empty_file(self, test_client):
        """Test upload with empty file."""
        files = {"file": ("empty.csv", BytesIO(b""), "text/csv")}

        response = await test_client.post("/documents/upload", files=files)

        assert response.status_code == 400
        assert "empty" in response.json()["detail"].lower()

    @pytest.mark.asyncio
    async def test_upload_temporary_document(self, test_client, sample_csv_content):
        """Test upload with temporary flag."""
        with patch("app.core.container.container.embedding_service") as mock_embed, \
             patch("app.core.container.container.vector_store") as mock_store:

            mock_embed.generate_embeddings = AsyncMock(return_value=[[0.1] * 1536])
            mock_store.add_chunks = AsyncMock()

            files = {"file": ("temp.csv", BytesIO(sample_csv_content), "text/csv")}
            data = {"is_temporary": "true"}

            response = await test_client.post("/documents/upload", files=files, data=data)

            assert response.status_code == 201
            result = response.json()
            assert result["is_temporary"] is True

    @pytest.mark.asyncio
    async def test_list_documents_empty(self, test_client):
        """Test listing documents when none exist."""
        response = await test_client.get("/documents")

        assert response.status_code == 200
        result = response.json()
        assert "documents" in result
        assert "total" in result
        assert isinstance(result["documents"], list)

    @pytest.mark.asyncio
    async def test_upload_and_list(self, test_client, sample_csv_content):
        """Test uploading a document and then listing it."""
        with patch("app.core.container.container.embedding_service") as mock_embed, \
             patch("app.core.container.container.vector_store") as mock_store:

            mock_embed.generate_embeddings = AsyncMock(return_value=[[0.1] * 1536])
            mock_store.add_chunks = AsyncMock()

            # Upload document
            files = {"file": ("test.csv", BytesIO(sample_csv_content), "text/csv")}
            upload_response = await test_client.post("/documents/upload", files=files)
            assert upload_response.status_code == 201
            uploaded_doc = upload_response.json()

            # List documents
            list_response = await test_client.get("/documents")
            assert list_response.status_code == 200
            result = list_response.json()

            # Verify uploaded document is in the list
            assert result["total"] >= 1
            assert any(doc["id"] == uploaded_doc["id"] for doc in result["documents"])