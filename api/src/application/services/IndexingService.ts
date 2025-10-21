import { inject, injectable } from 'tsyringe';
import { Document } from '@domain/entities/Document.js';
import {
  IIndexingService,
  IndexingResult,
} from '@application/ports/IIndexingService.js';
import { IDocumentParserFactory } from '@application/ports/IDocumentParserFactory.js';
import { IChunkingService } from '@application/ports/IChunkingService.js';
import { IEmbeddingProvider } from '@application/ports/IEmbeddingProvider.js';
import { IVectorStore } from '@application/ports/IVectorStore.js';

@injectable()
export class IndexingService implements IIndexingService {
  constructor(
    @inject('IDocumentParserFactory') private parserFactory: IDocumentParserFactory,
    @inject('IChunkingService') private chunkingService: IChunkingService,
    @inject('IEmbeddingProvider') private embeddingProvider: IEmbeddingProvider,
    @inject('IVectorStore') private vectorStore: IVectorStore
  ) {}

  async indexDocument(document: Document): Promise<IndexingResult> {
    const startTime = Date.now();

    try {
      // Step 1: Parse document to extract text
      const parser = this.parserFactory.getParser(document.mimeType);
      if (!parser) {
        throw new Error(`No parser available for MIME type: ${document.mimeType}`);
      }

      const parsedDoc = await parser.parse(document.filepath);

      // Step 2: Chunk the text
      const chunks = this.chunkingService.chunkText(parsedDoc.text);

      if (chunks.length === 0) {
        throw new Error('No chunks generated from document');
      }

      // Step 3: Generate embeddings in batch
      const chunkTexts = chunks.map(chunk => chunk.content);
      const embeddingsResponse = await this.embeddingProvider.generateBatchEmbeddings(chunkTexts);

      // Step 4: Prepare vectors for storage
      const vectors = chunks.map((chunk, index) => ({
        id: this.generateChunkId(document.id, chunk.index),
        embedding: embeddingsResponse.embeddings[index],
        content: chunk.content,
        metadata: {
          documentId: document.id,
          documentType: document.documentType,
          originalName: document.originalName,
          pageNumber: this.extractPageNumber(chunk, parsedDoc.pageCount),
          chunkIndex: chunk.index,
        },
      }));

      // Step 5: Insert into vector store
      await this.vectorStore.insertBatch(vectors);

      const processingTime = Date.now() - startTime;

      return {
        documentId: document.id,
        success: true,
        chunksIndexed: chunks.length,
        processingTime,
      };
    } catch (error) {
      const processingTime = Date.now() - startTime;

      return {
        documentId: document.id,
        success: false,
        chunksIndexed: 0,
        error: error instanceof Error ? error.message : 'Unknown error',
        processingTime,
      };
    }
  }

  async reindexDocument(document: Document): Promise<IndexingResult> {
    // Remove existing vectors
    await this.removeDocument(document.id);

    // Index again
    return this.indexDocument(document);
  }

  async removeDocument(documentId: string): Promise<void> {
    await this.vectorStore.deleteByDocumentId(documentId);
  }

  async batchIndexDocuments(documents: Document[]): Promise<IndexingResult[]> {
    const results: IndexingResult[] = [];

    // Process documents sequentially to avoid overwhelming the system
    // In production, consider using a queue system for better scaling
    for (const document of documents) {
      const result = await this.indexDocument(document);
      results.push(result);
    }

    return results;
  }

  /**
   * Generate a unique ID for a document chunk
   */
  private generateChunkId(documentId: string, chunkIndex: number): string {
    return `${documentId}-chunk-${chunkIndex}`;
  }

  /**
   * Extract page number from chunk if available
   * This is a simplified version - in production you might want more sophisticated logic
   */
  private extractPageNumber(_chunk: any, _totalPages?: number): number | undefined {
    // For now, we don't have page-level chunking
    // This could be enhanced to track which page each chunk came from
    return undefined;
  }
}