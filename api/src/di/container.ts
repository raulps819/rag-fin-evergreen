import 'reflect-metadata';
import { container } from 'tsyringe';
import { PrismaClient } from '@prisma/client';

// Database
container.registerSingleton<PrismaClient>('PrismaClient', PrismaClient);

// Repositories
// container.registerSingleton<IDocumentRepository>(
//   'IDocumentRepository',
//   PrismaDocumentRepository
// );

// Services
// container.registerSingleton<RAGService>('RAGService', RAGService);

// Use Cases
// container.register('SendMessageUseCase', SendMessageUseCase);

export { container };