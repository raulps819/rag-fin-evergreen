"""
Dependency container for manual wiring.
"""
from app.infrastructure.db.sqlite_client import SQLiteClient
from app.infrastructure.repositories.document_repository import DocumentRepository
from app.infrastructure.vector.chroma_store import ChromaVectorStore
from app.infrastructure.llm.openai_embedding import OpenAIEmbeddingService
from app.infrastructure.llm.openai_chat import OpenAIChatService
from app.infrastructure.document_processor import DocumentProcessor
from app.application.usecases.upload_document import UploadDocumentUseCase
from app.application.usecases.chat import ChatUseCase


class Container:
    """
    Simple dependency injection container (manual wiring).
    Implements Singleton pattern to ensure only one instance exists.
    """

    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._initialized = False
        return cls._instance

    def __init__(self):
        # Only initialize once
        if self._initialized:
            return

        # Infrastructure layer
        self.db_client = SQLiteClient()
        self.document_repository = DocumentRepository(self.db_client)
        self.vector_store = ChromaVectorStore()
        self.embedding_service = OpenAIEmbeddingService()
        self.chat_service = OpenAIChatService()
        self.document_processor = DocumentProcessor()

        # Application layer - Use cases
        self.upload_document_usecase = UploadDocumentUseCase(
            document_repository=self.document_repository,
            vector_store=self.vector_store,
            embedding_service=self.embedding_service,
            document_processor=self.document_processor
        )

        self.chat_usecase = ChatUseCase(
            vector_store=self.vector_store,
            llm_service=self.chat_service,
            embedding_service=self.embedding_service
        )

        self._initialized = True


# Global container instance
container = Container()