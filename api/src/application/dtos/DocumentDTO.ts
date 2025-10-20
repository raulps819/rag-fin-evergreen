import { DocumentType } from '@domain/value-objects/DocumentType.js';
import { DocumentStatus } from '@domain/entities/Document.js';

export interface CreateDocumentDTO {
  filename: string;
  originalName: string;
  filepath: string;
  mimeType: string;
  size: number;
  documentType: DocumentType;
  isTemporary?: boolean;
  metadata?: Record<string, unknown>;
  userId?: string;
  expiresAt?: Date;
}

export interface DocumentDTO {
  id: string;
  filename: string;
  originalName: string;
  filepath: string;
  mimeType: string;
  size: number;
  documentType: DocumentType;
  status: DocumentStatus;
  metadata?: Record<string, unknown>;
  textContent?: string;
  pageCount?: number;
  isTemporary: boolean;
  createdAt: Date;
  updatedAt: Date;
  processedAt?: Date;
  expiresAt?: Date;
  userId?: string;
}

export interface DocumentListDTO {
  id: string;
  filename: string;
  originalName: string;
  documentType: DocumentType;
  status: DocumentStatus;
  size: number;
  pageCount?: number;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  processedAt?: Date;
}

export interface ListDocumentsDTO {
  documents: DocumentListDTO[];
  total: number;
  limit: number;
  offset: number;
}

export interface UploadDocumentResponseDTO {
  documents: Array<{
    id: string;
    filename: string;
    originalName: string;
    documentType: string;
    size: number;
    status: string;
    createdAt: string;
  }>;
}