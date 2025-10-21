import { injectable } from 'tsyringe';
import OpenAI from 'openai';
import {
  IEmbeddingProvider,
  EmbeddingOptions,
  EmbeddingResponse,
  BatchEmbeddingResponse,
} from '@application/ports/IEmbeddingProvider.js';

@injectable()
export class OpenAIEmbeddingProvider implements IEmbeddingProvider {
  private client: OpenAI;
  private model: string;
  private dimension: number;

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY environment variable is required');
    }

    this.client = new OpenAI({ apiKey });
    this.model = process.env.OPENAI_EMBEDDING_MODEL || 'text-embedding-3-small';
    this.dimension = parseInt(process.env.EMBEDDING_DIMENSION || '1536', 10);
  }

  async generateEmbedding(
    text: string,
    options?: EmbeddingOptions
  ): Promise<EmbeddingResponse> {
    const model = options?.model || this.model;
    const dimensions = options?.dimensions || this.dimension;

    const response = await this.client.embeddings.create({
      model,
      input: text,
      dimensions,
    });

    const embeddingData = response.data[0];
    if (!embeddingData) {
      throw new Error('No embedding returned from OpenAI');
    }

    return {
      embedding: embeddingData.embedding,
      model: response.model,
      usage: {
        promptTokens: response.usage.prompt_tokens,
        totalTokens: response.usage.total_tokens,
      },
    };
  }

  async generateBatchEmbeddings(
    texts: string[],
    options?: EmbeddingOptions
  ): Promise<BatchEmbeddingResponse> {
    const model = options?.model || this.model;
    const dimensions = options?.dimensions || this.dimension;

    const response = await this.client.embeddings.create({
      model,
      input: texts,
      dimensions,
    });

    const embeddings = response.data.map(item => item.embedding);

    return {
      embeddings,
      model: response.model,
      usage: {
        promptTokens: response.usage.prompt_tokens,
        totalTokens: response.usage.total_tokens,
      },
    };
  }

  getEmbeddingDimension(): number {
    return this.dimension;
  }

  async isAvailable(): Promise<boolean> {
    try {
      await this.client.models.retrieve(this.model);
      return true;
    } catch (error) {
      return false;
    }
  }

  getProviderName(): string {
    return 'openai';
  }
}