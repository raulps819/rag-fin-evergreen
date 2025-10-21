import 'reflect-metadata';
import { container } from 'tsyringe';
import { PrismaClient } from '@prisma/client';

// Infrastructure - Document Parsers
import { PrismaDocumentRepository } from '@infrastructure/database/repositories/PrismaDocumentRepository.js';
import { ParserFactory } from '@infrastructure/document-parsers/ParserFactory.js';
import { PDFParser } from '@infrastructure/document-parsers/PDFParser.js';
import { CSVParser } from '@infrastructure/document-parsers/CSVParser.js';
import { XLSXParser } from '@infrastructure/document-parsers/XLSXParser.js';

// Infrastructure - LLM Providers
import { OpenAIProvider } from '@infrastructure/llm/OpenAIProvider.js';
import { OpenAIEmbeddingProvider } from '@infrastructure/llm/OpenAIEmbeddingProvider.js';
import { OllamaProvider } from '@infrastructure/llm/OllamaProvider.js';

// Infrastructure - Vector Store
import { ChromaVectorStore } from '@infrastructure/vector-store/ChromaVectorStore.js';

// Application Services
import { RAGService } from '@application/services/RAGService.js';
import { ChunkingService } from '@application/services/ChunkingService.js';
import { IndexingService } from '@application/services/IndexingService.js';

// Use Cases - Documents
import { UploadDocumentUseCase } from '@application/usecases/documents/UploadDocumentUseCase.js';
import { ListDocumentsUseCase } from '@application/usecases/documents/ListDocumentsUseCase.js';
import { GetDocumentUseCase } from '@application/usecases/documents/GetDocumentUseCase.js';
import { DeleteDocumentUseCase } from '@application/usecases/documents/DeleteDocumentUseCase.js';

// Use Cases - Chat
import { ChatQueryUseCase } from '@application/usecases/chat/ChatQueryUseCase.js';
import { ChatStreamUseCase } from '@application/usecases/chat/ChatStreamUseCase.js';

// Controllers
import { DocumentsController } from '@presentation/controllers/DocumentsController.js';
import { ChatController } from '@presentation/controllers/ChatController.js';

// Database
const prisma = new PrismaClient(); //singleton por instancia única do PrismaClient
container.registerInstance('PrismaClient', prisma);

// Repositories
container.registerSingleton('IDocumentRepository', PrismaDocumentRepository);

// Parsers - Register with token names for interface-based injection
container.registerSingleton('PDFParser', PDFParser);
container.registerSingleton('CSVParser', CSVParser);
container.registerSingleton('XLSXParser', XLSXParser);
container.registerSingleton('IDocumentParserFactory', ParserFactory);

// LLM Providers - Choose between OpenAI and Ollama based on environment
const llmProvider = process.env.LLM_PROVIDER || 'openai';
if (llmProvider === 'openai') {
  container.registerSingleton('ILLMProvider', OpenAIProvider);
  container.registerSingleton('IEmbeddingProvider', OpenAIEmbeddingProvider);
} else if (llmProvider === 'ollama') {
  container.registerSingleton('ILLMProvider', OllamaProvider);
  // Note: Ollama embedding provider to be implemented
  // For now, fallback to OpenAI for embeddings
  container.registerSingleton('IEmbeddingProvider', OpenAIEmbeddingProvider);
}

// Vector Store
container.registerSingleton('IVectorStore', ChromaVectorStore);

// Application Services
container.registerSingleton('IChunkingService', ChunkingService);
container.registerSingleton('IIndexingService', IndexingService);
container.registerSingleton('IRAGService', RAGService);

// Use Cases - Documents
container.registerSingleton('UploadDocumentUseCase', UploadDocumentUseCase);
container.registerSingleton('ListDocumentsUseCase', ListDocumentsUseCase);
container.registerSingleton('GetDocumentUseCase', GetDocumentUseCase);
container.registerSingleton('DeleteDocumentUseCase', DeleteDocumentUseCase);

// Use Cases - Chat
container.registerSingleton('ChatQueryUseCase', ChatQueryUseCase);
container.registerSingleton('ChatStreamUseCase', ChatStreamUseCase);

// Controllers
container.registerSingleton(DocumentsController, DocumentsController);
container.registerSingleton(ChatController, ChatController);

export { container };