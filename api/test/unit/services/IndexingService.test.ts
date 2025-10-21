import { describe, it, expect, beforeEach, vi } from 'vitest';
import { IndexingService } from '../../../src/application/services/IndexingService.js';
import { Document } from '../../../src/domain/entities/Document.js';
import { DocumentType } from '../../../src/domain/value-objects/DocumentType.js';
import { DocumentStatus } from '../../../src/domain/value-objects/DocumentStatus.js';

// Mock implementations
const mockParserFactory = {
  getParser: vi.fn(),
  getSupportedMimeTypes: vi.fn(),
};

const mockChunkingService = {
  chunkText: vi.fn(),
  getDefaultChunkSize: vi.fn(() => 1000),
  getDefaultOverlap: vi.fn(() => 200),
};

const mockEmbeddingProvider = {
  generateEmbedding: vi.fn(),
  generateBatchEmbeddings: vi.fn(),
  getEmbeddingDimension: vi.fn(() => 1536),
  isAvailable: vi.fn(() => Promise.resolve(true)),
  getProviderName: vi.fn(() => 'test'),
};

const mockVectorStore = {
  insert: vi.fn(),
  insertBatch: vi.fn(),
  search: vi.fn(),
  deleteByDocumentId: vi.fn(),
  deleteById: vi.fn(),
  isAvailable: vi.fn(() => Promise.resolve(true)),
  count: vi.fn(() => Promise.resolve(0)),
};

