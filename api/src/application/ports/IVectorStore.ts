import { DocumentType } from '@domain/value-objects/DocumentType.js';

export interface VectorMetadata {
  documentId: string;
  documentType: DocumentType;
  originalName: string;
  pageNumber?: number;
  chunkIndex: number;
  [key: string]: unknown;
}

export interface VectorSearchResult {
  id: string;
  content: string;
  score: number;
  metadata: VectorMetadata;
}

export interface VectorSearchOptions {
  topK?: number;
  minScore?: number;
  filter?: {
    documentType?: { in: DocumentType[] };
    documentId?: string;
    [key: string]: unknown;
  };
}

export interface VectorInsertOptions {
  batchSize?: number;
}

/**
 * Interface for vector store operations
 * Handles storage and retrieval of document embeddings
 */
export interface IVectorStore {
  /**
   * Insert a single vector with metadata
   * @param id - Unique identifier for the vector
   * @param embedding - The vector embedding
   * @param content - The original text content
   * @param metadata - Associated metadata
   */
  insert(
    id: string,
    embedding: number[],
    content: string,
    metadata: VectorMetadata
  ): Promise<void>;

  /**
   * Insert multiple vectors in batch
   * @param vectors - Array of vectors to insert
   * @param options - Batch insert options
   */
  insertBatch(
    vectors: Array<{
      id: string;
      embedding: number[];
      content: string;
      metadata: VectorMetadata;
    }>,
    options?: VectorInsertOptions
  ): Promise<void>;

  /**
   * Search for similar vectors
   * @param queryEmbedding - The query vector
   * @param options - Search options (topK, filters, etc.)
   * @returns Array of search results sorted by similarity
   */
  search(
    queryEmbedding: number[],
    options?: VectorSearchOptions
  ): Promise<VectorSearchResult[]>;

  /**
   * Delete vectors by document ID
   * @param documentId - The document ID to delete vectors for
   */
  deleteByDocumentId(documentId: string): Promise<void>;

  /**
   * Delete a specific vector by ID
   * @param id - The vector ID to delete
   */
  deleteById(id: string): Promise<void>;

  /**
   * Check if the vector store is available
   */
  isAvailable(): Promise<boolean>;

  /**
   * Get count of vectors in the store
   */
  count(): Promise<number>;
}