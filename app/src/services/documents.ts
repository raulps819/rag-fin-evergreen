/**
 * Documents Service
 *
 * Handles document upload and management
 * Endpoints: POST /documents/upload, GET /documents
 */

import { api, ApiError } from '@/lib/api-client';
import {
  Document,
  DocumentUploadResponse,
  DocumentListResponse,
  DocumentUploadOptions,
  toDocument,
  toDocuments,
  isSupportedDocumentType,
} from '@/types';

/**
 * Upload a document to the backend
 *
 * @param options - Upload options including file and settings
 * @returns Uploaded document metadata
 * @throws ApiError if upload fails
 */
export async function uploadDocument(
  options: DocumentUploadOptions
): Promise<Document> {
  const { file, isTemporary = false, onProgress } = options;

  // Validate file type
  if (!isSupportedDocumentType(file.name)) {
    throw new Error(
      `Tipo de archivo no soportado. Tipos permitidos: PDF, CSV, XLSX, XLS`
    );
  }

  // Validate file size (max 50MB)
  const maxSize = 50 * 1024 * 1024; // 50MB
  if (file.size > maxSize) {
    throw new Error(
      `Archivo demasiado grande. Tamaño máximo: 50MB`
    );
  }

  // Create FormData
  const formData = new FormData();
  formData.append('file', file);
  formData.append('is_temporary', isTemporary.toString());

  // TODO: Implement progress tracking with XMLHttpRequest or fetch progress
  // For now, onProgress is not used but ready for future implementation

  try {
    const response = await api.upload<DocumentUploadResponse>(
      '/documents/upload',
      formData
    );

    return toDocument(response);
  } catch (error) {
    if (error instanceof ApiError) {
      // Re-throw with user-friendly message
      if (error.status === 400) {
        throw new Error(error.message || 'Archivo inválido o corrupto');
      }
      if (error.status === 413) {
        throw new Error('Archivo demasiado grande');
      }
      if (error.status === 500) {
        throw new Error('Error al procesar el documento. Intenta nuevamente.');
      }
    }
    throw error;
  }
}

/**
 * List all uploaded documents
 *
 * @returns Array of documents with metadata
 * @throws ApiError if request fails
 */
export async function listDocuments(): Promise<Document[]> {
  try {
    const response = await api.get<DocumentListResponse>('/documents');
    return toDocuments(response);
  } catch (error) {
    if (error instanceof ApiError && error.status === 500) {
      throw new Error('Error al obtener la lista de documentos');
    }
    throw error;
  }
}

/**
 * Delete a document by ID
 * Note: This endpoint is not yet implemented in the backend
 *
 * @param documentId - Document ID to delete
 * @throws ApiError if request fails
 */
export async function deleteDocument(documentId: string): Promise<void> {
  try {
    await api.delete(`/documents/${documentId}`);
  } catch (error) {
    if (error instanceof ApiError) {
      if (error.status === 404) {
        throw new Error('Documento no encontrado');
      }
      if (error.status === 500) {
        throw new Error('Error al eliminar el documento');
      }
    }
    throw error;
  }
}

/**
 * Get document by ID
 * Note: This endpoint is not yet implemented in the backend
 *
 * @param documentId - Document ID
 * @returns Document metadata
 * @throws ApiError if request fails
 */
export async function getDocument(documentId: string): Promise<Document> {
  try {
    const response = await api.get<DocumentUploadResponse>(
      `/documents/${documentId}`
    );
    return toDocument(response);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      throw new Error('Documento no encontrado');
    }
    throw error;
  }
}