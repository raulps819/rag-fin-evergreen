import { Document, DocumentStatus } from '@domain/entities/Document.js';
import { DocumentType } from '@domain/value-objects/DocumentType.js';

export interface FindDocumentsFilters {
  documentType?: DocumentType;
  status?: DocumentStatus;
  isTemporary?: boolean;
  conversationId?: string;
  userId?: string;
  search?: string;
}

export interface PaginationOptions {
  limit?: number;
  offset?: number;
}

export interface IDocumentRepository {
  create(document: Document): Promise<Document>;
  findById(id: string): Promise<Document | null>;
  findMany(filters: FindDocumentsFilters, pagination: PaginationOptions): Promise<Document[]>;
  count(filters: FindDocumentsFilters): Promise<number>;
  update(document: Document): Promise<Document>;
  delete(id: string): Promise<void>;
  findExpired(): Promise<Document[]>;
}