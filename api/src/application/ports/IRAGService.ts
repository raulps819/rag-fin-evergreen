import { DocumentType } from '@domain/value-objects/DocumentType.js';

export interface RetrievedChunk {
  id: string;
  documentId: string;
  content: string;
  score: number;
  metadata: {
    documentType: DocumentType;
    originalName: string;
    pageNumber?: number;
    chunkIndex: number;
  };
}

export interface RAGQueryOptions {
  topK?: number;
  minScore?: number;
  documentTypes?: DocumentType[];
  dateRange?: {
    from: Date;
    to: Date;
  };
  rerank?: boolean;
}

export interface RAGResponse {
  answer: string;
  sources: RetrievedChunk[];
  confidence?: number;
  metadata?: {
    modelUsed: string;
    retrievalTime: number;
    generationTime: number;
    totalTokens?: number;
  };
}

export interface StreamRAGResponse {
  type: 'chunk' | 'sources' | 'done';
  content?: string;
  sources?: RetrievedChunk[];
  metadata?: RAGResponse['metadata'];
}

/**
 * Main RAG Service interface
 * Handles query processing, retrieval, and answer generation
 */
export interface IRAGService {
  /**
   * Process a user query and generate an answer with sources
   * @param query - User's natural language query
   * @param options - Optional configuration for retrieval and generation
   * @returns RAG response with answer and sources
   */
  query(query: string, options?: RAGQueryOptions): Promise<RAGResponse>;

  /**
   * Process a query with streaming response
   * @param query - User's natural language query
   * @param options - Optional configuration
   * @returns Async generator yielding response chunks
   */
  queryStream(
    query: string,
    options?: RAGQueryOptions
  ): AsyncGenerator<StreamRAGResponse>;

  /**
   * Retrieve relevant chunks without generating an answer
   * Useful for debugging or custom processing
   * @param query - User's query
   * @param options - Retrieval options
   * @returns Array of relevant chunks
   */
  retrieve(
    query: string,
    options?: RAGQueryOptions
  ): Promise<RetrievedChunk[]>;
}