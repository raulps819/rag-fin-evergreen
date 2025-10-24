"""
Dependency container for manual wiring.
"""
from app.core.config import settings
from app.infrastructure.db.sqlite_client import SQLiteClient
from app.infrastructure.db.postgres_client import PostgresClient
from app.infrastructure.repositories.document_repository import DocumentRepository
from app.infrastructure.repositories.conversation_repository import ConversationRepository
from app.infrastructure.repositories.message_repository import MessageRepository
from app.infrastructure.vector.chroma_store import ChromaVectorStore
from app.infrastructure.llm.openai_embedding import OpenAIEmbeddingService
from app.infrastructure.llm.openai_chat import OpenAIChatService
from app.infrastructure.llm.openai_query_expansion import OpenAIQueryExpansionService
from app.infrastructure.document_processor import DocumentProcessor
from app.application.usecases.upload_document import UploadDocumentUseCase
from app.application.usecases.chat import ChatUseCase
from app.application.usecases.create_conversation import CreateConversationUseCase
from app.application.usecases.list_conversations import ListConversationsUseCase
from app.application.usecases.get_conversation import GetConversationUseCase


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

        # Infrastructure layer - Auto-detect database type
        if settings.DATABASE_URL.startswith("postgresql://"):
            self.db_client = PostgresClient()
        else:
            self.db_client = SQLiteClient()
        self.document_repository = DocumentRepository(self.db_client)
        self.conversation_repository = ConversationRepository(self.db_client)
        self.message_repository = MessageRepository(self.db_client)
        self.vector_store = ChromaVectorStore()
        self.embedding_service = OpenAIEmbeddingService()
        self.chat_service = OpenAIChatService()
        self.query_expansion_service = OpenAIQueryExpansionService()
        self.document_processor = DocumentProcessor()

        # Application layer - Use cases
        self.upload_document_usecase = UploadDocumentUseCase(
            document_repository=self.document_repository,
            vector_store=self.vector_store,
            embedding_service=self.embedding_service,
            document_processor=self.document_processor
        )

        self.create_conversation_usecase = CreateConversationUseCase(
            conversation_repository=self.conversation_repository
        )

        self.list_conversations_usecase = ListConversationsUseCase(
            conversation_repository=self.conversation_repository
        )

        self.get_conversation_usecase = GetConversationUseCase(
            conversation_repository=self.conversation_repository,
            message_repository=self.message_repository
        )

        self._initialized = True

    def get_chat_usecase(self) -> ChatUseCase:
        """
        Get ChatUseCase instance with dependencies.
        Creates a new instance each time to allow proper dependency injection in tests.

        Returns:
            ChatUseCase instance
        """
        return ChatUseCase(
            vector_store=self.vector_store,
            llm_service=self.chat_service,
            embedding_service=self.embedding_service,
            conversation_repository=self.conversation_repository,
            message_repository=self.message_repository,
            query_expansion_service=self.query_expansion_service
        )


# Global container instance
container = Container()