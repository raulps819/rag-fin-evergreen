import { DocumentType } from '@domain/value-objects/DocumentType.js';

export interface RetrievedChunkForPrompt {
  content: string;
  metadata: {
    documentType: DocumentType;
    originalName: string;
    pageNumber?: number;
  };
}

/**
 * Get Spanish label for document type
 */
export function getDocumentTypeLabel(type: DocumentType): string {
  const labels: Record<DocumentType, string> = {
    [DocumentType.CONTRACT]: 'Contrato',
    [DocumentType.PURCHASE_ORDER]: 'Orden de Compra',
    [DocumentType.INVOICE]: 'Factura',
    [DocumentType.SALES_RECORD]: 'Registro de Venta',
    [DocumentType.OTHER]: 'Documento',
  };
  return labels[type] || 'Documento';
}

/**
 * Builds the context string from retrieved chunks
 * @param chunks - Retrieved document chunks
 * @returns Formatted context string
 */
export function buildContextFromChunks(chunks: RetrievedChunkForPrompt[]): string {
  if (chunks.length === 0) {
    return 'No se encontró información relevante en los documentos.';
  }

  const contextParts = chunks.map((chunk, index) => {
    const docType = getDocumentTypeLabel(chunk.metadata.documentType);
    const source = `[Fuente ${index + 1}: ${docType} - ${chunk.metadata.originalName}${
      chunk.metadata.pageNumber ? `, página ${chunk.metadata.pageNumber}` : ''
    }]`;

    return `${source}\n${chunk.content}\n`;
  });

  return `Información relevante de los documentos:\n\n${contextParts.join('\n---\n\n')}`;
}

/**
 * Builds user prompt with context and query
 * @param query - User's question
 * @param context - Context built from retrieved chunks
 * @returns User message content
 */
export function buildUserPromptWithContext(query: string, context: string): string {
  return `${context}\n\nPregunta del usuario: ${query}\n\nPor favor, responde basándote en la información proporcionada.`;
}

/**
 * Builds query expansion user prompt
 * @param originalQuery - The original user query
 * @returns User message content for query expansion
 */
export function buildQueryExpansionPrompt(originalQuery: string): string {
  return `Reformula la siguiente pregunta en 2-3 variantes que capturen diferentes aspectos de la consulta original. Mantén el contexto agrícola/financiero.

Consulta original: "${originalQuery}"

Proporciona las variantes como una lista numerada, sin explicaciones adicionales.`;
}