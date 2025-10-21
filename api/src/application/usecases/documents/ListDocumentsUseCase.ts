import { inject, injectable } from 'tsyringe';
import {
  IDocumentRepository,
  FindDocumentsFilters,
  PaginationOptions,
} from '@application/ports/IDocumentRepository.js';
import { Document } from '@domain/entities/Document.js';

export interface ListDocumentsResult {
  documents: Document[];
  total: number;
  limit: number;
  offset: number;
}

@injectable()
export class ListDocumentsUseCase {
  constructor(
    @inject('IDocumentRepository') private documentRepository: IDocumentRepository
  ) {}

  async execute(
    filters: FindDocumentsFilters,
    pagination: PaginationOptions
  ): Promise<ListDocumentsResult> {
    const [documents, total] = await Promise.all([
      this.documentRepository.findMany(filters, pagination),
      this.documentRepository.count(filters),
    ]);

    return {
      documents,
      total,
      limit: pagination.limit || 50,
      offset: pagination.offset || 0,
    };
  }
}