import { DocumentType } from '@domain/value-objects/DocumentType.js';

export enum DocumentStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export interface DocumentProps {
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
  version: number;
  isTemporary: boolean;
  createdAt: Date;
  updatedAt: Date;
  processedAt?: Date;
  expiresAt?: Date;
  userId?: string;
}

export class Document {
  private constructor(private props: DocumentProps) {}

  static create(props: Omit<DocumentProps, 'id' | 'createdAt' | 'updatedAt' | 'version' | 'status'>): Document {
    return new Document({
      ...props,
      id: crypto.randomUUID(),
      status: DocumentStatus.PENDING,
      version: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  static fromPersistence(props: DocumentProps): Document {
    return new Document(props);
  }

  get id(): string {
    return this.props.id;
  }

  get filename(): string {
    return this.props.filename;
  }

  get originalName(): string {
    return this.props.originalName;
  }

  get filepath(): string {
    return this.props.filepath;
  }

  get mimeType(): string {
    return this.props.mimeType;
  }

  get size(): number {
    return this.props.size;
  }

  get documentType(): DocumentType {
    return this.props.documentType;
  }

  get status(): DocumentStatus {
    return this.props.status;
  }

  get metadata(): Record<string, unknown> | undefined {
    return this.props.metadata;
  }

  get textContent(): string | undefined {
    return this.props.textContent;
  }

  get pageCount(): number | undefined {
    return this.props.pageCount;
  }

  get isTemporary(): boolean {
    return this.props.isTemporary;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get processedAt(): Date | undefined {
    return this.props.processedAt;
  }

  // Métodos de negocio
  markAsProcessing(): void {
    this.props.status = DocumentStatus.PROCESSING;
    this.props.updatedAt = new Date();
  }

  markAsCompleted(textContent: string, pageCount?: number): void {
    this.props.status = DocumentStatus.COMPLETED;
    this.props.textContent = textContent;
    this.props.pageCount = pageCount;
    this.props.processedAt = new Date();
    this.props.updatedAt = new Date();
  }

  markAsFailed(): void {
    this.props.status = DocumentStatus.FAILED;
    this.props.updatedAt = new Date();
  }

  setMetadata(metadata: Record<string, unknown>): void {
    this.props.metadata = { ...this.props.metadata, ...metadata };
    this.props.updatedAt = new Date();
  }

  isExpired(): boolean {
    if (!this.props.expiresAt) return false;
    return new Date() > this.props.expiresAt;
  }

  toPersistence(): DocumentProps {
    return { ...this.props };
  }
}