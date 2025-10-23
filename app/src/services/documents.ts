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
  DocumentUploadMultipleOptions,
  UploadResult,
  BatchUploadResults,
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

/**
 * Upload multiple documents to the backend
 *
 * Uploads files in parallel with a concurrency limit (default: 3).
 * Uses the same /documents/upload endpoint for each file.
 *
 * @param options - Upload options including files array and settings
 * @returns Batch upload results with individual file statuses
 */
export async function uploadDocuments(
  options: DocumentUploadMultipleOptions
): Promise<BatchUploadResults> {
  const {
    files,
    isTemporary = false,
    onProgress,
    maxConcurrent = 3
  } = options;

  // Validate all files first
  const maxSize = 50 * 1024 * 1024; // 50MB
  const invalidFiles: string[] = [];
  const oversizedFiles: string[] = [];

  files.forEach(file => {
    if (!isSupportedDocumentType(file.name)) {
      invalidFiles.push(file.name);
    }
    if (file.size > maxSize) {
      oversizedFiles.push(file.name);
    }
  });

  if (invalidFiles.length > 0) {
    throw new Error(
      `Archivos con tipo no soportado: ${invalidFiles.join(', ')}. Tipos permitidos: PDF, CSV, XLSX, XLS`
    );
  }

  if (oversizedFiles.length > 0) {
    throw new Error(
      `Archivos demasiado grandes (máx. 50MB): ${oversizedFiles.join(', ')}`
    );
  }

  // Create initial results array
  const results: UploadResult[] = files.map((file, index) => ({
    file,
    fileId: `${file.name}-${Date.now()}-${index}`,
    status: 'pending' as const,
    progress: 0,
  }));

  // Helper function to upload a single file
  const uploadSingleFile = async (result: UploadResult): Promise<UploadResult> => {
    try {
      // Update status to uploading
      result.status = 'uploading';
      result.progress = 0;
      onProgress?.(result.fileId, 0);

      // Upload the file
      const document = await uploadDocument({
        file: result.file,
        isTemporary,
        onProgress: (progress) => {
          result.progress = progress;
          onProgress?.(result.fileId, progress);
        },
      });

      // Success
      result.status = 'success';
      result.progress = 100;
      result.document = document;
      onProgress?.(result.fileId, 100);

      return result;
    } catch (error) {
      // Error
      result.status = 'error';
      result.error = error instanceof Error ? error.message : 'Error desconocido';
      onProgress?.(result.fileId, 0);

      return result;
    }
  };

  // Upload files with concurrency limit using Promise.all with batching
  const completed: UploadResult[] = [];

  for (let i = 0; i < results.length; i += maxConcurrent) {
    const batch = results.slice(i, i + maxConcurrent);
    const batchResults = await Promise.all(
      batch.map(result => uploadSingleFile(result))
    );
    completed.push(...batchResults);
  }

  // Calculate summary
  const successCount = completed.filter(r => r.status === 'success').length;
  const errorCount = completed.filter(r => r.status === 'error').length;

  return {
    results: completed,
    successCount,
    errorCount,
    totalCount: files.length,
  };
}