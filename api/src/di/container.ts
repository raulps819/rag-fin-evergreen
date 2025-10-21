import 'reflect-metadata';
import { container } from 'tsyringe';
import { PrismaClient } from '@prisma/client';

// Infrastructure
import { PrismaDocumentRepository } from '@infrastructure/database/repositories/PrismaDocumentRepository.js';
import { ParserFactory } from '@infrastructure/document-parsers/ParserFactory.js';
import { PDFParser } from '@infrastructure/document-parsers/PDFParser.js';
import { CSVParser } from '@infrastructure/document-parsers/CSVParser.js';
import { XLSXParser } from '@infrastructure/document-parsers/XLSXParser.js';

// Use Cases
import { UploadDocumentUseCase } from '@application/usecases/documents/UploadDocumentUseCase.js';
import { ListDocumentsUseCase } from '@application/usecases/documents/ListDocumentsUseCase.js';
import { GetDocumentUseCase } from '@application/usecases/documents/GetDocumentUseCase.js';
import { DeleteDocumentUseCase } from '@application/usecases/documents/DeleteDocumentUseCase.js';

// Controllers
import { DocumentsController } from '@presentation/controllers/DocumentsController.js';

// Database
const prisma = new PrismaClient(); //singleton por instancia única do PrismaClient
container.registerInstance('PrismaClient', prisma);

// Repositories
container.registerSingleton('IDocumentRepository', PrismaDocumentRepository);

// Parsers - Register with token names for interface-based injection
container.registerSingleton('PDFParser', PDFParser);
container.registerSingleton('CSVParser', CSVParser);
container.registerSingleton('XLSXParser', XLSXParser);
container.registerSingleton('IDocumentParserFactory', ParserFactory);

// Use Cases
container.registerSingleton('UploadDocumentUseCase', UploadDocumentUseCase);
container.registerSingleton('ListDocumentsUseCase', ListDocumentsUseCase);
container.registerSingleton('GetDocumentUseCase', GetDocumentUseCase);
container.registerSingleton('DeleteDocumentUseCase', DeleteDocumentUseCase);

// Controllers
container.registerSingleton(DocumentsController, DocumentsController);

export { container };