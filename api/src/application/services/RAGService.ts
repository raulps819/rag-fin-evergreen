import { inject, injectable } from 'tsyringe';
import {
  IRAGService,
  RAGQueryOptions,
  RAGResponse,
  RetrievedChunk,
  StreamRAGResponse,
} from '@application/ports/IRAGService.js';
import { ILLMProvider } from '@application/ports/ILLMProvider.js';
import { IEmbeddingProvider } from '@application/ports/IEmbeddingProvider.js';
import { IVectorStore } from '@application/ports/IVectorStore.js';
import { SYSTEM_PROMPT } from '@domain/prompts/system-prompts.js';
import { buildContextFromChunks, buildUserPromptWithContext } from '@domain/prompts/prompt-builder.js';

@injectable()
export class RAGService implements IRAGService {
  constructor(
    @inject('ILLMProvider') private llmProvider: ILLMProvider,
    @inject('IEmbeddingProvider') private embeddingProvider: IEmbeddingProvider,
    @inject('IVectorStore') private vectorStore: IVectorStore
  ) {}

  async query(query: string, options?: RAGQueryOptions): Promise<RAGResponse> {
    // Step 1: Retrieve relevant chunks
    const retrievalStart = Date.now();
    const chunks = await this.retrieve(query, options);
    const retrievalTime = Date.now() - retrievalStart;

    // Step 2: Build context from chunks
    const context = buildContextFromChunks(chunks);

    // Step 3: Generate answer using LLM
    const generationStart = Date.now();
    const messages = [
      {
        role: 'system' as const,
        content: SYSTEM_PROMPT,
      },
      {
        role: 'user' as const,
        content: buildUserPromptWithContext(query, context),
      },
    ];

    const completion = await this.llmProvider.chatCompletion(messages, {
      temperature: 0.7,
      maxTokens: 1000,
    });

    const generationTime = Date.now() - generationStart;

    return {
      answer: completion.content,
      sources: chunks,
      metadata: {
        modelUsed: completion.model,
        retrievalTime,
        generationTime,
        totalTokens: completion.usage?.totalTokens,
      },
    };
  }

  async *queryStream(
    query: string,
    options?: RAGQueryOptions
  ): AsyncGenerator<StreamRAGResponse> {
    // Step 1: Retrieve relevant chunks
    const retrievalStart = Date.now();
    const chunks = await this.retrieve(query, options);
    const retrievalTime = Date.now() - retrievalStart;

    // Yield sources first
    yield {
      type: 'sources',
      sources: chunks,
    };

    // Step 2: Build context and generate streaming answer
    const context = buildContextFromChunks(chunks);
    const generationStart = Date.now();

    const messages = [
      {
        role: 'system' as const,
        content: SYSTEM_PROMPT,
      },
      {
        role: 'user' as const,
        content: buildUserPromptWithContext(query, context),
      },
    ];

    // Stream the response
    for await (const chunk of this.llmProvider.chatCompletionStream(messages, {
      temperature: 0.7,
      maxTokens: 1000,
    })) {
      if (chunk.done) {
        const generationTime = Date.now() - generationStart;
        yield {
          type: 'done',
          metadata: {
            modelUsed: this.llmProvider.getProviderName(),
            retrievalTime,
            generationTime,
          },
        };
      } else {
        yield {
          type: 'chunk',
          content: chunk.content,
        };
      }
    }
  }

  async retrieve(
    query: string,
    options?: RAGQueryOptions
  ): Promise<RetrievedChunk[]> {
    // Step 1: Generate query embedding
    const embeddingResponse = await this.embeddingProvider.generateEmbedding(query);

    // Step 2: Search vector store
    const topK = options?.topK || 5;
    const minScore = options?.minScore || 0.7;

    const results = await this.vectorStore.search(embeddingResponse.embedding, {
      topK,
      minScore,
      filter: options?.documentTypes ? {
        documentType: { in: options.documentTypes },
      } : undefined,
    });

    // Step 3: Map to RetrievedChunk format
    const chunks: RetrievedChunk[] = results.map(result => ({
      id: result.id,
      documentId: result.metadata.documentId,
      content: result.content,
      score: result.score,
      metadata: {
        documentType: result.metadata.documentType,
        originalName: result.metadata.originalName,
        pageNumber: result.metadata.pageNumber,
        chunkIndex: result.metadata.chunkIndex,
      },
    }));

    // Step 4: Optional reranking (if enabled)
    if (options?.rerank && chunks.length > 0) {
      // TODO: Implement reranking logic
      // For now, return as-is (already sorted by similarity score)
    }

    return chunks;
  }
}