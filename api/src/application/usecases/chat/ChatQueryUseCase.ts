import { inject, injectable } from 'tsyringe';
import { IRAGService, RAGQueryOptions, RAGResponse } from '@application/ports/IRAGService.js';
import { DocumentType } from '@domain/value-objects/DocumentType.js';

export interface ChatQueryInput {
  query: string;
  documentTypes?: DocumentType[];
  topK?: number;
  dateRange?: {
    from: Date;
    to: Date;
  };
}

@injectable()
export class ChatQueryUseCase {
  constructor(
    @inject('IRAGService') private ragService: IRAGService
  ) {}

  async execute(input: ChatQueryInput): Promise<RAGResponse> {
    const options: RAGQueryOptions = {
      topK: input.topK || 5,
      minScore: 0.7,
      documentTypes: input.documentTypes,
      dateRange: input.dateRange,
    };

    return this.ragService.query(input.query, options);
  }
}