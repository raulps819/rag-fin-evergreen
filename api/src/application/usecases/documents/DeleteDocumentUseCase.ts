import { inject, injectable } from 'tsyringe';
import { IDocumentRepository } from '@application/ports/IDocumentRepository.js';
import { NotFoundError } from '@shared/errors/AppError.js';
import fs from 'fs/promises';

@injectable()
export class DeleteDocumentUseCase {
  constructor(
    @inject('IDocumentRepository') private documentRepository: IDocumentRepository
  ) {}

  async execute(id: string): Promise<void> {
    const document = await this.documentRepository.findById(id);

    if (!document) {
      throw new NotFoundError('Document');
    }

    // Eliminar el archivo físico
    try {
      await fs.unlink(document.filepath);
    } catch (error) {
      console.error(`Error deleting file ${document.filepath}:`, error);
      // Continuar con la eliminación de la BD aunque el archivo no exista
    }

    // Eliminar de la base de datos (esto también eliminará los chunks por cascade)
    await this.documentRepository.delete(id);
  }
}