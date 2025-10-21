import { inject, injectable } from 'tsyringe';
import { IRAGService, RAGQueryOptions, StreamRAGResponse } from '@application/ports/IRAGService.js';
import { DocumentType } from '@domain/value-objects/DocumentType.js';

export interface ChatStreamInput {
  query: string;
  documentTypes?: DocumentType[];
  topK?: number;
  dateRange?: {
    from: Date;
    to: Date;
  };
}

@injectable()
export class ChatStreamUseCase {
  constructor(
    @inject('IRAGService') private ragService: IRAGService
  ) {}

  async *execute(input: ChatStreamInput): AsyncGenerator<StreamRAGResponse> {
    const options: RAGQueryOptions = {
      topK: input.topK || 5,
      minScore: 0.7,
      documentTypes: input.documentTypes,
      dateRange: input.dateRange,
    };

    yield* this.ragService.queryStream(input.query, options);
  }
}