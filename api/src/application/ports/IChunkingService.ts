export interface TextChunk {
  content: string;
  index: number;
  startChar: number;
  endChar: number;
  metadata?: Record<string, unknown>;
}

export interface ChunkingOptions {
  chunkSize?: number;
  chunkOverlap?: number;
  preserveParagraphs?: boolean;
}

/**
 * Interface for text chunking services
 * Splits long documents into smaller chunks for embedding
 */
export interface IChunkingService {
  /**
   * Split text into chunks
   * @param text - The text to chunk
   * @param options - Chunking configuration
   * @returns Array of text chunks
   */
  chunkText(text: string, options?: ChunkingOptions): TextChunk[];

  /**
   * Get the default chunk size
   */
  getDefaultChunkSize(): number;

  /**
   * Get the default overlap size
   */
  getDefaultOverlap(): number;
}