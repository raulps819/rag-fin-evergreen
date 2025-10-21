import { FastifyRequest, FastifyReply } from 'fastify';
import { inject, injectable } from 'tsyringe';
import { UploadDocumentUseCase } from '@application/usecases/documents/UploadDocumentUseCase.js';
import { ListDocumentsUseCase } from '@application/usecases/documents/ListDocumentsUseCase.js';
import { GetDocumentUseCase } from '@application/usecases/documents/GetDocumentUseCase.js';
import { DeleteDocumentUseCase } from '@application/usecases/documents/DeleteDocumentUseCase.js';
import {
  uploadDocumentSchema,
  listDocumentsQuerySchema,
  documentIdParamSchema,
} from '@presentation/schemas/document.schema.js';
import fs from 'fs/promises';
import path from 'path';
import { pipeline } from 'stream/promises';
import crypto from 'crypto';

@injectable()
export class DocumentsController {
  constructor(
    @inject('UploadDocumentUseCase') private uploadDocumentUseCase: UploadDocumentUseCase,
    @inject('ListDocumentsUseCase') private listDocumentsUseCase: ListDocumentsUseCase,
    @inject('GetDocumentUseCase') private getDocumentUseCase: GetDocumentUseCase,
    @inject('DeleteDocumentUseCase') private deleteDocumentUseCase: DeleteDocumentUseCase
  ) {}

  async upload(request: FastifyRequest, reply: FastifyReply) {
    const uploadDir = process.env.UPLOAD_DIR || './uploads';
    await fs.mkdir(uploadDir, { recursive: true });

    const data = await request.file();
    if (!data) {
      return reply.status(400).send({ error: 'No file provided' });
    }

    // Extraer campos del formulario
    const fields = data.fields as any;
    const documentTypeValue = fields.documentType?.value;
    const isTemporaryValue = fields.isTemporary?.value === 'true';
    const metadataValue = fields.metadata?.value;

    // Parse metadata con manejo de errores
    let parsedMetadata: Record<string, unknown> | undefined;
    if (metadataValue) {
      try {
        parsedMetadata = JSON.parse(metadataValue);
      } catch (error) {
        return reply.status(400).send({
          error: 'Invalid metadata format',
          details: 'Metadata must be valid JSON'
        });
      }
    }

    // Validar datos
    const validatedData = uploadDocumentSchema.parse({
      documentType: documentTypeValue,
      isTemporary: isTemporaryValue,
      metadata: parsedMetadata,
    });

    // Generar nombre de archivo único
    const fileExt = path.extname(data.filename);
    const filename = `${crypto.randomUUID()}${fileExt}`;
    const filepath = path.join(uploadDir, filename);

    // Guardar archivo
    await pipeline(data.file, await fs.open(filepath, 'w').then(handle => handle.createWriteStream()));

    // Obtener tamaño del archivo
    const stats = await fs.stat(filepath);

    // Calcular expiresAt si es temporal (24 horas por defecto)
    let expiresAt: Date | undefined;
    if (validatedData.isTemporary) {
      expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);
    }

    // Ejecutar caso de uso
    const document = await this.uploadDocumentUseCase.execute({
      filename,
      originalName: data.filename,
      filepath,
      mimeType: data.mimetype,
      size: stats.size,
      documentType: validatedData.documentType as any, // validated by Zod
      isTemporary: validatedData.isTemporary,
      expiresAt,
      metadata: validatedData.metadata,
    });

    return reply.status(201).send({
      id: document.id,
      filename: document.filename,
      originalName: document.originalName,
      documentType: document.documentType,
      size: document.size,
      status: document.status,
      createdAt: document.createdAt,
    });
  }

  async list(request: FastifyRequest, reply: FastifyReply) {
    const query = listDocumentsQuerySchema.parse(request.query);

    const result = await this.listDocumentsUseCase.execute(
      {
        documentType: query.type as any, // validated by Zod
        status: query.status as any, // validated by Zod
        isTemporary: query.isTemporary,
        search: query.search,
      },
      {
        limit: query.limit,
        offset: query.offset,
      }
    );

    return reply.send({
      documents: result.documents.map(doc => ({
        id: doc.id,
        filename: doc.filename,
        originalName: doc.originalName,
        documentType: doc.documentType,
        status: doc.status,
        size: doc.size,
        pageCount: doc.pageCount,
        metadata: doc.metadata,
        createdAt: doc.createdAt,
        processedAt: doc.processedAt,
      })),
      total: result.total,
      limit: result.limit,
      offset: result.offset,
    });
  }

  async getById(request: FastifyRequest, reply: FastifyReply) {
    const { id } = documentIdParamSchema.parse(request.params);

    const document = await this.getDocumentUseCase.execute(id);

    return reply.send({
      id: document.id,
      filename: document.filename,
      originalName: document.originalName,
      filepath: document.filepath,
      mimeType: document.mimeType,
      size: document.size,
      documentType: document.documentType,
      status: document.status,
      metadata: document.metadata,
      textContent: document.textContent,
      pageCount: document.pageCount,
      isTemporary: document.isTemporary,
      createdAt: document.createdAt,
      processedAt: document.processedAt,
    });
  }

  async delete(request: FastifyRequest, reply: FastifyReply) {
    const { id } = documentIdParamSchema.parse(request.params);

    await this.deleteDocumentUseCase.execute(id);

    return reply.status(204).send();
  }

  async download(request: FastifyRequest, reply: FastifyReply) {
    const { id } = documentIdParamSchema.parse(request.params);

    const document = await this.getDocumentUseCase.execute(id);

    // Verificar que el archivo existe
    try {
      await fs.access(document.filepath);
    } catch {
      return reply.status(404).send({ error: 'File not found' });
    }

    return reply
      .header('Content-Type', document.mimeType)
      .header('Content-Disposition', `attachment; filename="${document.originalName}"`)
      .send(await fs.readFile(document.filepath));
  }
}