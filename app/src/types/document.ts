/**
 * Document types
 *
 * Types for document management (upload, list, etc.)
 * Compatible with backend schemas (snake_case from API)
 */

/**
 * Backend response for document upload
 * Matches: api/app/presentation/schemas/document.py::DocumentUploadResponse
 */
export interface DocumentUploadResponse {
  id: string;
  filename: string;
  file_type: string;
  chunk_count: number;
  upload_date: string; // ISO datetime string
  is_temporary: boolean;
}

/**
 * Backend response for document list
 * Matches: api/app/presentation/schemas/document.py::DocumentListResponse
 */
export interface DocumentListResponse {
  documents: DocumentUploadResponse[];
  total: number;
}

/**
 * Frontend representation of a document (camelCase)
 */
export interface Document {
  id: string;
  filename: string;
  fileType: string;
  chunkCount: number;
  uploadDate: Date;
  isTemporary: boolean;
}

/**
 * Convert backend response to frontend type
 */
export function toDocument(response: DocumentUploadResponse): Document {
  return {
    id: response.id,
    filename: response.filename,
    fileType: response.file_type,
    chunkCount: response.chunk_count,
    uploadDate: new Date(response.upload_date),
    isTemporary: response.is_temporary,
  };
}

/**
 * Convert array of backend responses to frontend types
 */
export function toDocuments(response: DocumentListResponse): Document[] {
  return response.documents.map(toDocument);
}

/**
 * File upload options
 */
export interface DocumentUploadOptions {
  file: File;
  isTemporary?: boolean;
  onProgress?: (progress: number) => void;
}

/**
 * Supported document types
 */
export const SUPPORTED_DOCUMENT_TYPES = ['pdf', 'csv', 'xlsx', 'xls'] as const;
export type SupportedDocumentType = typeof SUPPORTED_DOCUMENT_TYPES[number];

/**
 * Validate if file type is supported
 */
export function isSupportedDocumentType(filename: string): boolean {
  const extension = filename.split('.').pop()?.toLowerCase();
  return extension ? SUPPORTED_DOCUMENT_TYPES.includes(extension as any) : false;
}

/**
 * Get file extension from filename
 */
export function getFileExtension(filename: string): string | null {
  const extension = filename.split('.').pop()?.toLowerCase();
  return extension || null;
}