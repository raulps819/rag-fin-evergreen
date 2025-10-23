"""
Documents API endpoints.
"""
import logging
from fastapi import APIRouter, UploadFile, File, HTTPException, Form
from typing import Optional

from app.core.container import container
from app.presentation.schemas.document import DocumentUploadResponse, DocumentListResponse

router = APIRouter(prefix="/documents", tags=["documents"])
logger = logging.getLogger(__name__)


@router.post("/upload", response_model=DocumentUploadResponse, status_code=201)
async def upload_document(
    file: UploadFile = File(..., description="Document file to upload"),
    is_temporary: Optional[bool] = Form(False, description="Mark document as temporary")
):
    """
    Upload and process a document.

    This endpoint:
    1. Reads the uploaded file
    2. Extracts text content
    3. Creates chunks with overlap
    4. Generates embeddings using OpenAI
    5. Stores chunks in Chroma vector store
    6. Saves metadata in SQLite database

    Supported formats: PDF, CSV, XLSX
    """
    # Validate file type
    if not file.filename:
        raise HTTPException(status_code=400, detail="Filename is required")

    file_extension = file.filename.split(".")[-1].lower()
    supported_types = ["pdf", "csv", "xlsx", "xls"]

    if file_extension not in supported_types:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type. Supported types: {', '.join(supported_types)}"
        )

    try:
        # Log incoming upload
        file_size_mb = 0
        logger.info(f"📄 Incoming document upload - Filename: '{file.filename}' | Type: {file_extension} | Temporary: {is_temporary}")

        # Read file content
        file_content = await file.read()
        file_size_mb = len(file_content) / (1024 * 1024)  # Convert to MB

        if not file_content:
            raise HTTPException(status_code=400, detail="File is empty")

        logger.info(f"📦 Processing document - Size: {file_size_mb:.2f}MB")

        # Execute use case
        document = await container.upload_document_usecase.execute(
            filename=file.filename,
            file_content=file_content,
            file_type=file_extension,
            is_temporary=is_temporary or False
        )

        # Log success
        logger.info(f"✅ Document uploaded successfully - ID: {document.id} | Chunks: {document.chunk_count}")

        # Return response
        return DocumentUploadResponse(
            id=document.id,
            filename=document.filename,
            file_type=document.file_type,
            chunk_count=document.chunk_count,
            upload_date=document.upload_date,
            is_temporary=document.is_temporary
        )

    except ValueError as e:
        logger.error(f"❌ Validation error uploading document '{file.filename}': {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"❌ Error processing document '{file.filename}': {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error processing document: {str(e)}")


@router.get("", response_model=DocumentListResponse)
async def list_documents():
    """
    List all uploaded documents.

    Returns document metadata including:
    - ID
    - Filename
    - File type
    - Number of chunks
    - Upload date
    - Temporary flag
    """
    try:
        logger.info("📋 Listing all documents")

        documents = await container.document_repository.list_all()

        logger.info(f"✅ Retrieved {len(documents)} document(s)")

        return DocumentListResponse(
            documents=[
                DocumentUploadResponse(
                    id=doc.id,
                    filename=doc.filename,
                    file_type=doc.file_type,
                    chunk_count=doc.chunk_count,
                    upload_date=doc.upload_date,
                    is_temporary=doc.is_temporary
                )
                for doc in documents
            ],
            total=len(documents)
        )

    except Exception as e:
        logger.error(f"❌ Error listing documents: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error listing documents: {str(e)}")
