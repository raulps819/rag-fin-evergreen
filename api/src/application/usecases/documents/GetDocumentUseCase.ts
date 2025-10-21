import { inject, injectable } from 'tsyringe';
import { IDocumentRepository } from '@application/ports/IDocumentRepository.js';
import { Document } from '@domain/entities/Document.js';
import { NotFoundError } from '@shared/errors/AppError.js';

@injectable()
export class GetDocumentUseCase {
  constructor(
    @inject('IDocumentRepository') private documentRepository: IDocumentRepository
  ) {}

  async execute(id: string): Promise<Document> {
    const document = await this.documentRepository.findById(id);

    if (!document) {
      throw new NotFoundError('Document');
    }

    return document;
  }
}