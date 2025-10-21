import { inject, injectable } from 'tsyringe';
import { PrismaClient } from '@prisma/client';
import {
  IDocumentRepository,
  FindDocumentsFilters,
  PaginationOptions
} from '@application/ports/IDocumentRepository.js';
import { Document, DocumentStatus } from '@domain/entities/Document.js';
import { DocumentType } from '@domain/value-objects/DocumentType.js';

@injectable()
export class PrismaDocumentRepository implements IDocumentRepository {
  constructor(@inject('PrismaClient') private prisma: PrismaClient) {}

  async create(document: Document): Promise<Document> {
    const props = document.toPersistence();

    const created = await this.prisma.document.create({
      data: {
        id: props.id,
        filename: props.filename,
        originalName: props.originalName,
        filepath: props.filepath,
        mimeType: props.mimeType,
        size: props.size,
        documentType: DocumentType.toString(props.documentType) as any,
        status: props.status,
        metadata: props.metadata ? JSON.stringify(props.metadata) : null,
        textContent: props.textContent,
        pageCount: props.pageCount,
        version: props.version,
        isTemporary: props.isTemporary,
        createdAt: props.createdAt,
        updatedAt: props.updatedAt,
        processedAt: props.processedAt,
        expiresAt: props.expiresAt,
        userId: props.userId,
      },
    });

    return this.toDomain(created);
  }

  async findById(id: string): Promise<Document | null> {
    const document = await this.prisma.document.findUnique({
      where: { id },
    });

    if (!document) return null;
    return this.toDomain(document);
  }

  async findMany(
    filters: FindDocumentsFilters,
    pagination: PaginationOptions
  ): Promise<Document[]> {
    const documents = await this.prisma.document.findMany({
      where: this.buildWhereClause(filters),
      skip: pagination.offset || 0,
      take: pagination.limit || 50,
      orderBy: { createdAt: 'desc' },
    });

    return documents.map(doc => this.toDomain(doc));
  }

  async count(filters: FindDocumentsFilters): Promise<number> {
    return this.prisma.document.count({
      where: this.buildWhereClause(filters),
    });
  }

  async update(document: Document): Promise<Document> {
    const props = document.toPersistence();

    const updated = await this.prisma.document.update({
      where: { id: props.id },
      data: {
        status: props.status,
        metadata: props.metadata ? JSON.stringify(props.metadata) : null,
        textContent: props.textContent,
        pageCount: props.pageCount,
        updatedAt: props.updatedAt,
        processedAt: props.processedAt,
      },
    });

    return this.toDomain(updated);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.document.delete({
      where: { id },
    });
  }

  async findExpired(): Promise<Document[]> {
    const documents = await this.prisma.document.findMany({
      where: {
        isTemporary: true,
        expiresAt: {
          lte: new Date(),
        },
      },
    });

    return documents.map(doc => this.toDomain(doc));
  }

  private buildWhereClause(filters: FindDocumentsFilters) {
    const where: any = {};

    if (filters.documentType) {
      where.documentType = DocumentType.toString(filters.documentType);
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.isTemporary !== undefined) {
      where.isTemporary = filters.isTemporary;
    }

    if (filters.userId) {
      where.userId = filters.userId;
    }

    if (filters.search) {
      where.OR = [
        { filename: { contains: filters.search } },
        { originalName: { contains: filters.search } },
      ];
    }

    return where;
  }

  private toDomain(prismaDocument: any): Document {
    return Document.fromPersistence({
      id: prismaDocument.id,
      filename: prismaDocument.filename,
      originalName: prismaDocument.originalName,
      filepath: prismaDocument.filepath,
      mimeType: prismaDocument.mimeType,
      size: prismaDocument.size,
      documentType: DocumentType.fromString(prismaDocument.documentType),
      status: prismaDocument.status as DocumentStatus,
      metadata: prismaDocument.metadata ? JSON.parse(prismaDocument.metadata) : undefined,
      textContent: prismaDocument.textContent || undefined,
      pageCount: prismaDocument.pageCount || undefined,
      version: prismaDocument.version,
      isTemporary: prismaDocument.isTemporary,
      createdAt: prismaDocument.createdAt,
      updatedAt: prismaDocument.updatedAt,
      processedAt: prismaDocument.processedAt || undefined,
      expiresAt: prismaDocument.expiresAt || undefined,
      userId: prismaDocument.userId || undefined,
    });
  }
}