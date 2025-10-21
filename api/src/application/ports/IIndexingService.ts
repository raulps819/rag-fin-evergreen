import { Document } from '@domain/entities/Document.js';

export interface IndexingProgress {
  documentId: string;
  status: 'processing' | 'completed' | 'failed';
  chunksProcessed: number;
  totalChunks: number;
  error?: string;
}

export interface IndexingResult {
  documentId: string;
  success: boolean;
  chunksIndexed: number;
  error?: string;
  processingTime: number;
}

/**
 * Interface for document indexing service
 * Handles the complete pipeline: parsing -> chunking -> embedding -> vector storage
 */
export interface IIndexingService {
  /**
   * Index a single document
   * Parses, chunks, generates embeddings, and stores in vector DB
   * @param document - The document to index
   * @returns Indexing result with statistics
   */
  indexDocument(document: Document): Promise<IndexingResult>;

  /**
   * Re-index a document (removes old vectors and creates new ones)
   * @param document - The document to re-index
   * @returns Indexing result
   */
  reindexDocument(document: Document): Promise<IndexingResult>;

  /**
   * Remove a document from the index
   * @param documentId - The document ID to remove
   */
  removeDocument(documentId: string): Promise<void>;

  /**
   * Batch index multiple documents
   * @param documents - Array of documents to index
   * @returns Array of indexing results
   */
  batchIndexDocuments(documents: Document[]): Promise<IndexingResult[]>;
}