describe('IndexingService', () => {
  let indexingService: IndexingService;
  let testDocument: Document;

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();

    // Create service with mocks
    indexingService = new IndexingService(
      mockParserFactory as any,
      mockChunkingService as any,
      mockEmbeddingProvider as any,
      mockVectorStore as any
    );

    // Create test document
    testDocument = Document.create({
      filename: 'test.pdf',
      originalName: 'Test Document.pdf',
      filepath: '/tmp/test.pdf',
      mimeType: 'application/pdf',
      size: 1024,
      documentType: DocumentType.CONTRACT,
      isTemporary: false,
    });

    // Set document to completed status with text content
    testDocument.markAsCompleted('This is test content for the document.', 1);
  });

  describe('indexDocument', () => {
    it('should successfully index a document', async () => {
      // Setup mocks
      const mockParser = {
        parse: vi.fn(() => Promise.resolve({
          text: 'This is test content for the document.',
          pageCount: 1,
          metadata: {},
        })),
        supports: vi.fn(() => true),
      };

      mockParserFactory.getParser.mockReturnValue(mockParser);

      mockChunkingService.chunkText.mockReturnValue([
        { content: 'This is test content', index: 0, startChar: 0, endChar: 20 },
        { content: 'for the document.', index: 1, startChar: 21, endChar: 38 },
      ]);

      mockEmbeddingProvider.generateBatchEmbeddings.mockResolvedValue({
        embeddings: [
          Array(1536).fill(0.1),
          Array(1536).fill(0.2),
        ],
        model: 'text-embedding-3-small',
      });

      mockVectorStore.insertBatch.mockResolvedValue(undefined);

      // Execute
      const result = await indexingService.indexDocument(testDocument);

      // Assertions
      expect(result.success).toBe(true);
      expect(result.documentId).toBe(testDocument.id);
      expect(result.chunksIndexed).toBe(2);
      expect(result.processingTime).toBeGreaterThan(0);

      // Verify mock calls
      expect(mockParserFactory.getParser).toHaveBeenCalledWith('application/pdf');
      expect(mockParser.parse).toHaveBeenCalledWith('/tmp/test.pdf');
      expect(mockChunkingService.chunkText).toHaveBeenCalled();
      expect(mockEmbeddingProvider.generateBatchEmbeddings).toHaveBeenCalledWith([
        'This is test content',
        'for the document.',
      ]);
      expect(mockVectorStore.insertBatch).toHaveBeenCalled();
    });

    it('should return failure when parser is not found', async () => {
      mockParserFactory.getParser.mockReturnValue(null);

      const result = await indexingService.indexDocument(testDocument);

      expect(result.success).toBe(false);
      expect(result.chunksIndexed).toBe(0);
      expect(result.error).toContain('No parser available');
    });

    it('should return failure when chunking produces no chunks', async () => {
      const mockParser = {
        parse: vi.fn(() => Promise.resolve({
          text: '',
          pageCount: 0,
          metadata: {},
        })),
        supports: vi.fn(() => true),
      };

      mockParserFactory.getParser.mockReturnValue(mockParser);
      mockChunkingService.chunkText.mockReturnValue([]);

      const result = await indexingService.indexDocument(testDocument);

      expect(result.success).toBe(false);
      expect(result.error).toContain('No chunks generated');
    });

    it('should handle parsing errors gracefully', async () => {
      const mockParser = {
        parse: vi.fn(() => Promise.reject(new Error('Parse error'))),
        supports: vi.fn(() => true),
      };

      mockParserFactory.getParser.mockReturnValue(mockParser);

      const result = await indexingService.indexDocument(testDocument);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Parse error');
    });

    it('should handle embedding generation errors', async () => {
      const mockParser = {
        parse: vi.fn(() => Promise.resolve({
          text: 'Test content',
          pageCount: 1,
          metadata: {},
        })),
        supports: vi.fn(() => true),
      };

      mockParserFactory.getParser.mockReturnValue(mockParser);
      mockChunkingService.chunkText.mockReturnValue([
        { content: 'Test content', index: 0, startChar: 0, endChar: 12 },
      ]);

      mockEmbeddingProvider.generateBatchEmbeddings.mockRejectedValue(
        new Error('Embedding error')
      );

      const result = await indexingService.indexDocument(testDocument);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Embedding error');
    });
  });

  describe('reindexDocument', () => {
    it('should delete existing vectors and reindex', async () => {
      const mockParser = {
        parse: vi.fn(() => Promise.resolve({
          text: 'Test content',
          pageCount: 1,
          metadata: {},
        })),
        supports: vi.fn(() => true),
      };

      mockParserFactory.getParser.mockReturnValue(mockParser);
      mockChunkingService.chunkText.mockReturnValue([
        { content: 'Test content', index: 0, startChar: 0, endChar: 12 },
      ]);

      mockEmbeddingProvider.generateBatchEmbeddings.mockResolvedValue({
        embeddings: [Array(1536).fill(0.1)],
        model: 'test-model',
      });

      mockVectorStore.deleteByDocumentId.mockResolvedValue(undefined);
      mockVectorStore.insertBatch.mockResolvedValue(undefined);

      const result = await indexingService.reindexDocument(testDocument);

      expect(mockVectorStore.deleteByDocumentId).toHaveBeenCalledWith(testDocument.id);
      expect(result.success).toBe(true);
    });
  });

  describe('removeDocument', () => {
    it('should delete document vectors from store', async () => {
      mockVectorStore.deleteByDocumentId.mockResolvedValue(undefined);

      await indexingService.removeDocument(testDocument.id);

      expect(mockVectorStore.deleteByDocumentId).toHaveBeenCalledWith(testDocument.id);
    });
  });

  describe('batchIndexDocuments', () => {
    it('should index multiple documents sequentially', async () => {
      const doc1 = testDocument;
      const doc2 = Document.create({
        filename: 'test2.pdf',
        originalName: 'Test Document 2.pdf',
        filepath: '/tmp/test2.pdf',
        mimeType: 'application/pdf',
        size: 2048,
        documentType: DocumentType.INVOICE,
        isTemporary: false,
      });

      const mockParser = {
        parse: vi.fn(() => Promise.resolve({
          text: 'Test content',
          pageCount: 1,
          metadata: {},
        })),
        supports: vi.fn(() => true),
      };

      mockParserFactory.getParser.mockReturnValue(mockParser);
      mockChunkingService.chunkText.mockReturnValue([
        { content: 'Test content', index: 0, startChar: 0, endChar: 12 },
      ]);

      mockEmbeddingProvider.generateBatchEmbeddings.mockResolvedValue({
        embeddings: [Array(1536).fill(0.1)],
        model: 'test-model',
      });

      mockVectorStore.insertBatch.mockResolvedValue(undefined);

      const results = await indexingService.batchIndexDocuments([doc1, doc2]);

      expect(results).toHaveLength(2);
      expect(results[0].success).toBe(true);
      expect(results[1].success).toBe(true);
      expect(mockParser.parse).toHaveBeenCalledTimes(2);
    });
  });
});