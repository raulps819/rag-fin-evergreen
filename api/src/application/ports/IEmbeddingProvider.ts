export interface EmbeddingOptions {
  model?: string;
  dimensions?: number;
}

export interface EmbeddingResponse {
  embedding: number[];
  model: string;
  usage?: {
    promptTokens: number;
    totalTokens: number;
  };
}

export interface BatchEmbeddingResponse {
  embeddings: number[][];
  model: string;
  usage?: {
    promptTokens: number;
    totalTokens: number;
  };
}

/**
 * Interface for text embedding providers
 * Used for converting text to vector representations for similarity search
 */
export interface IEmbeddingProvider {
  /**
   * Generate embedding for a single text
   * @param text - The text to embed
   * @param options - Optional configuration
   * @returns The embedding vector
   */
  generateEmbedding(
    text: string,
    options?: EmbeddingOptions
  ): Promise<EmbeddingResponse>;

  /**
   * Generate embeddings for multiple texts in batch
   * @param texts - Array of texts to embed
   * @param options - Optional configuration
   * @returns Array of embedding vectors
   */
  generateBatchEmbeddings(
    texts: string[],
    options?: EmbeddingOptions
  ): Promise<BatchEmbeddingResponse>;

  /**
   * Get the dimension size of embeddings
   */
  getEmbeddingDimension(): number;

  /**
   * Check if the provider is available
   */
  isAvailable(): Promise<boolean>;

  /**
   * Get the provider name
   */
  getProviderName(): string;
}