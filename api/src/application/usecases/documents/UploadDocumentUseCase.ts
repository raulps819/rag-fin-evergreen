import { inject, injectable } from 'tsyringe';
import { IDocumentRepository } from '@application/ports/IDocumentRepository.js';
import { Document } from '@domain/entities/Document.js';
import { DocumentType } from '@domain/value-objects/DocumentType.js';

export interface UploadDocumentInput {
  filename: string;
  originalName: string;
  filepath: string;
  mimeType: string;
  size: number;
  documentType: DocumentType;
  isTemporary?: boolean;
  expiresAt?: Date;
  userId?: string;
  metadata?: Record<string, unknown>;
}

@injectable()
export class UploadDocumentUseCase {
  constructor(
    @inject('IDocumentRepository') private documentRepository: IDocumentRepository,
    @inject('IDocumentParserFactory') private parserFactory: any
  ) {}

  async execute(input: UploadDocumentInput): Promise<Document> {
    // 1. Crear el documento en estado PENDING
    const document = Document.create({
      filename: input.filename,
      originalName: input.originalName,
      filepath: input.filepath,
      mimeType: input.mimeType,
      size: input.size,
      documentType: input.documentType,
      isTemporary: input.isTemporary || false,
      expiresAt: input.expiresAt,
      userId: input.userId,
      metadata: input.metadata,
    });

    // 2. Guardar en la base de datos
    const savedDocument = await this.documentRepository.create(document);

    // 3. Iniciar procesamiento asíncrono (esto se puede mejorar con una cola de trabajos)
    this.processDocumentAsync(savedDocument).catch(error => {
      console.error(`Error processing document ${savedDocument.id}:`, error);
    });

    return savedDocument;
  }

  private async processDocumentAsync(document: Document): Promise<void> {
    try {
      // Marcar como PROCESSING
      document.markAsProcessing();
      await this.documentRepository.update(document);

      // Obtener el parser adecuado
      const parser = this.parserFactory.getParser(document.mimeType);
      if (!parser) {
        throw new Error(`No parser found for MIME type: ${document.mimeType}`);
      }

      // Extraer texto
      const parsed = await parser.parse(document.filepath);

      // Marcar como COMPLETED con el contenido extraído
      document.markAsCompleted(parsed.text, parsed.pageCount);

      // Agregar metadata del parser
      if (parsed.metadata) {
        document.setMetadata(parsed.metadata);
      }

      await this.documentRepository.update(document);
    } catch (error) {
      // Marcar como FAILED
      document.markAsFailed();
      await this.documentRepository.update(document);
      throw error;
    }
  }
}